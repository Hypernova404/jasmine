"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TANAMAN_MAP, GANGGUAN_MAP, FERTILIZER_MAP, namaPupuk, labelJenisGangguan } from "@/lib/catalog";
import { labelMetode } from "@/lib/fertilizer-calc";
import { BadgeVerified } from "@/components/ui/BadgeVerified";

type Params = { type: string; id: string };

export function DetailKatalog({ params }: { params: Promise<Params> }) {
  const { type, id } = use(params);
  const item = useMemo(() => {
    if (type === "tanaman") return TANAMAN_MAP[id];
    if (type === "gangguan") return GANGGUAN_MAP[id];
    if (type === "pupuk") return FERTILIZER_MAP[id];
    return undefined;
  }, [type, id]);

  if (!item) notFound();

  if (type === "tanaman") {
    const t = item as (typeof TANAMAN_MAP)[string];
    return (
      <div className="space-y-4">
        <Link href="/katalog" className="text-sm text-primary-dark">← Kembali ke katalog</Link>
        <header>
          <h1 className="text-2xl font-bold">{t.nama}</h1>
          <p className="text-sm italic text-muted">{t.namaLatin}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <BadgeVerified verified={t.verified} />
            {t.tier === "B" && (
              <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary-dark">
                Template otomatis
              </span>
            )}
          </div>
        </header>
        <section className="rounded-xl border border-border bg-card p-4 text-sm">
          <ul className="space-y-1">
            <li>Kategori: <strong className="capitalize">{t.kategori.replace("-", " ")}</strong></li>
            <li>Umur panen: <strong>{t.umurPanen[0]}–{t.umurPanen[1]} {t.satuanUmur === "bulan" ? "bulan" : "hari"}</strong></li>
            <li>pH ideal: <strong>{t.phIdeal[0]}–{t.phIdeal[1]}</strong></li>
            <li>Jarak tanam: <strong>{t.jarakTanam}</strong></li>
            <li>Populasi: <strong>{t.populasiPerHa.toLocaleString("id-ID")}/ha</strong></li>
            <li>Alias: {t.alias.join(", ") || "—"}</li>
          </ul>
        </section>
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-2 font-bold">Tahap pemupukan ({t.pupuk.length} tahap)</h2>
          <ol className="space-y-2 text-sm">
            {t.pupuk.map((p) => (
              <li key={p.id} className="rounded-lg border border-border p-2">
                <strong>{p.label}</strong>
                <span className="block text-xs text-muted">
                  {p.hstMulai < 0
                    ? `${Math.abs(p.hstMulai)} hari sebelum tanam`
                    : `Saat umur ${p.hstMulai} hari`}
                  {p.hstSelesai !== undefined ? ` sampai ${p.hstSelesai} hari` : ""}
                  {p.ulangiHari ? ` · ulang tiap ${p.ulangiHari} hari` : ""}
                  {" · "}
                  {labelMetode(p.metode)}
                </span>
                <ul className="mt-1 space-y-0.5">
                  {p.items.map((i) => (
                    <li key={i.pupukId}>
                      {namaPupuk(i.pupukId)} — {i.dosis}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
        <section className="rounded-xl border border-border bg-card p-4 text-sm">
          <h2 className="mb-2 font-bold">Catatan</h2>
          <ul className="list-disc space-y-1 pl-5">
            {t.catatan.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <p className="mt-3 text-xs text-muted">Sumber: {t.sumber.join("; ")}</p>
        </section>
      </div>
    );
  }

  if (type === "gangguan") {
    const g = item as (typeof GANGGUAN_MAP)[string];
    return (
      <div className="space-y-4">
        <Link href="/katalog" className="text-sm text-primary-dark">← Kembali ke katalog</Link>
        <header>
          <h1 className="text-2xl font-bold">{g.nama}</h1>
          <p className="text-sm text-muted">{labelJenisGangguan(g.jenis)} · Tingkat bahaya: {g.tingkatBahaya}</p>
          <div className="mt-1"><BadgeVerified verified={g.verified} /></div>
        </header>
        <section className="rounded-xl border border-border bg-card p-4 text-sm">
          <p><strong>Penyebab:</strong> {g.penyebab}</p>
          <p className="mt-2"><strong>Tanaman:</strong> {g.plants.join(", ")}</p>
        </section>
        <section className="rounded-xl border border-border bg-card p-4 text-sm">
          <h2 className="mb-1 font-bold">Gejala</h2>
          <ul className="list-disc space-y-0.5 pl-5">{g.gejala.map((x) => <li key={x}>{x}</li>)}</ul>
        </section>
        <section className="rounded-xl border border-border bg-card p-4 text-sm">
          <h2 className="mb-1 font-bold">Cara penanganan</h2>
          <ul className="list-disc space-y-0.5 pl-5">{g.kulturTeknis.map((x) => <li key={x}>{x}</li>)}</ul>
        </section>
        {g.obat.length > 0 && (
          <section className="rounded-xl border border-border bg-card p-4 text-sm">
            <h2 className="mb-1 font-bold">Obat (bahan aktif)</h2>
            <ul className="space-y-2">
              {g.obat.map((o) => (
                <li key={o.bahanAktif}>
                  <strong>{o.bahanAktif}</strong> ({o.golongan}) — {o.dosis}, {o.interval}
                  {o.catatan && <span className="block text-xs text-muted">{o.catatan}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="rounded-xl border border-border bg-card p-4 text-sm">
          <h2 className="mb-1 font-bold">Pencegahan</h2>
          <ul className="list-disc space-y-0.5 pl-5">{g.pencegahan.map((x) => <li key={x}>{x}</li>)}</ul>
          <p className="mt-3 text-xs text-muted">Sumber: {g.sumber.join("; ")}</p>
        </section>
      </div>
    );
  }

  const p = item as (typeof FERTILIZER_MAP)[string];
  return (
    <div className="space-y-4">
      <Link href="/katalog" className="text-sm text-primary-dark">← Kembali ke katalog</Link>
      <header>
        <h1 className="text-2xl font-bold">{p.nama}</h1>
        <p className="text-sm text-muted">{p.kandungan} · {p.tipe}</p>
      </header>
      <p className="rounded-xl border border-border bg-card p-4 text-sm">{p.keterangan}</p>
    </div>
  );
}
