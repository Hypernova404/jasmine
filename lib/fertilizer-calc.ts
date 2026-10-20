import type { Fase, PupukItem, TahapPupuk, Tanaman } from "@/data/types";

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
};

export type HasilKalkulasi = {
  aplikasi: AplikasiPupuk[];
  totalKebutuhan: { pupukId: string; nama: string; totalKg: number }[];
  totalAplikasi: number;
  tanggalPertama: Date;
  perluDolomit: boolean;
  rekomendasiDolomitTonPerHa: number;
  umur: number;
};

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
  },
): HasilKalkulasi {
  const umur = hitungUmur(opts.tanggalTanam, tanaman.satuanUmur, opts.umurSekarang);
  const aplikasi: AplikasiPupuk[] = [];

  for (const tahap of tanaman.pupuk) {
    const hsts = ekspansiTahap(tahap);
    for (const hst of hsts) {
      const tanggal = new Date(opts.tanggalTanam);
      if (tanaman.satuanUmur === "bulan") {
        tanggal.setMonth(tanggal.getMonth() + hst);
      } else {
        tanggal.setDate(tanggal.getDate() + hst);
      }
      aplikasi.push({
        tahapId: tahap.id,
        label: tahap.label,
        fase: tahap.fase,
        hst,
        tanggal,
        metode: tahap.metode,
        items: tahap.items.map((item) => ({
          ...item,
          ...hitungTotal(item, opts.jumlahTanaman, opts.luasHa),
        })),
        catatan: tahap.catatan,
      });
    }
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

  const perluDolomit =
    opts.pH !== undefined && opts.pH < 5.5 && tanaman.phIdeal[0] >= 5.5;

  return {
    aplikasi,
    totalKebutuhan: [...totalMap.values()].sort((a, b) => b.totalKg - a.totalKg),
    totalAplikasi: aplikasi.length,
    tanggalPertama: aplikasi[0]?.tanggal ?? opts.tanggalTanam,
    perluDolomit,
    rekomendasiDolomitTonPerHa: perluDolomit ? 1.5 : 0,
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
  "tabur-lubang": "Tabur lubang",
  "tabur-alur": "Tabur alur",
  "campur-tanah": "Campur tanah",
  kocor: "Kocor",
  "semprot-daun": "Semprot daun",
};

export function labelMetode(m: string): string {
  return METODE_LABEL[m] ?? m;
}

const FASE_LABEL: Record<Fase, string> = {
  dasar: "Dasar",
  vegetatif: "Vegetatif",
  generatif: "Generatif",
  panen: "Panen",
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
  return s === "bulan" ? "bulan" : "HST";
}
