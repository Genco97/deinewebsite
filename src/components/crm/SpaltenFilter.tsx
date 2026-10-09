"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/**
 * Auswahl im Tabellenkopf: filtert die Liste sofort nach einem Wert (z. B. Branche).
 * Die Wahl bleibt sofort stehen, auch solange die gefilterte Liste noch lädt.
 */
export function SpaltenFilter({
  name,
  titel,
  werte,
  aktuell,
  pfad,
  filter,
}: {
  name: string;
  titel: string;
  werte: string[];
  /** aktueller Wert laut Server */
  aktuell: string;
  pfad: string;
  /** die übrigen aktiven Filter als Query-String */
  filter: string;
}) {
  const router = useRouter();
  const [wahl, setWahl] = useState(aktuell);
  const [laedt, starten] = useTransition();

  return (
    <label className="inline-flex items-center gap-1.5">
      <span className="sr-only">{titel} filtern</span>
      <select
        value={wahl}
        onChange={(e) => {
          const wert = e.target.value;
          setWahl(wert);
          const p = new URLSearchParams(filter);
          if (wert) p.set(name, wert);
          else p.delete(name);
          starten(() => router.push(p.size ? `${pfad}?${p}` : pfad));
        }}
        className={`max-w-40 cursor-pointer rounded-md border bg-surface py-1 pl-2 pr-6 text-xs font-semibold uppercase tracking-wide ${
          wahl ? "border-brand text-brand" : "border-line text-muted"
        }`}
      >
        <option value="">{titel}: alle</option>
        {wahl && !werte.includes(wahl) ? <option value={wahl}>{wahl}</option> : null}
        {werte.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>
      {laedt ? (
        <span role="status" aria-label="Lädt" className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-light border-t-brand" />
      ) : null}
    </label>
  );
}
