import type { Tanaman } from "../types";

const SUMBER = [
  "Acuan umum budidaya hortikultura; verifikasi dengan panduan Kementan/BPTP/Balitsa setempat",
];

export const sawiHijau: Tanaman = {
  id: "sawi-hijau",
  nama: "Sawi Hijau",
  alias: ["sawi", "caisim", "choy sum"],
  namaLatin: "Brassica rapa L. var. chinensis",
  kategori: "sayuran-daun",
  satuanUmur: "hst",
  populasiPerHa: 300000,
  jarakTanam: "20 x 15 cm",
  umurPanen: [25, 45],
  phIdeal: [6.0, 7.0],
  pupuk: [
    {
      id: "sawihijau-dasar",
      label: "Pupuk dasar",
      fase: "dasar",
      hstMulai: -7,
      metode: "campur-tanah",
      items: [
        { pupukId: "pk-matang", dosis: "10 ton/ha (± 33 g/tanaman)", perHaKg: 10000, perTanamanGram: 33 },
        { pupukId: "sp36", dosis: "100 kg/ha (± 0,3 g/tanaman)", perHaKg: 100, perTanamanGram: 0.3 },
        { pupukId: "npk-161616", dosis: "150 kg/ha (± 0,5 g/tanaman)", perHaKg: 150, perTanamanGram: 0.5 },
      ],
    },
    {
      id: "sawihijau-susulan-1",
      label: "Susulan 1",
      fase: "vegetatif",
      hstMulai: 14,
      metode: "kocor",
      items: [
        { pupukId: "npk-161616", dosis: "100 kg/ha atau kocor 3 g/L air", perHaKg: 100 },
      ],
    },
    {
      id: "sawihijau-susulan-2",
      label: "Susulan 2 (sebelum panen)",
      fase: "vegetatif",
      hstMulai: 30,
      metode: "tabur-alur",
      items: [
        { pupukId: "za", dosis: "50 kg/ha (± 0,2 g/tanaman)", perHaKg: 50, perTanamanGram: 0.2 },
      ],
      catatan: "Stop N 7–10 hari sebelum panen.",
    },
  ],
  catatan: [
    "Sayuran daun cepat panen — jangan berlebihan N (nitrat tinggi).",
    "Siram merata agar daun tidak layu siang.",
  ],
  sumber: SUMBER,
  verified: false,
};

export const pakcoy: Tanaman = {
  id: "pakcoy",
  nama: "Pakcoy",
  alias: ["bok choy", "pak choi"],
  namaLatin: "Brassica rapa L. var. chinensis",
  kategori: "sayuran-daun",
  satuanUmur: "hst",
  populasiPerHa: 300000,
  jarakTanam: "20 x 15 cm",
  umurPanen: [28, 40],
  phIdeal: [6.0, 7.0],
  pupuk: [
    {
      id: "pakcoy-dasar",
      label: "Pupuk dasar",
      fase: "dasar",
      hstMulai: -7,
      metode: "campur-tanah",
      items: [
        { pupukId: "pk-matang", dosis: "10 ton/ha (± 33 g/tanaman)", perHaKg: 10000, perTanamanGram: 33 },
        { pupukId: "sp36", dosis: "100 kg/ha", perHaKg: 100 },
        { pupukId: "npk-161616", dosis: "150 kg/ha (± 0,5 g/tanaman)", perHaKg: 150, perTanamanGram: 0.5 },
      ],
    },
    {
      id: "pakcoy-susulan-1",
      label: "Susulan 1",
      fase: "vegetatif",
      hstMulai: 15,
      metode: "kocor",
      items: [
        { pupukId: "npk-161616", dosis: "100 kg/ha atau kocor 3 g/L", perHaKg: 100 },
      ],
    },
    {
      id: "pakcoy-susulan-2",
      label: "Susulan 2",
      fase: "vegetatif",
      hstMulai: 30,
      metode: "tabur-alur",
      items: [
        { pupukId: "za", dosis: "50 kg/ha", perHaKg: 50 },
        { pupukId: "kcl", dosis: "25 kg/ha", perHaKg: 25 },
      ],
      catatan: "Stop N 10 hari sebelum panen.",
    },
  ],
  catatan: [
    "Daun lebar — jaga kelembapan, jangan kekeringan.",
    "Hindari pupuk N berlebih agar daun tidak lunak.",
  ],
  sumber: SUMBER,
  verified: false,
};

export const bayam: Tanaman = {
  id: "bayam",
  nama: "Bayam",
  alias: ["bayam merah", "bayam hijau", "spinach"],
  namaLatin: "Amaranthus spp.",
  kategori: "sayuran-daun",
  satuanUmur: "hst",
  populasiPerHa: 500000,
  jarakTanam: "20 x 10 cm",
  umurPanen: [20, 35],
  phIdeal: [6.0, 7.5],
  pupuk: [
    {
      id: "bayam-dasar",
      label: "Pupuk dasar",
      fase: "dasar",
      hstMulai: -7,
      metode: "campur-tanah",
      items: [
        { pupukId: "pk-matang", dosis: "5 ton/ha (± 10 g/tanaman)", perHaKg: 5000, perTanamanGram: 10 },
        { pupukId: "npk-161616", dosis: "100 kg/ha (± 0,2 g/tanaman)", perHaKg: 100, perTanamanGram: 0.2 },
      ],
    },
    {
      id: "bayam-susulan",
      label: "Susulan 1",
      fase: "vegetatif",
      hstMulai: 12,
      metode: "kocor",
      items: [
        { pupukId: "za", dosis: "50 kg/ha (± 0,1 g/tanaman)", perHaKg: 50, perTanamanGram: 0.1 },
      ],
    },
  ],
  catatan: [
    "Panen muda (20–30 HST) untuk daun optimal.",
    "Jangan tanam di tanah masam berlebih — pH 6–7,5.",
  ],
  sumber: SUMBER,
  verified: false,
};

export const kangkung: Tanaman = {
  id: "kangkung",
  nama: "Kangkung",
  alias: ["kangkung darat", "water spinach"],
  namaLatin: "Ipomoea aquatica Forsk.",
  kategori: "sayuran-daun",
  satuanUmur: "hst",
  populasiPerHa: 400000,
  jarakTanam: "25 x 10 cm",
  umurPanen: [20, 35],
  phIdeal: [6.0, 7.5],
  pupuk: [
    {
      id: "kangkung-dasar",
      label: "Pupuk dasar",
      fase: "dasar",
      hstMulai: -7,
      metode: "campur-tanah",
      items: [
        { pupukId: "pk-matang", dosis: "8 ton/ha (± 20 g/tanaman)", perHaKg: 8000, perTanamanGram: 20 },
        { pupukId: "npk-161616", dosis: "100 kg/ha (± 0,25 g/tanaman)", perHaKg: 100, perTanamanGram: 0.25 },
      ],
    },
    {
      id: "kangkung-susulan",
      label: "Susulan 1",
      fase: "vegetatif",
      hstMulai: 14,
      metode: "kocor",
      items: [
        { pupukId: "za", dosis: "75 kg/ha (± 0,2 g/tanaman)", perHaKg: 75, perTanamanGram: 0.2 },
      ],
    },
  ],
  catatan: [
    "Respons baik terhadap N — daun lebat, panen cepat.",
    "Jaga kelembapan; kangkung suka lembap tapi tidak becek.",
  ],
  sumber: SUMBER,
  verified: false,
};
