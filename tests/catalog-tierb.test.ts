import { describe, it, expect } from "vitest";
import {
  SEMUA_TANAMAN,
  TANAMAN_MAP,
  getTanaman,
  cariKatalog,
  PLANTS,
} from "@/lib/catalog";
import { KOMODITAS_TIER_B } from "@/data/master-list";

describe("SEMUA_TANAMAN (integrasi Tier A + B)", () => {
  it("jumlah = Tier A + Tier B, id unik", () => {
    expect(SEMUA_TANAMAN).toHaveLength(PLANTS.length + KOMODITAS_TIER_B.length);
    const ids = SEMUA_TANAMAN.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("semua Tier A bertier 'A'/undefined dan Tier B bertier 'B'", () => {
    const setA = new Set(PLANTS.map((p) => p.id));
    for (const t of SEMUA_TANAMAN) {
      if (setA.has(t.id)) expect(t.tier).not.toBe("B");
      else expect(t.tier).toBe("B");
    }
  });

  it("setiap Tier B punya jadwal pupuk hasil engine", () => {
    for (const t of SEMUA_TANAMAN) {
      if (t.tier !== "B") continue;
      expect(t.pupuk.length).toBeGreaterThan(0);
      expect(t.kelompok).toBeTruthy();
    }
  });

  it("TANAMAN_MAP & getTanaman menjangkau Tier B", () => {
    expect(TANAMAN_MAP["paprika"]).toBeDefined();
    expect(TANAMAN_MAP["paprika"].tier).toBe("B");
    expect(getTanaman("nanas")?.tier).toBe("B");
    expect(getTanaman("tidak-ada")).toBeUndefined();
  });

  it("cariKatalog menemukan komoditas Tier B lewat nama & alias", () => {
    const hasil = cariKatalog("paprika", "tanaman");
    expect(hasil.some((h) => h.tipe === "tanaman" && h.item.id === "paprika")).toBe(true);
    const lewatAlias = cariKatalog("pineapple", "tanaman");
    expect(lewatAlias.some((h) => h.tipe === "tanaman" && h.item.id === "nanas")).toBe(true);
  });

  it("jadwal Tier B memuat catatan waktu sesuai satuan template", () => {
    const nanas = getTanaman("nanas");
    expect(nanas?.pupuk.some((t) => (t.catatan ?? "").includes("bulan"))).toBe(true);
  });
});
