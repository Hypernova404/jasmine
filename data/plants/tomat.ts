import type { Tanaman } from "../types";

export const tomat: Tanaman = {
  id: "tomat",
  nama: "Tomat",
  alias: ["tomat ceri", "tomato"],
  namaLatin: "Solanum lycopersicum L.",
  kategori: "sayuran-buah",
  satuanUmur: "hst",
  populasiPerHa: 25000,
  jarakTanam: "50 x 60 cm + ajir",
  umurPanen: [65, 120],
  phIdeal: [6.0, 6.8],
  pupuk: [
    {
      id: "tomat-dasar-1",
      label: "Pupuk dasar 1 — pembenah tanah",
      fase: "dasar",
      hstMulai: -14,
      metode: "campur-tanah",
      items: [
        {
          pupukId: "dolomit",
          dosis: "1,5 ton/ha jika pH < 5,5",
          perHaKg: 1500,
        },
      ],
    },
    {
      id: "tomat-dasar-2",
      label: "Pupuk dasar 2 — kandang + majemuk",
      fase: "dasar",
      hstMulai: -7,
      metode: "tabur-lubang",
      items: [
        {
          pupukId: "pk-matang",
          dosis: "20 ton/ha (± 0,8 kg/tanaman)",
          perHaKg: 20000,
          perTanamanGram: 800,
        },
        {
          pupukId: "sp36",
          dosis: "150 kg/ha (± 6 g/tanaman)",
          perHaKg: 150,
          perTanamanGram: 6,
        },
        {
          pupukId: "npk-161616",
          dosis: "300 kg/ha (± 12 g/tanaman)",
          perHaKg: 300,
          perTanamanGram: 12,
        },
      ],
    },
    {
      id: "tomat-veg-kocor",
      label: "Kocor vegetatif",
      fase: "vegetatif",
      hstMulai: 14,
      hstSelesai: 28,
      ulangiHari: 7,
      metode: "kocor",
      items: [
        {
          pupukId: "npk-161616",
          dosis: "5 g/L air, 250 ml/tanaman",
          perTanamanGram: 1.25,
        },
      ],
    },
    {
      id: "tomat-susulan-1",
      label: "Susulan 1",
      fase: "vegetatif",
      hstMulai: 30,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "npk-161616",
          dosis: "10 g/tanaman",
          perTanamanGram: 10,
        },
        {
          pupukId: "kcl",
          dosis: "5 g/tanaman",
          perTanamanGram: 5,
        },
      ],
    },
    {
      id: "tomat-gen-kocor",
      label: "Kocor generatif",
      fase: "generatif",
      hstMulai: 35,
      hstSelesai: 55,
      ulangiHari: 7,
      metode: "kocor",
      items: [
        {
          pupukId: "npk-161616",
          dosis: "5 g/L air + KNO3 5 g/L, 250 ml/tanaman",
          perTanamanGram: 1.25,
        },
        {
          pupukId: "kno3",
          dosis: "5 g/L air (campur), 250 ml/tanaman",
          perTanamanGram: 1.25,
        },
      ],
    },
    {
      id: "tomat-kalsium",
      label: "Aplikasi kalsium (cegah busuk ujung buah)",
      fase: "generatif",
      hstMulai: 40,
      hstSelesai: 100,
      ulangiHari: 10,
      metode: "semprot-daun",
      items: [
        {
          pupukId: "can",
          dosis: "2,5 g/L air (semprot daun / kocor)",
          perTanamanGram: 0.625,
        },
      ],
    },
    {
      id: "tomat-susulan-2",
      label: "Susulan 2",
      fase: "generatif",
      hstMulai: 55,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "npk-151515",
          dosis: "10 g/tanaman",
          perTanamanGram: 10,
        },
        {
          pupukId: "kcl",
          dosis: "7,5 g/tanaman",
          perTanamanGram: 7.5,
        },
      ],
    },
    {
      id: "tomat-panen",
      label: "Pemeliharaan saat panen",
      fase: "panen",
      hstMulai: 70,
      hstSelesai: 120,
      ulangiHari: 10,
      metode: "kocor",
      items: [
        {
          pupukId: "kno3",
          dosis: "5 g/L air + NPK 15-15-15 5 g/L, 250 ml/tanaman",
          perTanamanGram: 1.25,
        },
        {
          pupukId: "npk-151515",
          dosis: "5 g/L air (campur), 250 ml/tanaman",
          perTanamanGram: 1.25,
        },
      ],
    },
  ],
  catatan: [
    "Siram teratur — fluktuasi air memicu pecah buah & busuk ujung buah.",
    "Wiwil tunas air agar sirkulasi baik.",
    "Pasang ajir/lanjaran sejak muda.",
  ],
  sumber: [
    "Acuan umum budidaya hortikultura; verifikasi dengan panduan Kementan/BPTP/Balitsa setempat",
  ],
  verified: false,
};
