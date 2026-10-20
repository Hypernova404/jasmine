import Link from "next/link";
import { HamburgerMenu } from "./HamburgerMenu";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="no-print sticky top-0 z-40 bg-primary text-white shadow-md">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-3 px-3">
          <HamburgerMenu />
          <Link
            href="/identifikasi"
            className="min-w-0 flex-1 truncate text-lg font-bold tracking-tight"
          >
            Jasmine
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-4 pb-16">
        {children}
      </main>
    </div>
  );
}
