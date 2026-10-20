import type { Tanaman } from "../types";

const SUMBER = [
  "Acuan umum budidaya hortikultura; verifikasi dengan panduan Kementan/BPTP/Balitsa setempat",
];

export const wortel: Tanaman = {
  id: "wortel",
  nama: "Wortel",
  alias: ["carrot"],
  namaLatin: "Daucus carota L.",
  kategori: "sayuran-umbi",
  satuanUmur: "hst",
  populasiPerHa: 1000000,
  jarakTanam: "20 x 5 cm (setelah pangkas)",
  umurPanen: [70, 100],
  phIdeal: [6.0, 7.0],
  pupuk: [
    {
      id: "wortel-dasar",
      label: "Pupuk dasar",
      fase: "dasar",
      hstMulai: -7,
      metode: "campur-tanah",
      items: [
        { pupukId: "pk-matang", dosis: "15 ton/ha", perHaKg: 15000 },
        { pupukId: "sp36", dosis: "150 kg/ha (± 0,15 g/tanaman)", perHaKg: 150, perTanamanGram: 0.15 },
        { pupukId: "npk-151515", dosis: "100 kg/ha (± 0,1 g/tanaman)", perHaKg: 100, perTanamanGram: 0.1 },
      ],
    },
    {
      id: "wortel-susulan-1",
      label: "Susulan 1 (daun rimbun)",
      fase: "vegetatif",
      hstMulai: 30,
      metode: "kocor",
      items: [
        { pupukId: "npk-151515", dosis: "75 kg/ha (± 0,075 g/tanaman)", perHaKg: 75, perTanamanGram: 0.075 },
      ],
    },
    {
      id: "wortel-umbi",
      label: "Pembesaran umbi",
      fase: "generatif",
      hstMulai: 55,
      metode: "kocor",
      items: [
        { pupukId: "kcl", dosis: "75 kg/ha (± 0,075 g/tanaman)", perHaKg: 75, perTanamanGram: 0.075 },
      ],
      catatan: "Dominan K. Stop N setelah ± 45 HST — N berlebih memicu umbi bercabang & berbulu.",
    },
  ],
  catatan: [
    "Stop N setelah 45 HST (umbi bercabang bila N berlebih).",
    "Tanah harus gembur & bebatuan — umbi tidak menyerong.",
    "Pangkas daun jika terlalu lebat supaya fokus ke umbi.",
  ],
  sumber: SUMBER,
  verified: false,
};

export const kentang: Tanaman = {
  id: "kentang",
  nama: "Kentang",
  alias: ["kentang grati", "potato"],
  namaLatin: "Solanum tuberosum L.",
  kategori: "sayuran-umbi",
  satuanUmur: "hst",
  populasiPerHa: 60000,
  jarakTanam: "60 x 25 cm",
  umurPanen: [80, 120],
  phIdeal: [5.5, 6.5],
  pupuk: [
    {
      id: "kentang-dasar-1",
      label: "Pupuk dasar 1 — pembenah tanah",
      fase: "dasar",
      hstMulai: -14,
      metode: "campur-tanah",
      items: [
        { pupukId: "dolomit", dosis: "1 ton/ha jika pH < 5,5", perHaKg: 1000 },
      ],
    },
    {
      id: "kentang-dasar-2",
      label: "Pupuk dasar 2 — kandang + majemuk",
      fase: "dasar",
      hstMulai: -7,
      metode: "tabur-lubang",
      items: [
        { pupukId: "pk-matang", dosis: "20 ton/ha (± 333 g/tanaman)", perHaKg: 20000, perTanamanGram: 333 },
        { pupukId: "sp36", dosis: "150 kg/ha (± 2,5 g/tanaman)", perHaKg: 150, perTanamanGram: 2.5 },
        { pupukId: "npk-161616", dosis: "250 kg/ha (± 4,2 g/tanaman)", perHaKg: 250, perTanamanGram: 4.2 },
      ],
    },
    {
      id: "kentang-susulan-1",
      label: "Susulan 1 (tunas naik)",
      fase: "vegetatif",
      hstMulai: 20,
      metode: "tabur-alur",
      items: [
        { pupukId: "npk-161616", dosis: "150 kg/ha (± 2,5 g/tanaman)", perHaKg: 150, perTanamanGram: 2.5 },
      ],
    },
    {
      id: "kentang-susulan-2",
      label: "Susulan 2 (pembentukan umbi)",
      fase: "generatif",
      hstMulai: 45,
      metode: "tabur-alur",
      items: [
        { pupukId: "npk-161616", dosis: "150 kg/ha (± 2,5 g/tanaman)", perHaKg: 150, perTanamanGram: 2.5 },
        { pupukId: "kcl", dosis: "75 kg/ha (± 1,25 g/tanaman)", perHaKg: 75, perTanamanGram: 1.25 },
      ],
    },
    {
      id: "kentang-susulan-3",
      label: "Susulan 3 — dominasi K",
      fase: "generatif",
      hstMulai: 65,
      metode: "tabur-alur",
      items: [
        { pupukId: "kcl", dosis: "75 kg/ha (± 1,25 g/tanaman)", perHaKg: 75, perTanamanGram: 1.25 },
      ],
      catatan: "Stop N setelah 60 HST — umbi matang & tahan simpan.",
    },
  ],
  catatan: [
    "Gundukkan (hilling) saat tanaman naik — cegah umbi terpapar cahaya (hijau & beracun).",
    "Stop N setelah 60 HST.",
    "Musim hujan: hawar daun & alternaria marak — monitor daun bawah.",
  ],
  sumber: SUMBER,
  verified: false,
};

export const bawangPutih: Tanaman = {
  id: "bawang-putih",
  nama: "Bawang Putih",
  alias: ["bawang lanang", "garlic"],
  namaLatin: "Allium sativum L.",
  kategori: "sayuran-umbi",
  satuanUmur: "hst",
  populasiPerHa: 400000,
  jarakTanam: "20 x 12,5 cm",
  umurPanen: [80, 110],
  phIdeal: [6.0, 7.0],
  pupuk: [
    {
      id: "baput-dasar",
      label: "Pupuk dasar",
      fase: "dasar",
      hstMulai: -7,
      metode: "campur-tanah",
      items: [
        { pupukId: "pk-matang", dosis: "15 ton/ha (± 37 g/tanaman)", perHaKg: 15000, perTanamanGram: 37 },
        { pupukId: "sp36", dosis: "200 kg/ha (± 0,5 g/tanaman)", perHaKg: 200, perTanamanGram: 0.5 },
        { pupukId: "kcl", dosis: "75 kg/ha (± 0,2 g/tanaman)", perHaKg: 75, perTanamanGram: 0.2 },
      ],
    },
    {
      id: "baput-susulan-1",
      label: "Susulan 1",
      fase: "vegetatif",
      hstMulai: 25,
      metode: "tabur-alur",
      items: [
        { pupukId: "za", dosis: "100 kg/ha (± 0,25 g/tanaman)", perHaKg: 100, perTanamanGram: 0.25 },
        { pupukId: "kcl", dosis: "50 kg/ha (± 0,1 g/tanaman)", perHaKg: 50, perTanamanGram: 0.1 },
      ],
    },
    {
      id: "baput-susulan-2",
      label: "Susulan 2",
      fase: "vegetatif",
      hstMulai: 50,
      metode: "tabur-alur",
      items: [
        { pupukId: "za", dosis: "100 kg/ha (± 0,25 g/tanaman)", perHaKg: 100, perTanamanGram: 0.25 },
        { pupukId: "kcl", dosis: "50 kg/ha (± 0,1 g/tanaman)", perHaKg: 50, perTanamanGram: 0.1 },
      ],
    },
    {
      id: "baput-pembesaran",
      label: "Pembesaran siung (opsional)",
      fase: "generatif",
      hstMulai: 75,
      metode: "tabur-alur",
      items: [
        { pupukId: "kcl", dosis: "50 kg/ha (± 0,1 g/tanaman)", perHaKg: 50, perTanamanGram: 0.1 },
      ],
      catatan: "Stop N sepenuhnya — siung jadi lunak & mudah busuk saat simpan.",
    },
  ],
  catatan: [
    "Stop N setelah ± 70 HST (siung matang & tahan simpan).",
    "Hindari genangan — umbi busuk (moler).",
    "Kurangi pengairan 10–14 hari sebelum panen.",
  ],
  sumber: SUMBER,
  verified: false,
};
