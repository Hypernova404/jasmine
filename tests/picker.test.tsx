// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children?: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { PemupukanClient } from "@/components/pemupukan/PemupukanClient";
import { PenyemprotanClient } from "@/components/penyemprotan/PenyemprotanClient";
import { GANGGUAN_LIST, PLANT_MAP } from "@/lib/catalog";

afterEach(cleanup);

function inputPemupukan(): HTMLInputElement {
  const el = document.querySelector("#cari-tanaman");
  if (!el) throw new Error("input #cari-tanaman tidak ada");
  return el as HTMLInputElement;
}

function namaHasil(listId: string): string[] {
  const list = document.querySelector(`#${listId}`);
  if (!list) return [];
  return within(list as HTMLElement)
    .queryAllByRole("option")
    .map((li) => li.querySelector("span")?.textContent ?? "");
}

describe("PemupukanClient — pemilih tanaman ketik-lalu-klik", () => {
  it("menampilkan daftar hasil saat diketik, lalu bisa diklik", () => {
    render(<PemupukanClient />);
    const input = inputPemupukan();

    fireEvent.change(input, { target: { value: "tomat" } });
    const hasil = namaHasil("daftar-tanaman");
    expect(hasil.length).toBeGreaterThan(0);
    expect(hasil.map((n) => n.toLowerCase())).toContain("tomat");

    const idxTomat = hasil.findIndex((n) => n.toLowerCase() === "tomat");
    const list = document.querySelector("#daftar-tanaman") as HTMLElement;
    const btn = list.querySelectorAll("button")[idxTomat];
    fireEvent.click(btn);

    expect(input.value.toLowerCase()).toBe("tomat");
    expect(document.body.textContent).toMatch(/dipilih — ubah dengan mengetik/);
    expect(document.querySelector("#daftar-tanaman")).toBeNull();
  });

  it("menyembunyikan pilihan saat ketikan tidak cocok & menampilkan pesan tak ditemukan", () => {
    render(<PemupukanClient />);
    const input = inputPemupukan();

    fireEvent.change(input, { target: { value: "zzzz" } });
    expect(document.body.textContent).toMatch(/tidak ditemukan di katalog/);
    expect(document.body.textContent).not.toMatch(/dipilih — ubah dengan mengetik/);

    fireEvent.change(input, { target: { value: "kent" } });
    expect(namaHasil("daftar-tanaman").some((n) => n.toLowerCase().includes("kent"))).toBe(true);
  });

  it("tombol ✕ mengosongkan pilihan", () => {
    render(<PemupukanClient />);
    const input = inputPemupukan();

    fireEvent.change(input, { target: { value: "tomat" } });
    const list = document.querySelector("#daftar-tanaman") as HTMLElement;
    fireEvent.click(list.querySelectorAll("button")[0]);
    expect(input.value).not.toBe("");

    fireEvent.click(screen.getByLabelText("Hapus pilihan tanaman"));
    expect(input.value).toBe("");
    expect(document.body.textContent).not.toMatch(/dipilih — ubah dengan mengetik/);
  });

  it("menjangkau komoditas Tier B (jadwal template)", () => {
    render(<PemupukanClient />);
    const input = inputPemupukan();

    fireEvent.change(input, { target: { value: "nanas" } });
    const list = document.querySelector("#daftar-tanaman") as HTMLElement;
    expect(list).toBeTruthy();
    const btn = [...list.querySelectorAll("button")].find(
      (b) => b.querySelector("span")?.textContent === "Nanas",
    );
    expect(btn).toBeTruthy();
    expect(btn!.textContent).toMatch(/template/);
    fireEvent.click(btn!);
    expect(document.body.textContent).toMatch(/Jadwal template otomatis/);
  });
});

describe("PenyemprotanClient — pemilih tanaman ketik-lalu-klik", () => {
  it("kandidat hanya dari gangguan terpilih, bisa diklik, reset saat ganti gangguan", () => {
    render(<PenyemprotanClient />);
    const sel = document.querySelector("#gangguan") as HTMLSelectElement;

    const g1 = GANGGUAN_LIST.find((g) => g.plants.length > 0);
    const g2 = GANGGUAN_LIST.find((g) => g.id !== g1?.id && g.plants.length > 0);
    if (!g1 || !g2) throw new Error("tidak ada gangguan dengan tanaman");

    fireEvent.change(sel, { target: { value: g1.id } });
    fireEvent.click(screen.getByRole("button", { name: /^jumlah tanaman$/ }));

    const input = screen.getByLabelText("Pilih tanaman") as HTMLInputElement;
    const target = PLANT_MAP[g1.plants[0]];
    if (!target) throw new Error("tanaman kandidat tidak ada");

    fireEvent.change(input, { target: { value: target.nama.slice(0, 4) } });
    const hasil = namaHasil("daftar-tanaman-semprot");
    expect(hasil).toContain(target.nama);

    const list = document.querySelector("#daftar-tanaman-semprot") as HTMLElement;
    const btn = [...list.querySelectorAll("button")].find(
      (b) => b.querySelector("span")?.textContent === target.nama,
    );
    expect(btn).toBeTruthy();
    fireEvent.click(btn!);
    expect(input.value).toBe(target.nama);

    fireEvent.change(sel, { target: { value: g2.id } });
    expect(input.value).toBe("");
  });

  it("kandidat tidak memuat tanaman di luar gangguan", () => {
    render(<PenyemprotanClient />);
    const sel = document.querySelector("#gangguan") as HTMLSelectElement;
    const g1 = GANGGUAN_LIST.find((g) => g.plants.length > 0);
    if (!g1) throw new Error("tidak ada gangguan dengan tanaman");
    fireEvent.change(sel, { target: { value: g1.id } });
    fireEvent.click(screen.getByRole("button", { name: /^jumlah tanaman$/ }));

    const input = screen.getByLabelText("Pilih tanaman") as HTMLInputElement;
    const diLuar = GANGGUAN_LIST.map((g) => g.plants)
      .flat()
      .find((id) => !g1.plants.includes(id) && PLANT_MAP[id]);
    if (!diLuar) return;
    const nama = PLANT_MAP[diLuar].nama;
    fireEvent.change(input, { target: { value: nama } });
    expect(namaHasil("daftar-tanaman-semprot")).not.toContain(nama);
    expect(document.body.textContent).toMatch(/tidak ada pada gangguan ini/);
  });
});
