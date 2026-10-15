"use client";

import { useState } from "react";
import { BERATER } from "@/lib/pro-berater";
import type { BrancheId } from "@/lib/beispiele";

const euro = (p: number) => `${p.toLocaleString("de-AT", { minimumFractionDigits: p % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`;

/** Pro: ein kleines Werkzeug je Branche – Fragen anklicken, passende Empfehlung mit Preis bekommen. */
export function ProBerater({ branche, ziel }: { branche: BrancheId; ziel: string }) {
  const b = BERATER[branche];
  const [antworten, setAntworten] = useState<number[]>([]);
  const schritt = b.schritte[antworten.length];
  const gewaehlt = antworten.map((a, i) => b.schritte[i].optionen[a]);
  const preis = Math.max(0, b.basis.p + gewaehlt.reduce((s, o) => s + (o.p ?? 0), 0));
  const dauer = Math.max(0, b.basis.m + gewaehlt.reduce((s, o) => s + (o.m ?? 0), 0));
  const titel = [...gewaehlt].reverse().find((o) => o.titel)?.titel ?? gewaehlt[0]?.t;
  return (
    <div className="rounded-[30px] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,.08),rgba(255,255,255,.02))] p-6 sm:p-10">
      <div className="mb-6 flex gap-2" aria-hidden>
        {b.schritte.map((_, i) => (
          <i key={i} className={`h-1.5 flex-1 rounded-full ${i < antworten.length ? "bg-gradient-to-r from-fuchsia-500 to-cyan-400" : "bg-white/15"}`} />
        ))}
      </div>
      {schritt ? (
        <div key={antworten.length}>
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">
            Frage {antworten.length + 1} von {b.schritte.length}
          </p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{schritt.frage}</h3>
          <div className={`mt-8 grid gap-3 ${schritt.optionen.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
            {schritt.optionen.map((o, i) => (
              <button
                key={o.t}
                type="button"
                onClick={() => setAntworten([...antworten, i])}
                className="rounded-2xl border border-white/15 bg-white/[.04] p-5 text-left transition hover:-translate-y-1 hover:border-[var(--pro-a)] hover:bg-white/[.09]"
              >
                <b className="block text-xl">{o.t}</b>
                {o.x && <small className="text-white/55">{o.x}</small>}
              </button>
            ))}
          </div>
          {antworten.length > 0 && (
            <button type="button" onClick={() => setAntworten(antworten.slice(0, -1))} className="mt-6 text-sm text-white/55 underline-offset-4 hover:underline">
              ← Zurück
            </button>
          )}
        </div>
      ) : (
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">Unsere Empfehlung für Sie</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{titel}</h3>
          <p className="mt-4 text-lg text-white/65">
            {b.preisVor ?? "ab"} <b className="text-white">{euro(preis)}</b>
            {dauer > 0 && <> · {b.dauerText ? b.dauerText(dauer) : `ca. ${dauer} Minuten`}</>}
          </p>
          <p className="mt-2 text-sm text-white/45">{b.zusatz}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={ziel} className="inline-flex min-h-13 items-center rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-8 font-bold text-white">
              {b.knopf}
            </a>
            <button type="button" onClick={() => setAntworten([])} className="inline-flex min-h-13 items-center rounded-full border border-white/25 px-8 font-semibold">
              Nochmal von vorn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
