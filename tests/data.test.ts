import { describe, it, expect } from "vitest";
import { PLANTS } from "@/data/plants";
import { GANGGUAN_LIST } from "@/data/diseases";
import { FERTILIZERS, FERTILIZER_MAP } from "@/data/fertilizers";
import { TanamanSchema, GangguanSchema, PupukSchema } from "@/data/schema";

describe("validasi data katalog", () => {
  it("semua pupuk valid & id unik", () => {
    const ids = new Set<string>();
    for (const p of FERTILIZERS) {
      expect(PupukSchema.safeParse(p).success).toBe(true);
      expect(ids.has(p.id)).toBe(false);
      ids.add(p.id);
    }
  });

  it("semua tanaman valid & pupukId ada", () => {
    const ids = new Set<string>();
    for (const t of PLANTS) {
      expect(TamananSafe(t)).toBe(true);
      expect(ids.has(t.id)).toBe(false);
      ids.add(t.id);
      for (const tahap of t.pupuk) {
        for (const item of tahap.items) {
          expect(FERTILIZER_MAP[item.pupukId]).toBeDefined();
        }
      }
    }
  });

  it("semua gangguan valid & plants ada", () => {
    const plantIds = new Set(PLANTS.map((p) => p.id));
    const ids = new Set<string>();
    for (const g of GANGGUAN_LIST) {
      expect(GangguanSchema.safeParse(g).success).toBe(true);
      expect(ids.has(g.id)).toBe(false);
      ids.add(g.id);
      for (const pid of g.plants) {
        if (pid !== "*") expect(plantIds.has(pid)).toBe(true);
      }
      for (const p of g.pupukPendukung) {
        expect(FERTILIZER_MAP[p.pupukId]).toBeDefined();
      }
      expect(g.sumber.length).toBeGreaterThan(0);
    }
  });
});

function TamananSafe(t: unknown) {
  return TanamanSchema.safeParse(t).success;
}
