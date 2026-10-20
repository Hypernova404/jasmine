"use client";

import { useMemo, useState } from "react";
import type { Tanaman } from "@/data/types";
import { SEMUA_TANAMAN, namaPupuk } from "@/lib/catalog";
import {
  formatTanggal,
  formatTanggalPanjang,
  hitungJadwalPupuk,
  hitungJumlahTanaman,
  hitungUmur,
  labelFase,
  labelMetode,
  satuanUmurLabel,
  statusAplikasi,
  type HasilKalkulasi,
} from "@/lib/fertilizer-calc";
import { buatICS, downloadFile } from "@/lib/ics";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { BadgeVerified } from "@/components/ui/BadgeVerified";

const FASE_COLOR: Record<string, string> = {
  dasar: "bg-muted/20",
  vegetatif: "bg-primary-light",
  generatif: "bg-amber-100",
  panen: "bg-orange-100",
};

export function PemupukanClient() {
  const [plantId, setPlantId] = useState("");
  const [qTanaman, setQTanaman] = useState("");
  const [modeUmur, setModeUmur] = useState<"tanggal" | "umur">("tanggal");
  const [tanggalTanam, setTanggalTanam] = useState("");
  const [umurInput, setUmurInput] = useState("");
  const [jumlahTanaman, setJumlahTanaman] = useState("");
  const [hasil, setHasil] = useState<HasilKalkulasi | null>(null);
  const [meta, setMeta] = useState<{
    tanaman: Tanaman;
    tanggalTanam: Date;
    jumlahTanaman: number;
    luasHa: number;
    umur: number;
  } | null>(null);

  const plantOptions = useMemo(
    () => [...SEMUA_TANAMAN].sort((a, b) => a.nama.localeCompare(b.nama, "id")),
    [],
  );
  const tanaman = plantOptions.find((p) => p.id === plantId);
  const q = qTanaman.trim();
  const hasilCari = q
    ? plantOptions
        .filter(
          (p) =>
            p.nama.toLowerCase().includes(q.toLowerCase()) ||
            p.alias.some((a) => a.toLowerCase().includes(q.toLowerCase())),
        )
        .slice(0, 8)
    : [];
  const sudahTerpilih = Boolean(tanaman) && q === tanaman?.nama;
  const tampilkanHasil = q.length > 0 && !sudahTerpilih;

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

  function hitung() {
    if (!tanaman) return;

    let tTanam: Date;
    let umur: number | undefined;
    // eslint-disable-next-line react-hooks/purity -- event handler, hanya dipanggil saat klik
    const now = Date.now();
    if (modeUmur === "tanggal") {
      if (!tanggalTanam) return;
      tTanam = new Date(tanggalTanam + "T00:00:00");
      if (Number.isNaN(tTanam.getTime())) return;
    } else {
      const u = Number(umurInput);
      if (!umurInput || Number.isNaN(u)) return;
      umur = u;
      tTanam = new Date(now - u * (tanaman.satuanUmur === "bulan" ? 30 : 1) * 86400000);
    }

    const j = Number(jumlahTanaman);
    if (!jumlahTanaman || j <= 0) return;
    const opsi = { jumlahTanaman: j };

    const { jumlahTanaman: jml, luasHa } = hitungJumlahTanaman(opsi, tanaman.populasiPerHa);
    if (jml <= 0) return;

    const h = hitungJadwalPupuk(tanaman, {
      tanggalTanam: tTanam,
      jumlahTanaman: jml,
      luasHa,
      umurSekarang: umur,
    });
    setHasil(h);
    setMeta({
      tanaman,
      tanggalTanam: tTanam,
      jumlahTanaman: jml,
      luasHa,
      umur: hitungUmur(tTanam, tanaman.satuanUmur, umur),
    });
  }

  function simpanICS() {
    if (!meta || !hasil) return;
    for (const ap of hasil.aplikasi) {
      const judul = `Pemupukan: ${meta.tanaman.nama} — ${ap.label}`;
      const desc = [
        `Tanaman: ${meta.tanaman.nama}`,
        `Tahap: ${ap.label} (${labelFase(ap.fase)})`,
        `Umur: ${
          ap.hst >= 0
            ? `${ap.hst} ${satuanUmurLabel(meta.tanaman.satuanUmur)}`
            : `${Math.abs(ap.hst)} hari sebelum tanam`
        }`,
        `Metode: ${labelMetode(ap.metode)}`,
        ...ap.items.map((i) => `${namaPupuk(i.pupukId)}: ${i.dosis}`),
        ap.catatan ?? "",
      ]
        .filter(Boolean)
        .join("\n");
      const filename = `pemupukan-${meta.tanaman.id}-${ap.tahapId}.ics`;
      downloadFile(filename, buatICS({ judul, deskripsi: desc, tanggalMulai: ap.tanggal }));
    }
  }

  const umurSekarang = meta?.umur ?? 0;
  const tahapBerikut = hasil?.aplikasi.find((a) => statusAplikasi(a.hst, umurSekarang) === "nanti");
  const dasar = hasil?.aplikasi.find((a) => a.fase === "dasar" || a.hst < 0);

  return (
    <div className="space-y-4">
      <header className="no-print">
        <h1 className="text-2xl font-bold">2. Rekomendasi Pemupukan</h1>
        <p className="text-sm text-muted">
          Jadwal pemupukan lengkap dari mulai tanam sampai panen.
        </p>
      </header>

      <section className="no-print space-y-4 rounded-xl border border-border bg-card p-4">
        <div>
          <label htmlFor="cari-tanaman" className="mb-1 block text-sm font-semibold">
            Pilih tanaman
          </label>
          <div className="relative">
            <input
              id="cari-tanaman"
              type="text"
              value={qTanaman}
              onChange={(e) => ubahCariTanaman(e.target.value)}
              placeholder="Ketik nama tanaman…"
              autoComplete="off"
              role="combobox"
              aria-expanded={tampilkanHasil}
              aria-controls="daftar-tanaman"
              className="w-full rounded-lg border border-border bg-white px-3 py-3 pr-10"
            />
            {plantId && (
              <button
                type="button"
                aria-label="Hapus pilihan tanaman"
                onClick={() => {
                  setPlantId("");
                  setQTanaman("");
                }}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-primary-light hover:text-primary-dark"
              >
                ✕
              </button>
            )}
          </div>
          {tampilkanHasil && (
            <ul
              id="daftar-tanaman"
              role="listbox"
              className="mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-white"
            >
              {hasilCari.map((p) => (
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
          {tampilkanHasil && hasilCari.length === 0 && (
            <p className="mt-1 text-sm text-muted">
              Tanaman “{q}” tidak ditemukan di katalog.
            </p>
          )}
          {sudahTerpilih && tanaman && (
            <p className="mt-1 text-xs text-primary-dark">
              ✓ {tanaman.nama} dipilih — ubah dengan mengetik lagi atau tombol ✕
            </p>
          )}
          {tanaman && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
              <BadgeVerified verified={tanaman.verified} />
              {tanaman.tier === "B" && (
                <span className="rounded-full bg-primary-light px-2 py-0.5 font-semibold text-primary-dark">
                  Jadwal template otomatis
                </span>
              )}
              <span>pH tanah ideal {tanaman.phIdeal[0]}–{tanaman.phIdeal[1]}</span>
              <span>· {tanaman.jarakTanam}</span>
              <span>
                · Bisa dipanen umur {tanaman.umurPanen[0]}–{tanaman.umurPanen[1]}{" "}
                {satuanUmurLabel(tanaman.satuanUmur)}
              </span>
            </div>
          )}
        </div>

        {tanaman && (
          <>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Kapan tanaman ditanam?</legend>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModeUmur("tanggal")}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    modeUmur === "tanggal" ? "bg-primary text-white" : "bg-primary-light text-primary-dark"
                  }`}
                >
                  Tanggal tanam
                </button>
                <button
                  type="button"
                  onClick={() => setModeUmur("umur")}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    modeUmur === "umur" ? "bg-primary text-white" : "bg-primary-light text-primary-dark"
                  }`}
                >
                  Umur tanaman sekarang
                </button>
              </div>
              <div className="mt-2">
                {modeUmur === "tanggal" ? (
                  <input
                    type="date"
                    value={tanggalTanam}
                    onChange={(e) => setTanggalTanam(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-3"
                    aria-label="Tanggal tanam"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={umurInput}
                      onChange={(e) => setUmurInput(e.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-3"
                      aria-label="Umur tanaman"
                      min={0}
                    />
                    <span className="shrink-0 text-sm font-medium">
                      {satuanUmurLabel(tanaman.satuanUmur)}
                    </span>
                  </div>
                )}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Jumlah tanaman</legend>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={jumlahTanaman}
                onChange={(e) => setJumlahTanaman(e.target.value)}
                placeholder="mis. 500"
                className="w-full rounded-lg border border-border px-3 py-3"
                aria-label="Jumlah tanaman"
              />
                <p className="mt-1 text-xs text-muted">
                  Banyaknya tanaman Anda: ketik jumlahnya. (Dari angka ini, luas
                  lahan dihitung otomatis.)
                </p>
            </fieldset>

            <button
              type="button"
              onClick={hitung}
              className="w-full rounded-xl bg-primary-dark px-4 py-4 text-lg font-bold text-white"
            >
              Hitung Jadwal
            </button>
          </>
        )}
      </section>

      {hasil && meta && (
        <>
          <section className="rounded-xl border border-primary/40 bg-primary-light/40 p-4">
            <h2 className="font-bold">Ringkasan</h2>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                Pemupukan pertama:{" "}
                <strong>{dasar?.label ?? hasil.aplikasi[0]?.label ?? "—"}</strong>
                {dasar && ` (${formatTanggal(dasar.tanggal)})`}
              </li>
              {tahapBerikut && (
                <li>
                  Tahap berikutnya: <strong>{tahapBerikut.label}</strong> (
                  {formatTanggal(tahapBerikut.tanggal)})
                </li>
              )}
              <li>
                Total aplikasi sampai panen:{" "}
                <strong>{hasil.totalAplikasi} kali</strong>
              </li>
              <li>
                Jumlah tanaman: <strong>{meta.jumlahTanaman.toLocaleString("id-ID")}</strong>{" "}
                · Luas: <strong>{meta.luasHa.toFixed(3)} ha</strong>
              </li>
              <li>
                Umur saat ini:{" "}
                <strong>
                  {meta.umur} {satuanUmurLabel(meta.tanaman.satuanUmur)}
                </strong>
              </li>
            </ul>
            {hasil.perluDolomit && (
              <p className="mt-2 rounded-lg bg-warning-bg p-2 text-sm font-medium">
                Tanah Anda asam (pH kurang dari 5,5): tabur kapur dolomit ±{" "}
                {hasil.rekomendasiDolomitTonPerHa} ton/ha sekitar 2 minggu
                sebelum tanam
                {hasil.dolomitKgPerPohon > 0 &&
                  ` (${hasil.dolomitKgPerPohon} kg per pohon per tahun)`}
                .
              </p>
            )}
            {hasil.kapurKondisional && !hasil.perluDolomit && (
              <p className="mt-2 rounded-lg bg-warning-bg p-2 text-sm font-medium">
                Perlu diuji dulu: periksa keasaman tanah (pH). Bila pH kurang
                dari 5,5, tambahkan kapur dolomit sebelum tanam.
              </p>
            )}
            {hasil.catatanKapur && !hasil.perluDolomit && !hasil.kapurKondisional && (
              <p className="mt-2 rounded-lg bg-warning-bg p-2 text-sm font-medium">
                {hasil.catatanKapur}
              </p>
            )}
          </section>

          {hasil.peringatanMdpl && (
            <section className="rounded-xl border border-warning-border bg-warning-bg p-4 text-sm font-medium">
              ⚠ {hasil.peringatanMdpl}
            </section>
          )}

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 font-bold">Jadwal per tahap</h2>
            <div className="space-y-3">
              {hasil.aplikasi.map((ap) => {
                const st = statusAplikasi(ap.hst, umurSekarang);
                const isNow = st === "kini";
                return (
                  <div
                    key={`${ap.tahapId}-${ap.hst}`}
                    className={`print-break rounded-xl border p-3 ${
                      isNow
                        ? "border-primary border-2 shadow-sm"
                        : st === "lewat"
                          ? "border-border opacity-70"
                          : "border-border"
                    } ${FASE_COLOR[ap.fase] ?? ""}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">
                          {ap.label}
                          {isNow && (
                            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                              Sedang berjalan
                            </span>
                          )}
                          {st === "kini" && !isNow && (
                            <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-white">
                              Hari ini
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted">
                          {ap.hst >= 0
                            ? `Saat tanaman berumur ${ap.hst} ${satuanUmurLabel(meta.tanaman.satuanUmur)}`
                            : `${Math.abs(ap.hst)} hari sebelum tanam`}{" "}
                          · {labelFase(ap.fase)} · {labelMetode(ap.metode)}
                          {ap.dibagiTekstur &&
                            ` · dibagi jadi ${ap.dibagiTekstur.baru} kali karena tanah berpasir`}
                        </p>
                      </div>
                      <p className="text-sm font-medium">{formatTanggal(ap.tanggal)}</p>
                    </div>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {ap.items.map((it) => (
                        <li key={it.pupukId + it.dosis}>
                          <strong>{namaPupuk(it.pupukId)}</strong>
                          <span className="block text-muted">{it.dosis}</span>
                          {it.totalKg !== undefined && (
                            <span className="block text-xs font-medium text-primary-dark">
                              Total untuk lahan Anda:{" "}
                              {it.totalKg >= 1
                                ? `${it.totalKg.toFixed(2)} kg`
                                : `${(it.totalKg * 1000).toFixed(0)} g`}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                    {ap.catatan && (
                      <p className="mt-2 rounded-lg bg-white/70 p-2 text-xs">{ap.catatan}</p>
                    )}
                    {ap.catatanMusim && (
                      <p className="mt-1 text-xs text-muted">🌦 {ap.catatanMusim}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="print-break rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 font-bold">Total kebutuhan pupuk</h2>
            <ul className="divide-y divide-border text-sm">
              {hasil.totalKebutuhan.map((t) => (
                <li key={t.pupukId} className="flex justify-between gap-2 py-2">
                  <span>{t.nama}</span>
                  <span className="font-semibold">
                    {t.totalKg >= 1
                      ? `${t.totalKg.toFixed(2)} kg`
                      : `${(t.totalKg * 1000).toFixed(0)} g`}
                    {t.totalKg >= 50 && (
                      <span className="ml-1 font-normal text-muted">
                        (± {Math.ceil(t.totalKg / 50)} karung 50 kg)
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="print-break rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 font-bold">Catatan untuk {meta.tanaman.nama}</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                Keasaman tanah (pH) ideal: {meta.tanaman.phIdeal[0]}–
                {meta.tanaman.phIdeal[1]}
              </li>
              <li>Jarak tanam yang disarankan: {meta.tanaman.jarakTanam}</li>
              {meta.tanaman.catatan.map((c) => (
                <li key={c}>{c}</li>
              ))}
              {hasil.catatanTanah.map((c) => (
                <li key={c}>{c}</li>
              ))}
              {hasil.catatanAir && <li>{hasil.catatanAir}</li>}
              <li>🌦 {hasil.peringatanMusim}</li>
            </ul>
          </section>

          <div className="no-print flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 rounded-xl border-2 border-primary px-4 py-3 font-bold text-primary-dark"
            >
              Simpan sebagai PDF
            </button>
            <button
              type="button"
              onClick={simpanICS}
              className="flex-1 rounded-xl bg-primary px-4 py-3 font-bold text-white"
            >
              Tambahkan ke kalender
            </button>
          </div>

          <p className="no-print text-center text-xs text-muted">
            Dibuat {formatTanggalPanjang(new Date())}
          </p>
        </>
      )}

      <Disclaimer />
    </div>
  );
}
