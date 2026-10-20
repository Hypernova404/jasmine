import { describe, it, expect } from "vitest";
import {
  kgPupukDariHara,
  kebutuhanPupuk,
  susunJadwalTierB,
  bangunTanamanTierB,
  targetEfektif,
  formatKg,
} from "@/lib/fertilizer-engine";
import { TEMPLATES, TEMPLATES_MAP } from "@/data/templates";
import { KOMODITAS_TIER_B, KOMODITAS_TIER_B_MAP } from "@/data/master-list";
import { FERTILIZER_MAP } from "@/data/fertilizers";
import { TanamanSchema } from "@/data/schema";
import type { KomoditasTierB } from "@/data/types";

describe("kgPupukDariHara", () => {
  it("urea 46% — 100 kg N = 217,4 kg pupuk", () => {
    expect(kgPupukDariHara(100, 46)).toBe(217.4);
  });

  it("kasus nol / kadar nol menghasilkan 0", () => {
    expect(kgPupukDariHara(0, 46)).toBe(0);
    expect(kgPupukDariHara(100, 0)).toBe(0);
    expect(kgPupukDariHara(-5, 46)).toBe(0);
  });
});

describe("kebutuhanPupuk", () => {
  it("satu sumber nitrogen (urea 46%)", () => {
    const hasil = kebutuhanPupuk({ n: 80, p: 0, k: 0 }, { n: "urea" });
    expect(hasil).toEqual([{ pupukId: "urea", kg: 173.9 }]);
  });

  it("tiga sumber tunggal dihitung terpisah", () => {
    const hasil = kebutuhanPupuk(
      { n: 200, p: 100, k: 200 },
      { n: "urea", p: "sp36", k: "kcl" },
    );
    expect(hasil).toEqual([
      { pupukId: "urea", kg: 434.8 },
      { pupukId: "sp36", kg: 277.8 },
      { pupukId: "kcl", kg: 333.3 },
    ]);
  });

  it("majemuk satu pupuk untuk tiga hara — dipakai maksimum (hara penentu)", () => {
    const hasil = kebutuhanPupuk(
      { n: 150, p: 75, k: 150 },
      { n: "npk-151515", p: "npk-151515", k: "npk-151515" },
    );
    // N: 150/0,15 = 1000 · P: 75/0,15 = 500 · K: 150/0,15 = 1000 → max 1000
    expect(hasil).toEqual([{ pupukId: "npk-151515", kg: 1000 }]);
  });

  it("sumber tanpa kadar / hara nol dilewati", () => {
    const hasil = kebutuhanPupuk({ n: 100, p: 0, k: 0 }, { n: "dolomit", p: "sp36" });
    expect(hasil).toEqual([]);
  });
});

describe("targetEfektif", () => {
  it("override hanya mengganti kunci yang diberikan", () => {
    const t = TEMPLATES_MAP["solanaceae-buah"];
    expect(targetEfektif(t, { n: 120 })).toEqual({ n: 120, p: 100, k: 200 });
    expect(targetEfektif(t)).toEqual({ n: 200, p: 100, k: 200 });
  });
});

describe("susunJadwalTierB", () => {
  const t = TEMPLATES_MAP["solanaceae-buah"];

  it("menghasilkan satu tahap per template, id unik, label berbobot", () => {
    const jadwal = susunJadwalTierB({ template: t });
    expect(jadwal).toHaveLength(t.tahap.length);
    expect(new Set(jadwal.map((j) => j.id)).size).toBe(jadwal.length);
    expect(jadwal[0].label).toContain("40% target");
    expect(jadwal.every((j) => j.items.length > 0)).toBe(true);
  });

  it("konservasi hara: Σ perHaKg × kadar ≈ target total (dibulatkan ≤0,1 kg)", () => {
    const jadwal = susunJadwalTierB({ template: t });
    const total = { n: 0, p: 0, k: 0 };
    for (const tahap of jadwal) {
      for (const item of tahap.items) {
        const kadar = FERTILIZER_MAP[item.pupukId]?.kadar;
        if (!kadar || item.perHaKg === undefined) continue;
        total.n += ((kadar.n ?? 0) / 100) * item.perHaKg;
        total.p += ((kadar.p ?? 0) / 100) * item.perHaKg;
        total.k += ((kadar.k ?? 0) / 100) * item.perHaKg;
      }
    }
    expect(total.n).toBeCloseTo(t.target.n, 0);
    expect(total.p).toBeCloseTo(t.target.p, 0);
    expect(total.k).toBeCloseTo(t.target.k, 0);
  });

  it("populasi → perTanamanGram + teks dosis", () => {
    const jadwal = susunJadwalTierB({ template: t, populasiPerHa: 50000 });
    const dasar = jadwal[0].items.find((i) => i.pupukId === "urea");
    expect(dasar?.perHaKg).toBe(173.9);
    expect(dasar?.perTanamanGram).toBe(3.5);
    expect(dasar?.dosis).toContain("kg/ha");
    expect(dasar?.dosis).toContain("g/tanaman");
  });

  it("override target berlaku", () => {
    const jadwal = susunJadwalTierB({ template: t, target: { n: 46 } });
    const dasar = jadwal[0].items.find((i) => i.pupukId === "urea");
    // 46 × 0,4 = 18,4 kg N → 40 kg urea
    expect(dasar?.perHaKg).toBe(40);
  });

  it("template majemuk (hias) tetap satu item per tahap", () => {
    const jadwal = susunJadwalTierB({ template: TEMPLATES_MAP["hias"] });
    expect(jadwal.every((j) => j.items.length === 1)).toBe(true);
    expect(jadwal[0].items[0].pupukId).toBe("npk-151515");
  });

  it("setiap template: total bobot 1 & seluruh target hara terpenuhi (≥, boleh lebih)", () => {
    for (const template of TEMPLATES) {
      const jadwal = susunJadwalTierB({ template });
      expect(jadwal).toHaveLength(template.tahap.length);
      const total = { n: 0, p: 0, k: 0 };
      for (const tahap of jadwal) {
        for (const item of tahap.items) {
          const kadar = FERTILIZER_MAP[item.pupukId]?.kadar;
          if (!kadar || item.perHaKg === undefined) continue;
          total.n += ((kadar.n ?? 0) / 100) * item.perHaKg;
          total.p += ((kadar.p ?? 0) / 100) * item.perHaKg;
          total.k += ((kadar.k ?? 0) / 100) * item.perHaKg;
        }
      }
      // Sumber tunggal → pas; majemuk (hara penentu maks) → boleh berlebih.
      expect(total.n).toBeGreaterThanOrEqual(template.target.n - 0.5);
      expect(total.p).toBeGreaterThanOrEqual(template.target.p - 0.5);
      expect(total.k).toBeGreaterThanOrEqual(template.target.k - 0.5);
    }
  });
});

describe("bangunTanamanTierB", () => {
  const entri = KOMODITAS_TIER_B_MAP["brokoli"];

  it("berhasil dibangun & lolos TanamanSchema", () => {
    const tanaman = bangunTanamanTierB(entri);
    expect(tanaman.tier).toBe("B");
    expect(tanaman.kelompok).toBe("brassica-kubis");
    expect(tanaman.phIdeal).toEqual([6, 7]);
    expect(tanaman.pupuk.length).toBeGreaterThan(0);
    expect(() => TanamanSchema.parse(tanaman)).not.toThrow();
  });

  it("kelompok tak dikenal → error", () => {
    const palsu: KomoditasTierB = { ...entri, kelompok: "tidak-ada" };
    expect(() => bangunTanamanTierB(palsu)).toThrow(/tidak ada di templates/);
  });

  it("seluruh batch master lolos schema setelah dibangun", () => {
    for (const k of KOMODITAS_TIER_B) {
      const tanaman = bangunTanamanTierB(k);
      expect(() => TanamanSchema.parse(tanaman)).not.toThrow();
    }
  });
});

describe("formatKg", () => {
  it("format Indonesia (desimal koma)", () => {
    expect(formatKg(217.4)).toBe("217,4");
    expect(formatKg(1234.5)).toBe("1.234,5");
  });
});
