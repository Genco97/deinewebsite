import Link from "next/link";
import { Karte } from "@/components/ui";

/** Wie Menüpunkte: größer bei Maus, gibt beim Drücken nach (E2) */
export const ZOOM =
  "transition-[transform,box-shadow,background-color] duration-150 ease-out hover:scale-[1.03] hover:shadow-md active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none";

/** Ring fürs Tagesziel (B3) */
export function TagesRing({ kontakte, ziel }: { kontakte: number; ziel: number }) {
  const anteil = Math.min(1, kontakte / Math.max(1, ziel));
  const r = 42;
  const umfang = 2 * Math.PI * r;
  const fehlt = Math.max(0, ziel - kontakte);
  return (
    <Karte className="flex items-center gap-5 p-5">
      <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0 -rotate-90" role="img" aria-label={`${kontakte} von ${ziel} Kontakten heute`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-brand-light)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${umfang * anteil} ${umfang}`}
        />
        <text x="50" y="50" transform="rotate(90 50 50)" textAnchor="middle" dominantBaseline="central" className="fill-ink" style={{ fontSize: 19, fontWeight: 800 }}>
          {kontakte}/{ziel}
        </text>
      </svg>
      <div className="min-w-0">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Tagesziel</p>
        <p className="mt-1 text-lg font-bold text-ink">
          {kontakte} von {ziel} Kontakten heute
        </p>
        <p className="mt-1 text-sm text-muted">
          {fehlt === 0
            ? "Geschafft! Alles, was jetzt noch kommt, ist ein Bonus."
            : kontakte === 0
              ? "Der erste Anruf ist der schwerste. Los geht's!"
              : `Noch ${fehlt}, dann ist dein Tagesziel erreicht.`}
        </p>
        <Link href="/crm/profil" className="mt-2 inline-block text-sm font-semibold text-brand hover:underline">
          Ziel ändern
        </Link>
      </div>
    </Karte>
  );
}

export type TagEintrag = { id: string; firma: string; erledigt: boolean; info: string };

/** „Heute erledigt“ zum Abhaken (D3): offene Aufgaben oben, Erledigtes durchgestrichen darunter */
export function HeuteErledigt({ eintraege, gesamtOffen, gesamtErledigt }: { eintraege: TagEintrag[]; gesamtOffen: number; gesamtErledigt: number }) {
  const gesamt = gesamtOffen + gesamtErledigt;
  return (
    <Karte className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          Heute · {gesamtErledigt} von {gesamt} erledigt
        </p>
        <Link href="/crm" className="shrink-0 text-sm font-semibold text-brand hover:underline">
          Alle Aufgaben
        </Link>
      </div>
      {gesamt > 0 ? (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-light" aria-hidden>
          <div className="h-full rounded-full bg-ok" style={{ width: `${(gesamtErledigt / gesamt) * 100}%` }} />
        </div>
      ) : null}
      {eintraege.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Für heute steht nichts an. Ruf einen neuen Lead an, er erscheint dann hier als erledigt.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {eintraege.map((e) => (
            <li key={e.id}>
              <Link
                href={`/crm/leads/${e.id}`}
                className={`flex min-h-11 items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2 ${ZOOM}`}
              >
                <span
                  aria-hidden
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                    e.erledigt ? "border-ok bg-ok text-white" : "border-line"
                  }`}
                >
                  {e.erledigt ? "✓" : ""}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate font-semibold ${e.erledigt ? "text-muted line-through" : "text-ink"}`}>{e.firma}</span>
                  <span className="block truncate text-xs text-muted">
                    <span className="sr-only">{e.erledigt ? "Erledigt: " : "Offen: "}</span>
                    {e.info}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Karte>
  );
}
