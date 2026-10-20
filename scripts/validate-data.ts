import { PLANTS } from "../data/plants";
import { GANGGUAN_LIST } from "../data/diseases";
import { FERTILIZERS, FERTILIZER_MAP } from "../data/fertilizers";
import { TEMPLATES, TEMPLATES_MAP } from "../data/templates";
import { KOMODITAS_TIER_B } from "../data/master-list";
import {
  TanamanSchema,
  GangguanSchema,
  PupukSchema,
  TemplateKelompokSchema,
  KomoditasTierBSchema,
} from "../data/schema";

const errors: string[] = [];

const pupukIds = new Set<string>();
for (const p of FERTILIZERS) {
  try {
    PupukSchema.parse(p);
  } catch (e) {
    errors.push(`Pupuk ${p.id}: ${(e as Error).message}`);
  }
  if (pupukIds.has(p.id)) errors.push(`ID pupuk duplikat: ${p.id}`);
  pupukIds.add(p.id);
}

const plantIds = new Set<string>();
for (const t of PLANTS) {
  try {
    TanamanSchema.parse(t);
  } catch (e) {
    errors.push(`Tanaman ${t.id}: ${(e as Error).message}`);
  }
  if (plantIds.has(t.id)) errors.push(`ID tanaman duplikat: ${t.id}`);
  plantIds.add(t.id);
  if (t.sumber.length === 0) errors.push(`Tanaman ${t.id}: sumber kosong`);
  for (const tahap of t.pupuk) {
    for (const item of tahap.items) {
      if (!FERTILIZER_MAP[item.pupukId]) {
        errors.push(`Tanaman ${t.id} tahap ${tahap.id}: pupukId "${item.pupukId}" tidak ada di fertilizers`);
      }
    }
  }
}

const gangguanIds = new Set<string>();
for (const g of GANGGUAN_LIST) {
  try {
    GangguanSchema.parse(g);
  } catch (e) {
    errors.push(`Gangguan ${g.id}: ${(e as Error).message}`);
  }
  if (gangguanIds.has(g.id)) errors.push(`ID gangguan duplikat: ${g.id}`);
  gangguanIds.add(g.id);
  if (g.sumber.length === 0) errors.push(`Gangguan ${g.id}: sumber kosong`);
  for (const pid of g.plants) {
    if (pid !== "*" && !plantIds.has(pid)) {
      errors.push(`Gangguan ${g.id}: plantId "${pid}" tidak ada di plants`);
    }
  }
  for (const p of g.pupukPendukung) {
    if (!FERTILIZER_MAP[p.pupukId]) {
      errors.push(`Gangguan ${g.id}: pupukPendukung "${p.pupukId}" tidak ada`);
    }
  }
}

// ── Template kelompok (dasar Tier B) ─────────────────────────────────
const templateIds = new Set<string>();
for (const t of TEMPLATES) {
  try {
    TemplateKelompokSchema.parse(t);
  } catch (e) {
    errors.push(`Template ${t.id}: ${(e as Error).message}`);
  }
  if (templateIds.has(t.id)) errors.push(`ID template duplikat: ${t.id}`);
  templateIds.add(t.id);

  const totalBobot = t.tahap.reduce((s, x) => s + x.bobot, 0);
  if (Math.abs(totalBobot - 1) > 0.001) {
    errors.push(`Template ${t.id}: total bobot tahap ${totalBobot.toFixed(3)} ≠ 1`);
  }
  if (t.target.n <= 0 && t.target.p <= 0 && t.target.k <= 0) {
    errors.push(`Template ${t.id}: target hara semua nol`);
  }
  for (const [hara, pupukId] of Object.entries(t.sumberHara)) {
    const pupuk = FERTILIZER_MAP[pupukId];
    if (!pupuk) {
      errors.push(`Template ${t.id}: sumberHara.${hara} "${pupukId}" tidak ada di fertilizers`);
    } else if (!pupuk.kadar?.[hara as "n" | "p" | "k"]) {
      errors.push(`Template ${t.id}: sumberHara.${hara} "${pupukId}" tidak punya kadar ${hara}`);
    }
  }
  const pakai = KOMODITAS_TIER_B.filter((k) => k.kelompok === t.id);
  for (const k of pakai) {
    if (k.satuanUmur !== t.satuanWaktu) {
      errors.push(
        `Template ${t.id} (${t.satuanWaktu}): dipakai ${k.id} bersatuan ${k.satuanUmur}`,
      );
    }
  }
  if (pakai.length === 0) {
    errors.push(`Template ${t.id}: belum ada komoditas Tier B yang memakainya`);
  }
}

// ── Master list Tier B ───────────────────────────────────────────────
/** Luas tanam (m²) dari jarakTanam "a × b cm|m". */
function luasJarak(jarak: string): number | null {
  const m = jarak.trim().match(/^([\d.,]+)\s*[×x]\s*([\d.,]+)\s*(cm|m)$/i);
  if (!m) return null;
  const a = Number(m[1].replace(",", "."));
  const b = Number(m[2].replace(",", "."));
  if (!a || !b) return null;
  const luas = a * b;
  return m[3].toLowerCase() === "cm" ? luas / 10000 : luas;
}

const tierBIds = new Set<string>();
for (const k of KOMODITAS_TIER_B) {
  try {
    KomoditasTierBSchema.parse(k);
  } catch (e) {
    errors.push(`KomoditasTierB ${k.id}: ${(e as Error).message}`);
  }
  if (tierBIds.has(k.id)) errors.push(`ID komoditas duplikat: ${k.id}`);
  tierBIds.add(k.id);
  if (plantIds.has(k.id)) errors.push(`KomoditasTierB ${k.id}: bentrok id dengan PLANTS`);
  const tmpl = TEMPLATES_MAP[k.kelompok];
  if (!tmpl) {
    errors.push(`KomoditasTierB ${k.id}: kelompok "${k.kelompok}" tidak ada di templates`);
  } else if (tmpl.satuanWaktu !== k.satuanUmur) {
    errors.push(
      `KomoditasTierB ${k.id}: satuanUmur "${k.satuanUmur}" ≠ satuanWaktu template "${k.kelompok}" (${tmpl.satuanWaktu})`,
    );
  }
  if (k.jarakTanam) {
    const luas = luasJarak(k.jarakTanam);
    if (luas === null) {
      errors.push(`KomoditasTierB ${k.id}: jarakTanam "${k.jarakTanam}" tak terbaca`);
    } else {
      const harap = 10000 / luas;
      const simpang = Math.abs(k.populasiPerHa - harap) / harap;
      if (simpang > 0.2) {
        errors.push(
          `KomoditasTierB ${k.id}: populasi ${k.populasiPerHa}/ha menyimpang ${(simpang * 100).toFixed(0)}% dari jarak "${k.jarakTanam}" (≈${Math.round(harap)})`,
        );
      }
    }
  }
}

const pctVerifiedPlants = PLANTS.length
  ? Math.round((PLANTS.filter((p) => p.verified).length / PLANTS.length) * 100)
  : 0;
const pctVerifiedGangguan = GANGGUAN_LIST.length
  ? Math.round((GANGGUAN_LIST.filter((g) => g.verified).length / GANGGUAN_LIST.length) * 100)
  : 0;

console.log("── Ringkasan katalog ──");
console.log(`Tanaman     : ${PLANTS.length} (${pctVerifiedPlants}% verified) · Tier A`);
console.log(
  `Gangguan    : ${GANGGUAN_LIST.length} (${pctVerifiedGangguan}% verified)`,
);
console.log(`Pupuk       : ${FERTILIZERS.length} (${FERTILIZERS.filter((p) => p.kadar).length} berkadar)`);
console.log(`Template    : ${TEMPLATES.length} kelompok`);
console.log(`Tier B      : ${KOMODITAS_TIER_B.length} komoditas`);
console.log(`Total tanaman: ${PLANTS.length + KOMODITAS_TIER_B.length} (A + B)`);
console.log(
  `Per kategori:`,
  Object.entries(
    PLANTS.reduce<Record<string, number>>((acc, p) => {
      acc[p.kategori] = (acc[p.kategori] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([k, v]) => `${k}=${v}`)
    .join(", "),
);

if (errors.length) {
  console.error(`\n✗ ${errors.length} error:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("\n✓ Semua data valid.");
