/** Zeigt eine Firmenangabe – oder einen deutlich markierten Platzhalter, solange sie fehlt. */
export function Angabe({ wert, platzhalter }: { wert: string | null | undefined; platzhalter: string }) {
  if (wert) return <>{wert}</>;
  return (
    <mark className="rounded bg-amber-100 px-1 text-amber-900" title="Angabe fehlt noch">
      [{platzhalter}]
    </mark>
  );
}
