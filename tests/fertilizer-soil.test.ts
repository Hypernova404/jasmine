import { describe, it, expect } from "vitest";
import { hitungJadwalPupuk, sebarHst } from "@/lib/fertilizer-calc";
import { bayam } from "@/data/plants/sayuran-daun";
import { cabai } from "@/data/plants/cabai";
import { kentang } from "@/data/plants/sayuran-umbi";
import { PLANTS } from "@/data/plants";
import { KETINGGIAN_IDEAL } from "@/data/ketinggian";
import type { Tanaman } from "@/data/types";

function hitung(tanaman: Tanaman, extra: Record<string, unknown> = {}) {
  return hitungJadwalPupuk(tanaman, {
    tanggalTanam: new Date("2026-01-01"),
    jumlahTanaman: tanaman.populasiPerHa,
    luasHa: 1,
    ...extra,
  });
}

const adaDolomit = (h: ReturnType<typeof hitung>) =>
  h.aplikasi.some((a) => a.items.some((i) => i.pupukId === "dolomit"));

describe("sebarHst", () => {
  it("tunggal pra-tanam dimundurkan agar tetap pra-tanam", () => {
    expect(sebarHst([-7], 2)).toEqual([-14, -7]);
  });
  it("tunggal pasca-tanam maju sesuai ulangiHari", () => {
    expect(sebarHst([10], 2, 14)).toEqual([10, 24]);
    expect(sebarHst([10], 2)).toEqual([10, 17]);
  });
  it("multi mempertahankan rentang pertama–terakhir", () => {
    const out = sebarHst([10, 17, 24, 31], 6);
    expect(out.length).toBe(6);
    expect(out[0]).toBe(10);
    expect(out[out.length - 1]).toBe(31);
    for (let i = 1; i < out.length; i++) expect(out[i]).toBeGreaterThan(out[i - 1]);
  });
  it("baru <= asli tidak diubah", () => {
    expect(sebarHst([10, 17], 2)).toEqual([10, 17]);
  });
});

describe("kapur / pH", () => {
  it("pH ≥ 5,5 — tahap dolomit data dibuang & tidak perlu kapur", () => {
    const h = hitung(cabai, { pH: 6.5 });
    expect(adaDolomit(h)).toBe(false);
    expect(h.perluDolomit).toBe(false);
    expect(h.rekomendasiDolomitTonPerHa).toBe(0);
    expect(h.totalKebutuhan.some((t) => t.pupukId === "dolomit")).toBe(false);
  });

  it("pH 5,0 — injeksi tahap dolomit H-14 (1 ton/ha)", () => {
    const h = hitung(bayam, { pH: 5.0 });
    expect(h.perluDolomit).toBe(true);
    expect(h.rekomendasiDolomitTonPerHa).toBe(1);
    const ap = h.aplikasi.find((a) => a.tahapId === "kapur-dolomit");
    expect(ap).toBeDefined();
    expect(ap!.hst).toBe(-14);
    expect(ap!.items[0].totalKg).toBeCloseTo(1000, 5);
    expect(h.totalKebutuhan.find((t) => t.pupukId === "dolomit")!.totalKg).toBeCloseTo(
      1000,
      5,
    );
  });

  it("pH 4,4 — dolomit 3 ton/ha (batas maksimum)", () => {
    const h = hitung(bayam, { pH: 4.4 });
    expect(h.rekomendasiDolomitTonPerHa).toBe(3);
    expect(h.aplikasi.find((a) => a.tahapId === "kapur-dolomit")!.items[0].totalKg).toBeCloseTo(
      3000,
      5,
    );
  });

  it("pH kosong — kondisional (uji pH), tanpa injeksi", () => {
    const h = hitung(bayam, {});
    expect(h.kapurKondisional).toBe(true);
    expect(h.perluDolomit).toBe(false);
    expect(h.aplikasi.some((a) => a.tahapId === "kapur-dolomit")).toBe(false);
    expect(h.catatanTanah.join(" ")).toMatch(/uji pH/i);
  });

  it("pH > 7,3 — tanpa kapur, catatan ganti urea ke ZA", () => {
    const h = hitung(bayam, { pH: 7.4 });
    expect(h.perluDolomit).toBe(false);
    expect(adaDolomit(h)).toBe(false);
    expect(h.catatanTanah.join(" ")).toMatch(/ZA/);
    expect(h.catatanTanah.join(" ")).toMatch(/klorosis/);
  });

  it("pohon (satuanUmur bulan) — tidak diinjeksi, dosis tahunan kg/pohon", () => {
    const h = hitungJadwalPupuk(
      { ...kentang, satuanUmur: "bulan", pupuk: kentang.pupuk.filter(
        (t) => !t.items.some((i) => i.pupukId === "dolomit"),
      ) },
      { tanggalTanam: new Date("2026-01-01"), jumlahTanaman: 1000, luasHa: 1, pH: 5.0 },
    );
    expect(h.aplikasi.some((a) => a.tahapId === "kapur-dolomit")).toBe(false);
    expect(h.dolomitKgPerPohon).toBe(1);
  });
});

describe("tekstur berpasir — pembagian aplikasi ×1,5", () => {
  const base = hitung(cabai, {});
  const pasir = hitung(cabai, { tekstur: "berpasir" });

  it("jumlah aplikasi bertambah & ditandai dibagiTekstur", () => {
    expect(pasir.totalAplikasi).toBeGreaterThan(base.totalAplikasi);
    const dibagi = pasir.aplikasi.filter((a) => a.dibagiTekstur);
    expect(dibagi.length).toBeGreaterThan(0);
    for (const ap of dibagi) {
      expect(ap.dibagiTekstur!.baru).toBeGreaterThan(ap.dibagiTekstur!.asli);
      expect(ap.catatan).toMatch(/dibagi/);
      expect(ap.catatan).toMatch(/total hara tetap sama/);
    }
  });

  it("total hara TIDAK dinaikkan (hanya dibagi per aplikasi)", () => {
    const get = (h: ReturnType<typeof hitung>, id: string) =>
      h.totalKebutuhan.find((t) => t.pupukId === id)?.totalKg ?? 0;
    for (const id of ["npk-161616", "urea", "za", "kcl"]) {
      expect(get(pasir, id)).toBeCloseTo(get(base, id), 4);
    }
  });

  it("tanpa pilihan tekstur — ekspansi tidak berubah", () => {
    expect(base.aplikasi.some((a) => a.dibagiTekstur)).toBe(false);
    expect(hitung(cabai, { tekstur: "lempung" }).aplikasi.some((a) => a.dibagiTekstur)).toBe(
      false,
    );
  });
});

describe("musim, air & mdpl", () => {
  it("setiap aplikasi punya catatanMusim (tanam Jan = hujan)", () => {
    const h = hitung(cabai, {});
    expect(h.aplikasi.length).toBeGreaterThan(0);
    for (const ap of h.aplikasi) expect(ap.catatanMusim).toBeTruthy();
    expect(h.aplikasi[0].catatanMusim).toMatch(/hujan/);
  });

  it("tadah hujan + kemarau + kocor → catatan cadangan air", () => {
    const h = hitung(cabai, { tanggalTanam: new Date("2026-07-01") });
    const kocorKemarau = h.aplikasi.filter(
      (a) => a.metode === "kocor" && a.tanggal.getMonth() + 1 >= 5 && a.tanggal.getMonth() + 1 <= 10,
    );
    expect(kocorKemarau.length).toBeGreaterThan(0);
    for (const ap of kocorKemarau) {
      expect(ap.catatanMusim).toMatch(/Tadah hujan/);
    }
    expect(h.catatanAir).toMatch(/tadah hujan/);
  });

  it("irigasi → catatan air tanpa penyesuaian, tanpa catatan cadangan", () => {
    const h = hitung(cabai, { tanggalTanam: new Date("2026-07-01"), sumberAir: "irigasi" });
    expect(h.catatanAir).toMatch(/irigasi/);
    expect(h.aplikasi.every((a) => !a.catatanMusim?.includes("cadangan air"))).toBe(true);
  });

  it("mdpl di luar rentang ideal → peringatan; di dalam → null", () => {
    const diLuar = hitung(kentang, { mdpl: 300 });
    expect(diLuar.peringatanMdpl).toMatch(/1000–2400 mdpl/);
    const diDalam = hitung(kentang, { mdpl: 1500 });
    expect(diDalam.peringatanMdpl).toBeNull();
    expect(hitung(bayam, { mdpl: 300 }).peringatanMdpl).toBeNull();
  });

  it("peringatan musim berjalan terisi", () => {
    expect(hitung(bayam, {}).peringatanMusim.length).toBeGreaterThan(10);
  });

  it("catatanTanah selalu terisi (default lempung berpasir)", () => {
    const h = hitung(bayam, {});
    expect(h.catatanTanah.join(" ")).toMatch(/lempung berpasir/);
    expect(hitung(bayam, { tekstur: "liat" }).catatanTanah.join(" ")).toMatch(/liat/);
  });
});

describe("data ketinggian", () => {
  it("semua ID di KETINGGIAN_IDEAL ada di PLANTS", () => {
    const ids = new Set(PLANTS.map((p) => p.id));
    for (const key of Object.keys(KETINGGIAN_IDEAL)) {
      expect(ids.has(key), `ID tidak dikenal: ${key}`).toBe(true);
    }
  });
  it("rentang valid (min < max, ≥ 0)", () => {
    for (const [k, [lo, hi]] of Object.entries(KETINGGIAN_IDEAL)) {
      expect(lo, k).toBeGreaterThanOrEqual(0);
      expect(hi, k).toBeGreaterThan(lo);
    }
  });
});
