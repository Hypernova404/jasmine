import { describe, it, expect } from "vitest";
import { IdentifikasiAIResponseSchema } from "@/data/schema";
import { buildSystemPrompt } from "@/lib/gemini";

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
