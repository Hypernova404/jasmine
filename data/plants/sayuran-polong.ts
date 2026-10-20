import type { Tanaman } from "../types";

const SUMBER = [
  "Acuan umum budidaya hortikultura; verifikasi dengan panduan Kementan/BPTP/Balitsa setempat",
];

export const kacangPanjang: Tanaman = {
  id: "kacang-panjang",
  nama: "Kacang Panjang",
  alias: ["kacang", "long bean"],
  namaLatin: "Vigna unguiculata ssp. sesquipedalis",
  kategori: "sayuran-polong",
  satuanUmur: "hst",
  populasiPerHa: 100000,
  jarakTanam: "50 x 20 cm (ajir)",
  umurPanen: [50, 80],
  phIdeal: [6.0, 7.0],
  pupuk: [
    {
      id: "kacangpanjang-dasar",
      label: "Pupuk dasar",
      fase: "dasar",
      hstMulai: -7,
      metode: "tabur-lubang",
      items: [
        { pupukId: "pk-matang", dosis: "10 ton/ha (± 100 g/tanaman)", perHaKg: 10000, perTanamanGram: 100 },
        { pupukId: "sp36", dosis: "100 kg/ha (± 1 g/tanaman)", perHaKg: 100, perTanamanGram: 1 },
        { pupukId: "npk-161616", dosis: "150 kg/ha (± 1,5 g/tanaman)", perHaKg: 150, perTanamanGram: 1.5 },
      ],
      catatan: "Polong men-fix N — cukup pupuk dasar, N susulan sedikit.",
    },
    {
      id: "kacangpanjang-susulan-1",
      label: "Susulan 1 (tunas memanjat)",
      fase: "vegetatif",
      hstMulai: 25,
      metode: "tabur-alur",
      items: [
        { pupukId: "npk-161616", dosis: "100 kg/ha (± 1 g/tanaman)", perHaKg: 100, perTanamanGram: 1 },
      ],
    },
    {
      id: "kacangpanjang-generatif",
      label: "Susulan pembungaan",
      fase: "generatif",
      hstMulai: 45,
      metode: "kocor",
      items: [
        { pupukId: "kcl", dosis: "50 kg/ha (± 0,5 g/tanaman)", perHaKg: 50, perTanamanGram: 0.5 },
        { pupukId: "npk-151515", dosis: "75 kg/ha (± 0,75 g/tanaman)", perHaKg: 75, perTanamanGram: 0.75 },
      ],
    },
  ],
  catatan: [
    "Pasang ajir/turus sejak muda.",
    "Kalsium (semprot Ca nitrat) cegah polong bengkok & berlubang.",
    "Panen polong muda rutin agar pembungaan berlanjut.",
  ],
  sumber: SUMBER,
  verified: false,
};

export const buncis: Tanaman = {
  id: "buncis",
  nama: "Buncis",
  alias: ["buncis hijau", "green bean"],
  namaLatin: "Phaseolus vulgaris L.",
  kategori: "sayuran-polong",
  satuanUmur: "hst",
  populasiPerHa: 60000,
  jarakTanam: "60 x 25 cm",
  umurPanen: [45, 65],
  phIdeal: [6.0, 7.0],
  pupuk: [
    {
      id: "buncis-dasar",
      label: "Pupuk dasar",
      fase: "dasar",
      hstMulai: -7,
      metode: "tabur-lubang",
      items: [
        { pupukId: "pk-matang", dosis: "10 ton/ha (± 167 g/tanaman)", perHaKg: 10000, perTanamanGram: 167 },
        { pupukId: "sp36", dosis: "100 kg/ha (± 1,7 g/tanaman)", perHaKg: 100, perTanamanGram: 1.7 },
        { pupukId: "npk-161616", dosis: "200 kg/ha (± 3,3 g/tanaman)", perHaKg: 200, perTanamanGram: 3.3 },
      ],
    },
    {
      id: "buncis-susulan-1",
      label: "Susulan 1",
      fase: "vegetatif",
      hstMulai: 25,
      metode: "tabur-alur",
      items: [
        { pupukId: "npk-161616", dosis: "150 kg/ha (± 2,5 g/tanaman)", perHaKg: 150, perTanamanGram: 2.5 },
      ],
    },
    {
      id: "buncis-generatif",
      label: "Susulan pembungaan",
      fase: "generatif",
      hstMulai: 45,
      metode: "kocor",
      items: [
        { pupukId: "kcl", dosis: "75 kg/ha (± 1,25 g/tanaman)", perHaKg: 75, perTanamanGram: 1.25 },
        { pupukId: "npk-151515", dosis: "100 kg/ha (± 1,7 g/tanaman)", perHaKg: 100, perTanamanGram: 1.7 },
      ],
    },
  ],
  catatan: [
    "Buncis sensitif terhadap genangan — drainase wajib baik.",
    "Jangan tunggu polong kering; panen saat masih lunak.",
  ],
  sumber: SUMBER,
  verified: false,
};
