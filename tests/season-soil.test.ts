import { describe, it, expect } from "vitest";
import { getMusim, getMusimDetail, sesuaikanIntervalMusim, catatanMusim } from "@/lib/season";
import {
  rekomendasiKapur,
  bagiAplikasiPasir,
  gantiUreaKeZa,
  pengaliOrganikPasir,
  DEFAULT_SOIL_PROFILE,
} from "@/lib/soil-profile";

const d = (month1: number, day = 15) => new Date(2026, month1 - 1, day);

describe("lib/season", () => {
  it("getMusim: Nov-Apr = hujan, Mei-Okt = kemarau", () => {
    expect(getMusim(d(1))).toBe("hujan");
    expect(getMusim(d(4))).toBe("hujan");
    expect(getMusim(d(5))).toBe("kemarau");
    expect(getMusim(d(7))).toBe("kemarau");
    expect(getMusim(d(10))).toBe("kemarau");
    expect(getMusim(d(11))).toBe("hujan");
    expect(getMusim(d(12))).toBe("hujan");
  });

  it("getMusimDetail: Mei & Okt = transisi", () => {
    expect(getMusimDetail(d(5))).toBe("transisi");
    expect(getMusimDetail(d(10))).toBe("transisi");
    expect(getMusimDetail(d(1))).toBe("hujan");
    expect(getMusimDetail(d(6))).toBe("kemarau");
  });

  it("sesuaikanInterval: hujan batas bawah, kemarau batas atas", () => {
    expect(sesuaikanIntervalMusim([5, 10], "hujan")).toBe(5);
    expect(sesuaikanIntervalMusim([5, 10], "kemarau")).toBe(10);
  });

  it("catatanMusim tidak kosong", () => {
    expect(catatanMusim("hujan").length).toBeGreaterThan(10);
    expect(catatanMusim("kemarau").length).toBeGreaterThan(10);
  });
});

describe("lib/soil-profile", () => {
  it("profil default: mineral, lempung-berpasir, tanpa pH, tadah hujan", () => {
    expect(DEFAULT_SOIL_PROFILE.jenis).toBe("mineral");
    expect(DEFAULT_SOIL_PROFILE.tekstur).toBe("lempung-berpasir");
    expect(DEFAULT_SOIL_PROFILE.ph).toBeNull();
    expect(DEFAULT_SOIL_PROFILE.sumberAir).toBe("tadah-hujan");
  });

  it("kapur: tidak ada tanpa input pH; kondisional bila pH kosong", () => {
    const kosong = rekomendasiKapur(null);
    expect(kosong.perlu).toBe(false);
    expect(kosong.kondisional).toBe(true);
    expect(kosong.dolomitTonPerHa).toBe(0);
  });

  it("kapur: tabel sesuai (4,4→3 t; 4,5→2 t; 5,0→1 t; 5,4→1 t; 5,5→0)", () => {
    expect(rekomendasiKapur(4.4)).toMatchObject({ perlu: true, dolomitTonPerHa: 3 });
    expect(rekomendasiKapur(4.5)).toMatchObject({ perlu: true, dolomitTonPerHa: 2 });
    expect(rekomendasiKapur(4.9)).toMatchObject({ perlu: true, dolomitTonPerHa: 2 });
    expect(rekomendasiKapur(5.0)).toMatchObject({ perlu: true, dolomitTonPerHa: 1 });
    expect(rekomendasiKapur(5.4)).toMatchObject({ perlu: true, dolomitTonPerHa: 1 });
    expect(rekomendasiKapur(5.5)).toMatchObject({ perlu: false, kondisional: false });
    expect(rekomendasiKapur(6.5)).toMatchObject({ perlu: false });
    expect(rekomendasiKapur(7.3)).toMatchObject({ perlu: false });
  });

  it("kapur tahunan: kg/pohon, bukan ton/ha", () => {
    const r = rekomendasiKapur(5.0, true);
    expect(r.dolomitTonPerHa).toBe(0);
    expect(r.dolomitKgPerPohon).toBe(1);
    expect(r.catatan).toMatch(/kg\/pohon\/tahun/);
  });

  it("kapur: pH > 7,3 tanpa kapur + catatan ZA/klorosis", () => {
    const r = rekomendasiKapur(7.5);
    expect(r.perlu).toBe(false);
    expect(r.dolomitTonPerHa).toBe(0);
    expect(r.catatan).toMatch(/ZA/);
    expect(r.catatan).toMatch(/klorosis/);
  });

  it("bagiAplikasiPasir: x1,5 bulat ke atas, maks 2x", () => {
    expect(bagiAplikasiPasir(1)).toBe(2); // ceil(1.5)=2, cap 2
    expect(bagiAplikasiPasir(2)).toBe(3); // ceil(3.0)=3, cap 4
    expect(bagiAplikasiPasir(4)).toBe(6); // ceil(6.0)=6, cap 8
    expect(bagiAplikasiPasir(7)).toBe(11); // ceil(10.5)=11, cap 14
    expect(bagiAplikasiPasir(0)).toBe(0);
  });

  it("gantiUreaKeZa hanya bila pH > 7,3", () => {
    expect(gantiUreaKeZa(7.4)).toBe(true);
    expect(gantiUreaKeZa(7.3)).toBe(false);
    expect(gantiUreaKeZa(6.5)).toBe(false);
    expect(gantiUreaKeZa(null)).toBe(false);
  });

  it("pengaliOrganikPasir: 1,25x untuk berpasir, 1x selain itu", () => {
    expect(pengaliOrganikPasir("pasir")).toBe(1.25);
    expect(pengaliOrganikPasir("lempung-berpasir")).toBe(1.25);
    expect(pengaliOrganikPasir("lempung")).toBe(1);
    expect(pengaliOrganikPasir("liat")).toBe(1);
  });
});
