import type { Tanaman } from "../types";

export const bawangMerah: Tanaman = {
  id: "bawang-merah",
  nama: "Bawang Merah",
  alias: ["brambang", "bawang"],
  namaLatin: "Allium cepa L. var. aggregatum",
  kategori: "sayuran-umbi",
  satuanUmur: "hst",
  populasiPerHa: 400000,
  jarakTanam: "15 x 20 cm",
  umurPanen: [55, 65],
  phIdeal: [6.0, 6.8],
  pupuk: [
    {
      id: "bamer-dasar-1",
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
      id: "bamer-dasar-2",
      label: "Pupuk dasar 2 — kandang + SP-36 + KCl",
      fase: "dasar",
      hstMulai: -7,
      metode: "campur-tanah",
      items: [
        {
          pupukId: "pk-matang",
          dosis: "10 ton/ha",
          perHaKg: 10000,
        },
        {
          pupukId: "sp36",
          dosis: "200 kg/ha",
          perHaKg: 200,
        },
        {
          pupukId: "kcl",
          dosis: "100 kg/ha",
          perHaKg: 100,
        },
      ],
      catatan: "Tanah gembur dengan drainase baik.",
    },
    {
      id: "bamer-susulan-1",
      label: "Susulan 1",
      fase: "vegetatif",
      hstMulai: 10,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "za",
          dosis: "150 kg/ha",
          perHaKg: 150,
        },
        {
          pupukId: "kcl",
          dosis: "50 kg/ha",
          perHaKg: 50,
        },
      ],
      catatan: "Tabur merata di antara barisan lalu siram.",
    },
    {
      id: "bamer-susulan-2",
      label: "Susulan 2",
      fase: "vegetatif",
      hstMulai: 25,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "za",
          dosis: "150 kg/ha",
          perHaKg: 150,
        },
        {
          pupukId: "kcl",
          dosis: "50 kg/ha",
          perHaKg: 50,
        },
      ],
    },
    {
      id: "bamer-pembesaran",
      label: "Pembesaran umbi (opsional)",
      fase: "generatif",
      hstMulai: 35,
      hstSelesai: 45,
      ulangiHari: 10,
      metode: "semprot-daun",
      items: [
        {
          pupukId: "kno3",
          dosis: "5 g/L air (semprot daun)",
          perHaKg: 2,
        },
      ],
    },
  ],
  catatan: [
    "PENTING: hentikan pupuk N setelah ± 40 HST — umbi jadi lunak & mudah busuk saat simpan.",
    "Hindari genangan air.",
    "Kurangi pengairan 10 hari sebelum panen agar umbi matang.",
  ],
  sumber: [
    "Acuan umum budidaya hortikultura; verifikasi dengan panduan Kementan/BPTP/Balitsa setempat",
  ],
  verified: false,
};
