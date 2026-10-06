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

function ProPreis({ r, hell = true }: { r: ReturnType<typeof useRechner>; hell?: boolean }) {
  return (
    <label className={`flex items-center gap-2 text-sm ${hell ? "text-muted" : "text-white/70"}`}>
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
          className={`h-9 w-28 rounded-full px-4 pr-8 text-sm font-semibold focus:outline-none focus:ring-2 ${
            hell ? "bg-bg text-ink ring-1 ring-line focus:ring-brand" : "bg-white/10 text-white ring-1 ring-white/20 focus:ring-sky-300"
          }`}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">€</span>
      </span>
    </label>
  );
}

/* ===================================================================== */
/* R1 · Hell mit Schiebereglern und farbiger Ergebnis-Karte              */
/* ===================================================================== */
function R1({ gruender }: { gruender: boolean }) {
  const r = useRechner();
  const gesamt = useZaehlen(r.summe);
  return (
    <div className="grid gap-5 rounded-[28px] border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(16,24,40,.04),0_12px_32px_-12px_rgba(29,78,137,.18)] sm:p-6 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Provisions-Rechner</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">{gruender ? "Was eure Partner verdienen" : "Was du verdienen kannst"}</h2>
        <p className="mt-1 text-sm text-muted">Zieh die Regler – Verkäufe pro Monat.</p>

        <div className="mt-6 space-y-6">
          {EBENEN.map((e) => (
            <section key={e.key}>
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-2 font-bold text-ink">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.farbe }} />
                  {e.titel}
                  <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand">{e.prozent} %</span>
                </p>
                <p className="font-bold tabular-nums text-ink">{ganz(r.ebeneSumme(e))}</p>
              </div>
              <div className="space-y-3">
                {PAKETE.map((p) => {
                  const n = r.anzahl[e.key][p.id];
                  const id = `r1-${e.key}-${p.id}`;
                  return (
                    <div key={p.id} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3">
                      <label htmlFor={id} className="leading-tight">
                        <span className="block text-sm font-semibold text-ink">{p.name}</span>
                        <span className="block text-xs text-muted">{ganz(r.jeVerkauf(e, p.id))} je Verkauf</span>
                      </label>
                      <input
                        id={id}
                        type="range"
                        min={0}
                        max={20}
                        value={Math.min(n, 20)}
                        onChange={(ev) => r.setzen(e.key, p.id, Number(ev.target.value))}
                        className="regler h-2 w-full cursor-pointer appearance-none rounded-full"
                        style={{ background: `linear-gradient(90deg, ${e.farbe} ${(Math.min(n, 20) / 20) * 100}%, #e8edf3 0)` }}
                      />
                      <span className="rounded-lg bg-bg py-1 text-center text-sm font-bold tabular-nums text-ink">{n}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <aside className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d4e89] via-[#2563a8] to-[#3d7fd0] p-6 text-white lg:sticky lg:top-6 lg:self-start">
        <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <p className="relative text-sm font-medium text-white/80">{gruender ? "Ein Partner verdient" : "Du verdienst"} pro Monat</p>
        <p className="relative mt-1 text-5xl font-extrabold tabular-nums tracking-tight">{ganz(gesamt)}</p>
        <p className="relative mt-1 text-white/80">
          ≈ <strong className="text-white">{ganz(r.summe * 12)}</strong> im Jahr
        </p>
        <div className="relative mt-6 flex h-3 overflow-hidden rounded-full bg-white/15" aria-hidden>
          {EBENEN.map((e) => (
            <span key={e.key} className="h-full transition-[width] duration-500" style={{ width: `${r.summe ? (r.ebeneSumme(e) / r.summe) * 100 : 0}%`, background: e.key === "eigen" ? "#fff" : e.key === "direkt" ? "#bfdbfe" : "#7dd3fc" }} />
          ))}
        </div>
        <ul className="relative mt-4 space-y-2 text-sm">
          {EBENEN.map((e) => (
            <li key={e.key} className="flex justify-between">
              <span className="text-white/80">{e.kurz} · {e.prozent} %</span>
              <span className="font-semibold tabular-nums">{ganz(r.ebeneSumme(e))}</span>
            </li>
          ))}
        </ul>
        <div className="relative mt-6 border-t border-white/15 pt-4">
          <ProPreis r={r} hell={false} />
          <p className="mt-3 text-xs leading-relaxed text-white/60">{HINWEIS}</p>
        </div>
      </aside>
    </div>
  );
}

/* ===================================================================== */
/* R2 · Dunkel mit Glas-Kacheln und Ebenen-Umschalter                    */
/* ===================================================================== */
function R2({ gruender }: { gruender: boolean }) {
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
        <ProPreis r={r} hell={false} />
        <p className="max-w-md text-xs text-white/50">{HINWEIS}</p>
      </div>
    </div>
  );
}

/* ===================================================================== */
/* R3 · Hell & minimal mit Ring-Diagramm                                 */
/* ===================================================================== */
function Ring({ r, gesamt }: { r: ReturnType<typeof useRechner>; gesamt: number }) {
  const R = 54;
  const U = 2 * Math.PI * R;
  const anteile = EBENEN.map((e) => (r.summe ? (r.ebeneSumme(e) / r.summe) * U : 0));
  const versaetze = anteile.map((_, i) => anteile.slice(0, i).reduce((s, x) => s + x, 0));
  return (
    <div className="relative mx-auto h-56 w-56">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="70" cy="70" r={R} fill="none" stroke="#eef2f7" strokeWidth="14" />
        {EBENEN.map((e, i) => {
          const laenge = anteile[i];
          return (
            <circle
              key={e.key}
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke={e.farbe}
              strokeWidth="14"
              strokeDasharray={`${Math.max(0, laenge - 2)} ${U}`}
              strokeDashoffset={-versaetze[i]}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">pro Monat</p>
          <p className="text-4xl font-extrabold tabular-nums tracking-tight text-ink">{ganz(gesamt)}</p>
          <p className="text-sm text-muted">{ganz(r.summe * 12)} / Jahr</p>
        </div>
      </div>
    </div>
  );
}

function R3({ gruender }: { gruender: boolean }) {
  const r = useRechner();
  const gesamt = useZaehlen(r.summe);
  const [aktiv, setAktiv] = useState<EbeneKey>("eigen");
  const e = EBENEN.find((x) => x.key === aktiv)!;
  return (
    <div className="rounded-[32px] bg-white p-5 shadow-[0_2px_4px_rgba(16,24,40,.04),0_24px_48px_-24px_rgba(16,24,40,.18)] ring-1 ring-black/5 sm:p-8">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">Provisions-Rechner</h2>
          <p className="text-sm text-muted">{gruender ? "So viel verdient ein Partner im Monat." : "So viel verdienst du im Monat."}</p>
        </div>
        <ProPreis r={r} />
      </div>

      <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <Ring r={r} gesamt={gesamt} />
          <ul className="mx-auto mt-4 max-w-xs space-y-2 text-sm">
            {EBENEN.map((x) => (
              <li key={x.key} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: x.farbe }} />
                  {x.kurz} · {x.prozent} %
                </span>
                <span className="font-semibold tabular-nums text-ink">{ganz(r.ebeneSumme(x))}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div role="tablist" aria-label="Ebene wählen" className="grid grid-cols-3 rounded-2xl bg-[#f1f4f8] p-1">
            {EBENEN.map((x) => (
              <button
                key={x.key}
                role="tab"
                aria-selected={x.key === aktiv}
                onClick={() => setAktiv(x.key)}
                className={`min-h-11 rounded-xl text-sm font-semibold transition ${x.key === aktiv ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}
              >
                {x.kurz} <span className="text-brand">{x.prozent} %</span>
              </button>
            ))}
          </div>

          <ul className="mt-4 divide-y divide-[#eef1f5]" role="tabpanel">
            {PAKETE.map((p) => {
              const n = r.anzahl[e.key][p.id];
              return (
                <li key={p.id} className="flex items-center gap-4 py-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-extrabold text-white" style={{ background: e.farbe }}>
                    {p.id === "premium" ? "2k+" : p.preis}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-ink">{p.name}</span>
                    <span className="block text-sm text-muted">{ganz(r.jeVerkauf(e, p.id))} je Verkauf</span>
                  </span>
                  <span className="flex items-center gap-2" role="group" aria-label={`${e.titel}, ${p.name}`}>
                    <button
                      type="button"
                      onClick={() => r.setzen(e.key, p.id, n - 1)}
                      disabled={n === 0}
                      aria-label="eins weniger"
                      className="grid h-10 w-10 place-items-center rounded-full bg-[#f1f4f8] text-lg font-bold text-ink transition hover:bg-[#e4e9f0] active:scale-90 disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-xl font-extrabold tabular-nums text-ink" aria-live="polite">
                      {n}
                    </span>
                    <button
                      type="button"
                      onClick={() => r.setzen(e.key, p.id, n + 1)}
                      aria-label="eins mehr"
                      className="grid h-10 w-10 place-items-center rounded-full bg-brand text-lg font-bold text-white transition hover:bg-brand-hover active:scale-90"
                    >
                      +
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-muted">{HINWEIS}</p>
        </div>
      </div>
    </div>
  );
}

export type RechnerVariante = "r1" | "r2" | "r3";

/** Rechner: was ein Partner im Monat verdient – mit den echten Paketpreisen und Provisionssätzen */
export function ProvisionsRechner({ gruender, variante = "r1" }: { gruender: boolean; variante?: RechnerVariante }) {
  if (variante === "r2") return <R2 gruender={gruender} />;
  if (variante === "r3") return <R3 gruender={gruender} />;
  return <R1 gruender={gruender} />;
}
