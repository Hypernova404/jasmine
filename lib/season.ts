// Musim di Indonesia (asumsi kerja — bisa disetel ulang di sini).
// Hujan = Nov-Apr; Kemarau = Mei-Okt; Apr-Mei & Okt-Nov ditandai transisi.

export type Musim = "hujan" | "kemarau";
export type MusimDetail = Musim | "transisi";

export function getMusim(date: Date): Musim {
  const m = date.getMonth() + 1; // 1..12
  if (m >= 11 || m <= 4) return "hujan";
  return "kemarau";
}

export function getMusimDetail(date: Date): MusimDetail {
  const m = date.getMonth() + 1;
  if (m === 5 || m === 10) return "transisi";
  return getMusim(date);
}

export const MUSIM_LABEL: Record<Musim, string> = {
  hujan: "musim hujan",
  kemarau: "musim kemarau",
};

/**
 * Penyesuaian interval pestisida kontak/protektan terhadap musim.
 * Hujan: pakai batas bawah rentang (pestisida tercuci).
 * Kemarau: pakai batas atas.
 * Pestisida sistemik: tidak disesuaikan (ikuti label) — panggil hanya untuk kontak.
 */
export function sesuaikanIntervalMusim(
  intervalHari: [number, number],
  musim: Musim,
): number {
  const [min, max] = intervalHari;
  return musim === "hujan" ? min : max;
}

/** Catatan irigasi/mulsa untuk satu tahap, berdasarkan musim tanggalnya. */
export function catatanMusim(musim: Musim): string {
  return musim === "hujan"
    ? "Musim hujan: pastikan air tidak menggenang; jangan menabur pupuk saat tanah becek."
    : "Musim kemarau: siram setelah menabur pupuk. Tabur kering hanya bila ada irigasi, atau ganti dengan cara dikocor (disiram).";
}

/** Peringatan hama/penyakit musiman untuk ditampilkan di UI. */
export function peringatanMusim(musim: Musim): string {
  return musim === "hujan"
    ? "Awas penyakit musim hujan: antraknosa, hawar daun, bercak daun, embun bulu, layu bakteri."
    : "Awas hama musim kemarau: thrips, tungau, kutu daun, kutu kebul, ulat grayak.";
}
