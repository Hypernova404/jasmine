import type { Fase, PupukItem, TahapPupuk, Tanaman } from "@/data/types";
import { FERTILIZER_MAP } from "@/data/fertilizers";
import { KETINGGIAN_IDEAL } from "@/data/ketinggian";
import { getMusim, catatanMusim, peringatanMusim } from "@/lib/season";
import {
  rekomendasiKapur,
  catatanTekstur,
  bagiAplikasiPasir,
  type TeksturInput,
  type SumberAir,
} from "@/lib/soil-profile";

export type AplikasiPupuk = {
  tahapId: string;
  label: string;
  fase: Fase;
  hst: number;
  tanggal: Date;
  metode: TahapPupuk["metode"];
  items: {
    pupukId: string;
    dosis: string;
    perTanamanGram?: number;
    perHaKg?: number;
    totalGram?: number;
    totalKg?: number;
  }[];
  catatan?: string;
  /** Catatan musim (hujan/kemarau) untuk tanggal aplikasi ini. */
  catatanMusim?: string;
  /** Ditandai bila tekstur berpasir membagi tahap jadi lebih banyak aplikasi. */
  dibagiTekstur?: { asli: number; baru: number };
};

export type HasilKalkulasi = {
  aplikasi: AplikasiPupuk[];
  totalKebutuhan: { pupukId: string; nama: string; totalKg: number }[];
  totalAplikasi: number;
  tanggalPertama: Date;
  perluDolomit: boolean;
  rekomendasiDolomitTonPerHa: number;
  /** Saran kapur belum pasti — pH belum diisi (kondisional: uji pH dulu). */
  kapurKondisional: boolean;
  /** Catatan kapur/pH (masam → tabel dolomit; > 7,3 → ganti urea ke ZA). */
  catatanKapur: string;
  /** Dolomit tahunan (pohon/buah tahunan), kg/pohon/tahun. */
  dolomitKgPerPohon: number;
  /** Catatan tekstur tanah + pH untuk ditampilkan di hasil. */
  catatanTanah: string[];
  /** Catatan sumber air (tadah hujan vs irigasi). */
  catatanAir: string | null;
  /** Peringatan bila mdpl di luar rentang ketinggian ideal tanaman. */
  peringatanMdpl: string | null;
  /** Peringatan hama/penyakit musim berjalan. */
  peringatanMusim: string;
  umur: number;
};

/**
 * Sebar `baru` aplikasi pada rentang hst yang sama (total hara tetap).
 * Tahap tunggal: pra-tanam (hst < 0) di-mundurkan 7 hari agar tetap pra-tanam;
 * selepas tanam maju 7 hari. Tahap multi: rentang pertama–terakhir dipertahankan.
 */
export function sebarHst(hsts: number[], baru: number, ulangiHari?: number): number[] {
  const c = hsts.length;
  if (baru <= c) return hsts;
  if (c === 1) {
    const a = hsts[0];
    return a < 0 ? [a - 7, a] : [a, a + (ulangiHari ?? 7)];
  }
  const first = hsts[0];
  const last = hsts[c - 1];
  const span = last - first;
  const out = new Set<number>();
  for (let i = 0; i < baru; i++) {
    out.add(Math.round(first + (i * span) / (baru - 1)));
  }
  return [...out].sort((x, y) => x - y);
}

function tahapPunyaHara(tahap: TahapPupuk): boolean {
  return tahap.items.some((i) => {
    const t = FERTILIZER_MAP[i.pupukId]?.tipe;
    return t === "tunggal" || t === "majemuk";
  });
}

function hitungTotal(
  item: PupukItem,
  jumlahTanaman: number,
  luasHa: number,
): { totalGram?: number; totalKg?: number } {
  if (item.perTanamanGram !== undefined) {
    const totalGram = item.perTanamanGram * jumlahTanaman;
    return { totalGram, totalKg: totalGram / 1000 };
  }
  if (item.perHaKg !== undefined) {
    return { totalKg: item.perHaKg * luasHa };
  }
  return {};
}

export function ekspansiTahap(tahap: TahapPupuk): number[] {
  const hsts: number[] = [tahap.hstMulai];
  if (tahap.ulangiHari && tahap.hstSelesai !== undefined) {
    let h = tahap.hstMulai + tahap.ulangiHari;
    while (h <= tahap.hstSelesai) {
      hsts.push(h);
      h += tahap.ulangiHari;
    }
  } else if (tahap.hstSelesai !== undefined && tahap.hstSelesai > tahap.hstMulai) {
    hsts.push(tahap.hstSelesai);
  }
  return hsts;
}

export function hitungJumlahTanaman(
  opsi: { jumlahTanaman?: number; luasM2?: number },
  populasiPerHa: number,
): { jumlahTanaman: number; luasHa: number } {
  if (opsi.jumlahTanaman && opsi.jumlahTanaman > 0) {
    const jumlahTanaman = Math.round(opsi.jumlahTanaman);
    const luasHa = jumlahTanaman / populasiPerHa;
    return { jumlahTanaman, luasHa };
  }
  const luasM2 = opsi.luasM2 ?? 0;
  const luasHa = luasM2 / 10000;
  const jumlahTanaman = Math.round(luasHa * populasiPerHa);
  return { jumlahTanaman, luasHa };
}

export function hitungUmur(
  tanggalTanam: Date,
  satuanUmur: "hst" | "bulan",
  umurSekarang?: number,
): number {
  if (umurSekarang !== undefined && !Number.isNaN(umurSekarang)) {
    return umurSekarang;
  }
  const ms = Date.now() - tanggalTanam.getTime();
  const hari = Math.floor(ms / 86400000);
  return satuanUmur === "bulan" ? Math.floor(hari / 30) : hari;
}

export function statusAplikasi(
  hst: number,
  umurSekarang: number,
): "lewat" | "kini" | "nanti" {
  if (hst < umurSekarang - 0.5) return "lewat";
  if (Math.abs(hst - umurSekarang) <= 0.5) return "kini";
  return "nanti";
}

export function hitungJadwalPupuk(
  tanaman: Tanaman,
  opts: {
    tanggalTanam: Date;
    jumlahTanaman: number;
    luasHa: number;
    umurSekarang?: number;
    pH?: number;
    tekstur?: TeksturInput;
    mdpl?: number;
    sumberAir?: SumberAir;
  },
): HasilKalkulasi {
  const umur = hitungUmur(opts.tanggalTanam, tanaman.satuanUmur, opts.umurSekarang);
  const aplikasi: AplikasiPupuk[] = [];

  const ph = opts.pH;
  const kapur = rekomendasiKapur(ph ?? null, tanaman.satuanUmur === "bulan");
  const tanpaKapur = ph !== undefined && ph >= 5.5;
  const adaDolomitData = tanaman.pupuk.some((t) =>
    t.items.some((i) => i.pupukId === "dolomit"),
  );
  const teksturPasir = opts.tekstur === "berpasir";
  const sumberAir: SumberAir = opts.sumberAir ?? "tadah-hujan";

  for (const tahap of tanaman.pupuk) {
    let items = tahap.items;
    if (tanpaKapur) items = items.filter((i) => i.pupukId !== "dolomit");
    if (!items.length) continue;

    const hstsAsli = ekspansiTahap(tahap);
    let hsts = hstsAsli;
    let dibagi: { asli: number; baru: number } | undefined;
    if (teksturPasir && tahapPunyaHara(tahap)) {
      const baru = bagiAplikasiPasir(hstsAsli.length);
      if (baru > hstsAsli.length) {
        hsts = sebarHst(hstsAsli, baru, tahap.ulangiHari);
        dibagi = { asli: hstsAsli.length, baru: hsts.length };
      }
    }
    const faktorDosis = dibagi ? hstsAsli.length / hsts.length : 1;

    for (const hst of hsts) {
      const tanggal = new Date(opts.tanggalTanam);
      if (tanaman.satuanUmur === "bulan") {
        tanggal.setMonth(tanggal.getMonth() + hst);
      } else {
        tanggal.setDate(tanggal.getDate() + hst);
      }
      const musim = getMusim(tanggal);
      let cm = catatanMusim(musim);
      if (sumberAir === "tadah-hujan" && musim === "kemarau" && tahap.metode === "kocor") {
        cm += " Tadah hujan: pastikan ada cadangan air untuk kocor.";
      }
      const catatanParts: string[] = [];
      if (tahap.catatan) catatanParts.push(tahap.catatan);
      if (dibagi) {
        catatanParts.push(
          `Tekstur berpasir: aplikasi dibagi ${dibagi.baru}× (dari ${dibagi.asli}) — dosis per aplikasi otomatis dikurangi, total hara tetap sama.`,
        );
      }
      aplikasi.push({
        tahapId: tahap.id,
        label: tahap.label,
        fase: tahap.fase,
        hst,
        tanggal,
        metode: tahap.metode,
        items: items.map((item) => {
          const total = hitungTotal(item, opts.jumlahTanaman, opts.luasHa);
          return {
            ...item,
            ...(total.totalGram !== undefined
              ? { totalGram: total.totalGram * faktorDosis }
              : {}),
            ...(total.totalKg !== undefined
              ? { totalKg: total.totalKg * faktorDosis }
              : {}),
          };
        }),
        catatan: catatanParts.length ? catatanParts.join(" ") : undefined,
        catatanMusim: cm,
        dibagiTekstur: dibagi,
      });
    }
  }

  // Tahap kapur terhitung (bukan dari data): pH < 5,5 & tanaman belum punya
  // tahap dolomit sendiri. Pohon (satuanUmur bulan) tidak diinjeksi — dosis
  // tahunan kg/pohon ditampilkan sebagai catatan (kapur.dolomitKgPerPohon).
  if (kapur.perlu && tanaman.satuanUmur === "hst" && !adaDolomitData) {
    const tanggal = new Date(opts.tanggalTanam);
    tanggal.setDate(tanggal.getDate() - 14);
    const perHaKg = kapur.dolomitTonPerHa * 1000;
    aplikasi.push({
      tahapId: "kapur-dolomit",
      label: "Kapur dolomit (2 minggu sebelum tanam)",
      fase: "dasar",
      hst: -14,
      tanggal,
      metode: "tabur-lubang",
      items: [
        {
          pupukId: "dolomit",
          dosis: `${kapur.dolomitTonPerHa} ton/ha (pH < 5,5)`,
          perHaKg,
          totalKg: perHaKg * opts.luasHa,
        },
      ],
      catatan: kapur.catatan,
      catatanMusim: catatanMusim(getMusim(tanggal)),
    });
  }

  aplikasi.sort((a, b) => a.hst - b.hst);

  const totalMap = new Map<string, { pupukId: string; nama: string; totalKg: number }>();
  for (const ap of aplikasi) {
    for (const it of ap.items) {
      if (it.totalKg === undefined) continue;
      const cur = totalMap.get(it.pupukId) ?? {
        pupukId: it.pupukId,
        nama: it.pupukId,
        totalKg: 0,
      };
      cur.totalKg += it.totalKg;
      totalMap.set(it.pupukId, cur);
    }
  }

  const catatanTanah: string[] = [];
  if (opts.tekstur === "berpasir") {
    catatanTanah.push(...catatanTekstur("pasir"));
  } else if (opts.tekstur === "liat") {
    catatanTanah.push(...catatanTekstur("liat"));
  } else if (opts.tekstur === "lempung") {
    catatanTanah.push(...catatanTekstur("lempung"));
  } else {
    catatanTanah.push(
      "Jadwal ini dibuat untuk tanah biasa (lempung berpasir). Bila tanah Anda sangat berpasir atau sangat liat, minta bantuan penyuluh untuk menyesuaikan.",
    );
  }
  if (kapur.catatan) catatanTanah.push(kapur.catatan);

  const catatanAir =
    sumberAir === "tadah-hujan"
      ? "Air tadah hujan (mengandalkan hujan): saat kemarau, siram setelah menabur pupuk dan sesuaikan dengan persediaan air."
      : "Air irigasi: jadwal penyiraman pupuk bisa diikuti seperti tertulis.";

  let peringatanMdpl: string | null = null;
  if (opts.mdpl !== undefined && !Number.isNaN(opts.mdpl)) {
    const rentang = KETINGGIAN_IDEAL[tanaman.id];
    if (rentang && (opts.mdpl < rentang[0] || opts.mdpl > rentang[1])) {
      peringatanMdpl = `Lokasi ${opts.mdpl} mdpl di luar rentang ideal ${tanaman.nama} (${rentang[0]}–${rentang[1]} mdpl) — kinerja & ketahanan tanaman bisa menurun. Konsultasi penyuluh untuk varietas/susunan tanam yang sesuai.`;
    }
  }

  return {
    aplikasi,
    totalKebutuhan: [...totalMap.values()].sort((a, b) => b.totalKg - a.totalKg),
    totalAplikasi: aplikasi.length,
    tanggalPertama: aplikasi[0]?.tanggal ?? opts.tanggalTanam,
    perluDolomit: kapur.perlu,
    rekomendasiDolomitTonPerHa: kapur.dolomitTonPerHa,
    kapurKondisional: kapur.kondisional,
    catatanKapur: kapur.catatan,
    dolomitKgPerPohon: kapur.dolomitKgPerPohon,
    catatanTanah,
    catatanAir,
    peringatanMdpl,
    peringatanMusim: peringatanMusim(getMusim(new Date())),
    umur,
  };
}

export function umurSaatIni(
  tanaman: Tanaman,
  tanggalTanam: Date,
): number {
  return hitungUmur(tanggalTanam, tanaman.satuanUmur);
}

const METODE_LABEL: Record<string, string> = {
  "tabur-lubang": "Tabur di lubang dekat tanaman",
  "tabur-alur": "Tabur di alur",
  "campur-tanah": "Campur dengan tanah",
  kocor: "Siram larutan pupuk (kocor)",
  "semprot-daun": "Semprot ke daun",
};

export function labelMetode(m: string): string {
  return METODE_LABEL[m] ?? m;
}

const FASE_LABEL: Record<Fase, string> = {
  dasar: "Masa awal (sebelum/saat tanam)",
  vegetatif: "Masa pertumbuhan",
  generatif: "Masa berbunga & berbuah",
  panen: "Menjelang panen",
};

export function labelFase(f: Fase): string {
  return FASE_LABEL[f] ?? f;
}

export function formatTanggal(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatTanggalPanjang(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function satuanUmurLabel(s: "hst" | "bulan"): string {
  return s === "bulan" ? "bulan" : "hari";
}
