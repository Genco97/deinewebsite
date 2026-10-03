import type { ReactNode } from "react";
import { Karte } from "@/components/ui";

/** Kennzahl-Kachel: eine Zahl, groß – mit optionaler Zusatzzeile */
export function Kennzahl({
  titel,
  wert,
  zusatz,
  trend,
}: {
  titel: string;
  wert: string;
  zusatz?: ReactNode;
  trend?: { text: string; gut: boolean } | null;
}) {
  return (
    <Karte className="p-4 sm:p-5">
      <p className="text-sm text-muted">{titel}</p>
      <p className="mt-1 font-serif text-3xl font-semibold tracking-tight text-ink">{wert}</p>
      {trend || zusatz ? (
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted">
          {trend ? (
            <span className={`font-semibold ${trend.gut ? "text-ok" : "text-danger"}`}>
              <span aria-hidden>{trend.gut ? "▲" : "▼"}</span> {trend.text}
            </span>
          ) : null}
          {zusatz}
        </p>
      ) : null}
    </Karte>
  );
}

type Saeule = { label: string; wert: number; text: string };

/**
 * Säulendiagramm (eine Reihe), in HTML gebaut, damit die Schrift auf jedem Bildschirm
 * lesbar bleibt. Beschriftet sind nur der letzte Monat und der höchste Wert –
 * alle Werte stehen im Tooltip und in der Tabelle.
 */
export function Saeulen({
  daten,
  titel,
  achse,
}: {
  daten: Saeule[];
  titel: string;
  achse: (wert: number) => string;
}) {
  const max = Math.max(1, ...daten.map((d) => d.wert));
  // runde Skala: 1, 2, 5 × 10^n
  const roh = max / 3;
  const p = 10 ** Math.floor(Math.log10(roh));
  const schritt = [1, 2, 5, 10].map((f) => f * p).find((x) => x >= roh) ?? roh;
  const skalaMax = schritt * Math.ceil(max / schritt);
  const ticks = [1, 2, 3].map((i) => i * schritt).filter((t) => t <= skalaMax);
  const iMax = daten.reduce((m, d, i) => (d.wert > daten[m].wert ? i : m), 0);

  return (
    <figure>
      <div role="img" aria-label={titel} className="relative mt-6 h-52 border-b border-line">
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-0 border-t border-grid" style={{ bottom: `${(t / skalaMax) * 100}%` }}>
            <span className="absolute -top-4 left-0 text-[11px] text-muted">{achse(t)}</span>
          </div>
        ))}
        <div className="absolute inset-0 flex">
          {daten.map((d, i) => {
            const beschriften = d.wert > 0 && (i === daten.length - 1 || i === iMax);
            return (
              <div key={d.label} className="group flex flex-1 flex-col items-center justify-end" title={`${d.label}: ${d.text}`}>
                {beschriften ? <span className="mb-1 text-xs font-semibold text-ink">{d.text}</span> : null}
                <div
                  className="w-1/2 max-w-6 rounded-t bg-chart transition-opacity group-hover:opacity-80"
                  style={{ height: `${(d.wert / skalaMax) * 100}%`, minHeight: d.wert > 0 ? 2 : 0 }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex pt-1.5">
        {daten.map((d) => (
          <span key={d.label} className="flex-1 text-center text-xs text-muted">
            {d.label}
          </span>
        ))}
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-muted hover:text-ink">Als Tabelle</summary>
        <table className="mt-2 w-full text-left">
          <tbody className="divide-y divide-line">
            {daten.map((d) => (
              <tr key={d.label}>
                <td className="py-1.5 text-muted">{d.label}</td>
                <td className="py-1.5 text-right font-semibold text-ink">{d.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Waagrechte Balken (eine Reihe), Wert am Balkenende */
export function Balken({ daten }: { daten: { label: string; wert: number; text?: string }[] }) {
  const max = Math.max(1, ...daten.map((d) => d.wert));
  return (
    <ul className="space-y-2.5">
      {daten.map((d) => (
        <li key={d.label} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 text-sm sm:grid-cols-[9rem_1fr]">
          <span className="truncate text-muted">{d.label}</span>
          <span className="flex items-center gap-2" title={`${d.label}: ${d.text ?? d.wert}`}>
            <span
              className="h-3 rounded-r bg-chart"
              style={{ width: `${(d.wert / max) * 85}%`, minWidth: d.wert > 0 ? 4 : 0 }}
            />
            <span className="shrink-0 font-semibold text-ink">{d.text ?? d.wert}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
