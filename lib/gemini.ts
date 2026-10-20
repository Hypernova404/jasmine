import { GoogleGenAI } from "@google/genai";
import { IdentifikasiAIResponseSchema } from "@/data/schema";
import type { IdentifikasiResult } from "@/data/types";
import { PLANTS, GANGGUAN_LIST } from "@/data/catalog";

const MODEL_DEFAULT = process.env.GEMINI_MODEL || "gemini-2.5-flash";
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

  try {
    return await sekali();
  } catch {
    return await sekali();
  }
}
