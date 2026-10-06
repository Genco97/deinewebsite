"use client";

import { useState } from "react";
import { Karte } from "@/components/ui";
import { PAKETE, type PaketId } from "@/lib/pakete";
import { euro } from "@/lib/zeit";

const ZEILEN = [
  { key: "eigen", titel: "Eigene Verkäufe", prozent: 20 },
  { key: "direkt", titel: "Verkäufe von direkt Eingeladenen", prozent: 5 },
  { key: "indirekt", titel: "Verkäufe von indirekt Eingeladenen", prozent: 2 },
] as const;
type Zeile = (typeof ZEILEN)[number]["key"];

const START: Record<Zeile, Record<PaketId, number>> = {
  eigen: { basis: 4, business: 2, premium: 0 },
  direkt: { basis: 3, business: 0, premium: 0 },
  indirekt: { basis: 2, business: 0, premium: 0 },
};

function Zaehler({ wert, setzen, label }: { wert: number; setzen: (n: number) => void; label: string }) {
  const knopf = "flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-lg font-bold text-brand hover:border-brand disabled:opacity-40";
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={label}>
      <button type="button" className={knopf} onClick={() => setzen(Math.max(0, wert - 1))} disabled={wert === 0} aria-label={`${label}: eins weniger`}>
        −
      </button>
      <span className="w-8 text-center text-lg font-bold text-ink" aria-live="polite">
        {wert}
      </span>
      <button type="button" className={knopf} onClick={() => setzen(Math.min(99, wert + 1))} aria-label={`${label}: eins mehr`}>
        +
      </button>
    </div>
  );
}

/** Rechner: was ein Partner im Monat verdient – mit den echten Paketpreisen und Provisionssätzen */
export function ProvisionsRechner({ gruender }: { gruender: boolean }) {
  const [anzahl, setAnzahl] = useState(START);
  // Freies Tippen erlauben, gerechnet wird mit mindestens 2.000 €
  const [proEingabe, setProEingabe] = useState("2000");
  const proPreis = Math.min(20000, Math.max(2000, Number(proEingabe) || 2000));

  const preis = (p: PaketId) => (p === "premium" ? proPreis : PAKETE.find((x) => x.id === p)!.preis);
  const zeilenSumme = (z: (typeof ZEILEN)[number]) =>
    PAKETE.reduce((s, p) => s + anzahl[z.key][p.id] * preis(p.id) * (z.prozent / 100), 0);
  const summe = ZEILEN.reduce((s, z) => s + zeilenSumme(z), 0);

  return (
    <Karte className="overflow-hidden">
      <div className="border-b border-line bg-brand-light px-5 py-4">
        <h2 className="font-bold text-ink">🧮 Provisions-Rechner</h2>
        <p className="text-sm text-muted">
          {gruender ? "So rechnet es sich für eure Partner." : "Stell ein, wie viele Verkäufe im Monat – du siehst sofort, was du verdienst."}
        </p>
      </div>

      <div className="divide-y divide-line">
        {ZEILEN.map((z) => (
          <div key={z.key} className="px-5 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold text-ink">
                {z.titel} <span className="font-normal text-muted">· {z.prozent} %</span>
              </p>
              <p className="shrink-0 font-semibold text-brand">{euro(zeilenSumme(z))}</p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {PAKETE.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 rounded-xl bg-bg px-3 py-2">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{p.name}</span>
                    <span className="block text-xs text-muted">{euro((preis(p.id) * z.prozent) / 100)} pro Verkauf</span>
                  </span>
                  <Zaehler
                    wert={anzahl[z.key][p.id]}
                    label={`${z.titel}, ${p.name}`}
                    setzen={(n) => setAnzahl((a) => ({ ...a, [z.key]: { ...a[z.key], [p.id]: n } }))}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
          <label htmlFor="pro-preis" className="text-muted">
            Preis eines Pro-Pakets (ab 2.000 €):
          </label>
          <input
            id="pro-preis"
            type="number"
            min={2000}
            max={20000}
            step={100}
            value={proEingabe}
            onChange={(e) => setProEingabe(e.target.value)}
            onBlur={() => setProEingabe(String(proPreis))}
            className="min-h-10 w-28 rounded-lg border border-line bg-surface px-3 text-ink"
          />
          <span className="text-muted">€</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 border-t border-line bg-ink px-5 py-5 text-white sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-white/70">{gruender ? "Ein Partner verdient damit" : "Du verdienst damit"}</p>
          <p className="font-serif text-4xl font-semibold">{euro(summe)}</p>
          <p className="text-sm text-white/70">im Monat · {euro(summe * 12)} im Jahr</p>
        </div>
        <p className="max-w-xs text-xs text-white/60">
          Bruttobeträge vor Steuer. Ausgezahlt wird, sobald der Kunde voll bezahlt hat. Ist eine der Personen darüber ein Gründer, geht deren Anteil in den Gründer-Topf.
        </p>
      </div>
    </Karte>
  );
}
