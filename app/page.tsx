import Link from "next/link";
import { SEMUA_TANAMAN, GANGGUAN_LIST, FERTILIZERS } from "@/lib/catalog";

const MENU_UTAMA = [
  {
    href: "/identifikasi",
    icon: "📷",
    no: "1",
    label: "Identifikasi Penyakit",
    desc: "Foto tanaman → deteksi penyakit/hama + cara atasi dari database",
    cta: "Ambil foto",
  },
  {
    href: "/pemupukan",
    icon: "🌱",
    no: "2",
    label: "Rekomendasi Pemupukan",
    desc: "Jadwal pupuk tahap demi tahap sampai panen, siap unduh & cetak",
    cta: "Susun jadwal",
  },
  {
    href: "/penyemprotan",
    icon: "💧",
    no: "3",
    label: "Hitung Kebutuhan Semprot",
    desc: "Dosis per tangki, jumlah tangki, jadwal & masa tunggu panen",
    cta: "Hitung sekarang",
  },
] as const;

const MENU_SEKUNDER = [
  { href: "/katalog", icon: "📚", label: "Katalog Data", desc: "Tanaman, gangguan & pupuk" },
  { href: "/tentang", icon: "ℹ️", label: "Tentang & Disclaimer", desc: "Cara kerja & batasan aplikasi" },
] as const;

export default function BerandaPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-primary p-5 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide opacity-90">
          Asisten hortikultura
        </p>
        <h1 className="mt-1 text-2xl font-bold leading-tight">
          Jasmine — sawah kebun di genggaman
        </h1>
        <p className="mt-2 text-sm leading-relaxed opacity-95">
          Tanpa login. Pilih menu di bawah, mulai dari foto tanaman atau jadwal
          pupuk. Semua rekomendasi adalah <strong>acuan umum</strong> — verifikasi
          ke label produk & penyuluh (PPL/POPT) setempat.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white/20 px-2.5 py-1 font-semibold">
            {SEMUA_TANAMAN.length} tanaman
          </span>
          <span className="rounded-full bg-white/20 px-2.5 py-1 font-semibold">
            {GANGGUAN_LIST.length} gangguan
          </span>
          <span className="rounded-full bg-white/20 px-2.5 py-1 font-semibold">
            {FERTILIZERS.length} pupuk
          </span>
        </div>
      </section>

      <section aria-label="Menu utama" className="grid gap-3">
        {MENU_UTAMA.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary"
          >
            <span
              aria-hidden
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light text-2xl"
            >
              {m.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {m.no}
                </span>
                <span className="font-bold group-hover:text-primary-dark">{m.label}</span>
              </span>
              <span className="mt-1 block text-sm text-muted">{m.desc}</span>
              <span className="mt-2 inline-block text-sm font-semibold text-primary-dark">
                {m.cta} →
              </span>
            </span>
          </Link>
        ))}
      </section>

      <section aria-label="Menu lain" className="grid grid-cols-2 gap-3">
        {MENU_SEKUNDER.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary"
          >
            <span className="block text-xl" aria-hidden>
              {m.icon}
            </span>
            <span className="mt-1 block text-sm font-semibold">{m.label}</span>
            <span className="block text-xs text-muted">{m.desc}</span>
          </Link>
        ))}
      </section>

      <p className="text-center text-xs text-muted">
        Data bersifat acuan umum (belum terverifikasi) ·{" "}
        <Link href="/tentang" className="font-semibold text-primary-dark">
          baca disclaimer
        </Link>
      </p>
    </div>
  );
}
