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
import { IdentifikasiClient } from "@/components/identifikasi/IdentifikasiClient";

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

describe("IdentifikasiClient — pemilih tanaman ketik-lalu-klik (semua Tier)", () => {
  function inputIdentifikasi(): HTMLInputElement {
    const el = document.querySelector("#cari-tanaman-identifikasi");
    if (!el) throw new Error("input #cari-tanaman-identifikasi tidak ada");
    return el as HTMLInputElement;
  }

  it("menampilkan daftar & bisa memilih tanaman Tier A", () => {
    render(<IdentifikasiClient />);
    const input = inputIdentifikasi();
    fireEvent.change(input, { target: { value: "cabai" } });
    const hasil = namaHasil("daftar-tanaman-identifikasi");
    expect(hasil.length).toBeGreaterThan(0);

    const list = document.querySelector("#daftar-tanaman-identifikasi") as HTMLElement;
    fireEvent.click(list.querySelectorAll("button")[0]);
    expect(input.value).not.toBe("");
    expect(document.body.textContent).toMatch(/dipilih — ubah dengan mengetik/);
  });

  it("menjangkau komoditas Tier B & menandainya template", () => {
    render(<IdentifikasiClient />);
    const input = inputIdentifikasi();
    fireEvent.change(input, { target: { value: "nanas" } });
    const list = document.querySelector("#daftar-tanaman-identifikasi") as HTMLElement;
    const btn = [...list.querySelectorAll("button")].find(
      (b) => b.querySelector("span")?.textContent === "Nanas",
    );
    expect(btn).toBeTruthy();
    expect(btn!.textContent).toMatch(/template/);
    fireEvent.click(btn!);
    expect(document.body.textContent).toMatch(/jadwal template; AI memakai nama umum/);
  });

  it("pesan tak ditemukan saat ketikan tidak cocok", () => {
    render(<IdentifikasiClient />);
    const input = inputIdentifikasi();
    fireEvent.change(input, { target: { value: "zzzz" } });
    expect(document.body.textContent).toMatch(/tidak ditemukan di katalog/);
  });
});
