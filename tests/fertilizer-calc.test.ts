import { describe, it, expect } from "vitest";
import {
  ekspansiTahap,
  hitungJadwalPupuk,
  hitungJumlahTanaman,
  hitungUmur,
  statusAplikasi,
} from "@/lib/fertilizer-calc";
import { cabai } from "@/data/plants/cabai";
import { bawangMerah } from "@/data/plants/bawang-merah";
import type { TahapPupuk } from "@/data/types";

describe("ekspansiTahap", () => {
  it("tanpa ulangiHari hanya menghasilkan hstMulai", () => {
    const t: TahapPupuk = {
      id: "x",
      label: "Dasar",
      fase: "dasar",
      hstMulai: -7,
      metode: "tabur-lubang",
      items: [{ pupukId: "urea", dosis: "x", perHaKg: 10 }],
    };
    expect(ekspansiTahap(t)).toEqual([-7]);
  });

  it("mendukung hst negatif (pupuk dasar)", () => {
    const t: TahapPupuk = {
      id: "x",
      label: "Dasar",
      fase: "dasar",
      hstMulai: -14,
      metode: "campur-tanah",
      items: [{ pupukId: "dolomit", dosis: "x", perHaKg: 1000 }],
    };
    expect(ekspansiTahap(t)[0]).toBe(-14);
  });

  it("ulangiHari + hstSelesai menghasilkan ekspansi", () => {
    const t: TahapPupuk = {
      id: "x",
      label: "Kocor",
      fase: "vegetatif",
      hstMulai: 10,
      hstSelesai: 28,
      ulangiHari: 7,
      metode: "kocor",
      items: [{ pupukId: "urea", dosis: "x", perTanamanGram: 1 }],
    };
    expect(ekspansiTahap(t)).toEqual([10, 17, 24]);
  });
});

describe("hitungJumlahTanaman", () => {
  it("dari jumlah tanaman menghitung luas", () => {
    const r = hitungJumlahTanaman({ jumlahTanaman: 18000 }, 18000);
    expect(r.jumlahTanaman).toBe(18000);
    expect(r.luasHa).toBeCloseTo(1);
  });

  it("dari luas m2 menghitung populasi", () => {
    const r = hitungJumlahTanaman({ luasM2: 10000 }, 18000);
    expect(r.luasHa).toBeCloseTo(1);
    expect(r.jumlahTanaman).toBe(18000);
  });

  it("dari luas ha menghitung populasi", () => {
    const r = hitungJumlahTanaman({ luasM2: 10000 * 0.5 }, 20000);
    expect(r.luasHa).toBeCloseTo(0.5);
    expect(r.jumlahTanaman).toBe(10000);
  });
});

describe("hitungUmur", () => {
  it("pakai umurSekarang jika diisi", () => {
    expect(hitungUmur(new Date(), "hst", 30)).toBe(30);
  });

  it("hitung dari tanggal tanam (hst)", () => {
    const d = new Date(Date.now() - 10 * 86400000);
    expect(hitungUmur(d, "hst")).toBe(10);
  });

  it("hitung dari tanggal tanam (bulan)", () => {
    const d = new Date(Date.now() - 90 * 86400000);
    expect(hitungUmur(d, "bulan")).toBe(3);
  });
});

describe("statusAplikasi", () => {
  it("klasifikasi lewat/kini/nanti", () => {
    expect(statusAplikasi(10, 30)).toBe("lewat");
    expect(statusAplikasi(30, 30)).toBe("kini");
    expect(statusAplikasi(50, 30)).toBe("nanti");
  });
});

describe("hitungJadwalPupuk — cabai", () => {
  const hasil = hitungJadwalPupuk(cabai, {
    tanggalTanam: new Date("2026-01-01"),
    jumlahTanaman: 18000,
    luasHa: 1,
  });

  it("mengandung pupuk dasar negatif HST", () => {
    expect(hasil.aplikasi.some((a) => a.hst < 0)).toBe(true);
  });

  it("total aplikasi > 10 (ada ulangan)", () => {
    expect(hasil.totalAplikasi).toBeGreaterThan(10);
  });

  it("total kebutuhan NPK terisi", () => {
    const npk = hasil.totalKebutuhan.find((t) => t.pupukId === "npk-161616");
    expect(npk).toBeDefined();
    expect(npk!.totalKg).toBeGreaterThan(0);
  });

  it("tanggal dihitung dari tanggal tanam", () => {
    const dasar = hasil.aplikasi.find((a) => a.hst === -7)!;
    expect(dasar.tanggal.getTime()).toBe(
      new Date("2026-01-01").getTime() - 7 * 86400000,
    );
  });
});

describe("hitungJadwalPupuk — bawang (perHaKg)", () => {
  it("dosis perHaKg menghasilkan total kg dari luas", () => {
    const hasil = hitungJadwalPupuk(bawangMerah, {
      tanggalTanam: new Date("2026-01-01"),
      jumlahTanaman: 400000,
      luasHa: 1,
    });
    const za = hasil.totalKebutuhan.find((t) => t.pupukId === "za");
    expect(za).toBeDefined();
    expect(za!.totalKg).toBeCloseTo(300, 0);
  });
});
