"use client";

import { useState } from "react";

type Schritt = { frage: string; optionen: { t: string; x: string }[] };

const SCHRITTE: Schritt[] = [
  { frage: "Wie lang sind Ihre Haare?", optionen: [{ t: "Kurz", x: "bis zum Ohr" }, { t: "Mittel", x: "bis zur Schulter" }, { t: "Lang", x: "über die Schulter" }] },
  { frage: "Was soll passieren?", optionen: [{ t: "Neuer Look", x: "frischer Schnitt" }, { t: "Farbe", x: "Glanz oder Strähnen" }, { t: "Pflege", x: "Kraft und Gesundheit" }] },
  { frage: "Wie viel Zeit haben Sie?", optionen: [{ t: "Eine Stunde", x: "schnell und gut" }, { t: "Einen Vormittag", x: "ganz in Ruhe" }] },
];

function empfehlung(a: string[]) {
  const [laenge, ziel, zeit] = a;
  const lang = zeit === "Einen Vormittag";
  if (ziel === "Farbe") return { titel: lang ? "Balayage mit Glanz-Pflege" : "Ansatz färben & Föhnen", preis: laenge === "Lang" ? 140 : laenge === "Mittel" ? 110 : 62, dauer: lang ? 150 : 90 };
  if (ziel === "Pflege") return { titel: "Tiefenpflege mit Kopfmassage", preis: laenge === "Lang" ? 48 : 38, dauer: 45 };
  return { titel: lang ? "Beratung, Schnitt & Styling" : "Waschen, Schneiden, Föhnen", preis: laenge === "Lang" ? 62 : laenge === "Mittel" ? 52 : 42, dauer: lang ? 90 : 60 };
}

export function ProBerater({ ziel }: { ziel: string }) {
  const [antworten, setAntworten] = useState<string[]>([]);
  const schritt = SCHRITTE[antworten.length];
  const fertig = !schritt;
  const e = fertig ? empfehlung(antworten) : null;
  return (
    <div className="rounded-[30px] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,.08),rgba(255,255,255,.02))] p-6 sm:p-10">
      <div className="mb-6 flex gap-2" aria-hidden>
        {SCHRITTE.map((_, i) => (
          <i key={i} className={`h-1.5 flex-1 rounded-full ${i < antworten.length ? "bg-gradient-to-r from-fuchsia-500 to-cyan-400" : "bg-white/15"}`} />
        ))}
      </div>
      {schritt ? (
        <div key={antworten.length}>
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">Frage {antworten.length + 1} von {SCHRITTE.length}</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{schritt.frage}</h3>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {schritt.optionen.map((o) => (
              <button
                key={o.t}
                type="button"
                onClick={() => setAntworten([...antworten, o.t])}
                className="rounded-2xl border border-white/15 bg-white/[.04] p-5 text-left transition hover:-translate-y-1 hover:border-[var(--pro-a)] hover:bg-white/[.09]"
              >
                <b className="block text-xl">{o.t}</b>
                <small className="text-white/55">{o.x}</small>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">Unsere Empfehlung für Sie</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{e!.titel}</h3>
          <p className="mt-4 text-lg text-white/65">
            ab <b className="text-white">{e!.preis} €</b> · ca. {e!.dauer} Minuten · für {antworten[0].toLowerCase()}e Haare
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={ziel} className="inline-flex min-h-13 items-center rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-8 font-bold text-white">
              Dafür Termin buchen
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
