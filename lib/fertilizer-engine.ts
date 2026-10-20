import type {
  KomoditasTierB,
  Pupuk,
  TargetHara,
  TahapPupuk,
  Tanaman,
  TemplateKelompok,
} from "@/data/types";
import { FERTILIZER_MAP } from "@/data/fertilizers";
import { TEMPLATES_MAP } from "@/data/templates";
import { labelFase } from "@/lib/fertilizer-calc";

const HARA = ["n", "p", "k"] as const;

export function bulat1(x: number): number {
  return Math.round(x * 10) / 10;
}

/**
 * kg pupuk yang dibutuhkan untuk memasok kgHara hara,
 * bila kadar pupuk tersebut kadarPersen persen (mis. urea 46% → 100 kg N = 217,4 kg).
 */
export function kgPupukDariHara(kgHara: number, kadarPersen: number): number {
  if (kgHara <= 0 || kadarPersen <= 0) return 0;
  return bulat1(kgHara / (kadarPersen / 100));
}

export function formatKg(kg: number): string {
  return kg.toLocaleString("id-ID", { maximumFractionDigits: 1 });
}

export function targetEfektif(
  template: TemplateKelompok,
  override?: Partial<TargetHara>,
): TargetHara {
  return {
    n: override?.n ?? template.target.n,
    p: override?.p ?? template.target.p,
    k: override?.k ?? template.target.k,
  };
}

/**
 * Kebutuhan pupuk (kg, skala target yang diberikan) per pupuk sumber.
 * Bila satu pupuk menyuplai >1 hara, dipakai nilai MAKSIMUM (hara penentu) —
 * sisanya jadi kelebihan, tidak dijumlahkan.
 */
export function kebutuhanPupuk(
  target: TargetHara,
  sumber: { n?: string; p?: string; k?: string },
  peta: Record<string, Pupuk> = FERTILIZER_MAP,
): { pupukId: string; kg: number }[] {
  const perPupuk = new Map<string, number>();
  for (const hara of HARA) {
    const id = sumber[hara];
    const kgHara = target[hara];
    if (!id || kgHara <= 0) continue;
    const kadar = peta[id]?.kadar?.[hara];
    if (!kadar) continue;
    const kg = kgPupukDariHara(kgHara, kadar);
    perPupuk.set(id, Math.max(perPupuk.get(id) ?? 0, kg));
  }
  return [...perPupuk.entries()].map(([pupukId, kg]) => ({ pupukId, kg }));
}

export interface OpsiSusunJadwal {
  template: TemplateKelompok;
  /** Override sebagian target kelompok (kg/ha/musim). */
  target?: Partial<TargetHara>;
  /** Override sumberHara pupuk per hara (pupukId). */
  sumberHara?: Partial<{ n: string; p: string; k: string }>;
  /** Untk perTanamanGram — bila diisi, tiap item juga memuat dosis per tanaman. */
  populasiPerHa?: number;
}

export function susunJadwalTierB(opsi: OpsiSusunJadwal): TahapPupuk[] {
  const target = targetEfektif(opsi.template, opsi.target);
  const sumber = { ...opsi.template.sumberHara, ...opsi.sumberHara };

  return opsi.template.tahap.map((tahap, i) => {
    const targetTahap: TargetHara = {
      n: target.n * tahap.bobot,
      p: target.p * tahap.bobot,
      k: target.k * tahap.bobot,
    };
    const kebutuhan = kebutuhanPupuk(targetTahap, sumber);

    const items = kebutuhan.map(({ pupukId, kg }) => {
      const perTanamanGram =
        opsi.populasiPerHa && opsi.populasiPerHa > 0
          ? bulat1((kg * 1000) / opsi.populasiPerHa)
          : undefined;
      const dosis =
        perTanamanGram !== undefined
          ? `±${formatKg(kg)} kg/ha (≈${formatKg(perTanamanGram)} g/tanaman)`
          : `±${formatKg(kg)} kg/ha`;
      return { pupukId, dosis, perHaKg: kg, perTanamanGram };
    });

    if (items.length === 0) {
      throw new Error(
        `Template ${opsi.template.id} tahap ${i + 1}: tidak ada kebutuhan — periksa sumber/kadar hara`,
      );
    }

    const satuan = opsi.template.satuanWaktu;
    const unit = satuan === "bulan" ? "bulan" : "HST";
    const saat =
      tahap.hstMulai !== undefined
        ? tahap.hstMulai < 0
          ? `${-tahap.hstMulai} ${unit} pra-tanam`
          : `${tahap.hstMulai} ${unit}`
        : undefined;
    const ulang =
      tahap.ulangiHari !== undefined
        ? ` (ulang tiap ${tahap.ulangiHari} ${unit})`
        : "";
    const catatanWaktu = saat ? `Waktu: ${saat}${ulang}.` : "";

    const persen = Math.round(tahap.bobot * 100);
    return {
      id: `${opsi.template.id}-t${i + 1}`,
      label: `${labelFase(tahap.fase)} · ${persen}% target`,
      fase: tahap.fase,
      hstMulai: tahap.hstMulai ?? 0,
      ...(tahap.hstSelesai !== undefined ? { hstSelesai: tahap.hstSelesai } : {}),
      ...(tahap.ulangiHari !== undefined ? { ulangiHari: tahap.ulangiHari } : {}),
      metode: tahap.metode,
      items,
      catatan: [tahap.catatan, catatanWaktu].filter(Boolean).join(" "),
    };
  });
}

/** Susun objek Tanaman Tier B dari entri master + template kelompoknya. */
export function bangunTanamanTierB(entry: KomoditasTierB): Tanaman {
  const template = TEMPLATES_MAP[entry.kelompok];
  if (!template) {
    throw new Error(`Komoditas ${entry.id}: kelompok "${entry.kelompok}" tidak ada di templates`);
  }

  const target = targetEfektif(template, entry.target);
  const pupuk = susunJadwalTierB({
    template,
    target: entry.target,
    populasiPerHa: entry.populasiPerHa,
  });

  const targetTeks = `${formatKg(target.n)} kg N · ${formatKg(target.p)} kg P₂O₅ · ${formatKg(target.k)} kg K₂O/ha/musim`;

  return {
    id: entry.id,
    nama: entry.nama,
    alias: entry.alias,
    namaLatin: entry.namaLatin ?? "—",
    kategori: entry.kategori,
    satuanUmur: entry.satuanUmur,
    populasiPerHa: entry.populasiPerHa,
    jarakTanam: entry.jarakTanam ?? "—",
    umurPanen: entry.umurPanen,
    phIdeal: entry.phIdeal ?? template.phIdeal,
    pupuk,
    catatan: [
      `Disusun otomatis dari template kelompok "${template.nama}" — ${targetTeks}.`,
      ...(template.catatan ? [template.catatan] : []),
      "Angka acuan umum — utamakan hasil uji tanah & anjuran PPL setempat.",
    ],
    sumber: [...new Set([...template.sumber, ...entry.sumber])],
    verified: entry.verified ?? false,
    tier: "B",
    kelompok: entry.kelompok,
  };
}
