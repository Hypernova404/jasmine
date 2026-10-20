"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MENU_UTAMA = [
  {
    href: "/identifikasi",
    no: "1",
    label: "Identifikasi Penyakit",
    desc: "Foto tanaman → deteksi penyakit/hama",
  },
  {
    href: "/pemupukan",
    no: "2",
    label: "Rekomendasi Pemupukan",
    desc: "Jadwal pupuk lengkap sampai panen",
  },
] as const;

const MENU_SEKUNDER = [
  { href: "/katalog", label: "Katalog Data" },
  { href: "/tentang", label: "Tentang & Disclaimer" },
] as const;

export function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-lg text-white hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span className="flex flex-col gap-[5px]" aria-hidden>
          <span
            className={`block h-[3px] w-6 rounded bg-white transition-transform ${
              open ? "translate-y-[8px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[3px] w-6 rounded bg-white transition-opacity ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[3px] w-6 rounded bg-white transition-transform ${
              open ? "-translate-y-[8px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border bg-card shadow-xl"
        >
          <ul className="flex flex-col">
            {MENU_UTAMA.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    role="menuitem"
                    href={item.href}
                    className={`flex items-start gap-3 border-b border-border px-4 py-3.5 transition-colors ${
                      active ? "bg-primary-light" : "hover:bg-primary-light/50"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        active
                          ? "bg-primary text-white"
                          : "bg-primary-light text-primary-dark"
                      }`}
                    >
                      {item.no}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-foreground">
                        {item.label}
                      </span>
                      <span className="block text-sm text-muted">
                        {item.desc}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <ul className="flex flex-col bg-background/60">
            {MENU_SEKUNDER.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    role="menuitem"
                    href={item.href}
                    className={`block px-4 py-2.5 text-sm ${
                      active
                        ? "font-semibold text-primary-dark"
                        : "text-muted hover:text-primary-dark"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
