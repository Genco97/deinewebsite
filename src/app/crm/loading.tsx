// Wird sofort beim Seitenwechsel angezeigt, bis die Daten geladen sind.
export default function Laden() {
  return (
    <div aria-busy="true" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Wird geladen …</span>
      <div className="mb-2 h-8 w-48 rounded-lg bg-line" />
      <div className="mb-8 h-4 w-72 max-w-full rounded bg-line/70" />
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-line bg-surface p-5">
            <div className="mb-4 h-5 w-40 rounded bg-line" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-line/70" />
              <div className="h-4 w-5/6 rounded bg-line/70" />
              <div className="h-4 w-2/3 rounded bg-line/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
