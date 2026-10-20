"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Gangguan, IdentifikasiResult } from "@/data/types";
import { PLANTS, namaPupuk } from "@/lib/catalog";
import { kompresGambar, formatUkuran } from "@/lib/image";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { BadgeVerified } from "@/components/ui/BadgeVerified";

type ResponsServer = {
  ai: IdentifikasiResult;
  tanamanDitampilkan: { id: string | null; nama: string };
  gangguan: Gangguan | null;
  terverifikasi: boolean;
  sisaKuota: number;
};

type Tab = "kultur" | "obat" | "pupuk" | "pencegahan";

const TABS: { id: Tab; label: string }[] = [
  { id: "kultur", label: "Kultur Teknis" },
  { id: "obat", label: "Obat" },
  { id: "pupuk", label: "Pupuk Pendukung" },
  { id: "pencegahan", label: "Pencegahan" },
];

function badgeJenis(t: string) {
  const map: Record<string, { label: string; cls: string }> = {
    penyakit: { label: "Penyakit", cls: "bg-danger text-white" },
    hama: { label: "Hama", cls: "bg-accent text-white" },
    defisiensi: { label: "Defisiensi Hara", cls: "bg-primary text-white" },
    fisiologis: { label: "Fisiologis", cls: "bg-primary-dark text-white" },
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

export function IdentifikasiClient() {
  const [plantId, setPlantId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasil, setHasil] = useState<ResponsServer | null>(null);
  const [tab, setTab] = useState<Tab>("kultur");
  const [sisaKuota, setSisaKuota] = useState<number | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const plantOptions = useMemo(
    () => [...PLANTS].sort((a, b) => a.nama.localeCompare(b.nama, "id")),
    [],
  );

  const tambahFiles = useCallback(async (list: FileList | null) => {
    if (!list) return;
    const accepted: File[] = [];
    for (const f of Array.from(list)) {
      if (!f.type.startsWith("image/")) continue;
      accepted.push(await kompresGambar(f));
    }
    setFiles((prev) => {
      const next = [...prev, ...accepted].slice(0, 3);
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev, ...accepted.map((f) => URL.createObjectURL(f))].slice(0, 3);
      return next;
    });
    setHasil(null);
    setError(null);
  }, []);

  const hapusFoto = useCallback(
    (i: number) => {
      setFiles((prev) => prev.filter((_, idx) => idx !== i));
      setPreviews((prev) => {
        URL.revokeObjectURL(prev[i]);
        return prev.filter((_, idx) => idx !== i);
      });
    },
    [],
  );

  async function analisis() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    setHasil(null);
    try {
      const fd = new FormData();
      if (plantId) fd.append("plantId", plantId);
      files.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/identify", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Analisis gagal.");
      }
      setHasil(data);
      setSisaKuota(data.sisaKuota);
      setTab("kultur");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  function salinRingkasan() {
    if (!hasil) return;
    const g = hasil.gangguan;
    const lines = [
      `Hasil Identifikasi — Tani Pintar`,
      `Tanaman: ${hasil.tanamanDitampilkan.nama}`,
      `Kondisi: ${hasil.ai.diseaseNameGuess}`,
      `Keyakinan: ${(hasil.ai.confidence * 100).toFixed(0)}%`,
      `Gejala terlihat: ${hasil.ai.visibleSymptoms.join("; ")}`,
      g ? `Cara mengatasi: ${g.kulturTeknis.join(" | ")}` : "",
      `Disclaimer: panduan awal — konsultasikan penyuluh/POPT setempat.`,
    ]
      .filter(Boolean)
      .join("\n");
    void navigator.clipboard.writeText(lines);
  }

  function bagikanWhatsApp() {
    if (!hasil) return;
    const g = hasil.gangguan;
    const text = encodeURIComponent(
      `Hasil Identifikasi Tani Pintar\nTanaman: ${hasil.tanamanDitampilkan.nama}\nKondisi: ${hasil.ai.diseaseNameGuess}\nKeyakinan: ${(hasil.ai.confidence * 100).toFixed(0)}%\n${g ? `Saran: ${g.kulturTeknis[0] ?? ""}` : ""}\n(Panduan awal — konsultasi penyuluh/POPT)`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  }

  const gangguan = hasil?.gangguan ?? null;
  const rendah = hasil ? hasil.ai.confidence < 0.6 || hasil.ai.needsMorePhotos : false;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">1. Identifikasi Penyakit</h1>
        <p className="text-sm text-muted">
          Foto tanaman → deteksi penyakit, hama, atau defisiensi hara.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-4">
        <label htmlFor="plantId" className="mb-1 block text-sm font-semibold">
          Jenis tanaman (opsional, bantu akurasi)
        </label>
        <select
          id="plantId"
          value={plantId}
          onChange={(e) => setPlantId(e.target.value)}
          className="w-full rounded-lg border border-border bg-white px-3 py-3 text-base"
        >
          <option value="">— Tidak diketahui —</option>
          {plantOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama}
            </option>
          ))}
        </select>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="rounded-xl bg-primary px-4 py-4 text-base font-bold text-white active:bg-primary-dark"
          >
            📷 Ambil Foto
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="rounded-xl border-2 border-primary bg-white px-4 py-4 text-base font-bold text-primary-dark active:bg-primary-light"
          >
            🖼 Pilih Galeri
          </button>
        </div>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => void tambahFiles(e.target.files)}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void tambahFiles(e.target.files)}
        />

        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
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
        )}

        {files.length > 0 && files.length < 3 && (
          <p className="mt-2 text-xs text-muted">
            Boleh tambah foto (daun, buah, batang) — maksimal 3 foto.
          </p>
        )}

        <button
          type="button"
          onClick={() => void analisis()}
          disabled={files.length === 0 || loading}
          className="mt-4 w-full rounded-xl bg-primary-dark px-4 py-4 text-lg font-bold text-white disabled:opacity-50"
        >
          {loading ? "Menganalisis…" : "Analisis"}
        </button>
        {sisaKuota !== null && (
          <p className="mt-2 text-center text-xs text-muted">
            Sisa kuota hari ini: {sisaKuota}
          </p>
        )}

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
          className="flex items-center justify-center gap-3 rounded-xl border border-border bg-card p-8"
          role="status"
        >
          <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          <span className="font-medium">Menganalisis foto dengan AI…</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border-2 border-danger bg-red-50 p-4 text-danger" role="alert">
          <p className="font-semibold">Terjadi kesalahan</p>
          <p className="text-sm">{error}</p>
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
              {hasil.tanamanDitampilkan.nama}
              {hasil.ai.diseaseId !== null || hasil.ai.conditionType === "sehat"
                ? ` — ${hasil.ai.diseaseNameGuess}`
                : ` — ${hasil.ai.diseaseNameGuess}`}
            </h2>
            {!hasil.terverifikasi && hasil.ai.diseaseId === null && hasil.ai.conditionType !== "sehat" && (
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
              <h3 className="mb-2 font-semibold">Cara mengatasi (dari database)</h3>
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
                            <tr key={o.bahanAktif + o.dosis} className="border-b border-border/50 align-top">
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
                    <p className="text-sm text-muted">Tidak ada pupuk pendukung khusus.</p>
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

          {!hasil.terverifikasi && hasil.ai.diseaseId === null && hasil.ai.conditionType !== "sehat" && (
            <section className="rounded-lg bg-primary-light/40 p-3 text-sm">
              <h3 className="mb-1 font-semibold">Saran umum yang aman</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>Sanitasi lahan — buang bagian tanaman yang sakit</li>
                <li>Isolasi tanaman yang terlihat sakit</li>
                <li>Perbaiki drainase &amp; jaga kelembapan</li>
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
                    <span className="text-muted">{(d.confidence * 100).toFixed(0)}%</span>
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
    </div>
  );
}
