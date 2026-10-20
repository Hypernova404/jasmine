"use client";

import dynamic from "next/dynamic";

const PenyemprotanClient = dynamic(
  () => import("./PenyemprotanClient").then((m) => m.PenyemprotanClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20 text-muted" role="status">
        <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Memuat kalkulator semprot…
      </div>
    ),
  },
);

export function PenyemprotanPage() {
  return <PenyemprotanClient />;
}
