import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div className="space-y-2">
          <p className="flex items-center gap-2 font-bold text-ink">
            <LogoMark className="h-5 w-5" /> Ursprung
          </p>
          <p className="text-sm text-muted">Websites für Betriebe – persönlich aus Wien.</p>
        </div>
        <address className="space-y-1 text-sm not-italic text-muted">
          <p className="font-semibold text-ink">Ursprung [Rechtsform]</p>
          <p>[Adresse]</p>
          <p>UID: [UID]</p>
        </address>
        <nav aria-label="Rechtliches" className="flex flex-col text-sm">
          <Link href="/impressum" className="inline-flex min-h-11 items-center text-muted hover:text-ink">
            Impressum
          </Link>
          <Link href="/datenschutz" className="inline-flex min-h-11 items-center text-muted hover:text-ink">
            Datenschutz
          </Link>
          <Link href="/agb" className="inline-flex min-h-11 items-center text-muted hover:text-ink">
            AGB
          </Link>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted">
          © {new Date().getFullYear()} Ursprung
        </p>
      </div>
    </footer>
  );
}
