"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cariKatalog } from "@/lib/catalog";
import { BadgeVerified } from "@/components/ui/BadgeVerified";

const FILTERS = [
  { id: "", label: "Semua" },
  { id: "tanaman", label: "Tanaman" },
  { id: "gangguan", label: "Penyakit & Hama" },
  { id: "pupuk", label: "Pupuk" },
  { id: "penyakit", label: "Jenis: Penyakit" },
  { id: "hama", label: "Jenis: Hama" },
  { id: "defisiensi", label: "Jenis: Defisiensi" },
] as const;

export function KatalogClient() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const hasil = useMemo(() => cariKatalog(q, filter || undefined), [q, filter]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Katalog Data</h1>
        <p className="text-sm text-muted">
          Tanaman, penyakit/hama, dan pupuk dari database terstruktur.
        </p>
      </header>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari tanaman, penyakit, pupuk…"
        className="w-full rounded-xl border border-border bg-card px-4 py-3"
        aria-label="Cari katalog"
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              filter === f.id ? "bg-primary text-white" : "bg-primary-light text-primary-dark"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted">{hasil.length} item</p>

      <ul className="space-y-2">
        {hasil.map((h) => {
          if (h.tipe === "tanaman") {
            return (
              <li key={`t-${h.item.id}`}>
                <Link
                  href={`/katalog/tanaman/${h.item.id}`}
                  className="block rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{h.item.nama}</span>
                    <BadgeVerified verified={h.item.verified} />
                  </div>
                  <span className="text-xs text-muted capitalize">
                    Tanaman · {h.item.kategori.replace("-", " ")}
                  </span>
                </Link>
              </li>
            );
          }
          if (h.tipe === "gangguan") {
            return (
              <li key={`g-${h.item.id}`}>
                <Link
                  href={`/katalog/gangguan/${h.item.id}`}
                  className="block rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{h.item.nama}</span>
                    <BadgeVerified verified={h.item.verified} />
                  </div>
                  <span className="text-xs text-muted capitalize">
                    {h.item.jenis} · {h.item.penyebab}
                  </span>
                </Link>
              </li>
            );
          }
          return (
            <li key={`p-${h.item.id}`}>
              <div className="rounded-xl border border-border bg-card p-3">
                <span className="font-semibold">{h.item.nama}</span>
                <span className="block text-xs text-muted">
                  Pupuk · {h.item.kandungan} · {h.item.keterangan}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      {hasil.length === 0 && (
        <p className="py-10 text-center text-muted">Tidak ada hasil.</p>
      )}
    </div>
  );
}
