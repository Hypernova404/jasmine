import type { Tanaman } from "../types";

export const cabai: Tanaman = {
  id: "cabai-merah-besar",
  nama: "Cabai Merah Besar",
  alias: ["cabai", "cabai keriting", "cabe"],
  namaLatin: "Capsicum annuum L.",
  kategori: "sayuran-buah",
  satuanUmur: "hst",
  populasiPerHa: 18000,
  jarakTanam: "60 x 50 cm (bedengan mulsa)",
  umurPanen: [75, 150],
  phIdeal: [6.0, 6.8],
  pupuk: [
    {
      id: "cabai-dasar-1",
      label: "Pupuk dasar 1 — pembenah tanah",
      fase: "dasar",
      hstMulai: -14,
      metode: "campur-tanah",
      items: [
        {
          pupukId: "dolomit",
          dosis: "1–2 ton/ha jika pH < 5,5 (campur tanah)",
          perHaKg: 1500,
        },
      ],
      catatan: "Hanya jika pH tanah < 5,5.",
    },
    {
      id: "cabai-dasar-2",
      label: "Pupuk dasar 2 — kandang + majemuk",
      fase: "dasar",
      hstMulai: -7,
      metode: "tabur-lubang",
      items: [
        {
          pupukId: "pk-matang",
          dosis: "20 ton/ha (± 1 kg/tanaman)",
          perHaKg: 20000,
          perTanamanGram: 1000,
        },
        {
          pupukId: "sp36",
          dosis: "200 kg/ha (± 11 g/tanaman)",
          perHaKg: 200,
          perTanamanGram: 11,
        },
        {
          pupukId: "npk-161616",
          dosis: "300 kg/ha (± 17 g/tanaman)",
          perHaKg: 300,
          perTanamanGram: 17,
        },
      ],
      catatan: "Aplikasi ke lubang tanam / campur bedengan.",
    },
    {
      id: "cabai-veg-kocor",
      label: "Kocor vegetatif",
      fase: "vegetatif",
      hstMulai: 10,
      hstSelesai: 28,
      ulangiHari: 7,
      metode: "kocor",
      items: [
        {
          pupukId: "npk-161616",
          dosis: "5 g/L air, 250 ml/tanaman (± 1,25 g/tanaman/aplikasi)",
          perTanamanGram: 1.25,
        },
      ],
    },
    {
      id: "cabai-susulan-tabur-1",
      label: "Susulan tabur 1",
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
      catatan: "Tabur alur 10 cm dari tanaman, tutup tanah, siram.",
    },
    {
      id: "cabai-gen-kocor",
      label: "Kocor generatif",
      fase: "generatif",
      hstMulai: 37,
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
      id: "cabai-susulan-tabur-2",
      label: "Susulan tabur 2",
      fase: "generatif",
      hstMulai: 60,
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
      id: "cabai-panen",
      label: "Pemeliharaan saat panen",
      fase: "panen",
      hstMulai: 77,
      hstSelesai: 150,
      ulangiHari: 10,
      metode: "kocor",
      items: [
        {
          pupukId: "npk-151515",
          dosis: "5 g/L air + KNO3 5 g/L, 250 ml/tanaman",
          perTanamanGram: 1.25,
        },
        {
          pupukId: "kno3",
          dosis: "5 g/L air (campur), 250 ml/tanaman",
          perTanamanGram: 1.25,
        },
      ],
      catatan:
        "Semprot daun kalsium nitrat 2,5 g/L tiap 14 hari untuk cegah busuk ujung buah. Stop kocor 3 hari sebelum panen besar jika hujan lebat.",
    },
  ],
  catatan: [
    "Hindari N berlebih saat berbunga.",
    "Mulsa perak/hitam tekan gulma & jaga kelembapan.",
    "Pengairan teratur — fluktuasi air picu rontok bunga & buah retak.",
    "Template juga dipakai untuk cabai-rawit dengan populasi lebih rapat.",
  ],
  sumber: [
    "Acuan umum budidaya hortikultura; verifikasi dengan panduan Kementan/BPTP/Balitsa setempat",
  ],
  verified: false,
};
