import { GANGGUAN_LIST } from "@/data/diseases";
import { PLANTS } from "@/data/plants";
import { FERTILIZERS } from "@/data/fertilizers";
import { Disclaimer } from "@/components/ui/Disclaimer";

export const metadata = { title: "Tentang — Tani Pintar" };

export default function TentangPage() {
  const verifiedPlants = PLANTS.filter((p) => p.verified).length;
  const verifiedGangguan = GANGGUAN_LIST.filter((g) => g.verified).length;
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Tentang Tani Pintar</h1>
        <p className="text-sm text-muted">
          Aplikasi identifikasi penyakit &amp; rekomendasi pemupukan hortikultura
          untuk lahan mineral.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-4 text-sm">
        <h2 className="mb-2 font-bold">Sumber data</h2>
        <p>
          Seluruh katalog tanaman, gangguan, dan pupuk disimpan sebagai data
          terstruktur di dalam aplikasi (bukan hasil karangan AI saat runtime).
          Semua entri saat ini berstatus{" "}
          <strong>acuan umum</strong> (<code>verified: false</code>) dan wajib
          diverifikasi dengan panduan Kementan/BPTP/Balitsa setempat sebelum
          dianggap resmi.
        </p>
        <ul className="mt-3 grid grid-cols-3 gap-2 text-center">
          <li className="rounded-lg bg-primary-light p-2">
            <strong className="block text-lg">{PLANTS.length}</strong> tanaman
          </li>
          <li className="rounded-lg bg-primary-light p-2">
            <strong className="block text-lg">{GANGGUAN_LIST.length}</strong> gangguan
          </li>
          <li className="rounded-lg bg-primary-light p-2">
            <strong className="block text-lg">{FERTILIZERS.length}</strong> pupuk
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted">
          Terverifikasi: {verifiedPlants} tanaman, {verifiedGangguan} gangguan.
        </p>
      </section>

      <Disclaimer />

      <section className="rounded-xl border border-border bg-card p-4 text-sm">
        <h2 className="mb-2 font-bold">Privasi</h2>
        <p>
          Foto yang diunggah untuk identifikasi <strong>tidak disimpan</strong> —
          hanya diproses di memori saat analisis. Riwayat scan (tanpa foto) dapat
          disimpan lokal di browser Anda.
        </p>
      </section>
    </div>
  );
}
