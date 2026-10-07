"use client";

import { useEffect, useRef, useState } from "react";
import { PAKETE, type PaketId } from "@/lib/pakete";

const EBENEN = [
  { key: "eigen", titel: "Eigene Verkäufe", kurz: "Eigene", prozent: 20, farbe: "#1d4e89" },
  { key: "direkt", titel: "Von direkt Eingeladenen", kurz: "Direkt", prozent: 5, farbe: "#3b82f6" },
  { key: "indirekt", titel: "Von indirekt Eingeladenen", kurz: "Indirekt", prozent: 2, farbe: "#93c5fd" },
] as const;
type Ebene = (typeof EBENEN)[number];
type EbeneKey = Ebene["key"];

const START: Record<EbeneKey, Record<PaketId, number>> = {
  eigen: { basis: 4, business: 2, premium: 0 },
  direkt: { basis: 3, business: 0, premium: 0 },
  indirekt: { basis: 2, business: 0, premium: 0 },
};

const ganz = (n: number) => `${Math.round(n).toLocaleString("de-AT")} €`;

/** Gemeinsame Rechenlogik – Preise und Sätze wie in der echten Abrechnung */
function useRechner() {
  const [anzahl, setAnzahl] = useState(START);
  // Freies Tippen erlauben, gerechnet wird mit mindestens 2.000 €
  const [proEingabe, setProEingabe] = useState("2000");
  const proPreis = Math.min(20000, Math.max(2000, Number(proEingabe) || 2000));
  const preis = (p: PaketId) => (p === "premium" ? proPreis : PAKETE.find((x) => x.id === p)!.preis);
  const jeVerkauf = (e: Ebene, p: PaketId) => (preis(p) * e.prozent) / 100;
  const ebeneSumme = (e: Ebene) => PAKETE.reduce((s, p) => s + anzahl[e.key][p.id] * jeVerkauf(e, p.id), 0);
  const summe = EBENEN.reduce((s, e) => s + ebeneSumme(e), 0);
  const setzen = (e: EbeneKey, p: PaketId, n: number) =>
    setAnzahl((a) => ({ ...a, [e]: { ...a[e], [p]: Math.max(0, Math.min(99, n)) } }));
  return { anzahl, setzen, proEingabe, setProEingabe, proPreis, jeVerkauf, ebeneSumme, summe };
}

/** Zahl zählt weich hoch/runter (ohne Animation bei „weniger Bewegung“) */
function useZaehlen(ziel: number) {
  const [wert, setWert] = useState(ziel);
  const von = useRef(ziel);
  useEffect(() => {
    const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    const a = von.current;
    let id = 0;
    const schritt = (t: number) => {
      const p = ruhig ? 1 : Math.min(1, (t - start) / 450);
      const v = a + (ziel - a) * (1 - Math.pow(1 - p, 3));
      von.current = v;
      setWert(v);
      if (p < 1) id = requestAnimationFrame(schritt);
    };
    id = requestAnimationFrame(schritt);
    return () => cancelAnimationFrame(id);
  }, [ziel]);
  return wert;
}

const HINWEIS = "Bruttobeträge vor Steuer. Ausgezahlt wird, sobald der Kunde voll bezahlt hat. Ist jemand darüber ein Gründer, geht dessen Anteil in den Gründer-Topf.";

function ProPreis({ r }: { r: ReturnType<typeof useRechner> }) {
  return (
    <label className="flex items-center gap-2 text-sm text-white/70">
      Pro-Paket kostet
      <span className="relative">
        <input
          type="number"
          min={2000}
          max={20000}
          step={100}
          value={r.proEingabe}
          onChange={(e) => r.setProEingabe(e.target.value)}
          onBlur={() => r.setProEingabe(String(r.proPreis))}
          className="h-9 w-28 rounded-full px-4 pr-8 text-sm font-semibold focus:outline-none focus:ring-2 bg-white/10 text-white ring-1 ring-white/20 focus:ring-sky-300"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">€</span>
      </span>
    </label>
  );
}

/* ===================================================================== */
/* Dunkel mit Glas-Kacheln und Ebenen-Umschalter                         */
/* ===================================================================== */
function Rechner({ gruender }: { gruender: boolean }) {
  const r = useRechner();
  const gesamt = useZaehlen(r.summe);
  const [aktiv, setAktiv] = useState<EbeneKey>("eigen");
  const e = EBENEN.find((x) => x.key === aktiv)!;
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#0b1d36] p-5 text-white shadow-[0_20px_60px_-20px_rgba(11,29,54,.6)] sm:p-8">
      <div aria-hidden className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#2563eb]/40 blur-3xl" />
      <div aria-hidden className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-[#38bdf8]/25 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Provisions-Rechner</p>
          <p className="mt-3 text-sm text-white/70">{gruender ? "Ein Partner verdient" : "Du verdienst"} im Monat</p>
          <p className="bg-gradient-to-r from-white to-sky-200 bg-clip-text text-6xl font-extrabold tabular-nums tracking-tight text-transparent sm:text-7xl">{ganz(gesamt)}</p>
          <p className="mt-1 text-white/70">
            ≈ <span className="font-semibold text-white">{ganz(r.summe * 12)}</span> im Jahr
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-96">
          {EBENEN.map((x) => (
            <div key={x.key} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur">
              <p className="text-xs text-white/60">{x.kurz}</p>
              <p className="font-bold tabular-nums">{ganz(r.ebeneSumme(x))}</p>
            </div>
          ))}
        </div>
      </div>

      <div role="tablist" aria-label="Ebene wählen" className="relative mt-8 flex w-full justify-between rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur sm:inline-flex sm:w-auto">
        {EBENEN.map((x) => (
          <button
            key={x.key}
            role="tab"
            aria-selected={x.key === aktiv}
            onClick={() => setAktiv(x.key)}
            className={`min-h-10 flex-1 whitespace-nowrap rounded-full px-3 text-sm font-semibold transition sm:px-4 ${x.key === aktiv ? "bg-white text-[#0b1d36] shadow" : "text-white/70 hover:text-white"}`}
          >
            {x.kurz} <span className={x.key === aktiv ? "text-brand" : "text-white/50"}>{x.prozent} %</span>
          </button>
        ))}
      </div>

      <div className="relative mt-4 grid gap-3 sm:grid-cols-3" role="tabpanel">
        {PAKETE.map((p) => {
          const n = r.anzahl[e.key][p.id];
          return (
            <div key={p.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur transition hover:border-sky-300/40">
              <p className="font-bold">{p.name}</p>
              <p className="text-sm text-white/60">{ganz(r.jeVerkauf(e, p.id))} je Verkauf</p>
              <div className="mt-5 flex items-center justify-between" role="group" aria-label={`${e.titel}, ${p.name}`}>
                <button
                  type="button"
                  onClick={() => r.setzen(e.key, p.id, n - 1)}
                  disabled={n === 0}
                  aria-label="eins weniger"
                  className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-xl transition hover:bg-white/20 active:scale-90 disabled:opacity-30"
                >
                  −
                </button>
                <span className="text-4xl font-extrabold tabular-nums" aria-live="polite">
                  {n}
                </span>
                <button
                  type="button"
                  onClick={() => r.setzen(e.key, p.id, n + 1)}
                  aria-label="eins mehr"
                  className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-xl shadow-[0_6px_20px_-6px_rgba(56,189,248,.7)] transition hover:brightness-110 active:scale-90"
                >
                  +
                </button>
              </div>
              <p className="mt-4 text-right text-sm text-white/60">
                = <span className="font-semibold text-white">{ganz(n * r.jeVerkauf(e, p.id))}</span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="relative mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <ProPreis r={r} />
        <p className="max-w-md text-xs text-white/50">{HINWEIS}</p>
      </div>
    </div>
  );
}

/** Rechner: was ein Partner im Monat verdient – mit den echten Paketpreisen und Provisionssätzen */
export function ProvisionsRechner({ gruender }: { gruender: boolean }) {
  return <Rechner gruender={gruender} />;
}
