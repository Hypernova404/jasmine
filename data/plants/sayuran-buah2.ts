import type { Tanaman } from "../types";

const SUMBER = [
  "Acuan umum budidaya hortikultura; verifikasi dengan panduan Kementan/BPTP/Balitsa setempat",
];

export const cabaiRawit: Tanaman = {
  id: "cabai-rawit",
  nama: "Cabai Rawit",
  alias: ["rawit", "cabe rawit", "bird's eye chili", "cabe setan"],
  namaLatin: "Capsicum frutescens L.",
  kategori: "sayuran-buah",
  satuanUmur: "hst",
  populasiPerHa: 40000,
  jarakTanam: "60 x 40 cm",
  umurPanen: [60, 120],
  phIdeal: [6.0, 7.0],
  pupuk: [
    {
      id: "rawit-dasar-1",
      label: "Pupuk dasar 1 — pembenah tanah",
      fase: "dasar",
      hstMulai: -14,
      metode: "campur-tanah",
      items: [
        { pupukId: "dolomit", dosis: "1 ton/ha jika pH < 6", perHaKg: 1000 },
      ],
    },
    {
      id: "rawit-dasar-2",
      label: "Pupuk dasar 2 — kandang + majemuk",
      fase: "dasar",
      hstMulai: -7,
      metode: "campur-tanah",
      items: [
        { pupukId: "pk-matang", dosis: "15 ton/ha (± 50 g/tanaman)", perHaKg: 15000, perTanamanGram: 50 },
        { pupukId: "sp36", dosis: "150 kg/ha (± 0,5 g/tanaman)", perHaKg: 150, perTanamanGram: 0.5 },
        { pupukId: "npk-161616", dosis: "200 kg/ha (± 0,7 g/tanaman)", perHaKg: 200, perTanamanGram: 0.7 },
      ],
    },
    {
      id: "rawit-susulan-1",
      label: "Susulan 1 (tunas baru)",
      fase: "vegetatif",
      hstMulai: 21,
      metode: "tabur-alur",
      items: [
        { pupukId: "npk-161616", dosis: "100 kg/ha (± 0,3 g/tanaman)", perHaKg: 100, perTanamanGram: 0.3 },
        { pupukId: "za", dosis: "50 kg/ha (± 0,2 g/tanaman)", perHaKg: 50, perTanamanGram: 0.2 },
      ],
    },
    {
      id: "rawit-generatif",
      label: "Susulan pembungaan",
      fase: "generatif",
      hstMulai: 40,
      metode: "kocor",
      items: [
        { pupukId: "npk-151515", dosis: "100 kg/ha atau kocor 3 g/L air", perHaKg: 100 },
        { pupukId: "kcl", dosis: "50 kg/ha (± 0,2 g/tanaman)", perHaKg: 50, perTanamanGram: 0.2 },
      ],
    },
    {
      id: "rawit-panen",
      label: "Susulan rutin saat panen",
      fase: "panen",
      hstMulai: 60,
      hstSelesai: 120,
      ulangiHari: 21,
      metode: "kocor",
      items: [
        { pupukId: "kcl", dosis: "50 kg/ha (± 0,2 g/tanaman)", perHaKg: 50, perTanamanGram: 0.2 },
        { pupukId: "npk-151515", dosis: "75 kg/ha (± 0,3 g/tanaman)", perHaKg: 75, perTanamanGram: 0.3 },
      ],
      catatan: "Rawit dipetik bertahap — K penting agar buah padat & tahan angkut.",
    },
  ],
  catatan: [
    "Rawit pedas — N berlebih membuat daun rimbun tapi buah sedikit.",
    "Panen rutin merangsang pembungaan lanjutan.",
    "Kalsium (semprot Ca nitrat) cegah buah keriting & busuk ujung.",
  ],
  sumber: SUMBER,
  verified: false,
};

export const melon: Tanaman = {
  id: "melon",
  nama: "Melon",
  alias: ["cantaloupe", "honeydew"],
  namaLatin: "Cucumis melo L.",
  kategori: "sayuran-buah",
  satuanUmur: "hst",
  populasiPerHa: 10000,
  jarakTanam: "200 x 50 cm (1 tanaman/lubang)",
  umurPanen: [70, 95],
  phIdeal: [6.0, 7.0],
  pupuk: [
    {
      id: "melon-dasar",
      label: "Pupuk dasar",
      fase: "dasar",
      hstMulai: -7,
      metode: "campur-tanah",
      items: [
        { pupukId: "pk-matang", dosis: "20 ton/ha (± 200 g/tanaman)", perHaKg: 20000, perTanamanGram: 200 },
        { pupukId: "sp36", dosis: "200 kg/ha (± 2 g/tanaman)", perHaKg: 200, perTanamanGram: 2 },
        { pupukId: "npk-161616", dosis: "250 kg/ha (± 2,5 g/tanaman)", perHaKg: 250, perTanamanGram: 2.5 },
      ],
    },
    {
      id: "melon-susulan-1",
      label: "Susulan 1 (memanjat)",
      fase: "vegetatif",
      hstMulai: 21,
      metode: "kocor",
      items: [
        { pupukId: "npk-161616", dosis: "150 kg/ha atau kocor 3 g/L air", perHaKg: 150 },
      ],
    },
    {
      id: "melon-generatif",
      label: "Susulan pembungaan",
      fase: "generatif",
      hstMulai: 35,
      metode: "kocor",
      items: [
        { pupukId: "npk-151515", dosis: "100 kg/ha (± 1 g/tanaman)", perHaKg: 100, perTanamanGram: 1 },
        { pupukId: "kcl", dosis: "100 kg/ha (± 1 g/tanaman)", perHaKg: 100, perTanamanGram: 1 },
      ],
    },
    {
      id: "melon-buah",
      label: "Pembesaran buah",
      fase: "generatif",
      hstMulai: 50,
      metode: "kocor",
      items: [
        { pupukId: "kcl", dosis: "100 kg/ha (± 1 g/tanaman)", perHaKg: 100, perTanamanGram: 1 },
        { pupukId: "can", dosis: "100 kg/ha (± 1 g/tanaman)", perHaKg: 100, perTanamanGram: 1 },
      ],
      catatan: "Stop N sejak buah mulai membesar — gula (Brix) turun bila N tinggi.",
    },
  ],
  catatan: [
    "Pilih 1 buah terbaik per tanaman, buang sisanya (biasanya buah ke-3–5).",
    "Stop N setelah buah mulai membesar.",
    "Jaga kelembapan seragam — perubahan drastis memicu pecah buah.",
  ],
  sumber: SUMBER,
  verified: false,
};

export const semangka: Tanaman = {
  id: "semangka",
  nama: "Semangka",
  alias: ["watermelon", "semangka tanpa biji"],
  namaLatin: "Citrullus lanatus (Thunb.) Matsum. & Nakai",
  kategori: "sayuran-buah",
  satuanUmur: "hst",
  populasiPerHa: 8000,
  jarakTanam: "250 x 50 cm",
  umurPanen: [70, 95],
  phIdeal: [6.0, 7.0],
  pupuk: [
    {
      id: "semangka-dasar",
      label: "Pupuk dasar",
      fase: "dasar",
      hstMulai: -7,
      metode: "campur-tanah",
      items: [
        { pupukId: "pk-matang", dosis: "15 ton/ha (± 190 g/tanaman)", perHaKg: 15000, perTanamanGram: 190 },
        { pupukId: "sp36", dosis: "200 kg/ha (± 2,5 g/tanaman)", perHaKg: 200, perTanamanGram: 2.5 },
        { pupukId: "npk-161616", dosis: "200 kg/ha (± 2,5 g/tanaman)", perHaKg: 200, perTanamanGram: 2.5 },
      ],
    },
    {
      id: "semangka-susulan-1",
      label: "Susulan 1 (memanjat)",
      fase: "vegetatif",
      hstMulai: 18,
      metode: "kocor",
      items: [
        { pupukId: "npk-161616", dosis: "125 kg/ha atau kocor 3 g/L air", perHaKg: 125 },
      ],
    },
    {
      id: "semangka-generatif",
      label: "Susulan pembungaan",
      fase: "generatif",
      hstMulai: 32,
      metode: "kocor",
      items: [
        { pupukId: "npk-151515", dosis: "100 kg/ha (± 1,25 g/tanaman)", perHaKg: 100, perTanamanGram: 1.25 },
        { pupukId: "kcl", dosis: "100 kg/ha (± 1,25 g/tanaman)", perHaKg: 100, perTanamanGram: 1.25 },
      ],
    },
    {
      id: "semangka-buah",
      label: "Pembesaran buah",
      fase: "generatif",
      hstMulai: 45,
      metode: "kocor",
      items: [
        { pupukId: "kcl", dosis: "100 kg/ha (± 1,25 g/tanaman)", perHaKg: 100, perTanamanGram: 1.25 },
        { pupukId: "kno3", dosis: "50 kg/ha (± 0,6 g/tanaman)", perHaKg: 50, perTanamanGram: 0.6 },
      ],
      catatan: "K dominan untuk rasa manis. Stop N setelah buah selesai membesar.",
    },
  ],
  catatan: [
    "Beri alas (palet/plastik) di bawah buah — cegah busuk akibat tanah lembap.",
    "Panen saat sulur dekat tangkai buah mengering.",
    "Stop N setelah buah mulai membesar.",
  ],
  sumber: SUMBER,
  verified: false,
};

export const jagungManis: Tanaman = {
  id: "jagung-manis",
  nama: "Jagung Manis",
  alias: ["jagung", "sweet corn"],
  namaLatin: "Zea mays L. saccharata",
  kategori: "sayuran-buah",
  satuanUmur: "hst",
  populasiPerHa: 50000,
  jarakTanam: "80 x 25 cm (2 tanaman/lubang)",
  umurPanen: [65, 90],
  phIdeal: [5.8, 7.0],
  pupuk: [
    {
      id: "jagung-dasar",
      label: "Pupuk dasar",
      fase: "dasar",
      hstMulai: -7,
      metode: "tabur-lubang",
      items: [
        { pupukId: "pk-matang", dosis: "10 ton/ha (± 40 g/tanaman)", perHaKg: 10000, perTanamanGram: 40 },
        { pupukId: "sp36", dosis: "200 kg/ha (± 0,8 g/tanaman)", perHaKg: 200, perTanamanGram: 0.8 },
        { pupukId: "npk-161616", dosis: "200 kg/ha (± 0,8 g/tanaman)", perHaKg: 200, perTanamanGram: 0.8 },
      ],
    },
    {
      id: "jagung-susulan-1",
      label: "Susulan 1 (tunas 4–5 helai)",
      fase: "vegetatif",
      hstMulai: 21,
      metode: "tabur-alur",
      items: [
        { pupukId: "urea", dosis: "150 kg/ha (± 0,6 g/tanaman)", perHaKg: 150, perTanamanGram: 0.6 },
        { pupukId: "kcl", dosis: "75 kg/ha (± 0,3 g/tanaman)", perHaKg: 75, perTanamanGram: 0.3 },
      ],
    },
    {
      id: "jagung-generatif",
      label: "Susulan 2 (sebelum malai)",
      fase: "generatif",
      hstMulai: 40,
      metode: "tabur-alur",
      items: [
        { pupukId: "npk-151515", dosis: "150 kg/ha (± 0,6 g/tanaman)", perHaKg: 150, perTanamanGram: 0.6 },
        { pupukId: "kcl", dosis: "75 kg/ha (± 0,3 g/tanaman)", perHaKg: 75, perTanamanGram: 0.3 },
      ],
      catatan: "Panen jagung manis muda (sebelum biji mengeras) untuk rasa optimal.",
    },
  ],
  catatan: [
    "Panen saat silikel berisi susu (± 3 minggu setelah malai jantan muncul).",
    "Genangan saat berbuah memicu busuk batang.",
    "Panen cepat — gula berubah jadi pati bila terlambat.",
  ],
  sumber: SUMBER,
  verified: false,
};

export const pare: Tanaman = {
  id: "pare",
  nama: "Pare",
  alias: ["peria", "bitter melon", "paria"],
  namaLatin: "Momordica charantia L.",
  kategori: "sayuran-buah",
  satuanUmur: "hst",
  populasiPerHa: 10000,
  jarakTanam: "200 x 50 cm (ajir/trellis)",
  umurPanen: [45, 90],
  phIdeal: [6.0, 7.0],
  pupuk: [
    {
      id: "pare-dasar",
      label: "Pupuk dasar",
      fase: "dasar",
      hstMulai: -7,
      metode: "campur-tanah",
      items: [
        { pupukId: "pk-matang", dosis: "15 ton/ha (± 150 g/tanaman)", perHaKg: 15000, perTanamanGram: 150 },
        { pupukId: "sp36", dosis: "150 kg/ha (± 1,5 g/tanaman)", perHaKg: 150, perTanamanGram: 1.5 },
        { pupukId: "npk-161616", dosis: "150 kg/ha (± 1,5 g/tanaman)", perHaKg: 150, perTanamanGram: 1.5 },
      ],
    },
    {
      id: "pare-susulan-1",
      label: "Susulan 1 (memanjat)",
      fase: "vegetatif",
      hstMulai: 21,
      metode: "kocor",
      items: [
        { pupukId: "npk-161616", dosis: "100 kg/ha atau kocor 3 g/L air", perHaKg: 100 },
      ],
    },
    {
      id: "pare-generatif",
      label: "Susulan pembungaan",
      fase: "generatif",
      hstMulai: 35,
      metode: "kocor",
      items: [
        { pupukId: "npk-151515", dosis: "75 kg/ha (± 0,8 g/tanaman)", perHaKg: 75, perTanamanGram: 0.8 },
        { pupukId: "kcl", dosis: "50 kg/ha (± 0,5 g/tanaman)", perHaKg: 50, perTanamanGram: 0.5 },
      ],
      catatan: "Panen rutin buah muda merangsang bunga lanjutan.",
    },
  ],
  catatan: [
    "Pasang ajir/trellis sejak muda — pare memanjat kuat.",
    "Panen buah muda (5–7 hari setelah buah terbentuk) untuk pahit optimal.",
    "Hindari N berlebih — daun lebat, buah sedikit.",
  ],
  sumber: SUMBER,
  verified: false,
};
