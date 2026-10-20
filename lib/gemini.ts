import { GoogleGenAI } from "@google/genai";
import { IdentifikasiAIResponseSchema } from "@/data/schema";
import type { IdentifikasiResult } from "@/data/types";
import { PLANTS, GANGGUAN_LIST } from "@/data/catalog";

const MODEL_DEFAULT = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const TEMPERATURE = 0.2;

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
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Error sementara dari Gemini (overload/rate limit) — layak diulang. */
export function errorSementaraGemini(e: unknown): boolean {
  const pesan = e instanceof Error ? e.message : String(e);
  const obj = e as { status?: number | string; code?: number | string };
  const kode = String(obj?.status ?? obj?.code ?? "");
  return (
    /UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand|503|429/i.test(pesan) ||
    kode === "503" ||
    kode === "429" ||
    kode === "UNAVAILABLE" ||
    kode === "RESOURCE_EXHAUSTED"
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY belum diatur. Fitur identifikasi nonaktif — minta pemilik server mengatur key di aistudio.google.com/apikey.",
    );
  }

  const ai = new GoogleGenAI({ apiKey });
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

  async function sekali(): Promise<IdentifikasiResult> {
    const result = await ai.models.generateContent({
      model: MODEL_DEFAULT,
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

  /** Error sementara dari Gemini (overload/rate limit) — layak diulang. */
  function errorSementara(e: unknown): boolean {
    return errorSementaraGemini(e);
  }

  /** Pesan ramah untuk kondisi overload/rate limit. */
  function pesanSementara(e: unknown): Error {
    return pesanSementaraGemini(e);
  }

  const JEDA = [1500, 3500, 7000];
  let terakhir: unknown;
  for (let i = 0; i <= JEDA.length; i++) {
    try {
      return await sekali();
    } catch (e) {
      terakhir = e;
      // Respons non-JSON / schema tidak valid: coba sekali lagi (perilaku lama).
      const boleh = errorSementara(e) || !(e instanceof Error);
      if (!boleh || i === JEDA.length) break;
      await new Promise((r) => setTimeout(r, JEDA[i]));
    }
  }
  if (errorSementara(terakhir)) throw pesanSementara(terakhir);
  // Fallback: satu percobaan tambahan seperti semula.
  return await sekali();
}
