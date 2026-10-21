import type { Tanaman } from "../types";

export const padi: Tanaman = {
  id: "padi",
  nama: "Padi",
  alias: ["beras", "gabah", "padi sawah"],
  namaLatin: "Oryza sativa L.",
  kategori: "sayuran-buah",
  satuanUmur: "hst",
  populasiPerHa: 250000,
  jarakTanam: "20 x 20 cm (tanam jajar legowo 2:1 atau jajar biasa)",
  umurPanen: [105, 135],
  phIdeal: [5.5, 6.5],
  pupuk: [
    {
      id: "padi-dasar",
      label: "Pupuk dasar — harian pra-tanam",
      fase: "dasar",
      hstMulai: -7,
      metode: "campur-tanah",
      items: [
        {
          pupukId: "dolomit",
          dosis: "1–2 ton/ha jika pH < 5,5 (campur tanah sebelum tanam)",
          perHaKg: 1500,
        },
        {
          pupukId: "pk-matang",
          dosis: "2–3 ton/ha (pupuk kandang matang)",
          perHaKg: 2500,
        },
        {
          pupukId: "sp36",
          dosis: "100–150 kg/ha",
          perHaKg: 125,
        },
        {
          pupukId: "urea",
          dosis: "50 kg/ha (1/3 dosis total urea)",
          perHaKg: 50,
        },
        {
          pupukId: "npk-161616",
          dosis: "100 kg/ha",
          perHaKg: 100,
        },
      ],
      catatan: "Disebar merata & dicampur saat pengolahan tanah (penggaruan terakhir).",
    },
    {
      id: "padi-susulan-1",
      label: "Susulan 1 — awal vegetatif",
      fase: "vegetatif",
      hstMulai: 14,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "urea",
          dosis: "100 kg/ha (1/3 dosis total urea)",
          perHaKg: 100,
        },
        {
          pupukId: "kcl",
          dosis: "50 kg/ha",
          perHaKg: 50,
        },
      ],
      catatan: "Tabur saat umur 14 HST, tutup tanah, genangkan air 3–5 cm.",
    },
    {
      id: "padi-susulan-2",
      label: "Susulan 2 — pemanjangan batang",
      fase: "vegetatif",
      hstMulai: 35,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "urea",
          dosis: "100 kg/ha (1/3 dosis total urea)",
          perHaKg: 100,
        },
      ],
      catatan: "Tabur saat umur 35 HST (awal pemanjangan), tutup tanah, genangkan air.",
    },
    {
      id: "padi-susulan-3",
      label: "Susulan 3 — pembentukan anakan maksimal",
      fase: "vegetatif",
      hstMulai: 50,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "urea",
          dosis: "50 kg/ha (sisa urea jika perlu, atau skip jika anakan padat)",
          perHaKg: 50,
        },
        {
          pupukId: "kcl",
          dosis: "50 kg/ha",
          perHaKg: 50,
        },
      ],
      catatan: "Opsional — hanya jika tanaman kuning/anakan sedikit. Skip jika sudah padat hijau.",
    },
    {
      id: "padi-generatif",
      label: "Susulan generatif — pembentukan malai",
      fase: "generatif",
      hstMulai: 65,
      metode: "tabur-alur",
      items: [
        {
          pupukId: "sp36",
          dosis: "50 kg/ha (tambahan P untuk pembungaan)",
          perHaKg: 50,
        },
        {
          pupukId: "kcl",
          dosis: "50 kg/ha",
          perHaKg: 50,
        },
      ],
      catatan: "Tabur saat umur 65 HST (awal pembentukan malai). Tutup tanah, genangkan air.",
    },
    {
      id: "padi-panen",
      label: "Pemeliharaan panen",
      fase: "panen",
      hstMulai: 100,
      hstSelesai: 135,
      metode: "kocor",
      items: [
        {
          pupukId: "kno3",
          dosis: "5–10 g/L air, semprot daun tiap 10–14 hari",
          perHaKg: 0,
        },
      ],
      catatan: "Stop pupuk N pada fase isi gabah (HST 90–95). KNO3 buat gabah penuh & mencegah busuk malai.",
    },
  ],
  catatan: [
    "Padi butuh air genangan tiap tahap (kecuali panen) — tatair kunci hasil.",
    "Rotasi tanam (padi-palawija) menurunkan hama/tanah asam.",
    "Gunakan varietas tahan hama utama (wereng, blast, bacterial leaf blight).",
    "Giling/panen saat kelembaban gabah 20–25% (gampang giling, hasil maksimal).",
    "Dosage di atas acuan umum — sesuaikan dengan hasil analisis tanah & rekomendasi PPL setempat.",
  ],
  sumber: [
    "Acuan umum budidaya padi sawah; verifikasi dengan panduan Kementan/BPTP/Balitsa setempat",
  ],
  verified: false,
};