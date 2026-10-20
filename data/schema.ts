import { z } from "zod";

export const KategoriEnum = z.enum([
  "sayuran-buah",
  "sayuran-daun",
  "sayuran-umbi",
  "sayuran-polong",
  "buah",
  "rempah-biofarmaka",
  "tanaman-hias",
]);

export const FaseEnum = z.enum(["dasar", "vegetatif", "generatif", "panen"]);

export const MetodePupukEnum = z.enum([
  "tabur-lubang",
  "tabur-alur",
  "campur-tanah",
  "kocor",
  "semprot-daun",
]);

export const GolonganObatEnum = z.enum([
  "fungisida",
  "insektisida",
  "bakterisida",
  "akarisida",
  "nematisida",
  "agens-hayati",
]);

export const JenisGangguanEnum = z.enum([
  "penyakit",
  "hama",
  "defisiensi",
  "fisiologis",
]);

export const TipePupukEnum = z.enum([
  "tunggal",
  "majemuk",
  "organik",
  "hayati",
  "pembenah-tanah",
  "mikro",
]);

export const KadarHaraSchema = z.object({
  n: z.number().positive().max(100).optional(),
  p: z.number().positive().max(100).optional(),
  k: z.number().positive().max(100).optional(),
});

export const TargetHaraSchema = z.object({
  n: z.number().nonnegative(),
  p: z.number().nonnegative(),
  k: z.number().nonnegative(),
});

export const TahapTemplateSchema = z
  .object({
    fase: FaseEnum,
    bobot: z.number().positive().max(1),
    metode: MetodePupukEnum,
    hstMulai: z.number().int().optional(),
    hstSelesai: z.number().int().optional(),
    ulangiHari: z.number().int().positive().optional(),
    catatan: z.string().optional(),
  })
  .refine(
    (v) => v.hstSelesai === undefined || v.hstSelesai >= (v.hstMulai ?? 0),
    { message: "TahapTemplate: hstSelesai harus >= hstMulai" },
  );

export const TemplateKelompokSchema = z
  .object({
    id: z.string().min(1),
    nama: z.string().min(1),
    deskripsi: z.string().min(1),
    target: TargetHaraSchema,
    phIdeal: z.tuple([z.number().positive(), z.number().max(14)]),
    /** Satuan waktu tahap/hstMulai template — wajib sama dengan satuanUmur komoditasnya. */
    satuanWaktu: z.enum(["hst", "bulan"]),
    tahap: z.array(TahapTemplateSchema).min(1),
    sumberHara: z.object({ n: z.string().min(1), p: z.string().min(1), k: z.string().min(1) }),
    catatan: z.string().optional(),
    sumber: z.array(z.string()).min(1),
    verified: z.boolean(),
  })
  .refine(
    (v) => v.phIdeal[1] >= v.phIdeal[0],
    { message: "TemplateKelompok: phIdeal maksimum harus >= minimum" },
  );

export const KomoditasTierBSchema = z
  .object({
    id: z.string().min(1),
    nama: z.string().min(1),
    alias: z.array(z.string()),
    namaLatin: z.string().min(1).optional(),
    kategori: KategoriEnum,
    kelompok: z.string().min(1),
    satuanUmur: z.enum(["hst", "bulan"]),
    populasiPerHa: z.number().positive(),
    jarakTanam: z.string().min(1).optional(),
    umurPanen: z.tuple([z.number().positive(), z.number().positive()]),
    phIdeal: z.tuple([z.number().positive(), z.number().max(14)]).optional(),
    target: TargetHaraSchema.partial().optional(),
    sumber: z.array(z.string()).min(1),
    verified: z.boolean().optional(),
  })
  .refine(
    (v) => v.umurPanen[1] >= v.umurPanen[0],
    { message: "KomoditasTierB: umurPanen[1] harus >= umurPanen[0]" },
  )
  .refine(
    (v) => !v.phIdeal || v.phIdeal[1] >= v.phIdeal[0],
    { message: "KomoditasTierB: phIdeal maksimum harus >= minimum" },
  );

export const PupukItemSchema = z
  .object({
    pupukId: z.string().min(1),
    dosis: z.string().min(1),
    perTanamanGram: z.number().nonnegative().optional(),
    perHaKg: z.number().nonnegative().optional(),
  })
  .refine(
    (v) => v.perTanamanGram !== undefined || v.perHaKg !== undefined,
    { message: "PupukItem harus punya perTanamanGram atau perHaKg" },
  );

export const TahapPupukSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    fase: FaseEnum,
    hstMulai: z.number().int(),
    hstSelesai: z.number().int().optional(),
    ulangiHari: z.number().int().positive().optional(),
    metode: MetodePupukEnum,
    items: z.array(PupukItemSchema).min(1),
    catatan: z.string().optional(),
  })
  .refine(
    (v) => v.hstSelesai === undefined || v.hstSelesai >= v.hstMulai,
    { message: "hstSelesai harus >= hstMulai" },
  );

export const TanamanSchema = z.object({
  id: z.string().min(1),
  nama: z.string().min(1),
  alias: z.array(z.string()),
  namaLatin: z.string().min(1),
  kategori: KategoriEnum,
  satuanUmur: z.enum(["hst", "bulan"]),
  populasiPerHa: z.number().positive(),
  jarakTanam: z.string().min(1),
  umurPanen: z.tuple([z.number().positive(), z.number().positive()]),
  phIdeal: z.tuple([z.number().positive(), z.number().max(14)]),
  pupuk: z.array(TahapPupukSchema),
  catatan: z.array(z.string()),
  sumber: z.array(z.string()).min(1),
  verified: z.boolean(),
  tier: z.enum(["A", "B"]).optional(),
  kelompok: z.string().min(1).optional(),
});

export const ObatSchema = z.object({
  bahanAktif: z.string().min(1),
  golongan: GolonganObatEnum,
  dosis: z.string().min(1),
  interval: z.string().min(1),
  maksAplikasi: z.string().optional(),
  masaTungguPanen: z.string().optional(),
  catatan: z.string().optional(),
  sifat: z.enum(["kontak", "sistemik", "kontak-sistemik"]).optional(),
  kelompokAksi: z.string().optional(),
  dosisMin: z.number().positive().optional(),
  dosisMax: z.number().positive().optional(),
  satuanDosis: z.enum(["mL/L", "g/L", "mL/ha", "g/ha"]).optional(),
  intervalHari: z.tuple([z.number().int().positive(), z.number().int().positive()]).optional(),
  masaTungguHari: z.number().int().positive().optional(),
});

export const PupukPendukungSchema = z.object({
  pupukId: z.string().min(1),
  dosis: z.string().min(1),
  catatan: z.string().optional(),
});

export const GangguanSchema = z.object({
  id: z.string().min(1),
  nama: z.string().min(1),
  alias: z.array(z.string()),
  jenis: JenisGangguanEnum,
  plants: z.array(z.string()).min(1),
  penyebab: z.string().min(1),
  gejala: z.array(z.string()).min(1),
  kulturTeknis: z.array(z.string()),
  obat: z.array(ObatSchema),
  pupukPendukung: z.array(PupukPendukungSchema),
  pencegahan: z.array(z.string()),
  tingkatBahaya: z.enum(["rendah", "sedang", "tinggi"]),
  sumber: z.array(z.string()).min(1),
  verified: z.boolean(),
});

export const PupukSchema = z.object({
  id: z.string().min(1),
  nama: z.string().min(1),
  kandungan: z.string().min(1),
  tipe: TipePupukEnum,
  keterangan: z.string().min(1),
  kadar: KadarHaraSchema.optional(),
});

export const IdentifikasiAIResponseSchema = z.object({
  isPlant: z.boolean(),
  imageQuality: z.enum(["baik", "kurang", "buruk"]),
  plantId: z.string().nullable(),
  plantNameGuess: z.string(),
  partAffected: z.enum([
    "daun",
    "buah",
    "batang",
    "akar",
    "bunga",
    "seluruh_tanaman",
    "tidak_jelas",
  ]),
  conditionType: z.enum([
    "penyakit",
    "hama",
    "defisiensi",
    "fisiologis",
    "sehat",
    "tidak_jelas",
  ]),
  diseaseId: z.string().nullable(),
  diseaseNameGuess: z.string(),
  confidence: z.number().min(0).max(1),
  visibleSymptoms: z.array(z.string()),
  differential: z.array(
    z.object({
      diseaseId: z.string().nullable(),
      name: z.string(),
      confidence: z.number().min(0).max(1),
    }),
  ),
  needsMorePhotos: z.boolean(),
  photoTips: z.string(),
});
