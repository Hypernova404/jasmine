export function Disclaimer() {
  return (
    <div className="print-break mt-6 rounded-xl border border-warning-border bg-warning-bg p-4 text-sm leading-relaxed">
      <p className="mb-1 font-semibold text-foreground">Disclaimer penting</p>
      <p className="text-foreground/90">
        Hasil identifikasi dan rekomendasi bersifat <strong>panduan awal</strong>,
        bukan diagnosis pasti. Dosis adalah acuan umum; selalu{" "}
        <strong>baca label produk</strong>, sesuaikan dengan kondisi lahan, dan
        konsultasikan dengan penyuluh pertanian (PPL/POPT) atau BPTP setempat.
        Gunakan APD saat menyemprot, patuhi masa tunggu panen, dan gunakan
        pestisida terdaftar di Kementerian Pertanian. Gilir bahan aktif untuk
        mencegah resistensi.
      </p>
    </div>
  );
}
