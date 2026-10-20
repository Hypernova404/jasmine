import { describe, it, expect } from "vitest";
import {
  parseDosis,
  parseIntervalHari,
  parseMasaTunggu,
  hitungSemprot,
  type InputSemprot,
} from "@/lib/spray-calc";

describe("parseDosis", () => {
  it("rentang mL/L dengan satuan 'air'", () => {
    expect(parseDosis("0,5–1 ml/L air")).toEqual({
      min: 0.5,
      max: 1,
      satuan: "mL/L",
    });
  });

  it("rentang g/L dengan awalan nama produk", () => {
    expect(parseDosis("Kalsium nitrat 2,5–5 g/L, semprot ke daun")).toEqual({
      min: 2.5,
      max: 5,
      satuan: "g/L",
    });
  });

  it("angka tunggal mL/L → min = max", () => {
    expect(parseDosis("0,5 ml/L air")).toEqual({
      min: 0.5,
      max: 0.5,
      satuan: "mL/L",
    });
  });

  it("satuan g/ha", () => {
    expect(parseDosis("300 g/ha")).toEqual({ min: 300, max: 300, satuan: "g/ha" });
  });

  it("teks label tidak terdeteksi → null", () => {
    expect(parseDosis("sesuai label")).toBeNull();
    expect(parseDosis("cek label produk terdaftar Kementan")).toBeNull();
    expect(parseDosis("10–20 g/lubang tanam atau kocor")).toBeNull();
  });
});

describe("parseIntervalHari", () => {
  it("rentang + konteks", () => {
    expect(parseIntervalHari("5–7 hari saat lembap")).toEqual([5, 7]);
    expect(parseIntervalHari("10–14 hari saat bunga & buah muda")).toEqual([10, 14]);
  });
  it("angka tunggal", () => {
    expect(parseIntervalHari("7 hari")).toEqual([7, 7]);
    expect(parseIntervalHari("preventif / per 14 hari")).toEqual([14, 14]);
  });
  it("tanpa hari → null", () => {
    expect(parseIntervalHari("sesuai label")).toBeNull();
    expect(parseIntervalHari("—")).toBeNull();
    expect(parseIntervalHari("berdasarkan monitoring psyllid")).toBeNull();
  });
});

describe("parseMasaTunggu", () => {
  it("deteksi hari", () => {
    expect(parseMasaTunggu("masa tunggu 14 hari")).toBe(14);
  });
  it("label produk → null", () => {
    expect(parseMasaTunggu("ikuti label produk")).toBeNull();
    expect(parseMasaTunggu(undefined)).toBeNull();
  });
});

describe("hitungSemprot", () => {
  const base: InputSemprot = {
    dosis: { min: 1, max: 2, satuan: "mL/L" },
    kapasitasTangkiL: 16,
    volumePerHaL: 300,
    luasHa: 0.5,
    intervalHari: [5, 10],
    masaTungguHari: 7,
    tanggalSemprot: new Date(2026, 1, 10), // Feb = musim hujan
    tanggalPanen: new Date(2026, 2, 10), // 28 hari lagi
  };

  it("dosis per tangki = dose × kapasitas (basis per liter)", () => {
    const h = hitungSemprot(base);
    expect(h.dosisPerTangkiMin).toBe(16);
    expect(h.dosisPerTangkiMax).toBe(32);
    expect(h.satuan).toBe("mL/L");
  });

  it("dosis per tangki basis per ha = dose × (kapasitas/volume)", () => {
    const h = hitungSemprot({ ...base, dosis: { min: 300, max: 300, satuan: "mL/ha" } });
    // 16 L / 300 L/ha = 0,05333 ha → 300 × 0,05333 = 16 mL
    expect(h.dosisPerTangkiMin).toBeCloseTo(16, 2);
  });

  it("tangki per ha dibulatkan ke atas", () => {
    const h = hitungSemprot(base);
    expect(h.tangkiPerHa).toBe(19); // ceil(300/16) = ceil(18,75) = 19
  });

  it("total produk = dose × volume LAHAN (bukan pembulatan per tangki)", () => {
    const h = hitungSemprot(base);
    expect(h.produkTotalMin).toBe(150); // 1 × 150 L
    expect(h.produkTotalMax).toBe(300); // 2 × 150 L
    expect(h.volumeSemprotTotalL).toBe(150);
    expect(h.tangkiTotal).toBe(10); // ceil(150/16) = 10
  });

  it("interval disesuaikan musim (hujan = batas bawah)", () => {
    const h = hitungSemprot(base); // 10 Feb = hujan
    expect(h.intervalHariDipakai).toBe(5);
    expect(h.jadwalBerikutnya?.getDate()).toBe(15);
  });

  it("kemarau = batas atas", () => {
    const h = hitungSemprot({ ...base, tanggalSemprot: new Date(2026, 6, 10) });
    expect(h.intervalHariDipakai).toBe(10);
  });

  it("masa tunggu aman → tanpa peringatan, batas terakhir = panen − tunggu", () => {
    const h = hitungSemprot({ ...base, tanggalPanen: new Date(2026, 3, 10) });
    expect(h.peringatanPanen).toBeNull();
    expect(h.batasSemprotTerakhir).not.toBeNull();
    expect(h.batasSemprotTerakhir!.getDate()).toBe(3); // 10 Apr − 7 = 3 Apr
  });

  it("panen terlalu dekat → peringatan berisi sisa hari", () => {
    const h = hitungSemprot({ ...base, tanggalPanen: new Date(2026, 1, 14) });
    expect(h.peringatanPanen).toMatch(/masa tunggu 7 hari/);
    expect(h.batasSemprotTerakhir).not.toBeNull();
  });

  it("tanpa masa tunggu tapi ada panen → minta cek label", () => {
    const h = hitungSemprot({ ...base, masaTungguHari: null });
    expect(h.peringatanPanen).toMatch(/label produk/);
  });

  it("tanpa interval → catatan monitoring", () => {
    const h = hitungSemprot({ ...base, intervalHari: null });
    expect(h.jadwalBerikutnya).toBeNull();
    expect(h.catatanInterval).toMatch(/label/);
  });

  it("dosis manual ditandai", () => {
    const h = hitungSemprot({ ...base, dosisManual: true });
    expect(h.catatanDosis).toMatch(/manual/);
  });

  it("validasi input", () => {
    expect(() => hitungSemprot({ ...base, kapasitasTangkiL: 0 })).toThrow();
    expect(() => hitungSemprot({ ...base, luasHa: 0 })).toThrow();
  });
});
