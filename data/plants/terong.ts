import type { Tanaman } from "../types";

export const terong: Tanaman = {
  id: "terong",
  nama: "Terong",
  alias: ["terong ungu", "eggplant"],
  namaLatin: "Solanum melongena L.",
  kategori: "sayuran-buah",
  satuanUmur: "hst",
  populasiPerHa: 12000,
  jarakTanam: "100 x 60 cm",
  umurPanen: [60, 150],
  phIdeal: [5.5, 6.8],
  pupuk: [
    {
      id: "terong-dasar-1",
      label: "Pupuk dasar 1 — pembenah tanah",
      fase: "dasar",
      hstMulai: -14,
      metode: "campur-tanah",
      items: [
        {
          pupukId: "dolomit",
          dosis: "1–2 ton/ha jika pH < 5,5",
          perHaKg: 1500,
        },
      ],
    },
    {
      id: "terong-dasar-2",
      label: "Pupuk dasar 2 — kandang + majemuk",
      fase: "dasar",
      hstMulai: -7,
      metode: "tabur-lubang",
      items: [
        {
          pupukId: "pk-matang",
          dosis: "20 ton/ha (± 1,7 kg/tanaman)",
          perHaKg: 20000,
          perTanamanGram: 1700,
        },
        {
          pupukId: "sp36",
          dosis: "150 kg/ha",
          perHaKg: 150,
        },
        {
          pupukId: "npk-161616",
          dosis: "300 kg/ha (± 25 g/tanaman)",
          perHaKg: 300,
          perTanamanGram: 25,
        },
      ],
    },
    {
      id: "terong-veg-kocor",
      label: "Kocor vegetatif",
      fase: "vegetatif",
      hstMulai: 14,
      hstSelesai: 35,
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
      id: "terong-susulan-1",
      label: "Susulan 1",
      fase: "vegetatif",
      hstMulai: 30,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "npk-161616",
          dosis: "15 g/tanaman",
          perTanamanGram: 15,
        },
        {
          pupukId: "kcl",
          dosis: "7,5 g/tanaman",
          perTanamanGram: 7.5,
        },
      ],
    },
    {
      id: "terong-gen-kocor",
      label: "Kocor generatif",
      fase: "generatif",
      hstMulai: 42,
      hstSelesai: 70,
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
      id: "terong-panen",
      label: "Pemeliharaan saat panen",
      fase: "panen",
      hstMulai: 60,
      hstSelesai: 150,
      ulangiHari: 14,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "npk-151515",
          dosis: "15 g/tanaman",
          perTanamanGram: 15,
        },
      ],
    },
  ],
  catatan: [
    "Pangkas tunas bawah untuk sirkulasi udara.",
    "Pengendalian penggerek buah penting saat panen berlangsung.",
  ],
  sumber: [
    "Acuan umum budidaya hortikultura; verifikasi dengan panduan Kementan/BPTP/Balitsa setempat",
  ],
  verified: false,
};
