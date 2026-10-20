"use client";

import dynamic from "next/dynamic";

const IdentifikasiClient = dynamic(
  () => import("./IdentifikasiClient").then((m) => m.IdentifikasiClient),
  { ssr: false, loading: () => <PageLoading label="Memuat identifikasi…" /> },
);

export function PageLoading({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-20 text-muted" role="status">
      <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      {label}
    </div>
  );
}

export function IdentifikasiPage() {
  return <IdentifikasiClient />;
}
