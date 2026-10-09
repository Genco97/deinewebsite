"use client";

import { Children, useState } from "react";

/** Projekt-Board: am Handy eine Phase nach der anderen über Reiter, ab lg alle vier Spalten nebeneinander */
export function PhasenReiter({
  phasen,
  start,
  children,
}: {
  phasen: { label: string; anzahl: number; farbe: string }[];
  start: number;
  children: React.ReactNode;
}) {
  const [aktiv, setAktiv] = useState(start);
  const spalten = Children.toArray(children);
  return (
    <>
      <div role="tablist" aria-label="Phase wählen" className="mb-3 grid grid-cols-4 gap-1 rounded-xl border border-line bg-surface p-1 lg:hidden">
        {phasen.map((p, i) => (
          <button
            key={p.label}
            type="button"
            role="tab"
            aria-selected={i === aktiv}
            onClick={() => setAktiv(i)}
            className={`flex min-h-12 flex-col items-center justify-center rounded-lg px-1 text-xs font-semibold leading-tight transition-colors ${
              i === aktiv ? "bg-brand text-white" : "text-ink hover:text-brand"
            }`}
          >
            <span className="flex items-center gap-1">
              <span aria-hidden className={`h-2 w-2 rounded-full ${p.farbe}`} />
              {p.anzahl}
            </span>
            <span className="truncate">{p.label}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {spalten.map((s, i) => (
          <div key={i} className={i === aktiv ? "min-w-0" : "hidden min-w-0 lg:block"}>
            {s}
          </div>
        ))}
      </div>
    </>
  );
}
