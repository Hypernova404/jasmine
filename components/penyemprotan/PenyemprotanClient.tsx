"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Gangguan } from "@/data/types";
import { GANGGUAN_LIST, GANGGUAN_MAP, PLANT_MAP } from "@/lib/catalog";
import {
  parseDosis,
  parseIntervalHari,
  parseMasaTunggu,
  hitungSemprot,
  fmtNilai,
  type HasilSemprot,
  type SatuanDosisSemprot,
} from "@/lib/spray-calc";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { BadgeVerified } from "@/components/ui/BadgeVerified";

const SATUAN_LIST: SatuanDosisSemprot[] = ["mL/L", "g/L", "mL/ha", "g/ha"];

const TANGKI_LIST = [10, 15, 16, 20];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function saranVolume(umurHari: number | null): number | null {
  if (umurHari === null || Number.isNaN(umurHari)) return null;
  if (umurHari < 45) return 250;
  if (umurHari < 90) return 300;
  return 400;
}

export function PenyemprotanClient() {
  // Dikirim dari tautan identifikasi (?gangguan=…); komponen ini ssr:false,
  // jadi aman membaca window saat inisialisasi state.
  const [gangguanId, setGangguanId] = useState(() => {
    const g = new URLSearchParams(window.location.search).get("gangguan");
    return g && GANGGUAN_MAP[g] ? g : "";
  });
  const [obatIdx, setObatIdx] = useState(0);
  const [dosisManual, setDosisManual] = useState<{ angka: number; satuan: SatuanDosisSemprot }>({
    angka: 0,
    satuan: "mL/L",
  });
  const [modeLuas, setModeLuas] = useState<"m2" | "tanaman">("m2");
  const [luasM2, setLuasM2] = useState("");
  const [jumlahTanaman, setJumlahTanaman] = useState("");
  const [tanamanId, setTanamanId] = useState("");
  const [qTanaman, setQTanaman] = useState("");
  const [kapasitasTangki, setKapasitasTangki] = useState("16");
  const [volumePerHa, setVolumePerHa] = useState("300");
  const [umurHari, setUmurHari] = useState("");
  const [tanggalSemprot, setTanggalSemprot] = useState(todayISO);
  const [tanggalPanen, setTanggalPanen] = useState("");
  const [hasil, setHasil] = useState<HasilSemprot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const daftar = useMemo(
    () => GANGGUAN_LIST.filter((g) => g.obat.length > 0).sort((a, b) => a.nama.localeCompare(b.nama, "id")),
    [],
  );

  const gangguan: Gangguan | null = gangguanId ? (GANGGUAN_MAP[gangguanId] ?? null) : null;
  const obat = gangguan && obatIdx < gangguan.obat.length ? gangguan.obat[obatIdx] : null;

  // Dosis: struktur database → parser teks → manual
  const dosisTerstruktur =
    obat?.dosisMin !== undefined && obat?.dosisMax !== undefined && obat?.satuanDosis
      ? { min: obat.dosisMin, max: obat.dosisMax, satuan: obat.satuanDosis }
      : null;
  const dosisTeks = obat ? parseDosis(obat.dosis) : null;
  const perluManual = !dosisTerstruktur && !dosisTeks;

  const intervalHari = obat
    ? (obat.intervalHari ?? parseIntervalHari(obat.interval))
    : null;
  const masaTungguHari = obat
    ? (obat.masaTungguHari ?? parseMasaTunggu(obat.masaTungguPanen))
    : null;

  const dosisDipakai =
    dosisTerstruktur ??
    dosisTeks ??
    (dosisManual.angka > 0
      ? { min: dosisManual.angka, max: dosisManual.angka, satuan: dosisManual.satuan }
      : null);
  const satuanPokok = dosisDipakai ? dosisDipakai.satuan.split("/")[0] : "";

  // Picker tanaman: ketik → muncul kandidat dari gangguan terpilih → klik.
  const kandidat = useMemo(
    () =>
      gangguan
        ? gangguan.plants
            .map((id) => PLANT_MAP[id])
            .filter((p): p is NonNullable<typeof p> => Boolean(p))
        : [],
    [gangguan],
  );
  const qT = qTanaman.trim();
  const hasilCariT = qT
    ? kandidat
        .filter(
          (p) =>
            p.nama.toLowerCase().includes(qT.toLowerCase()) ||
            p.alias.some((a) => a.toLowerCase().includes(qT.toLowerCase())),
        )
        .slice(0, 8)
    : [];
  const tanamanTerpilih = tanamanId ? PLANT_MAP[tanamanId] : undefined;
  const sudahPilihT = Boolean(tanamanTerpilih) && qT === tanamanTerpilih?.nama;
  const tampilkanHasilT = qT.length > 0 && !sudahPilihT;

  function ubahCariTanaman(v: string) {
    setQTanaman(v);
    const persis = kandidat.find(
      (p) => p.nama.toLowerCase() === v.trim().toLowerCase(),
    );
    if (persis) setTanamanId(persis.id);
    else if (tanamanId) setTanamanId("");
  }

  function pilihTanaman(id: string) {
    const p = PLANT_MAP[id];
    if (!p) return;
    setTanamanId(id);
    setQTanaman(p.nama);
  }

  function luasHaDariInput(): number | null {
    if (modeLuas === "m2") {
      const m2 = parseFloat(luasM2.replace(",", "."));
      if (!Number.isFinite(m2) || m2 <= 0) return null;
      return m2 / 10_000;
    }
    const n = parseInt(jumlahTanaman, 10);
    const t = tanamanId ? PLANT_MAP[tanamanId] : undefined;
    if (!Number.isFinite(n) || n <= 0 || !t) return null;
    return n / t.populasiPerHa;
  }

  function hitung(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setHasil(null);
    if (!obat) {
      setError("Pilih gangguan dan obat terlebih dahulu.");
      return;
    }
    const luasHa = luasHaDariInput();
    if (luasHa === null) {
      setError(
        modeLuas === "m2"
          ? "Isi luas lahan dalam m² (angka lebih dari 0)."
          : "Isi jumlah tanaman dan pilih tanamannya.",
      );
      return;
    }
    const kap = parseFloat(kapasitasTangki);
    const vol = parseFloat(volumePerHa);
    if (!Number.isFinite(kap) || kap <= 0 || !Number.isFinite(vol) || vol <= 0) {
      setError("Kapasitas tangki dan volume semprot harus lebih dari 0.");
      return;
    }

    const manual = !dosisTerstruktur && !dosisTeks;
    if (manual && (!Number.isFinite(dosisManual.angka) || dosisManual.angka <= 0)) {
      setError("Isi dosis manual dengan angka lebih dari 0.");
      return;
    }
    if (!dosisDipakai) {
      setError("Dosis belum tersedia — isi dosis manual terlebih dahulu.");
      return;
    }

    try {
      setHasil(
        hitungSemprot({
          dosis: dosisDipakai,
          kapasitasTangkiL: kap,
          volumePerHaL: vol,
          luasHa,
          intervalHari,
          masaTungguHari,
          tanggalSemprot: new Date(tanggalSemprot + "T00:00:00"),
          tanggalPanen: tanggalPanen ? new Date(tanggalPanen + "T00:00:00") : null,
          dosisManual: manual,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghitung.");
    }
  }

  const luasHaPreview = luasHaDariInput();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Hitung Kebutuhan Semprot</h1>
        <p className="mt-1 text-sm text-muted">
          Dosis per tangki, jumlah tangki, jadwal berikutnya, dan masa tunggu —
          mengikuti acuan database. <BadgeVerified verified={false} />
        </p>
      </div>

      <form onSubmit={hitung} className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div>
          <label htmlFor="gangguan" className="mb-1 block text-sm font-semibold">
            1. Gangguan (dari identifikasi)
          </label>
          <select
            id="gangguan"
            value={gangguanId}
            onChange={(e) => {
              setGangguanId(e.target.value);
              setObatIdx(0);
              setHasil(null);
              setTanamanId("");
              setQTanaman("");
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          >
            <option value="">— pilih gangguan —</option>
            {gangguan && !gangguan.obat.length && (
              <option value={gangguan.id}>{gangguan.nama} (tanpa obat)</option>
            )}
            {daftar.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nama}
              </option>
            ))}
          </select>
        </div>

        {gangguan && (
          <div>
            <span className="mb-1 block text-sm font-semibold">2. Pilih obat</span>
            {gangguan.obat.length === 0 ? (
              <p className="text-sm text-muted">
                Gangguan ini tidak punya rekomendasi obat — andalkan kultur teknis
                & pencegahan.
              </p>
            ) : (
              <div className="space-y-2">
                {gangguan.obat.map((o, i) => (
                  <label
                    key={o.bahanAktif + o.dosis}
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm ${
                      obatIdx === i
                        ? "border-primary bg-primary-light"
                        : "border-border bg-background"
                    }`}
                  >
                    <input
                      type="radio"
                      name="obat"
                      checked={obatIdx === i}
                      onChange={() => {
                        setObatIdx(i);
                        setHasil(null);
                      }}
                      className="mt-1"
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold">{o.bahanAktif}</span>
                      <span className="block text-xs capitalize text-muted">
                        {o.golongan}
                        {o.sifat ? ` · ${o.sifat}` : ""}
                        {o.kelompokAksi ? ` · grup ${o.kelompokAksi}` : ""}
                      </span>
                      <span className="block text-xs text-muted">
                        Dosis: {o.dosis} · Interval: {o.interval}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {obat && perluManual && (
          <div className="rounded-lg border border-warning-border bg-warning-bg p-3">
            <p className="mb-2 text-sm">
              Dosis database tidak terdeteksi otomatis ({obat.dosis ? `"${obat.dosis}"` : "—"}).
              Isi dosis manual <strong>sesuai label produk</strong>:
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="any"
                value={dosisManual.angka || ""}
                onChange={(e) =>
                  setDosisManual((d) => ({ ...d, angka: parseFloat(e.target.value) }))
                }
                placeholder="angka"
                className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                aria-label="Angka dosis"
              />
              <select
                value={dosisManual.satuan}
                onChange={(e) =>
                  setDosisManual((d) => ({
                    ...d,
                    satuan: e.target.value as SatuanDosisSemprot,
                  }))
                }
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                aria-label="Satuan dosis"
              >
                {SATUAN_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-sm font-semibold">3. Luas lahan</span>
            <div className="mb-2 flex gap-2 text-xs">
              {(["m2", "tanaman"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModeLuas(m)}
                  className={`rounded-full px-3 py-1 font-semibold ${
                    modeLuas === m ? "bg-primary text-white" : "bg-primary-light text-primary-dark"
                  }`}
                >
                  {m === "m2" ? "m²" : "jumlah tanaman"}
                </button>
              ))}
            </div>
            {modeLuas === "m2" ? (
              <input
                type="number"
                min="0"
                step="any"
                value={luasM2}
                onChange={(e) => setLuasM2(e.target.value)}
                placeholder="contoh: 500"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                aria-label="Luas lahan m²"
              />
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={qTanaman}
                    onChange={(e) => ubahCariTanaman(e.target.value)}
                    placeholder="Ketik nama tanaman…"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={tampilkanHasilT}
                    aria-controls="daftar-tanaman-semprot"
                    aria-label="Pilih tanaman"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm"
                  />
                  {tanamanId && (
                    <button
                      type="button"
                      aria-label="Hapus pilihan tanaman"
                      onClick={() => {
                        setTanamanId("");
                        setQTanaman("");
                      }}
                      className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-primary-light hover:text-primary-dark"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {tampilkanHasilT && (
                  <ul
                    id="daftar-tanaman-semprot"
                    role="listbox"
                    className="max-h-56 overflow-y-auto rounded-lg border border-border bg-background"
                  >
                    {hasilCariT.map((p) => (
                      <li key={p.id} role="option" aria-selected={p.id === tanamanId}>
                        <button
                          type="button"
                          onClick={() => pilihTanaman(p.id)}
                          className="flex w-full items-center justify-between gap-2 border-b border-border/50 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-primary-light"
                        >
                          <span className="font-medium">{p.nama}</span>
                          <span className="shrink-0 text-xs text-muted">
                            {p.populasiPerHa.toLocaleString("id-ID")}/ha
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {tampilkanHasilT && hasilCariT.length === 0 && (
                  <p className="text-xs text-muted">
                    Tanaman “{qT}” tidak ada pada gangguan ini.
                  </p>
                )}
                <input
                  type="number"
                  min="1"
                  value={jumlahTanaman}
                  onChange={(e) => setJumlahTanaman(e.target.value)}
                  placeholder="jumlah tanaman"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  aria-label="Jumlah tanaman"
                />
              </div>
            )}
            {luasHaPreview !== null && (
              <p className="mt-1 text-xs text-muted">
                Luas ≈ {fmtNilai(luasHaPreview * 10_000)} m² ({fmtNilai(luasHaPreview)} ha)
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="tangki" className="mb-1 block text-sm font-semibold">
                Kapasitas tangki (liter)
              </label>
              <select
                id="tangki"
                value={kapasitasTangki}
                onChange={(e) => setKapasitasTangki(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              >
                {TANGKI_LIST.map((t) => (
                  <option key={t} value={String(t)}>
                    {t} L
                  </option>
                ))}
                {!TANGKI_LIST.includes(parseInt(kapasitasTangki)) && (
                  <option value={kapasitasTangki}>{kapasitasTangki} L</option>
                )}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="umur" className="mb-1 block text-sm font-semibold">
                  Umur (hari/hst)
                </label>
                <input
                  id="umur"
                  type="number"
                  min="1"
                  value={umurHari}
                  onChange={(e) => {
                    setUmurHari(e.target.value);
                    const s = saranVolume(parseFloat(e.target.value));
                    if (s && ["250", "300", "400"].includes(volumePerHa)) {
                      setVolumePerHa(String(s));
                    }
                  }}
                  placeholder="opsional"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="volume" className="mb-1 block text-sm font-semibold">
                  Volume/ha (liter)
                </label>
                <input
                  id="volume"
                  type="number"
                  min="1"
                  value={volumePerHa}
                  onChange={(e) => setVolumePerHa(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="tglSemprot" className="mb-1 block text-sm font-semibold">
              Tanggal semprot
            </label>
            <input
              id="tglSemprot"
              type="date"
              value={tanggalSemprot}
              onChange={(e) => setTanggalSemprot(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="tglPanen" className="mb-1 block text-sm font-semibold">
              Perkiraan panen (opsional)
            </label>
            <input
              id="tglPanen"
              type="date"
              value={tanggalPanen}
              onChange={(e) => setTanggalPanen(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          🧮 Hitung kebutuhan
        </button>
      </form>

      {hasil && obat && (
        <section aria-live="polite" className="space-y-3">
          <h2 className="font-semibold">Hasil perhitungan</h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Kartu
              label="Dosis per tangki"
              nilai={`${fmtNilai(hasil.dosisPerTangkiMin)}–${fmtNilai(hasil.dosisPerTangkiMax)} ${satuanPokok}`}
              sub={
                dosisDipakai && dosisDipakai.satuan.endsWith("/L")
                  ? `${fmtNilai(dosisDipakai.min)}–${fmtNilai(dosisDipakai.max)} ${satuanPokok}/L × ${kapasitasTangki} L`
                  : `${fmtNilai(dosisDipakai?.min ?? 0)} ${satuanPokok}/ha × ${fmtNilai(hasil.luasPerTangkiHa)} ha`
              }
            />
            <Kartu
              label="Tangki per 1 ha"
              nilai={`${hasil.tangkiPerHa} tangki`}
              sub={`≈ ${fmtNilai(Math.round(hasil.luasPerTangkiHa * 10_000))} m²/tangki`}
            />
            <Kartu
              label="Total larutan"
              nilai={`${fmtNilai(hasil.volumeSemprotTotalL)} L`}
              sub={`${fmtNilai(parseFloat(volumePerHa) || 0)} L/ha`}
            />
            <Kartu
              label="Total produk"
              nilai={`${fmtNilai(hasil.produkTotalMin)}–${fmtNilai(hasil.produkTotalMax)} ${hasil.satuan.split("/")[0]}`}
              sub={`untuk ${fmtNilai(parseFloat(luasHaPreview?.toFixed(3) ?? "0"))} ha · ${hasil.tangkiTotal} tangki`}
            />
            <Kartu
              label="Semprot berikutnya"
              nilai={
                hasil.jadwalBerikutnya
                  ? hasil.jadwalBerikutnya.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"
              }
              sub={
                hasil.intervalHariDipakai !== null
                  ? `+${hasil.intervalHariDipakai} hari`
                  : "lihat label"
              }
            />
            <Kartu
              label="Semprot terakhir aman"
              nilai={
                hasil.batasSemprotTerakhir
                  ? hasil.batasSemprotTerakhir.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : masaTungguHari !== null
                    ? `T−${masaTungguHari} hari`
                    : "cek label"
              }
              sub={
                hasil.batasSemprotTerakhir
                  ? `masa tunggu ${masaTungguHari} hari`
                  : "masa tunggu produk"
              }
            />
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-card p-4 text-sm">
            <p>{hasil.catatanDosis}</p>
            <p>{hasil.catatanInterval}</p>
            <p>{hasil.catatanMusim}</p>
            {hasil.peringatanPanen && (
              <p className="rounded-lg border border-warning-border bg-warning-bg p-2.5 font-medium">
                ⚠ {hasil.peringatanPanen}
              </p>
            )}
            <p className="text-muted">
              Rotasi bahan aktif antaraplikasi (ganti kelompok aksi) untuk
              mencegah resistensi; kenakan APD lengkap.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              href={`/katalog/gangguan/${gangguan!.id}`}
              className="rounded-lg bg-primary-light px-3 py-2 font-semibold text-primary-dark"
            >
              Detail gangguan →
            </Link>
            <Link
              href="/identifikasi"
              className="rounded-lg border border-border px-3 py-2 font-semibold"
            >
              Identifikasi lain
            </Link>
          </div>
        </section>
      )}

      <Disclaimer />
    </div>
  );
}

function Kartu({ label, nilai, sub }: { label: string; nilai: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs uppercase text-muted">{label}</p>
      <p className="mt-0.5 font-bold">{nilai}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}
