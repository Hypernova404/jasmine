"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEM = [
  { href: "/", icon: "🏠", label: "Beranda" },
  { href: "/identifikasi", icon: "📷", label: "Identifikasi" },
  { href: "/pemupukan", icon: "🌱", label: "Pemupukan" },
] as const;

function aktif(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-primary-dark/40 bg-primary text-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex w-full max-w-3xl">
        {ITEM.map((it) => {
          const active = aktif(pathname, it.href);
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2 text-center transition-opacity ${
                  active
                    ? "bg-white/15 font-bold"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                <span aria-hidden className="text-lg leading-none">
                  {it.icon}
                </span>
                <span className="text-[11px] leading-tight">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
