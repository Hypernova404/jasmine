// Profil tanah & aturan penyesuaian — INTERNAL (tidak pernah tampil di UI,
// PDF, atau pesan error; lihat aturan tampilan di README/bagian spesifikasi).
// Semua konstanta adalah ASUMSI KERJA yang bisa disetel ulang di sini.

export type TeksturInput = "berpasir" | "lempung" | "liat";
export type TeksturProfil = "pasir" | "lempung-berpasir" | "lempung" | "liat";
export type SumberAir = "irigasi" | "tadah-hujan";

/** Profil acuan: tanah mineral lahan hortikultura. Gambut di luar cakupan. */
export const DEFAULT_SOIL_PROFILE = {
  jenis: "mineral" as const,
  tekstur: "lempung-berpasir" as const as TeksturProfil,
  ph: null as number | null,
  sumberAir: "tadah-hujan" as const as SumberAir,
};

export type RekomendasiKapur = {
  /** true bila tahap kapur layak ditambahkan (pH terisi & < 5,5) */
  perlu: boolean;
  /** true bila pH belum diisi — tahap kapur hanya saran kondisional */
  kondisional: boolean;
  dolomitTonPerHa: number;
  dolomitKgPerPohon: number;
  catatan: string;
};

/**
 * Aturan kapur (bagian 7.1):
 * pH < 5,5 → dolomit 14 hari sebelum tanam: 5,0-5,4 = 1 t/ha; 4,5-4,9 = 2 t/ha;
 *             < 4,5 = 3 t/ha (maksimum). Tahunan: 0,5-1 kg/pohon/tahun.
 * pH 5,5-7,3 → tanpa kapur.
 * pH > 7,3 → JANGAN kapur; ganti urea dengan ZA; catatan klorosis mikro.
 * pH belum diisi → kondisional + saran uji pH.
 */
export function rekomendasiKapur(
  ph: number | null | undefined,
  tahunan = false,
): RekomendasiKapur {
  if (ph === null || ph === undefined || Number.isNaN(ph)) {
    return {
      perlu: false,
      kondisional: true,
      dolomitTonPerHa: 0,
      dolomitKgPerPohon: 0,
      catatan:
        "Kondisional: uji pH tanah. Bila pH < 5,5, tambah dolomit 14 hari sebelum tanam.",
    };
  }
  if (ph < 4.5) {
    return kapur(3, 1, `pH ${fmt(ph)} sangat masam — dolomit 3 t/ha (batas maksimum).`, tahunan);
  }
  if (ph < 5.0) {
    return kapur(2, 1, `pH ${fmt(ph)} masam — dolomit 2 t/ha.`, tahunan);
  }
  if (ph < 5.5) {
    return kapur(1, 1, `pH ${fmt(ph)} agak masam — dolomit 1 t/ha.`, tahunan);
  }
  if (ph <= 7.3) {
    return {
      perlu: false,
      kondisional: false,
      dolomitTonPerHa: 0,
      dolomitKgPerPohon: 0,
      catatan: "",
    };
  }
  return {
    perlu: false,
    kondisional: false,
    dolomitTonPerHa: 0,
    dolomitKgPerPohon: 0,
    catatan:
      "pH > 7,3: jangan beri kapur/dolomit. Ganti urea dengan ZA. Awasi klorosis mikro (Fe, Zn, Mn, B) — semprot chelate bila gejala muncul.",
  };
}

function kapur(
  ton: number,
  kgPohon: number,
  catatan: string,
  tahunan = false,
): RekomendasiKapur {
  return {
    perlu: true,
    kondisional: false,
    dolomitTonPerHa: tahunan ? 0 : ton,
    dolomitKgPerPohon: tahunan ? kgPohon : 0,
    catatan: tahunan ? `Aplikasi tahunan: dolomit ${kgPohon} kg/pohon/tahun. ${catatan}` : catatan,
  };
}

function fmt(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

export function catatanTekstur(tekstur: TeksturProfil): string[] {
  switch (tekstur) {
    case "pasir":
    case "lempung-berpasir":
      return [
        "Tanah berpasir/lempung berpasir: N dan K mudah tercuci — perbanyak jumlah aplikasi (dosis dibagi), siram setelah tabur, dan gunakan mulsa.",
        "Tambah bahan organik rutin untuk menahan air & hara.",
      ];
    case "liat":
      return [
        "Tanah liat: buat bedengan tinggi (30-40 cm) dengan parit drainase; jangan tabur N menjelang hujan lebat atau saat tanah jenuh.",
        "Tambah bahan organik untuk memperbaiki struktur; hindari pemadatan tanah.",
      ];
    case "lempung":
    default:
      return ["Tekstur lempung: ikuti jadwal tahap apa adanya."];
  }
}

/**
 * Jumlah aplikasi untuk tekstur berpasir/lempung berpasir (bagian 7.1):
 * jumlah aplikasi N & K dikali 1,5 (bulatkan ke atas, maksimum 2x jumlah asli),
 * dosis per aplikasi dibagi sebanding — total hara TIDAK dinaikkan.
 */
export function bagiAplikasiPasir(jumlahAsli: number): number {
  if (jumlahAsli <= 0) return jumlahAsli;
  return Math.min(Math.ceil(jumlahAsli * 1.5), jumlahAsli * 2);
}

/** Aturan pH > 7,3 untuk penggantian pupuk (urea → ZA) pada tahap berbasis N. */
export function gantiUreaKeZa(ph: number | null | undefined): boolean {
  return ph !== null && ph !== undefined && ph > 7.3;
}

/** Bahan organik minimal 1,25x angka template untuk tekstur berpasir. */
export function pengaliOrganikPasir(tekstur: TeksturProfil): number {
  return tekstur === "pasir" || tekstur === "lempung-berpasir" ? 1.25 : 1;
}
