import { describe, it, expect } from "vitest";
import { IdentifikasiAIResponseSchema } from "@/data/schema";
import {
  buildSystemPrompt,
  errorSementaraGemini,
  pesanSementaraGemini,
} from "@/lib/gemini";

describe("IdentifikasiAIResponseSchema", () => {
  it("valid payload diterima", () => {
    const ok = IdentifikasiAIResponseSchema.safeParse({
      isPlant: true,
      imageQuality: "baik",
      plantId: "cabai-merah-besar",
      plantNameGuess: "Cabai",
      partAffected: "daun",
      conditionType: "penyakit",
      diseaseId: "cabai-antraknosa",
      diseaseNameGuess: "Antraknosa",
      confidence: 0.85,
      visibleSymptoms: ["bercak"],
      differential: [{ diseaseId: null, name: "lain", confidence: 0.3 }],
      needsMorePhotos: false,
      photoTips: "fokus",
    });
    expect(ok.success).toBe(true);
  });

  it("confidence di luar 0..1 ditolak", () => {
    const bad = IdentifikasiAIResponseSchema.safeParse({
      isPlant: true,
      imageQuality: "baik",
      plantId: null,
      plantNameGuess: "x",
      partAffected: "daun",
      conditionType: "sehat",
      diseaseId: null,
      diseaseNameGuess: "x",
      confidence: 1.5,
      visibleSymptoms: [],
      differential: [],
      needsMorePhotos: false,
      photoTips: "",
    });
    expect(bad.success).toBe(false);
  });
});

describe("buildSystemPrompt", () => {
  it("menyisipkan katalog tanaman & penyakit", () => {
    const p = buildSystemPrompt("cabai-merah-besar");
    expect(p).toContain("KATALOG_TANAMAN");
    expect(p).toContain("cabai-merah-besar");
    expect(p).toContain("PLANT_HINT_DARI_USER: cabai-merah-besar");
  });

  it("hint tanaman tanpa ada = tidak ada", () => {
    const p = buildSystemPrompt(null);
    expect(p).toContain("PLANT_HINT_DARI_USER: tidak ada");
  });
});

describe("errorSementaraGemini", () => {
  it("mengenali 503 UNAVAILABLE sebagai sementara", () => {
    const e = new Error(
      "This model is currently experiencing high demand. Spikes in demand are usually temporary.",
    );
    (e as { status?: number }).status = 503;
    expect(errorSementaraGemini(e)).toBe(true);
  });

  it("mengenali 429 / RESOURCE_EXHAUSTED sebagai sementara", () => {
    const e = new Error("RESOURCE_EXHAUSTED: quota exceeded");
    expect(errorSementaraGemini(e)).toBe(true);
  });

  it("error validasi biasa bukan sementara", () => {
    expect(errorSementaraGemini(new Error("Respons AI bukan JSON yang valid."))).toBe(false);
  });
});

describe("pesanSementaraGemini", () => {
  it("rate limit → pesan spesifik", () => {
    const m = pesanSementaraGemini(new Error("RESOURCE_EXHAUSTED")).message;
    expect(m).toMatch(/rate limit/i);
  });

  it("overload → pesan penuh/permintaan tinggi", () => {
    const m = pesanSementaraGemini(new Error("high demand")).message;
    expect(m).toMatch(/penuh|permintaan tinggi/i);
  });
});
