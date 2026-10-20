# Jasmine

Website mobile-first untuk petani/penggiat hortikultura:

1. **Identifikasi Penyakit** — upload foto (kamera/galeri), AI (Gemini) menganalisis, hasil: nama penyakit/hama/defisiensi, gejala, penyebab, **cara mengatasi dari database terstruktur**.
2. **Rekomendasi Pemupukan** (tanah mineral) — jadwal lengkap sampai panen: jenis pupuk, dosis per tanaman & per ha, total kebutuhan, metode, tanggal kalender.
3. **Hitung Kebutuhan Semprot** — dosis per tangki, jumlah tangki, jadwal aplikasi & masa tunggu panen.

> Buka web → **Beranda** (kartu menu). Navigasi via **navbar bawah** (Beranda/Identifikasi/Pemupukan/Semprot) atau **☰ (hamburger) di kiri atas**.

## Tech stack

- Next.js (App Router) + TypeScript strict
- Tailwind CSS (tema hijau, mobile-first)
- Gemini API (`@google/genai`) — hanya server
- Zod (validasi data & respons AI)
- Vitest (unit test)
- Deploy: GitHub → Vercel

**Tanpa login, tanpa batas kuota scan** (biaya Gemini menempel pada `GEMINI_API_KEY` masing-masing).

## Setup lokal

```bash
cp .env.example .env.local
# isi GEMINI_API_KEY
npm install --legacy-peer-deps
npm run dev
```

Buka http://localhost:3000 — membuka beranda.

### Env

| Variabel | Wajib? | Keterangan |
|---|---|---|
| `GEMINI_API_KEY` | Ya (untuk fitur scan) | Dari https://aistudio.google.com/apikey |
| `GEMINI_MODEL` | Tidak | Default `gemini-3.5-flash` |

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
- **Tanpa auth & tanpa limit scan** — siapa pun yang punya URL bisa memakai fitur identifikasi tanpa batas; pasang auth / WAF / rate limit bila suatu saat diperlukan (biaya Gemini bisa membengkak).
- Dosis pupuk & pestisida = **acuan umum**, bukan rekomendasi resmi. Selalu baca label & konsultasi penyuluh.
- AI **tidak pernah** memberikan dosis obat — semua dari database terstruktur.

## Struktur

```
app/           # halaman & API
components/    # UI (hamburger, identifikasi, pemupukan, katalog)
data/          # types, schema Zod, fertilizers, plants, diseases, COVERAGE.md
lib/           # gemini, fertilizer-calc, spray-calc, catalog, season, soil-profile, image, ics
scripts/       # validate-data
tests/         # unit test
```
