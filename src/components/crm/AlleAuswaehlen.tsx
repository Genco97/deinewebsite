"use client";

/** Setzt alle Häkchen mit name="id" im selben Formular. */
export function AlleAuswaehlen() {
  const setzen = (e: React.MouseEvent<HTMLButtonElement>, an: boolean) => {
    const form = e.currentTarget.form;
    form?.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name="id"]').forEach((c) => (c.checked = an));
  };
  return (
    <div className="flex gap-2 text-sm">
      <button type="button" onClick={(e) => setzen(e, true)} className="min-h-11 px-2 text-brand hover:underline">
        Alle auswählen
      </button>
      <button type="button" onClick={(e) => setzen(e, false)} className="min-h-11 px-2 text-muted hover:underline">
        Keine
      </button>
    </div>
  );
}
