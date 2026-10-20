# Progres kelengkapan data — Jasmine

Status `verified: false` berarti **acuan umum**, perlu verifikasi ahli (PPL/POPT/BPTP).

## Tanaman

| ID | Nama | Kategori | Tahap pupuk | Status |
|---|---|---|---|---|
| cabai-merah-besar | Cabai Merah Besar | sayuran-buah | 7 | acuan umum |
| cabai-rawit | Cabai Rawit | sayuran-buah | 5 | acuan umum |
| tomat | Tomat | sayuran-buah | 8 | acuan umum |
| terong | Terong | sayuran-buah | 6 | acuan umum |
| mentimun | Mentimun | sayuran-buah | 5 | acuan umum |
| melon | Melon | sayuran-buah | 4 | acuan umum |
| semangka | Semangka | sayuran-buah | 4 | acuan umum |
| pare | Pare | sayuran-buah | 3 | acuan umum |
| jagung-manis | Jagung Manis | sayuran-buah | 3 | acuan umum |
| bawang-merah | Bawang Merah | sayuran-umbi | 5 | acuan umum |
| bawang-putih | Bawang Putih | sayuran-umbi | 4 | acuan umum |
| kentang | Kentang | sayuran-umbi | 5 | acuan umum |
| wortel | Wortel | sayuran-umbi | 3 | acuan umum |
| kubis | Kubis | sayuran-daun | 7 | acuan umum |
| sawi-hijau | Sawi Hijau | sayuran-daun | 3 | acuan umum |
| pakcoy | Pakcoy | sayuran-daun | 3 | acuan umum |
| bayam | Bayam | sayuran-daun | 2 | acuan umum |
| kangkung | Kangkung | sayuran-daun | 2 | acuan umum |
| kacang-panjang | Kacang Panjang | sayuran-polong | 3 | acuan umum |
| buncis | Buncis | sayuran-polong | 3 | acuan umum |
| mangga | Mangga | buah (tahunan) | 4 | acuan umum |
| jeruk | Jeruk | buah (tahunan) | 4 | acuan umum |
| pisang | Pisang | buah (tahunan) | 4 | acuan umum |
| pepaya | Pepaya | buah (tahunan) | 4 | acuan umum |

**Total tanaman: 24** (Tier A, jadwal manual) + **295 Tier B** (template) = **319**
(target Fase 4: ~60+ Tier A; master list Tier B ditambah bertahap menuju ~300)

## Komoditas Tier B (jadwal otomatis dari template)

Semua acuan umum — disusun `lib/fertilizer-engine.ts` dari `data/templates.ts`.

| Kelompok | Satuan | Jumlah | Contoh |
|---|---|---|---|
| buah-tahunan | bulan | 86 | alpukat, durian, manggis, kelapa, jeruk varietas, pisang varietas |
| hias | bulan | 43 | melati, mawar, anggrek, krisan, anthurium, gerbera |
| rempah | bulan | 32 | jahe, kunyit, sereh, lada, pala, cengkeh, temulawak |
| rempah-cepat | hst | 26 | kemangi, ketumbar, pudina, rosemary, seledri, sambiloto |
| cucurbitaceae | hst | 19 | labu siam, gambas, oyong, timun panjang, melon, semangka |
| daun-cepat | hst | 16 | bayam merah, kenikir, genjer, selada, arugula, endive |
| polong | hst | 16 | kedelai, kacang hijau, kacang merah, buncis, edamame |
| brassica-daun-cepat | hst | 14 | sawi putih, caisim, kailan, tatsoi, mizuna |
| solanaceae-buah | hst | 11 | paprika, tomat ceri, cabe keriting, terong putih |
| umbi-cepat | hst | 10 | ubi jalar, wortel varietas, kentang, bit, lobak |
| allium-umbi | hst | 7 | bawang bombay, bawang daun, bawang putih varietas |
| umbi-lama | bulan | 7 | singkong, garut, talas, suweg, uwi, bengkuang |
| brassica-kubis | hst | 3 | brokoli, kembang kol, kubis merah |
| jagung | hst | 2 | jagung pulut, jagung ungu |
| stroberi | hst | 2 | stroberi, stroberi lokal |
| nanas | bulan | 1 | nanas |

Setiap `TemplateKelompok` punya `satuanWaktu` (`hst`/`bulan`) yang **wajib sama**
dengan `satuanUmur` komoditasnya — dijaga oleh `scripts/validate-data.ts` agar
jadwal tidak salah skala waktu.

## Gangguan (penyakit / hama / defisiensi)

| ID | Jenis | Tanaman utama | Status |
|---|---|---|---|
| cabai-antraknosa | penyakit | cabai, tomat, terong | acuan umum |
| solanaceae-layu-fusarium | penyakit | cabai, tomat, terong, kentang | acuan umum |
| solanaceae-layu-bakteri | penyakit | cabai, tomat, terong | acuan umum |
| cabai-virus-kuning | penyakit | cabai, tomat | acuan umum |
| hama-tungau | hama | cabai, terong, mentimun | acuan umum |
| cabai-bercak-daun-cercospora | penyakit | cabai, terong | acuan umum |
| tomat-hawar-daun | penyakit | tomat, kentang | acuan umum |
| tomat-bercak-alternaria | penyakit | tomat, terong, cabai-rawit, kentang | acuan umum |
| busuk-ujung-buah | fisiologis | tomat, cabai, terong | acuan umum |
| cucurbit-embun-bulu | penyakit | mentimun, melon, semangka, pare | acuan umum |
| cucurbit-embun-tepung | penyakit | mentimun, melon, semangka, pare | acuan umum |
| bawang-bercak-ungu | penyakit | bawang-merah, bawang-putih | acuan umum |
| bawang-moler | penyakit | bawang-merah, bawang-putih | acuan umum |
| ulat-grayak | hama | multi (solanaceae, cucurbit, jagung) | acuan umum |
| hama-thrips | hama | multi (solanaceae, cucurbit, allium) | acuan umum |
| hama-kutu-daun | hama | * | acuan umum |
| hama-lalat-buah | hama | multi (cabai, tomat, timun, mangga, pepaya) | acuan umum |
| kubis-akar-gada | penyakit | kubis, sawi, pakcoy | acuan umum |
| kubis-busuk-hitam | penyakit | kubis, sawi, pakcoy | acuan umum |
| ulat-plutella-krop | hama | kubis, sawi, pakcoy | acuan umum |
| terong-penggerek-buah | hama | terong, cabai, tomat | acuan umum |
| semai-rebah-kecambah | penyakit | * | acuan umum |
| defisiensi-n | defisiensi | * | acuan umum |
| defisiensi-k | defisiensi | * | acuan umum |
| defisiensi-p | defisiensi | * | acuan umum |
| defisiensi-ca | defisiensi | * | acuan umum |
| defisiensi-mg | defisiensi | * | acuan umum |
| defisiensi-fe | defisiensi | * | acuan umum |
| jeruk-cvpd | penyakit | jeruk | acuan umum |
| mangga-antraknosa | penyakit | mangga | acuan umum |
| pisang-layu-fusarium | penyakit | pisang | acuan umum |
| pepaya-busuk-pangkal-batang | penyakit | pepaya | acuan umum |

**Total gangguan: 32** (0% verified)

## Pupuk

**Total: 20** entri (tunggal, majemuk, organik, hayati, mikro, pembenah)

## Prioritas Fase 4 (lanjutan)

Selesai: cabai-rawit, sawi-hijau, pakcoy, bayam, kangkung, kacang-panjang, buncis, wortel, kentang, bawang-putih, melon, semangka, jagung-manis, pare, mangga, jeruk, pisang, pepaya.

Berikutnya: sawi-sawi lain (sawi putih, caisim), brokoli, kailan, asparagus, batang (seledri, daun bawang), rempah (kemangi, ketumbar, jahe, kunyit, lengkuas, sereh, cabe jawa), tanaman hias opsional, lanjutan buah (alpukat, kelengkeng, rambutan, salak, srikaya, jambu, kelapa, durian).
