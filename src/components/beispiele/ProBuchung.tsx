"use client";

import { useState } from "react";
import { abPreis, type Betrieb, type Leistung } from "@/lib/beispiele";

const TAG = new Intl.DateTimeFormat("de-AT", { weekday: "short", day: "numeric", month: "numeric" });
const TAG_LANG = new Intl.DateTimeFormat("de-AT", { weekday: "long", day: "numeric", month: "long" });
const ZEITEN = ["9:00", "9:30", "10:30", "11:00", "13:00", "14:30", "15:00", "16:30", "17:00"];

/** Die nächsten Öffnungstage (Di–Sa). */
function naechsteTage(anzahl: number) {
  const tage: Date[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (tage.length < anzahl) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 1) tage.push(new Date(d));
  }
  return tage;
}

/** Ein paar Termine sind „schon vergeben“ – immer gleich für denselben Tag. */
function frei(tag: Date, zeit: string) {
  const s = tag.getDate() * 7 + zeit.length * 3 + Number(zeit.replace(":", ""));
  if (tag.getDay() === 6 && Number(zeit.split(":")[0]) >= 14) return false;
  return s % 5 !== 0 && s % 7 !== 3;
}

const knopf = "min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition";
const aus = "border-white/10 bg-white/5 hover:border-violet-400/60";
const an = "border-violet-400 bg-violet-500/25 text-white";

export function ProBuchung({ betrieb }: { betrieb: Betrieb }) {
  const [leistung, setLeistung] = useState<Leistung | null>(null);
  const [tage, setTage] = useState<Date[]>([]);
  const [tag, setTag] = useState<Date | null>(null);
  const [zeit, setZeit] = useState<string | null>(null);
  const [fertig, setFertig] = useState(false);

  if (fertig && leistung && tag && zeit) {
    return (
      <div role="status" className="py-6 text-center">
        <p className="text-5xl">✓</p>
        <p className="mt-4 text-2xl font-bold">{betrieb.buchung.erledigt}</p>
        <p className="mt-2 text-white/70">
          {leistung.name} am {TAG_LANG.format(tag)} um {zeit} Uhr.
        </p>
        <p className="mt-4 text-sm text-white/50">Beispiel – es wurde nichts gesendet. Auf einer echten Seite kommt jetzt eine Bestätigung per E-Mail.</p>
        <button
          onClick={() => {
            setFertig(false);
            setLeistung(null);
            setTag(null);
            setZeit(null);
          }}
          className="mt-6 rounded-full border border-white/20 px-5 py-2 text-sm font-semibold hover:bg-white/10"
        >
          Noch einmal ausprobieren
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-violet-300">1 · {betrieb.buchung.schritt}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {betrieb.leistungen.map((l) => (
            <button
              key={l.id}
              type="button"
              aria-pressed={leistung?.id === l.id}
              onClick={() => {
                setLeistung(l);
                if (tage.length === 0) setTage(naechsteTage(10));
                setZeit(null);
              }}
              className={`${knopf} text-left ${leistung?.id === l.id ? an : aus}`}
            >
              {l.name}
              <span className="block text-xs font-normal text-white/60">
                {l.dauer ? `${l.dauer} Min. · ` : ""}{abPreis(l.preis)}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {leistung ? (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-violet-300">2 · Tag</legend>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tage.map((t) => (
              <button
                key={t.toISOString()}
                type="button"
                aria-pressed={tag?.getTime() === t.getTime()}
                onClick={() => {
                  setTag(t);
                  setZeit(null);
                }}
                className={`${knopf} shrink-0 ${tag?.getTime() === t.getTime() ? an : aus}`}
              >
                {TAG.format(t)}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {leistung && tag ? (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-violet-300">3 · Uhrzeit</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {ZEITEN.map((z) => {
              const ok = frei(tag, z);
              return (
                <button
                  key={z}
                  type="button"
                  disabled={!ok}
                  aria-pressed={zeit === z}
                  onClick={() => setZeit(z)}
                  className={`${knopf} ${zeit === z ? an : aus} disabled:cursor-not-allowed disabled:opacity-30 disabled:line-through`}
                >
                  {z}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {leistung && tag && zeit ? (
        <button
          type="button"
          onClick={() => setFertig(true)}
          className="min-h-12 w-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-6 font-bold text-white shadow-[0_0_40px_rgba(167,139,250,0.45)] transition hover:brightness-110"
        >
          {leistung.name} am {TAG.format(tag)} um {zeit} buchen
        </button>
      ) : null}
    </div>
  );
}
