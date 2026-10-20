"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Gangguan, IdentifikasiResult } from "@/data/types";
import { SEMUA_TANAMAN, PLANT_MAP, namaPupuk } from "@/lib/catalog";
import { kompresGambar, formatUkuran } from "@/lib/image";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { BadgeVerified } from "@/components/ui/BadgeVerified";

type ResponsServer = {
  ai: IdentifikasiResult;
  tanamanDitampilkan: { id: string | null; nama: string };
  gangguan: Gangguan | null;
  terverifikasi: boolean;
};

type Tab = "kultur" | "obat" | "pupuk" | "pencegahan";

type RiwayatItem = {
  ts: number;
  tanaman: string;
  kondisi: string;
  keyakinan: number;
};

const TABS: { id: Tab; label: string }[] = [
  { id: "kultur", label: "Kultur Teknis" },
  { id: "obat", label: "Obat" },
  { id: "pupuk", label: "Pupuk Pendukung" },
  { id: "pencegahan", label: "Pencegahan" },
];

const STORAGE_KEY = "jasmine.riwayat-scan";

function badgeJenis(t: string) {
  const map: Record<string, { label: string; cls: string }> = {
    penyakit: { label: "Penyakit", cls: "bg-danger text-white" },
    hama: { label: "Hama", cls: "bg-accent text-white" },
    defisiensi: { label: "Kurang Unsur Hara", cls: "bg-primary text-white" },
    fisiologis: { label: "Gangguan Tumbuh", cls: "bg-primary-dark text-white" },
    sehat: { label: "Sehat", cls: "bg-primary-light text-primary-dark" },
    tidak_jelas: { label: "Tidak Jelas", cls: "bg-muted/20 text-foreground" },
  };
  const b = map[t] ?? map.tidak_jelas;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${b.cls}`}>
      {b.label}
    </span>
  );
}

function levelKeyakinan(c: number): { label: string; cls: string } {
  if (c >= 0.8) return { label: "Tinggi", cls: "text-primary-dark" };
  if (c >= 0.5) return { label: "Sedang", cls: "text-accent" };
  return { label: "Rendah", cls: "text-danger" };
}

function muatRiwayat(): RiwayatItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RiwayatItem[]).slice(0, 20) : [];
  } catch {
    return [];
  }
}

export function IdentifikasiClient() {
  const [plantId, setPlantId] = useState("");
  const [qTanaman, setQTanaman] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Menganalisis foto dengan AI…");
  const [error, setError] = useState<string | null>(null);
  const [errorSementara, setErrorSementara] = useState(false);
  const [hasil, setHasil] = useState<ResponsServer | null>(null);
  const [tab, setTab] = useState<Tab>("kultur");
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const kameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // localStorage hanya ada di client — baca sekali saat mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRiwayat(muatRiwayat());
  }, []);

  const plantOptions = useMemo(
    () => [...SEMUA_TANAMAN].sort((a, b) => a.nama.localeCompare(b.nama, "id")),
    [],
  );

  const tanamanTerpilih = plantOptions.find((p) => p.id === plantId);
  const qCari = qTanaman.trim();
  const hasilCariTanaman = qCari
    ? plantOptions
        .filter(
          (p) =>
            p.nama.toLowerCase().includes(qCari.toLowerCase()) ||
            p.alias.some((a) => a.toLowerCase().includes(qCari.toLowerCase())),
        )
        .slice(0, 8)
    : [];
  const sudahTerpilih = Boolean(tanamanTerpilih) && qCari === tanamanTerpilih?.nama;
  const tampilkanHasilTanaman = qCari.length > 0 && !sudahTerpilih;

  function ubahCariTanaman(v: string) {
    setQTanaman(v);
    const persis = plantOptions.find(
      (p) => p.nama.toLowerCase() === v.trim().toLowerCase(),
    );
    if (persis) setPlantId(persis.id);
    else if (plantId) setPlantId("");
  }

  function pilihTanaman(id: string) {
    const p = plantOptions.find((x) => x.id === id);
    if (!p) return;
    setPlantId(id);
    setQTanaman(p.nama);
  }

  function hapusPilihanTanaman() {
    setPlantId("");
    setQTanaman("");
  }

  const tambahFiles = useCallback(async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const accepted: File[] = [];
    for (const f of Array.from(list)) {
      if (!f.type.startsWith("image/")) continue;
      accepted.push(await kompresGambar(f));
    }
    if (accepted.length === 0) return;
    setFiles((prev) => [...prev, ...accepted].slice(0, 3));
    setPreviews((prev) => {
      const urls = accepted.map((f) => URL.createObjectURL(f));
      return [...prev, ...urls].slice(0, 3);
    });
    setHasil(null);
    setError(null);
  }, []);

  const hapusFoto = useCallback((i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, idx) => idx !== i);
    });
  }, []);

  function simpanRiwayat(r: ResponsServer) {
    const item: RiwayatItem = {
      ts: Date.now(),
      tanaman: r.tanamanDitampilkan.nama,
      kondisi: r.ai.diseaseNameGuess,
      keyakinan: r.ai.confidence,
    };
    const next = [item, ...riwayat].slice(0, 20);
    setRiwayat(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* kuota storage penuh — abaikan */
    }
  }

  async function analisis() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    setErrorSementara(false);
    setHasil(null);
    const pesan = [
      "Mengompres & mengirim foto…",
      "Gemini sedang menganalisis gejala…",
      "Mencocokkan dengan database penyakit…",
    ];
    let pi = 0;
    setLoadingMsg(pesan[0]);
    const timer = setInterval(() => {
      pi = Math.min(pi + 1, pesan.length - 1);
      setLoadingMsg(pesan[pi]);
    }, 2500);
    try {
      const fd = new FormData();
      // Hint ke AI hanya untuk Tier A — AI & database gangguan hanya mengenal
      // komoditas Tier A. Tier B tetap dapat dipilih, dipakai untuk konteks UI.
      if (plantId && PLANT_MAP[plantId]) fd.append("plantId", plantId);
      files.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/identify", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setErrorSementara(Boolean(data.sementara) || res.status === 503);
        throw new Error(data.error ?? "Analisis gagal.");
      }
      setHasil(data);
      setTab("kultur");
      simpanRiwayat(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }

function salinRingkasan() {
    if (!hasil) return;
    const lines = [
      `Asil Cek Tanaman — Jasmine`,
      `Tanaman: ${hasil.tanamanDitampilkan.nama}`,
      `Kahanan: ${hasil.ai.diseaseNameGuess}`,
      `Kepesthen: ${(hasil.ai.confidence * 100).toFixed(0)}%`,
      `Géjala sing katon: ${hasil.ai.visibleSymptoms.join("; ")}`,
      `Pènget: iki mung pituduh awal — takonna penyuluh/POPT ing panggonanmu.`,
    ]
      .filter(Boolean)
      .join("\n");
    void navigator.clipboard.writeText(lines);
  }

  function bagikanWhatsApp() {
    if (!hasil) return;
    const g = hasil.gangguan;
    const text = encodeURIComponent(
      `Hasil Identifikasi Jasmine\nTanaman: ${hasil.tanamanDitampilkan.nama}\nKondisi: ${hasil.ai.diseaseNameGuess}\nKeyakinan: ${(hasil.ai.confidence * 100).toFixed(0)}%\n${g ? `Saran: ${g.kulturTeknis[0] ?? ""}` : ""}\n(Panduan awal — konsultasi penyuluh/POPT)`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  }

  function bersihkanRiwayat() {
    setRiwayat([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  const gangguan = hasil?.gangguan ?? null;
  const rendah = hasil ? hasil.ai.confidence < 0.6 || hasil.ai.needsMorePhotos : false;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">1. Identifikasi Penyakit</h1>
        <p className="text-sm text-muted">
          Foto tanaman → deteksi penyakit, hama, atau kekurangan unsur hara.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-4">
        <label htmlFor="cari-tanaman-identifikasi" className="mb-1 block text-sm font-semibold">
          Jenis tanaman (opsional, bantu akurasi)
        </label>
        <div className="relative">
          <input
            id="cari-tanaman-identifikasi"
            type="text"
            value={qTanaman}
            onChange={(e) => ubahCariTanaman(e.target.value)}
            placeholder="Ketik nama tanaman…"
            autoComplete="off"
            role="combobox"
            aria-expanded={tampilkanHasilTanaman}
            aria-controls="daftar-tanaman-identifikasi"
            className="w-full rounded-lg border border-border bg-white px-3 py-3 pr-10 text-base"
          />
          {plantId && (
            <button
              type="button"
              aria-label="Hapus pilihan tanaman"
              onClick={hapusPilihanTanaman}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-primary-light hover:text-primary-dark"
            >
              ✕
            </button>
          )}
        </div>
        {tampilkanHasilTanaman && (
          <ul
            id="daftar-tanaman-identifikasi"
            role="listbox"
            className="mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-white"
          >
            {hasilCariTanaman.map((p) => (
              <li key={p.id} role="option" aria-selected={p.id === plantId}>
                <button
                  type="button"
                  onClick={() => pilihTanaman(p.id)}
                  className="flex w-full items-center justify-between gap-2 border-b border-border/50 px-3 py-2.5 text-left text-sm last:border-b-0 hover:bg-primary-light"
                >
                  <span className="font-medium">{p.nama}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {p.kategori.replace(/-/g, " ")}
                    {p.tier === "B" ? " · template" : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {tampilkanHasilTanaman && hasilCariTanaman.length === 0 && (
          <p className="mt-1 text-sm text-muted">
            Tanaman “{qCari}” tidak ditemukan di katalog.
          </p>
        )}
        {sudahTerpilih && tanamanTerpilih && (
          <p className="mt-1 text-xs text-primary-dark">
            ✓ {tanamanTerpilih.nama} dipilih — ubah dengan mengetik lagi atau tombol ✕
            {!PLANT_MAP[tanamanTerpilih.id] &&
              " (jadwal template; AI memakai nama umum)"}
          </p>
        )}

        <div className="mt-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary-light/20 p-4">
          {/* Input galeri (tanpa capture — buka file picker / galeri) */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void tambahFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {/* Input kamera (capture environment — langsung buka kamera belakang) */}
          <input
            ref={kameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              void tambahFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {previews.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div key={src} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Foto ${i + 1}`}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => hapusFoto(i)}
                    aria-label={`Hapus foto ${i + 1}`}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm text-white"
                  >
                    ✕
                  </button>
                  <p className="mt-1 truncate text-xs text-muted">
                    {formatUkuran(files[i]?.size ?? 0)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-4xl" aria-hidden>
                📸
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                Belum ada foto terpilih
              </p>
              <p className="text-xs text-muted">
                Maksimal 3 foto (daun, buah, batang)
              </p>
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => kameraRef.current?.click()}
              className="rounded-xl border-2 border-primary bg-white px-3 py-3.5 text-base font-bold text-primary-dark active:bg-primary-light"
            >
              📷 Kamera
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-xl border-2 border-primary bg-white px-3 py-3.5 text-base font-bold text-primary-dark active:bg-primary-light"
            >
              🖼️ Galeri
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            {previews.length === 0
              ? "Ambil foto langsung atau pilih dari galeri HP kamu"
              : previews.length < 3
                ? "Boleh tambah foto lain (daun, buah, batang)"
                : "Maksimal 3 foto"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void analisis()}
          disabled={files.length === 0 || loading}
          className="mt-4 w-full rounded-xl bg-primary-dark px-4 py-4 text-lg font-bold text-white disabled:opacity-50"
        >
          {loading ? "Menganalisis…" : "🔍 Analisis Sekarang"}
        </button>

        <details className="mt-3 text-sm text-muted">
          <summary className="cursor-pointer font-medium">Tips foto yang baik</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Dekat &amp; fokus pada bagian sakit</li>
            <li>Cahaya cukup, hindari bayangan kuat</li>
            <li>Sertakan bagian sehat sebagai pembanding</li>
            <li>Boleh 3 foto: daun, buah, batang</li>
          </ul>
        </details>
      </section>

      {loading && (
        <div
          className="relative overflow-hidden rounded-xl border-2 border-primary bg-card p-6"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0">
              <div className="absolute inset-0 rounded-full border-4 border-primary-light" />
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
              <span className="absolute inset-0 flex items-center justify-center text-xl">
                🔍
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-primary-dark">Sedang menganalisis…</p>
              <p className="animate-pulse text-sm text-muted">{loadingMsg}</p>
            </div>
          </div>
          <div
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scanline"
            aria-hidden
          />
        </div>
      )}

      {error && (
        <div className="rounded-xl border-2 border-danger bg-red-50 p-4 text-danger" role="alert">
          <p className="font-semibold">
            {errorSementara ? "Server AI sedang sibuk" : "Terjadi kesalahan"}
          </p>
          <p className="text-sm">{error}</p>
          {errorSementara && (
            <button
              type="button"
              onClick={analisis}
              disabled={loading || files.length === 0}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Coba lagi
            </button>
          )}
        </div>
      )}

      {hasil && (
        <article className="space-y-4 rounded-xl border border-border bg-card p-4">
          <header className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {badgeJenis(hasil.ai.conditionType)}
              <span className="text-sm text-muted">
                Keyakinan:{" "}
                <strong className={levelKeyakinan(hasil.ai.confidence).cls}>
                  {levelKeyakinan(hasil.ai.confidence).label} (
                  {(hasil.ai.confidence * 100).toFixed(0)}%)
                </strong>
              </span>
              {!hasil.terverifikasi && hasil.ai.diseaseId === null && (
                <BadgeVerified verified={false} />
              )}
            </div>
            <h2 className="text-xl font-bold">
              {hasil.tanamanDitampilkan.nama} — {hasil.ai.diseaseNameGuess}
            </h2>
            {!hasil.terverifikasi &&
              hasil.ai.diseaseId === null &&
              hasil.ai.conditionType !== "sehat" && (
                <p className="rounded-lg bg-warning-bg px-3 py-2 text-sm">
                  Belum ada di database. Informasi umum, belum diverifikasi. Hanya
                  saran umum aman yang ditampilkan.
                </p>
              )}
            {rendah && hasil.ai.conditionType !== "sehat" && (
              <div className="rounded-lg border border-warning-border bg-warning-bg p-3 text-sm font-medium">
                Hasil belum pasti. Ambil foto ulang atau konsultasikan ke
                penyuluh/POPT setempat.
              </div>
            )}
          </header>

          <section>
            <h3 className="mb-1 font-semibold">Gejala terlihat di foto</h3>
            <ul className="list-disc space-y-0.5 pl-5 text-sm">
              {hasil.ai.visibleSymptoms.map((s) => (
                <li key={s}>{s}</li>
              ))}
              {hasil.ai.visibleSymptoms.length === 0 && (
                <li className="text-muted">Tidak ada gejala spesifik terdeteksi.</li>
              )}
            </ul>
            {gangguan && (
              <>
                <h3 className="mb-1 mt-3 font-semibold">Gejala khas (dari database)</h3>
                <ul className="list-disc space-y-0.5 pl-5 text-sm">
                  {gangguan.gejala.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {(gangguan || hasil.ai.conditionType !== "sehat") && (
            <section>
              <h3 className="mb-1 font-semibold">Penyebab</h3>
              <p className="text-sm">
                {gangguan?.penyebab ?? "— (belum ada data terverifikasi)"}
              </p>
            </section>
          )}

          {gangguan && (gangguan.kulturTeknis.length > 0 || gangguan.obat.length > 0) && (
            <section>
              <div className="flex flex-wrap gap-2" role="tablist">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => setTab(t.id)}
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                      tab === t.id
                        ? "bg-primary text-white"
                        : "bg-primary-light text-primary-dark"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-border p-3">
                {tab === "kultur" && (
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {gangguan.kulturTeknis.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                )}
                {tab === "obat" &&
                  (gangguan.obat.length === 0 ? (
                    <p className="text-sm text-muted">
                      Tidak ada rekomendasi obat untuk kondisi ini.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[320px] border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-border text-xs uppercase text-muted">
                            <th className="py-1.5 pr-2">Bahan aktif</th>
                            <th className="py-1.5 pr-2">Golongan</th>
                            <th className="py-1.5 pr-2">Dosis</th>
                            <th className="py-1.5">Interval</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gangguan.obat.map((o) => (
                            <tr
                              key={o.bahanAktif + o.dosis}
                              className="border-b border-border/50 align-top"
                            >
                              <td className="py-2 pr-2 font-medium">
                                {o.bahanAktif}
                                {o.catatan && (
                                  <span className="block text-xs font-normal text-muted">
                                    {o.catatan}
                                  </span>
                                )}
                                {o.masaTungguPanen && (
                                  <span className="block text-xs text-muted">
                                    Masa tunggu: {o.masaTungguPanen}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 pr-2 capitalize">{o.golongan}</td>
                              <td className="py-2 pr-2">{o.dosis}</td>
                              <td className="py-2">{o.interval}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                {tab === "pupuk" &&
                  (gangguan.pupukPendukung.length === 0 ? (
                    <p className="text-sm text-muted">
                      Tidak ada pupuk pendukung khusus.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {gangguan.pupukPendukung.map((p) => (
                        <li key={p.pupukId}>
                          <strong>{namaPupuk(p.pupukId)}</strong>: {p.dosis}
                          {p.catatan && (
                            <span className="block text-xs text-muted">{p.catatan}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ))}
                {tab === "pencegahan" && (
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {gangguan.pencegahan.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}

          {!hasil.terverifikasi &&
            hasil.ai.diseaseId === null &&
            hasil.ai.conditionType !== "sehat" && (
              <section className="rounded-lg bg-primary-light/40 p-3 text-sm">
                <h3 className="mb-1 font-semibold">Saran umum yang aman</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Bersihkan lahan — buang bagian tanaman yang sakit</li>
                  <li>Pisahkan tanaman yang terlihat sakit</li>
                  <li>Perbaiki saluran air agar tidak menggenang</li>
                  <li>Konsultasikan ke penyuluh/POPT setempat</li>
                </ul>
              </section>
            )}

          {hasil.ai.differential.length > 0 && (
            <section>
              <h3 className="mb-1 font-semibold">Diagnosis banding</h3>
              <ul className="space-y-1 text-sm">
                {hasil.ai.differential.slice(0, 2).map((d) => (
                  <li key={d.name} className="flex justify-between gap-2">
                    <span>{d.name}</span>
                    <span className="text-muted">
                      {(d.confidence * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="flex flex-wrap gap-2 no-print">
            <button
              type="button"
              onClick={salinRingkasan}
              className="rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary-dark"
            >
              Salin ringkasan
            </button>
            <button
              type="button"
              onClick={bagikanWhatsApp}
              className="rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white"
            >
              Bagikan ke WhatsApp
            </button>
          </section>

          <Disclaimer />
        </article>
      )}

      {riwayat.length > 0 && (
        <section className="no-print rounded-xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Riwayat scan terakhir</h2>
            <button
              type="button"
              onClick={bersihkanRiwayat}
              className="text-xs font-medium text-danger"
            >
              Hapus
            </button>
          </div>
          <p className="mb-2 text-xs text-muted">
            Disimpan lokal di HP kamu — foto tidak pernah disimpan.
          </p>
          <ul className="divide-y divide-border text-sm">
            {riwayat.map((r) => (
              <li key={r.ts} className="flex items-start justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.tanaman}</p>
                  <p className="truncate text-xs text-muted">{r.kondisi}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-muted">
                  <p className="font-semibold text-foreground">
                    {(r.keyakinan * 100).toFixed(0)}%
                  </p>
                  <p>
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(r.ts))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasil && riwayat.length === 0 && (
        <p className="no-print text-center text-xs text-muted">
          Riwayat scan akan muncul di sini (lokal, tanpa foto).
        </p>
      )}
    </div>
  );
}
