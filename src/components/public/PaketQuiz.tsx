"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClass } from "@/components/ui";
import { PAKETE, type PaketId } from "@/lib/pakete";

const FRAGEN: { frage: string; antworten: { text: string; paket: PaketId }[] }[] = [
  {
    frage: "Was sollen Ihre Kunden auf der Seite tun?",
    antworten: [
      { text: "Mich finden und anrufen", paket: "basis" },
      { text: "Bilder ansehen und eine Anfrage schicken", paket: "business" },
      { text: "Direkt online buchen oder bestellen", paket: "premium" },
    ],
  },
  {
    frage: "Wie viel möchten Sie zeigen?",
    antworten: [
      { text: "Das Wichtigste auf einer Seite", paket: "basis" },
      { text: "Leistungen, Team, Galerie – auf mehreren Seiten", paket: "business" },
      { text: "Ein eigenes Design, das richtig auffällt", paket: "premium" },
    ],
  },
  {
    frage: "Wie schnell soll es gehen?",
    antworten: [
      { text: "So schnell wie möglich", paket: "basis" },
      { text: "In ein bis zwei Wochen", paket: "business" },
      { text: "Lieber gründlich, mit persönlichem Gespräch", paket: "premium" },
    ],
  },
];

const WARUM: Record<PaketId, string> = {
  basis: "Sie wollen vor allem gefunden und angerufen werden. Dafür reicht eine starke Seite mit allem Wichtigen – schnell online und günstig.",
  business: "Sie wollen zeigen, was Sie können, und Anfragen bekommen. Mit mehreren Seiten, Galerie und Anfrage-Formular holen Sie das heraus.",
  premium: "Ihre Kunden sollen direkt online buchen oder bestellen. Dafür braucht es ein eigenes Design und Technik, die mitarbeitet.",
};

/** Mehrheit gewinnt, bei Gleichstand die Mitte (Business) */
function empfehlung(wahl: PaketId[]): PaketId {
  const z = (p: PaketId) => wahl.filter((w) => w === p).length;
  if (z("premium") >= 2 || (wahl[0] === "premium" && z("basis") === 0)) return "premium";
  if (z("basis") >= 2) return "basis";
  return "business";
}

/** B2: drei Fragen, dann eine klare Empfehlung */
export function PaketQuiz() {
  const [wahl, setWahl] = useState<PaketId[]>([]);
  const schritt = wahl.length;
  const fertig = schritt >= FRAGEN.length;
  const paket = fertig ? PAKETE.find((p) => p.id === empfehlung(wahl))! : null;

  return (
    <div className="max-w-3xl overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="flex items-center gap-3 border-b border-line bg-bg px-5 py-3">
        <p className="text-sm font-semibold text-ink">{fertig ? "Ihre Empfehlung" : `Frage ${schritt + 1} von ${FRAGEN.length}`}</p>
        <div className="ml-auto flex gap-1.5" aria-hidden>
          {FRAGEN.map((_, i) => (
            <span key={i} className={`h-2 w-8 rounded-full transition-colors ${i < schritt ? "bg-brand" : i === schritt ? "bg-brand/40" : "bg-line"}`} />
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-8" aria-live="polite">
        {!paket ? (
          <fieldset key={schritt}>
            <legend className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{FRAGEN[schritt].frage}</legend>
            <div className="mt-6 grid gap-3">
              {FRAGEN[schritt].antworten.map((a) => (
                <button
                  key={a.text}
                  type="button"
                  onClick={() => setWahl([...wahl, a.paket])}
                  className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-line bg-surface px-5 py-3 text-left text-[17px] font-medium text-ink transition-[transform,border-color,box-shadow] duration-150 hover:scale-[1.02] hover:border-brand hover:shadow-md active:scale-[0.98] motion-reduce:transform-none"
                >
                  {a.text}
                  <span aria-hidden className="text-brand">→</span>
                </button>
              ))}
            </div>
            {schritt > 0 ? (
              <button type="button" onClick={() => setWahl(wahl.slice(0, -1))} className="mt-4 min-h-11 text-sm font-semibold text-muted hover:text-brand">
                ← Zurück
              </button>
            ) : null}
          </fieldset>
        ) : (
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">Für Sie passt</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-3 font-serif text-4xl font-semibold text-ink">
              Paket {paket.name}
              <span className="text-2xl text-muted">
                {paket.ab ? "ab " : ""}
                {paket.preisText}
              </span>
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted">{WARUM[paket.id]}</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {paket.leistungen.map((l) => (
                <li key={l} className="flex gap-2.5 text-ink">
                  <span aria-hidden className="font-bold text-ok">✓</span>
                  {l}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={`/demo?paket=${paket.id}`} className={buttonClass("primary", "sm:px-7")}>
                {paket.button}
              </Link>
              <button type="button" onClick={() => setWahl([])} className={buttonClass("secondary", "sm:px-7")}>
                Nochmal von vorn
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
