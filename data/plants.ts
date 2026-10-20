import type { Tanaman } from "./types";
import { TanamanSchema } from "./schema";
import { cabai } from "./plants/cabai";
import { tomat } from "./plants/tomat";
import { bawangMerah } from "./plants/bawang-merah";
import { terong } from "./plants/terong";
import { mentimun } from "./plants/mentimun";
import { kubis } from "./plants/kubis";

export const PLANTS: Tanaman[] = [cabai, tomat, bawangMerah, terong, mentimun, kubis];

for (const p of PLANTS) {
  TanamanSchema.parse(p);
}

export const PLANT_MAP: Record<string, Tanaman> = Object.fromEntries(
  PLANTS.map((p) => [p.id, p]),
);

export function getPlant(id: string): Tanaman | undefined {
  return PLANT_MAP[id];
}

export function searchPlants(q: string): Tanaman[] {
  const s = q.trim().toLowerCase();
  if (!s) return PLANTS;
  return PLANTS.filter(
    (p) =>
      p.nama.toLowerCase().includes(s) ||
      p.id.toLowerCase().includes(s) ||
      p.alias.some((a) => a.toLowerCase().includes(s)),
  );
}
