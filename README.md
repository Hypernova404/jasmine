# Jasmine

Website mobile-first untuk petani/penggiat hortikultura:

1. **Identifikasi Penyakit** — upload foto (kamera/galeri), AI (Gemini) menganalisis, hasil: nama penyakit/hama/defisiensi, gejala, penyebab, **cara mengatasi dari database terstruktur**.
2. **Rekomendasi Pemupukan** (tanah mineral) — jadwal lengkap sampai panen: jenis pupuk, dosis per tanaman & per ha, total kebutuhan, metode, tanggal kalender.

> Buka web → langsung **Menu 1 (Identifikasi)**. Navigasi via **☰ (hamburger) di kiri atas**: menu 1 & menu 2.

## Tech stack

- Next.js (App Router) + TypeScript strict
- Tailwind CSS (tema hijau, mobile-first)
- Gemini API (`@google/genai`) — hanya server
- Zod (validasi data & respons AI)
- Vitest (unit test)
- Deploy: GitHub → Vercel

**Tanpa login** (versi ini membuang auth Google agar langsung dipakai). Rate limit identifikasi per IP (in-memory).

## Setup lokal

```bash
cp .env.example .env.local
# isi GEMINI_API_KEY
npm install --legacy-peer-deps
npm run dev
```

Buka http://localhost:3000 — langsung ke `/identifikasi`.

### Env

| Variabel | Wajib? | Keterangan |
|---|---|---|
| `GEMINI_API_KEY` | Ya (untuk fitur scan) | Dari https://aistudio.google.com/apikey |
| `GEMINI_MODEL` | Tidak | Default `gemini-2.5-flash` |
| `DAILY_SCAN_LIMIT` | Tidak | Default `10` per IP/hari |

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Di Vercel: **Add New Project** → import repo.
3. Set env: `GEMINI_API_KEY` (dan opsional lainnya).
4. Deploy. Setiap push ke `main` akan auto-deploy.

## Script

```bash
npm run dev            # development
npm run build          # production build
npm run lint           # eslint
npm run test           # vitest
npm run validate:data  # validasi seluruh katalog (/data)
```

## Menambah data tanaman / penyakit

1. Tambah file di `data/plants/` mengikuti interface `Tanaman` (`data/types.ts`).
2. Daftarkan di `data/plants.ts` (array `PLANTS`).
3. Gangguan: tambah entri `Gangguan` di `data/diseases.ts`.
4. Pastikan semua `pupukId` & `plants` merujuk ID yang ada.
5. Jalankan `npm run validate:data`.
6. Update `data/COVERAGE.md`.

Semua entri baru: `verified: false` + `sumber` minimal 1 (acuan umum + verifikasi Kementan/BPTP/Balitsa).

## Batasan & catatan

- **Foto tidak disimpan** — hanya diproses di memori.
- **Rate limit in-memory** — reset saat serverless restart (perkiraan 10/IP/hari, bukan jaminan keras). Upstash Redis bisa ditambahkan nanti.
- **Tanpa auth** — siapa pun yang punya URL bisa memakai fitur scan (batas per IP). Pasang auth / WAF bila perlu.
- Dosis pupuk & pestisida = **acuan umum**, bukan rekomendasi resmi. Selalu baca label & konsultasi penyuluh.
- AI **tidak pernah** memberikan dosis obat — semua dari database terstruktur.

## Struktur

```
app/           # halaman & API
components/    # UI (hamburger, identifikasi, pemupukan, katalog)
data/          # types, schema Zod, fertilizers, plants, diseases, COVERAGE.md
lib/           # gemini, fertilizer-calc, catalog, ratelimit, image, ics
scripts/       # validate-data
tests/         # unit test
```
