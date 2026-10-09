"use client";

import { useState } from "react";
import { notizHinzufuegen } from "@/app/crm/leads/actions";
import { buttonClass } from "@/components/ui";

/** Letzte Notiz direkt in der Leads-Liste – und schnell eine neue dazuschreiben (landet im Verlauf). */
export function NotizSchnell({ id, firma, notiz, am }: { id: string; firma: string; notiz: string | null; am: string | null }) {
  const [offen, setOffen] = useState(false);

  if (offen) {
    return (
      <form action={notizHinzufuegen} onSubmit={() => setTimeout(() => setOffen(false), 0)} className="w-full min-w-56 space-y-2">
        <input type="hidden" name="id" value={id} />
        <label htmlFor={`notiz-${id}`} className="sr-only">
          Notiz zu {firma}
        </label>
        <textarea
          id={`notiz-${id}`}
          name="notiz"
          rows={3}
          required
          maxLength={4000}
          autoFocus
          placeholder="z. B. will Online-Buchung, ruft nach dem Urlaub zurück …"
          className="block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <div className="flex gap-2">
          <button className={buttonClass("primary", "min-h-9 px-3 text-sm")}>Speichern</button>
          <button type="button" onClick={() => setOffen(false)} className={buttonClass("secondary", "min-h-9 px-3 text-sm")}>
            Abbrechen
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-start gap-1.5">
      {notiz ? (
        <p className="min-w-0 flex-1 text-sm text-ink">
          <span className="line-clamp-2">{notiz}</span>
          {am ? <span className="block text-xs text-muted">{am}</span> : null}
        </p>
      ) : (
        <p className="flex-1 text-sm text-muted">–</p>
      )}
      <button
        type="button"
        onClick={() => setOffen(true)}
        aria-label={`Notiz zu ${firma} schreiben`}
        title="Notiz schreiben"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand hover:bg-brand-light"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
    </div>
  );
}
