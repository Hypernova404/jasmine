export type Kategori =
  | "sayuran-buah"
  | "sayuran-daun"
  | "sayuran-umbi"
  | "sayuran-polong"
  | "buah"
  | "rempah-biofarmaka"
  | "tanaman-hias";

export type Fase = "dasar" | "vegetatif" | "generatif" | "panen";

export type MetodePupuk =
  | "tabur-lubang"
  | "tabur-alur"
  | "campur-tanah"
  | "kocor"
  | "semprot-daun";

export type GolonganObat =
  | "fungisida"
  | "insektisida"
  | "bakterisida"
  | "akarisida"
  | "nematisida"
  | "agens-hayati";

export type JenisGangguan =
  | "penyakit"
  | "hama"
  | "defisiensi"
  | "fisiologis";

export type TipePupuk =
  | "tunggal"
  | "majemuk"
  | "organik"
  | "hayati"
  | "pembenah-tanah"
  | "mikro";

/** Tier katalog tanaman: A = jadwal manual per komoditas, B = disusun dari template kelompok. */
export type TierTanaman = "A" | "B";

/** Kandungan hara pupuk dalam persen massa (N, P2O5, K2O). */
export interface KadarHara {
  n?: number;
  p?: number;
  k?: number;
}

/** Kebutuhan hara per hektar sepanjang satu musim tanam (kg/ha). */
export interface TargetHara {
  n: number;
  p: number;
  k: number;
}

/** Satu tahap distribusi pada template kelompok — bobot = porsi target total. */
export interface TahapTemplate {
  fase: Fase;
  /** Porsi target pada tahap ini; jumlah seluruh tahap harus = 1. */
  bobot: number;
  metode: MetodePupuk;
  hstMulai?: number;
  hstSelesai?: number;
  ulangiHari?: number;
  catatan?: string;
}

/** Template jadwal pupuk per kelompok komoditas (dasar rekomendasi Tier B). */
export interface TemplateKelompok {
  id: string;
  nama: string;
  /** Penjelasan kelompok (mis. botani/kategori komoditas). */
  deskripsi: string;
  target: TargetHara;
  phIdeal: [number, number];
  tahap: TahapTemplate[];
  /** Sumber pupuk default per hara (pupukId) — harus punya kadar hara yang sesuai. */
  sumberHara: { n: string; p: string; k: string };
  catatan?: string;
  sumber: string[];
  verified: boolean;
}

/** Entri komoditas Tier B — rekomendasi disusun otomatis dari template kelompoknya. */
export interface KomoditasTierB {
  id: string;
  nama: string;
  alias: string[];
  namaLatin?: string;
  kategori: Kategori;
  /** TemplateKelompok.id */
  kelompok: string;
  satuanUmur: "hst" | "bulan";
  populasiPerHa: number;
  jarakTanam?: string;
  umurPanen: [number, number];
  phIdeal?: [number, number];
  /** Override sebagian target kelompok (kg/ha/musim). */
  target?: Partial<TargetHara>;
  sumber: string[];
  verified?: boolean;
}

export interface PupukItem {
  pupukId: string;
  dosis: string;
  perTanamanGram?: number;
  perHaKg?: number;
}

export interface TahapPupuk {
  id: string;
  label: string;
  fase: Fase;
  hstMulai: number;
  hstSelesai?: number;
  ulangiHari?: number;
  metode: MetodePupuk;
  items: PupukItem[];
  catatan?: string;
}

export interface Tanaman {
  id: string;
  nama: string;
  alias: string[];
  namaLatin: string;
  kategori: Kategori;
  satuanUmur: "hst" | "bulan";
  populasiPerHa: number;
  jarakTanam: string;
  umurPanen: [number, number];
  phIdeal: [number, number];
  pupuk: TahapPupuk[];
  catatan: string[];
  sumber: string[];
  verified: boolean;
  /** Default "A" — hanya Tier B yang menyimpan eksplisit. */
  tier?: TierTanaman;
  /** TemplateKelompok.id — hanya Tier B. */
  kelompok?: string;
}

export interface Obat {
  bahanAktif: string;
  golongan: GolonganObat;
  dosis: string;
  interval: string;
  maksAplikasi?: string;
  masaTungguPanen?: string;
  catatan?: string;
  /** Sifat fungisida/insektisida — memengaruhi strategi rotasi (label produk). */
  sifat?: "kontak" | "sistemik" | "kontak-sistemik";
  /** Kode FRAC/IRAC/HRAC untuk rotasi bahan aktif (contoh: "3A", "M01"). */
  kelompokAksi?: string;
  /** Dosis terstruktur untuk kalkulator semprot — opsional. */
  dosisMin?: number;
  dosisMax?: number;
  satuanDosis?: "mL/L" | "g/L" | "mL/ha" | "g/ha";
  intervalHari?: [number, number];
  masaTungguHari?: number;
}

export interface PupukPendukung {
  pupukId: string;
  dosis: string;
  catatan?: string;
}

export interface Gangguan {
  id: string;
  nama: string;
  alias: string[];
  jenis: JenisGangguan;
  plants: string[];
  penyebab: string;
  gejala: string[];
  kulturTeknis: string[];
  obat: Obat[];
  pupukPendukung: PupukPendukung[];
  pencegahan: string[];
  tingkatBahaya: "rendah" | "sedang" | "tinggi";
  sumber: string[];
  verified: boolean;
}

export interface Pupuk {
  id: string;
  nama: string;
  kandungan: string;
  tipe: TipePupuk;
  keterangan: string;
  /** Kandungan terstruktur utk kalkulasi target hara — hanya untuk pupuk ber-N/P/K. */
  kadar?: KadarHara;
}

export type IdentifikasiResult = {
  isPlant: boolean;
  imageQuality: "baik" | "kurang" | "buruk";
  plantId: string | null;
  plantNameGuess: string;
  partAffected:
    | "daun"
    | "buah"
    | "batang"
    | "akar"
    | "bunga"
    | "seluruh_tanaman"
    | "tidak_jelas";
  conditionType:
    | "penyakit"
    | "hama"
    | "defisiensi"
    | "fisiologis"
    | "sehat"
    | "tidak_jelas";
  diseaseId: string | null;
  diseaseNameGuess: string;
  confidence: number;
  visibleSymptoms: string[];
  differential: {
    diseaseId: string | null;
    name: string;
    confidence: number;
  }[];
  needsMorePhotos: boolean;
  photoTips: string;
};
