import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analisisGambar, geminiTersedia } from "@/lib/gemini";
import { cekRateLimit } from "@/lib/ratelimit";
import { cocokkanGangguan, getPlant, PLANT_MAP } from "@/lib/catalog";

export const maxDuration = 60;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE = 4 * 1024 * 1024;
const MAX_TOTAL = 4 * 1024 * 1024;

const BodySchema = z.object({
  plantId: z.string().optional(),
});

function ambilIP(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  const limit = Number(process.env.DAILY_SCAN_LIMIT ?? 10);

  if (!geminiTersedia()) {
    return NextResponse.json(
      {
        error: "Fitur identifikasi belum aktif. Server memerlukan GEMINI_API_KEY.",
      },
      { status: 503 },
    );
  }

  const ip = ambilIP(req);
  const rl = cekRateLimit(`identify:${ip}`, limit);
  const sisaHeader = { "X-RateLimit-Remaining": String(rl.sisa) };
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: `Batas analisis harian tercapai (${limit}/hari). Coba lagi besok.`,
        resetAt: new Date(rl.resetAt).toISOString(),
      },
      { status: 429, headers: sisaHeader },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Format permintaan harus multipart/form-data." },
      { status: 400, headers: sisaHeader },
    );
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length < 1 || files.length > 3) {
    return NextResponse.json(
      { error: "Unggah 1–3 foto dalam satu analisis." },
      { status: 400, headers: sisaHeader },
    );
  }

  let totalSize = 0;
  for (const f of files) {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return NextResponse.json(
        { error: "Tipe file harus JPEG, PNG, atau WebP." },
        { status: 400, headers: sisaHeader },
      );
    }
    if (f.size > MAX_FILE) {
      return NextResponse.json(
        { error: "Ukuran tiap foto maksimal 4 MB. Kompres dulu di perangkat." },
        { status: 400, headers: sisaHeader },
      );
    }
    totalSize += f.size;
  }
  if (totalSize > MAX_TOTAL) {
    return NextResponse.json(
      { error: "Total ukuran foto maksimal 4 MB." },
      { status: 400, headers: sisaHeader },
    );
  }

  const plantIdRaw = form.get("plantId");
  const parsedBody = BodySchema.safeParse({
    plantId: typeof plantIdRaw === "string" && plantIdRaw ? plantIdRaw : undefined,
  });
  if (!parsedBody.success || (parsedBody.data.plantId && !PLANT_MAP[parsedBody.data.plantId])) {
    return NextResponse.json(
      { error: "plantId tidak dikenal." },
      { status: 400, headers: sisaHeader },
    );
  }
  const plantId = parsedBody.data.plantId ?? null;

  try {
    const gambar = await Promise.all(
      files.map(async (f) => {
        const buf = Buffer.from(await f.arrayBuffer());
        return {
          inlineData: { mimeType: f.type, data: buf.toString("base64") },
        };
      }),
    );

    const ai = await analisisGambar(gambar, plantId);
    const gangguan = cocokkanGangguan(ai.diseaseId);
    const tanaman =
      getPlant(ai.plantId ?? "") ?? (plantId ? getPlant(plantId) : undefined);

    return NextResponse.json(
      {
        ai,
        tanamanDitampilkan: tanaman
          ? { id: tanaman.id, nama: tanaman.nama }
          : { id: null, nama: ai.plantNameGuess },
        gangguan: gangguan ?? null,
        terverifikasi: Boolean(gangguan),
        sisaKuota: rl.sisa,
      },
      { headers: { ...sisaHeader, "Cache-Control": "no-store" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan saat analisis.";
    return NextResponse.json({ error: msg }, { status: 500, headers: sisaHeader });
  }
}
