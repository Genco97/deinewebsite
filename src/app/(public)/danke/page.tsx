import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui";

export const metadata: Metadata = {
  title: "Danke für Ihre Anfrage",
  robots: { index: false },
};

const TEXTE: Record<string, { titel: string; text: string; weiter?: string[] }> = {
  demo: {
    titel: "Danke! Wir bauen Ihre Demo.",
    text: "Wir melden uns in den nächsten Tagen bei Ihnen, um kurz die Details zu besprechen. Bis dahin müssen Sie nichts tun – und nichts zahlen.",
    weiter: [
      "Wir rufen Sie kurz an und klären die Details.",
      "Innerhalb von rund 48 Stunden bekommen Sie Ihre Demo zum Ansehen.",
      "Gefällt sie Ihnen, passen wir sie an. Erst wenn sie online geht, zahlen Sie.",
    ],
  },
  beratung: {
    titel: "Danke für Ihre Anfrage.",
    text: "Wir melden uns bei Ihnen, um einen Termin für das Erstgespräch zu vereinbaren.",
  },
  karte: {
    titel: "Danke! Wir rufen Sie an.",
    text: "Wir melden uns in den nächsten Tagen telefonisch bei Ihnen – gerne zur Zeit, die Sie angegeben haben. Das Gespräch ist unverbindlich.",
  },
  rueckruf: {
    titel: "Danke! Wir rufen Sie zurück.",
    text: "Wir melden uns so bald wie möglich telefonisch bei Ihnen.",
  },
};

export default async function DankeSeite({ searchParams }: PageProps<"/danke">) {
  const { art } = await searchParams;
  const t = TEXTE[typeof art === "string" ? art : "demo"] ?? TEXTE.demo;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:py-24">
      <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-full bg-ok-light text-ok">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5 10 17 19 7" />
        </svg>
      </span>
      <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{t.titel}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{t.text}</p>
      {t.weiter ? (
        <ol className="mt-8 space-y-3 rounded-2xl border border-line bg-surface p-5">
          <li className="text-sm font-semibold uppercase tracking-wide text-brand">So geht&apos;s weiter</li>
          {t.weiter.map((w, i) => (
            <li key={w} className="flex items-start gap-3 text-ink">
              <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">
                {i + 1}
              </span>
              {w}
            </li>
          ))}
        </ol>
      ) : null}
      <Link href="/" className={buttonClass("secondary", "mt-8")}>
        Zurück zur Startseite
      </Link>
    </div>
  );
}
