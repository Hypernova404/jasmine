import type { Tanaman } from "../types";

export const mentimun: Tanaman = {
  id: "mentimun",
  nama: "Mentimun",
  alias: ["timun", "bimbi", "cucumber"],
  namaLatin: "Cucumis sativus L.",
  kategori: "sayuran-buah",
  satuanUmur: "hst",
  populasiPerHa: 25000,
  jarakTanam: "80 x 50 cm (ajir/turus)",
  umurPanen: [35, 60],
  phIdeal: [6.0, 6.8],
  pupuk: [
    {
      id: "timun-dasar",
      label: "Pupuk dasar",
      fase: "dasar",
      hstMulai: -7,
      metode: "tabur-lubang",
      items: [
        {
          pupukId: "pk-matang",
          dosis: "15 ton/ha (± 0,6 kg/tanaman)",
          perHaKg: 15000,
          perTanamanGram: 600,
        },
        {
          pupukId: "npk-161616",
          dosis: "200 kg/ha (± 8 g/tanaman)",
          perHaKg: 200,
          perTanamanGram: 8,
        },
      ],
    },
    {
      id: "timun-susulan-1",
      label: "Susulan 1",
      fase: "vegetatif",
      hstMulai: 7,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "npk-161616",
          dosis: "5 g/tanaman, tabur dan siram",
          perTanamanGram: 5,
        },
      ],
    },
    {
      id: "timun-veg-kocor",
      label: "Kocor vegetatif",
      fase: "vegetatif",
      hstMulai: 14,
      hstSelesai: 35,
      ulangiHari: 7,
      metode: "kocor",
      items: [
        {
          pupukId: "npk-161616",
          dosis: "5 g/L air, 200 ml/tanaman",
          perTanamanGram: 1.0,
        },
      ],
    },
    {
      id: "timun-susulan-2",
      label: "Susulan 2",
      fase: "vegetatif",
      hstMulai: 25,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "npk-161616",
          dosis: "7,5 g/tanaman",
          perTanamanGram: 7.5,
        },
        {
          pupukId: "kcl",
          dosis: "5 g/tanaman",
          perTanamanGram: 5,
        },
      ],
    },
    {
      id: "timun-panen",
      label: "Pemeliharaan saat panen",
      fase: "panen",
      hstMulai: 38,
      hstSelesai: 60,
      ulangiHari: 7,
      metode: "kocor",
      items: [
        {
          pupukId: "kno3",
          dosis: "5 g/L air, 200 ml/tanaman",
          perTanamanGram: 1.0,
        },
      ],
    },
  ],
  catatan: [
    "Kebutuhan air tinggi dan merata — jangan sampai stres air.",
    "Hindari daun basah malam hari (mencegah embun bulu).",
    "Pasang ajir/turus sejak tanam.",
  ],
  sumber: [
    "Acuan umum budidaya hortikultura; verifikasi dengan panduan Kementan/BPTP/Balitsa setempat",
  ],
  verified: false,
};
