import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const t0 = Date.now();
try {
  const r = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [{ role: "user", parts: [{ text: "Balas JSON: {\"ok\":true}" }] }],
    config: { temperature: 0.2, responseMimeType: "application/json" },
  });
  console.log("OK", Date.now() - t0, "ms:", (r.text || "").slice(0, 100));
} catch (e) {
  console.log("ERR", Date.now() - t0, "ms:", e.message?.slice(0, 300));
}
