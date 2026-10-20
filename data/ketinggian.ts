// Rentang ketinggian (mdpl) ideal per tanaman — ASUMSI KERJA hortikultura
// Indonesia (bisa disetel ulang). Opsional: hanya untuk peringatan mdpl.

export const KETINGGIAN_IDEAL: Record<string, [number, number]> = {
  "cabai-merah-besar": [0, 1500],
  "cabai-rawit": [0, 1200],
  tomat: [0, 1500],
  terong: [0, 1000],
  mentimun: [0, 1000],
  melon: [0, 800],
  semangka: [0, 800],
  pare: [0, 800],
  "jagung-manis": [0, 1200],
  "bawang-merah": [0, 700],
  "bawang-putih": [0, 700],
  kubis: [500, 2000],
  "sawi-hijau": [0, 1500],
  pakcoy: [0, 1500],
  bayam: [0, 800],
  kangkung: [0, 600],
  "kacang-panjang": [0, 900],
  buncis: [0, 1500],
  wortel: [400, 2000],
  kentang: [1000, 2400],
  mangga: [0, 700],
  jeruk: [0, 600],
  pisang: [0, 500],
  pepaya: [0, 600],
};
