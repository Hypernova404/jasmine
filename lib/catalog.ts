import type { Gangguan, Pupuk, Tanaman } from "@/data/types";
import { FERTILIZERS, FERTILIZER_MAP } from "@/data/fertilizers";
import { PLANTS, PLANT_MAP, getPlant } from "@/data/plants";
import { GANGGUAN_LIST } from "@/data/diseases";
import { KOMODITAS_TIER_B } from "@/data/master-list";
import { bangunTanamanTierB } from "@/lib/fertilizer-engine";

export { FERTILIZERS, FERTILIZER_MAP, PLANTS, PLANT_MAP, getPlant, GANGGUAN_LIST };

/**
 * Seluruh tanaman yang bisa dipilih pengguna: Tier A (jadwal manual) + Tier B
 * (jadwal disusun otomatis dari template kelompok oleh fertilizer-engine).
 * Dibangun sekali di sini agar tidak berulang kali di setiap komponen.
 */
export const SEMUA_TANAMAN: Tanaman[] = [
  ...PLANTS,
  ...KOMODITAS_TIER_B.map(bangunTanamanTierB),
];

export const TANAMAN_MAP: Record<string, Tanaman> = Object.fromEntries(
  SEMUA_TANAMAN.map((t) => [t.id, t]),
);

export function getTanaman(id: string): Tanaman | undefined {
  return TANAMAN_MAP[id];
}

export const GANGGUAN_MAP: Record<string, Gangguan> = Object.fromEntries(
  GANGGUAN_LIST.map((g) => [g.id, g]),
);

export function getGangguan(id: string): Gangguan | undefined {
  return GANGGUAN_MAP[id];
}

export function gangguanUntukTanaman(plantId: string): Gangguan[] {
  return GANGGUAN_LIST.filter(
    (g) => g.plants.includes(plantId) || g.plants.includes("*"),
  );
}

export function cocokkanGangguan(id: string | null): Gangguan | undefined {
  if (!id) return undefined;
  return GANGGUAN_MAP[id];
}

export type KatalogItem =
  | { tipe: "tanaman"; item: Tanaman }
  | { tipe: "gangguan"; item: Gangguan }
  | { tipe: "pupuk"; item: Pupuk };

export function cariKatalog(q: string, kategori?: string): KatalogItem[] {
  const s = q.trim().toLowerCase();
  const hasil: KatalogItem[] = [];

  for (const p of SEMUA_TANAMAN) {
    if (kategori && kategori !== "tanaman" && p.kategori !== kategori) continue;
    const cocok =
      !s ||
      p.nama.toLowerCase().includes(s) ||
      p.id.toLowerCase().includes(s) ||
      p.alias.some((a) => a.toLowerCase().includes(s));
    if (cocok) hasil.push({ tipe: "tanaman", item: p });
  }
  for (const g of GANGGUAN_LIST) {
    if (kategori && kategori !== "gangguan" && g.jenis !== kategori) continue;
    const cocok =
      !s ||
      g.nama.toLowerCase().includes(s) ||
      g.id.toLowerCase().includes(s) ||
      g.alias.some((a) => a.toLowerCase().includes(s)) ||
      g.penyebab.toLowerCase().includes(s);
    if (cocok) hasil.push({ tipe: "gangguan", item: g });
  }
  for (const f of FERTILIZERS) {
    if (kategori && kategori !== "pupuk") continue;
    const cocok =
      !s ||
      f.nama.toLowerCase().includes(s) ||
      f.id.toLowerCase().includes(s) ||
      f.kandungan.toLowerCase().includes(s);
    if (cocok) hasil.push({ tipe: "pupuk", item: f });
  }
  return hasil;
}

export function namaPupuk(id: string): string {
  return FERTILIZER_MAP[id]?.nama ?? id;
}

const JENIS_LABEL: Record<string, string> = {
  penyakit: "Penyakit",
  hama: "Hama",
  defisiensi: "Kurang unsur hara",
  fisiologis: "Gangguan tumbuh",
};

export function labelJenisGangguan(jenis: string): string {
  return JENIS_LABEL[jenis] ?? jenis;
}
