import Link from "next/link";
import { Logo } from "@/components/Logo";
import { buttonClass } from "@/components/ui";

const LINKS = [
  { href: "/#ablauf", label: "So läuft's" },
  { href: "/#beispiele", label: "Beispiele" },
  { href: "/#pakete", label: "Pakete" },
  { href: "/#ueber-uns", label: "Über uns" },
  { href: "/#fragen", label: "Fragen" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-[15px] font-medium text-muted hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="inline-flex min-h-11 items-center px-2 text-xs text-muted hover:text-ink">
            Mitarbeiter-Login
          </Link>
          <Link href="/demo?paket=business" className={buttonClass("primary")}>
            Gratis-Demo
          </Link>
        </div>

        {/* Mobil: Menü ohne JavaScript */}
        <details className="group relative md:hidden">
          <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-lg border border-line px-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Menü</span>
            <span className="hidden group-open:inline">Schließen</span>
          </summary>
          <div className="absolute right-0 top-14 w-64 rounded-xl border border-line bg-surface p-2 shadow-sm">
            <nav aria-label="Mobile Navigation" className="flex flex-col">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex min-h-11 items-center rounded-lg px-3 font-medium text-ink hover:bg-bg"
                >
                  {l.label}
                </Link>
              ))}
              <Link href="/demo?paket=business" className={buttonClass("primary", "mt-2")}>
                Gratis-Demo anfordern
              </Link>
              <Link
                href="/login"
                className="mt-1 flex min-h-11 items-center justify-center text-xs text-muted hover:text-ink"
              >
                Mitarbeiter-Login
              </Link>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
