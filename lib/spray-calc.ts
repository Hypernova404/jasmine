// Kalkulator kebutuhan semprot (kalkulator ekstensi — bukan label produk).
// Prinsip: total LAHAN mengikuti dosis database; pembulatan hanya terjadi
// per tangki. Dosis & interval database selalu didahulukan; input manual
// hanya bila teks dosis tidak terdeteksi.

import { getMusim, sesuaikanIntervalMusim, MUSIM_LABEL } from "@/lib/season";

export type SatuanDosisSemprot = "mL/L" | "g/L" | "mL/ha" | "g/ha";

export type DosisSemprot = {
  min: number;
  max: number;
  satuan: SatuanDosisSemprot;
};

export type InputSemprot = {
  dosis: DosisSemprot;
  kapasitasTangkiL: number;
  volumePerHaL: number;
  luasHa: number;
  intervalHari: [number, number] | null;
  masaTungguHari: number | null;
  tanggalSemprot: Date;
  tanggalPanen?: Date | null;
  /** true bila dosis berasal dari input pengguna, bukan database */
  dosisManual?: boolean;
};

export type HasilSemprot = {
  dosisPerTangkiMin: number;
  dosisPerTangkiMax: number;
  satuan: SatuanDosisSemprot;
  tangkiPerHa: number;
  luasPerTangkiHa: number;
  volumeSemprotTotalL: number;
  tangkiTotal: number;
  produkTotalMin: number;
  produkTotalMax: number;
  intervalHariDipakai: number | null;
  jadwalBerikutnya: Date | null;
  catatanInterval: string | null;
  batasSemprotTerakhir: Date | null;
  peringatanPanen: string | null;
  catatanMusim: string;
  catatanDosis: string;
};

const SATUAN_TERPAKAI: Record<SatuanDosisSemprot, "perLiter" | "perHa"> = {
  "mL/L": "perLiter",
  "g/L": "perLiter",
  "mL/ha": "perHa",
  "g/ha": "perHa",
};

/**
 * Deteksi pola dosis dari teks database.
 * Contoh: "0,5–1 ml/L air" → {min:0.5, max:1, satuan:"mL/L"}
 *          "2–2,5 g/L air"  → {min:2, max:2.5, satuan:"g/L"}
 *          "2,5–5 g/L, semprot ke daun tiap 7–10 hari" → {min:2.5,max:5,...}
 * Return null bila tidak terdeteksi (mis. "sesuai label").
 */
export function parseDosis(text: string): DosisSemprot | null {
  const re =
    /(\d+(?:[.,]\d+)?)\s*(?:[–-]\s*(\d+(?:[.,]\d+)?)\s*)?(ml|cc|g|gram|kg)\s*\/\s*(l|liter|ha)\b/i;
  const m = text.match(re);
  if (!m) return null;
  const min = num(m[1]);
  const max = m[2] !== undefined ? num(m[2]) : min;
  if (min === null || max === null || min <= 0 || max < min) return null;
  const unit = m[3].toLowerCase();
  const per = m[4].toLowerCase();
  const cair = unit === "ml" || unit === "cc";
  const satuan: SatuanDosisSemprot = cair
    ? per === "ha"
      ? "mL/ha"
      : "mL/L"
    : per === "ha"
      ? "g/ha"
      : "g/L";
  return { min, max, satuan };
}

function num(s: string): number | null {
  const v = parseFloat(s.replace(",", "."));
  return Number.isFinite(v) ? v : null;
}

/** Deteksi interval hari dari teks: "5–7 hari saat lembap" → [5,7]; "7 hari" → [7,7]. */
export function parseIntervalHari(text: string): [number, number] | null {
  const re = /(\d+)\s*(?:[–-]\s*(\d+)\s*)?hari/;
  const m = text.match(re);
  if (!m) return null;
  const min = parseInt(m[1], 10);
  const max = m[2] !== undefined ? parseInt(m[2], 10) : min;
  if (!Number.isFinite(min) || min <= 0 || max < min) return null;
  return [min, max];
}

/** Deteksi masa tunggu (hari) dari teks. "ikuti label produk" → null. */
export function parseMasaTunggu(text: string | undefined | null): number | null {
  if (!text) return null;
  const m = text.match(/(\d+)\s*hari/);
  if (!m) return null;
  const v = parseInt(m[1], 10);
  return Number.isFinite(v) && v > 0 ? v : null;
}

function plusDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

export function hitungSemprot(input: InputSemprot): HasilSemprot {
  const { dosis, kapasitasTangkiL, volumePerHaL, luasHa } = input;
  if (kapasitasTangkiL <= 0) throw new Error("kapasitasTangkiL harus > 0");
  if (volumePerHaL <= 0) throw new Error("volumePerHaL harus > 0");
  if (luasHa <= 0) throw new Error("luasHa harus > 0");

  const basis = SATUAN_TERPAKAI[dosis.satuan];

  // Dosis per tangki: basis per liter → dose × kapasitas; basis per ha →
  // dose × luas yang dicakup satu tangki (kapasitas / volume per ha).
  const luasPerTangkiHa = kapasitasTangkiL / volumePerHaL;
  const faktor =
    basis === "perLiter" ? kapasitasTangkiL : luasPerTangkiHa;
  const dosisPerTangkiMin = round2(dosis.min * faktor);
  const dosisPerTangkiMax = round2(dosis.max * faktor);

  const tangkiPerHa = Math.max(1, Math.ceil(volumePerHaL / kapasitasTangkiL));
  const volumeSemprotTotalL = round2(volumePerHaL * luasHa);
  const tangkiTotal = Math.max(1, Math.ceil(volumeSemprotTotalL / kapasitasTangkiL));

  // Total produk untuk seluruh LAHAN — tanpa pembulatan per tangki.
  const produkTotalMin =
    basis === "perLiter"
      ? round2(dosis.min * volumeSemprotTotalL)
      : round2(dosis.min * luasHa);
  const produkTotalMax =
    basis === "perLiter"
      ? round2(dosis.max * volumeSemprotTotalL)
      : round2(dosis.max * luasHa);

  // Jadwal berikutnya — sesuaikan interval dengan musim (pestisida kontak).
  const musim = getMusim(input.tanggalSemprot);
  let intervalHariDipakai: number | null = null;
  let jadwalBerikutnya: Date | null = null;
  let catatanInterval: string | null = null;
  if (input.intervalHari) {
    intervalHariDipakai = sesuaikanIntervalMusim(input.intervalHari, musim);
    jadwalBerikutnya = plusDays(input.tanggalSemprot, intervalHariDipakai);
    const [rMin, rMax] = input.intervalHari;
    catatanInterval =
      rMin === rMax
        ? `Interval ${rMin} hari (database). Disesuaikan ${MUSIM_LABEL[musim]}.`
        : `Rentang database ${rMin}–${rMax} hari → dipakai ${intervalHariDipakai} hari (${MUSIM_LABEL[musim]}). Pestisida sistemik/agens hayati: ikuti label.`;
  } else {
    catatanInterval =
      "Interval tidak terdeteksi dari database — atur berdasarkan label produk / monitoring hama.";
  }

  // Masa tunggu vs tanggal panen.
  let batasSemprotTerakhir: Date | null = null;
  let peringatanPanen: string | null = null;
  const panen = input.tanggalPanen ?? null;
  if (input.masaTungguHari !== null && panen) {
    batasSemprotTerakhir = plusDays(panen, -input.masaTungguHari);
    const sisaHari = Math.floor(
      (panen.getTime() - input.tanggalSemprot.getTime()) / 86_400_000,
    );
    if (sisaHari < input.masaTungguHari) {
      peringatanPanen = `Tanggal panen terlalu dekat: sisa ${sisaHari} hari, masa tunggu ${input.masaTungguHari} hari. Semprot terakhir aman: ${fmtTanggal(batasSemprotTerakhir)}.`;
    }
  } else if (panen) {
    peringatanPanen = `Masa tunggu tidak terdeteksi dari database — pastikan jeda semprot→panen mengikuti label produk (tanggal panen ${fmtTanggal(panen)}).`;
  }

  const catatanDosis = input.dosisManual
    ? "Dosis dari input manual pengguna — verifikasi terhadap label produk."
    : "Dosis dari database (acuan umum — verifikasi terhadap label produk).";

  return {
    dosisPerTangkiMin,
    dosisPerTangkiMax,
    satuan: dosis.satuan,
    tangkiPerHa,
    luasPerTangkiHa: round4(luasPerTangkiHa),
    volumeSemprotTotalL,
    tangkiTotal,
    produkTotalMin,
    produkTotalMax,
    intervalHariDipakai,
    jadwalBerikutnya,
    catatanInterval,
    batasSemprotTerakhir,
    peringatanPanen,
    catatanMusim: `Semprot pada ${MUSIM_LABEL[musim]}. ${
      musim === "hujan"
        ? "Hindari semprot saat hujan akan datang (efikasi turun); semprot sore hari."
        : "Semprot sore untuk hindari panas & mudah menguap."
    }`,
    catatanDosis,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function fmtTanggal(d: Date): string {
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format angka gaya Indonesia (koma desimal). */
export function fmtNilai(n: number): string {
  return n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}
