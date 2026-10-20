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
}

export interface Obat {
  bahanAktif: string;
  golongan: GolonganObat;
  dosis: string;
  interval: string;
  maksAplikasi?: string;
  masaTungguPanen?: string;
  catatan?: string;
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
