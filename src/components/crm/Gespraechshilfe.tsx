import { Karte } from "@/components/ui";
import { ABSCHLUSS, EINWAENDE, branchenSatz, einstieg } from "@/lib/gespraech";

/** F3: Einstieg, passender Satz zur Branche und Antworten auf typische Einwände */
export function Gespraechshilfe({
  firma,
  ansprechpartner,
  branche,
  meinName,
  offen = false,
}: {
  firma: string;
  ansprechpartner: string | null;
  branche: string | null;
  meinName: string;
  offen?: boolean;
}) {
  const saetze = einstieg({ meinName, ansprechpartner, firma });
  return (
    <Karte className="overflow-hidden">
      <details open={offen} className="group">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 bg-brand-light px-4 py-3 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 font-bold text-brand">
            <span aria-hidden>💬</span> Gesprächshilfe
          </span>
          <span aria-hidden className="text-brand transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="space-y-5 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Einstieg</p>
            <ol className="mt-2 space-y-2">
              {saetze.map((s, i) => (
                <li key={i} className="rounded-lg bg-bg px-3 py-2 text-[15px] leading-snug text-ink">
                  „{s}“
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Passend zur Branche</p>
            <p className="mt-2 rounded-lg border-l-4 border-brand bg-bg px-3 py-2 text-[15px] leading-snug text-ink">„{branchenSatz(branche)}“</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Wenn der Kunde sagt …</p>
            <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
              {EINWAENDE.map((e) => (
                <li key={e.einwand}>
                  <details className="group/e">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 font-semibold text-ink hover:bg-brand-light [&::-webkit-details-marker]:hidden">
                      „{e.einwand}“
                      <span aria-hidden className="text-brand transition-transform group-open/e:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="px-3 pb-3 text-[15px] leading-snug text-muted">{e.antwort}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Zum Schluss</p>
            <ul className="mt-2 space-y-1 text-sm text-ink">
              {ABSCHLUSS.map((a) => (
                <li key={a} className="flex gap-2">
                  <span aria-hidden className="text-ok">✓</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </Karte>
  );
}
