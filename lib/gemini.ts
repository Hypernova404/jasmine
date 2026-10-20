import { GoogleGenAI } from "@google/genai";
import { IdentifikasiAIResponseSchema } from "@/data/schema";
import type { IdentifikasiResult } from "@/data/types";
import { PLANTS, GANGGUAN_LIST } from "@/data/catalog";

/**
 * Daftar model yang dicoba berurutan. Model pertama dari GEMINI_MODEL, lalu
 * cadangan (model generasi baru Gemini). Bila satu model tidak tersedia (404),
 * otomatis pindah ke model berikutnya.
 */
function daftarModel(): string[] {
  const utama = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const cadangan = [
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
  ];
  return [...new Set([utama, ...cadangan])];
}

const TEMPERATURE = 0.2;

/**
 * Kumpulkan semua API key dari env:
 * - GEMINI_API_KEY  : satu atau beberapa key dipisah koma
 * - GEMINI_API_KEY_1, GEMINI_API_KEY_2, ... : key tambahan
 * Urutan dipertahankan, duplikat dibuang.
 */
function daftarApiKey(): string[] {
  const keys: string[] = [];
  const utama = process.env.GEMINI_API_KEY;
  if (utama) {
    for (const k of utama.split(",")) {
      const t = k.trim();
      if (t) keys.push(t);
    }
  }
  for (let i = 1; i <= 50; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k && k.trim()) keys.push(k.trim());
  }
  return [...new Set(keys)];
}

/** Penanda giliran key antar-request (modul-level, per instance serverless). */
let giliranKey = 0;

const SYSTEM_PROMPT_TEMPLATE = `Kamu adalah ahli fitopatologi dan agronomi hortikultura Indonesia.
Tugasmu: menganalisis foto tanaman dan mengidentifikasi kondisinya.

ATURAN:
1. Jika foto bukan tanaman atau terlalu buram/gelap, set isPlant=false atau imageQuality="buruk" dan jelaskan di photoTips.
2. Tentukan plantId HANYA dari daftar KATALOG_TANAMAN. Jika tidak ada yang cocok, plantId=null dan isi plantNameGuess.
3. Tentukan diseaseId HANYA dari daftar KATALOG_PENYAKIT untuk tanaman tersebut. Jika tidak ada yang cocok, diseaseId=null dan isi diseaseNameGuess.
4. Jika tanaman tampak sehat, conditionType="sehat", diseaseId=null.
5. Jangan mengarang. Jika ragu, turunkan confidence dan set needsMorePhotos=true.
6. Isi visibleSymptoms dengan gejala yang BENAR-BENAR terlihat di foto (bagian daun/buah/batang, warna, pola bercak).
7. JANGAN memberikan nama obat atau dosis. Itu diambil dari database oleh aplikasi.
8. Berikan maksimal 2 diagnosis banding (differential) dengan confidence masing-masing.
9. Jawab HANYA JSON sesuai schema.

KATALOG_TANAMAN:
{{KATALOG_TANAMAN}}

KATALOG_PENYAKIT:
{{KATALOG_PENYAKIT}}

PLANT_HINT_DARI_USER: {{PLANT_HINT}}`;

function ringkasTanaman(): string {
  return PLANTS.map((p) => `${p.id} | ${p.nama} | ${p.alias.join(", ")}`).join("\n");
}

function ringkasPenyakit(plantId?: string | null): string {
  const list = plantId
    ? GANGGUAN_LIST.filter(
        (g) => g.plants.includes(plantId) || g.plants.includes("*"),
      )
    : GANGGUAN_LIST;
  return list
    .map((g) => `${g.id} | ${g.nama} | plants: ${g.plants.join(",")} | ${g.gejala[0] ?? ""}`)
    .join("\n");
}

export function buildSystemPrompt(plantId?: string | null): string {
  return SYSTEM_PROMPT_TEMPLATE.replace("{{KATALOG_TANAMAN}}", ringkasTanaman())
    .replace("{{KATALOG_PENYAKIT}}", ringkasPenyakit(plantId))
    .replace("{{PLANT_HINT}}", plantId || "tidak ada");
}

export function geminiTersedia(): boolean {
  return daftarApiKey().length > 0;
}

/** Error sementara dari Gemini (overload/rate limit) — layak dicoba key lain. */
export function errorSementaraGemini(e: unknown): boolean {
  const pesan = e instanceof Error ? e.message : String(e);
  const obj = e as { status?: number | string; code?: number | string };
  const kode = String(obj?.status ?? obj?.code ?? "");
  return (
    /UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand|rate limit|quota|503|429/i.test(
      pesan,
    ) ||
    kode === "503" ||
    kode === "429" ||
    kode === "UNAVAILABLE" ||
    kode === "RESOURCE_EXHAUSTED"
  );
}

/** Model tidak tersedia untuk key ini (404/NOT_FOUND) — layak pindah model. */
export function errorModelTidakAda(e: unknown): boolean {
  const pesan = e instanceof Error ? e.message : String(e);
  const obj = e as { status?: number | string; code?: number | string };
  const kode = String(obj?.status ?? obj?.code ?? "");
  return (
    /NOT_FOUND|not found|no longer available|is not supported|404/i.test(pesan) ||
    kode === "404" ||
    kode === "NOT_FOUND"
  );
}

/** API key tidak valid/rusak (401/403) — layak pindah ke key berikutnya. */
export function errorKeyRusak(e: unknown): boolean {
  const pesan = e instanceof Error ? e.message : String(e);
  const obj = e as { status?: number | string; code?: number | string };
  const kode = String(obj?.status ?? obj?.code ?? "");
  return (
    /UNAUTHENTICATED|API key not valid|PERMISSION_DENIED|API_KEY_INVALID|401|403/i.test(
      pesan,
    ) ||
    kode === "401" ||
    kode === "403" ||
    kode === "UNAUTHENTICATED" ||
    kode === "PERMISSION_DENIED"
  );
}

/** Pesan ramah untuk kondisi overload/rate limit. */
export function pesanSementaraGemini(e: unknown): Error {
  const pesan = e instanceof Error ? e.message : String(e);
  if (/RESOURCE_EXHAUSTED|rate limit|quota|429/i.test(pesan)) {
    return new Error(
      "Server AI sedang membatasi permintaan (rate limit). Tunggu sebentar lalu coba lagi.",
    );
  }
  return new Error(
    "Server AI sedang penuh (permintaan tinggi). Tunggu sebentar lalu coba lagi.",
  );
}

type GambarInline = { inlineData: { mimeType: string; data: string } };

export async function analisisGambar(
  gambar: GambarInline[],
  plantIdHint?: string | null,
): Promise<IdentifikasiResult> {
  const apiKeys = daftarApiKey();
  if (apiKeys.length === 0) {
    throw new Error(
      "GEMINI_API_KEY belum diatur. Fitur identifikasi nonaktif — minta pemilik server mengatur key di aistudio.google.com/apikey.",
    );
  }

  const systemInstruction = buildSystemPrompt(plantIdHint);

  const responseSchema = {
    type: "object",
    properties: {
      isPlant: { type: "boolean" },
      imageQuality: { type: "string", enum: ["baik", "kurang", "buruk"] },
      plantId: { type: ["string", "null"] },
      plantNameGuess: { type: "string" },
      partAffected: {
        type: "string",
        enum: ["daun", "buah", "batang", "akar", "bunga", "seluruh_tanaman", "tidak_jelas"],
      },
      conditionType: {
        type: "string",
        enum: ["penyakit", "hama", "defisiensi", "fisiologis", "sehat", "tidak_jelas"],
      },
      diseaseId: { type: ["string", "null"] },
      diseaseNameGuess: { type: "string" },
      confidence: { type: "number" },
      visibleSymptoms: { type: "array", items: { type: "string" } },
      differential: {
        type: "array",
        items: {
          type: "object",
          properties: {
            diseaseId: { type: ["string", "null"] },
            name: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["diseaseId", "name", "confidence"],
        },
      },
      needsMorePhotos: { type: "boolean" },
      photoTips: { type: "string" },
    },
    required: [
      "isPlant",
      "imageQuality",
      "plantId",
      "plantNameGuess",
      "partAffected",
      "conditionType",
      "diseaseId",
      "diseaseNameGuess",
      "confidence",
      "visibleSymptoms",
      "differential",
      "needsMorePhotos",
      "photoTips",
    ],
  } as const;

  async function sekali(model: string, apiKey: string): Promise<IdentifikasiResult> {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            ...gambar.map((g) => ({ inlineData: g.inlineData })),
            { text: "Analisis foto ini. Jawab HANYA JSON." },
          ],
        },
      ],
      config: {
        systemInstruction,
        temperature: TEMPERATURE,
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const text = result.text ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Respons AI bukan JSON yang valid.");
      parsed = JSON.parse(match[0]);
    }
    return IdentifikasiAIResponseSchema.parse(parsed);
  }

  // Susun urutan key mulai dari giliran saat ini (round-robin antar-request),
  // supaya beban merata ke semua key.
  const mulai = giliranKey % apiKeys.length;
  giliranKey = (giliranKey + 1) % apiKeys.length;
  const urutanKey = [
    ...apiKeys.slice(mulai),
    ...apiKeys.slice(0, mulai),
  ];

  const model = daftarModel();
  let terakhir: unknown;
  let kenalimit = false;
  let adaKeyRusak = false;

  // Coba tiap key bergiliran. Untuk tiap key, coba model utama; bila model
  // tidak tersedia (404), pindah ke model cadangan untuk key yang sama.
  for (const apiKey of urutanKey) {
    for (const m of model) {
      try {
        return await sekali(m, apiKey);
      } catch (e) {
        terakhir = e;
        if (errorModelTidakAda(e)) {
          // Model tak tersedia untuk key ini — coba model berikutnya.
          continue;
        }
        if (errorKeyRusak(e)) {
          // Key rusak/tidak valid — pindah ke key berikutnya.
          adaKeyRusak = true;
          break;
        }
        if (errorSementaraGemini(e) || !(e instanceof Error)) {
          // Rate limit/overload atau error tak terduga — catat, pindah key.
          if (errorSementaraGemini(e)) kenalimit = true;
          break;
        }
        // Error lain (mis. schema): coba model berikutnya sebelum menyerah.
        continue;
      }
    }
  }

  // Semua key/model gagal. Bila murni limit, beri pesan ramah; bila key rusak
  // dan itulah penyebabnya, sampaikan apa adanya.
  if (kenalimit || errorSementaraGemini(terakhir)) {
    throw pesanSementaraGemini(terakhir);
  }
  if (adaKeyRusak && errorKeyRusak(terakhir)) {
    throw new Error(
      "API key Gemini tidak valid. Periksa kembali GEMINI_API_KEY di pengaturan server.",
    );
  }
  // Error lain: lempar error aslinya (mis. respons AI bukan JSON).
  throw terakhir instanceof Error ? terakhir : new Error("Analisis gagal.");
}
