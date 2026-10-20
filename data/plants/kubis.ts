import type { Tanaman } from "../types";

export const kubis: Tanaman = {
  id: "kubis",
  nama: "Kubis",
  alias: ["kol", "kubis bundar", "cabbage"],
  namaLatin: "Brassica oleracea L. var. capitata",
  kategori: "sayuran-daun",
  satuanUmur: "hst",
  populasiPerHa: 30000,
  jarakTanam: "60 x 50 cm",
  umurPanen: [70, 90],
  phIdeal: [6.0, 7.0],
  pupuk: [
    {
      id: "kubis-dasar-1",
      label: "Pupuk dasar 1 — pembenah tanah",
      fase: "dasar",
      hstMulai: -14,
      metode: "campur-tanah",
      items: [
        {
          pupukId: "dolomit",
          dosis: "2 ton/ha (target pH 6,0–6,5; penting cegah akar gada)",
          perHaKg: 2000,
        },
      ],
    },
    {
      id: "kubis-dasar-2",
      label: "Pupuk dasar 2 — kandang + majemuk",
      fase: "dasar",
      hstMulai: -7,
      metode: "tabur-lubang",
      items: [
        {
          pupukId: "pk-matang",
          dosis: "25 ton/ha (± 0,8 kg/tanaman)",
          perHaKg: 25000,
          perTanamanGram: 800,
        },
        {
          pupukId: "sp36",
          dosis: "150 kg/ha",
          perHaKg: 150,
        },
        {
          pupukId: "npk-161616",
          dosis: "300 kg/ha (± 10 g/tanaman)",
          perHaKg: 300,
          perTanamanGram: 10,
        },
      ],
    },
    {
      id: "kubis-susulan-1",
      label: "Susulan 1",
      fase: "vegetatif",
      hstMulai: 14,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "za",
          dosis: "100 kg/ha (± 3,3 g/tanaman)",
          perHaKg: 100,
          perTanamanGram: 3.3,
        },
      ],
    },
    {
      id: "kubis-susulan-2",
      label: "Susulan 2",
      fase: "vegetatif",
      hstMulai: 28,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "npk-161616",
          dosis: "200 kg/ha (± 6,7 g/tanaman)",
          perHaKg: 200,
          perTanamanGram: 6.7,
        },
        {
          pupukId: "kcl",
          dosis: "100 kg/ha (± 3,3 g/tanaman)",
          perHaKg: 100,
          perTanamanGram: 3.3,
        },
      ],
    },
    {
      id: "kubis-mikro-1",
      label: "Semprot boron 1",
      fase: "vegetatif",
      hstMulai: 30,
      metode: "semprot-daun",
      items: [
        {
          pupukId: "borax",
          dosis: "1 g/L air (semprot daun, opsional)",
          perHaKg: 0.5,
        },
      ],
      catatan: "Cegah batang berongga & krop retak.",
    },
    {
      id: "kubis-susulan-3",
      label: "Susulan 3 — pembentukan krop",
      fase: "generatif",
      hstMulai: 42,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "za",
          dosis: "100 kg/ha",
          perHaKg: 100,
        },
        {
          pupukId: "kcl",
          dosis: "100 kg/ha",
          perHaKg: 100,
        },
      ],
    },
    {
      id: "kubis-mikro-2",
      label: "Semprot boron 2",
      fase: "generatif",
      hstMulai: 45,
      metode: "semprot-daun",
      items: [
        {
          pupukId: "borax",
          dosis: "1 g/L air (semprot daun, opsional)",
          perHaKg: 0.5,
        },
      ],
    },
  ],
  catatan: [
    "Stop N setelah 55–60 HST agar krop tidak retak.",
    "Siram teratur menghindari krop pecah.",
    "Dolomit penting untuk cegah akar gada pada brassica.",
  ],
  sumber: [
    "Acuan umum budidaya hortikultura; verifikasi dengan panduan Kementan/BPTP/Balitsa setempat",
  ],
  verified: false,
};
