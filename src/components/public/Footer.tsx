import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { FIRMA, firmenname } from "@/lib/firma";

const SEITE = [
  { href: "/#ablauf", label: "So läuft's" },
  { href: "/#beispiele", label: "Beispiele" },
  { href: "/#pakete", label: "Pakete" },
  { href: "/#fragen", label: "Fragen" },
];

const RECHTLICHES = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
];

const linkKlasse = "inline-flex min-h-8 items-center text-sm text-muted hover:text-ink";

export function Footer() {
  // Fehlende Firmendaten zeigt nur das Impressum als Platzhalter – hier bleiben sie einfach weg
  const adresse = [FIRMA.strasse, [FIRMA.plz, FIRMA.ort].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-7 px-4 py-8 sm:py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 space-y-2 md:col-span-1">
          <p className="flex items-center gap-2 font-extrabold tracking-[-0.04em] text-ink">
            <LogoMark className="h-5 w-5" /> Ursprung
          </p>
          <p className="max-w-xs text-sm text-muted">Websites für Betriebe – persönlich aus Wien.</p>
        </div>
        <nav aria-label="Seite">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink">Seite</p>
          <ul>
            {SEITE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkKlasse}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Rechtliches">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink">Rechtliches</p>
          <ul>
            {RECHTLICHES.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkKlasse}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <address className="col-span-2 space-y-1 text-sm not-italic text-muted md:col-span-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink">Kontakt</p>
          <p className="font-semibold text-ink">{firmenname()}</p>
          <p>{adresse || `${FIRMA.ort}, ${FIRMA.land}`}</p>
          {FIRMA.telefon ? (
            <p>
              <a href={`tel:${FIRMA.telefon.replace(/[^+\d]/g, "")}`} className="hover:text-ink">
                {FIRMA.telefon}
              </a>
            </p>
          ) : null}
          {FIRMA.email ? (
            <p>
              <a href={`mailto:${FIRMA.email}`} className="hover:text-ink">
                {FIRMA.email}
              </a>
            </p>
          ) : null}
          {FIRMA.uid ? <p>UID: {FIRMA.uid}</p> : null}
        </address>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted">
          © {new Date().getFullYear()} {firmenname()}
        </p>
      </div>
    </footer>
  );
}
