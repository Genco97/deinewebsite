import type { Metadata } from "next";
import { SALON, euroGanz } from "@/lib/beispiele";

export const metadata: Metadata = { title: "Beispiel: Ursprung-Stil" };

export default function UrsprungBeispiel() {
  return (
    <div className="bg-bg text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <p className="font-serif text-xl font-semibold">{SALON.name}</p>
          <nav aria-label="Beispiel-Navigation" className="hidden gap-6 text-sm text-muted sm:flex">
            <a href="#leistungen" className="hover:text-brand">Leistungen</a>
            <a href="#zeiten" className="hover:text-brand">Öffnungszeiten</a>
            <a href="#kontakt" className="hover:text-brand">Kontakt</a>
          </nav>
          <a href={SALON.telefonLink} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
            Anrufen
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand">Friseur in {SALON.plz} {SALON.ort}</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-6xl">{SALON.slogan}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{SALON.einleitung}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href={SALON.telefonLink} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-6 font-semibold text-white hover:bg-brand-hover">
            Termin vereinbaren: {SALON.telefon}
          </a>
          <a href="#leistungen" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-surface px-6 font-semibold hover:border-brand hover:text-brand">
            Preise ansehen
          </a>
        </div>
      </section>

      <section id="leistungen" className="border-y border-line bg-surface py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-serif text-3xl font-semibold">Leistungen & Preise</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {SALON.leistungen.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-4 rounded-xl border border-line bg-bg p-5">
                <div>
                  <p className="font-semibold">{l.name}</p>
                  <p className="mt-1 text-sm text-muted">{l.text}</p>
                </div>
                <p className="shrink-0 font-semibold text-brand">ab {euroGanz(l.preis)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-2">
        <div id="zeiten">
          <h2 className="font-serif text-3xl font-semibold">Öffnungszeiten</h2>
          <dl className="mt-6 divide-y divide-line rounded-xl border border-line bg-surface">
            {SALON.oeffnungszeiten.map((o) => (
              <div key={o.tage} className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-muted">{o.tage}</dt>
                <dd className="font-semibold">{o.zeit}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div id="kontakt">
          <h2 className="font-serif text-3xl font-semibold">Kontakt</h2>
          <div className="mt-6 space-y-2 rounded-xl border border-line bg-surface p-5">
            <p className="font-semibold">{SALON.name}</p>
            <p className="text-muted">
              {SALON.strasse}, {SALON.plz} {SALON.ort}
            </p>
            <p>
              <a href={SALON.telefonLink} className="font-semibold text-brand underline">{SALON.telefon}</a>
            </p>
            <p className="text-muted">{SALON.email}</p>
          </div>
          <div aria-hidden className="mt-4 grid h-40 place-items-center rounded-xl border border-line bg-[repeating-linear-gradient(45deg,#eef2f7_0_12px,#e8edf4_12px_24px)] text-sm font-semibold text-muted">
            📍 Karte
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-surface py-6 text-center text-sm text-muted">
        © {SALON.name} · Impressum · Datenschutz
      </footer>
    </div>
  );
}
