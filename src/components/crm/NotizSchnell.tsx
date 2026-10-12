"use client";

import { useRef, useState } from "react";
import { notizHinzufuegen } from "@/app/crm/leads/actions";
import { buttonClass } from "@/components/ui";

type Eintrag = { text: string; am: string };

/**
 * Notizen direkt in der Leads-Liste. Beim Schreiben bleiben die bisherigen Notizen sichtbar,
 * und die letzte lässt sich mit einem Tipp übernehmen, um an ihr weiterzuschreiben.
 * Jede Speicherung landet als neuer Eintrag im Verlauf – nichts wird überschrieben.
 */
export function NotizSchnell({ id, firma, notizen }: { id: string; firma: string; notizen: Eintrag[] }) {
  const [offen, setOffen] = useState(false);
  const [wert, setWert] = useState("");
  const feld = useRef<HTMLTextAreaElement>(null);
  const letzte = notizen[0] ?? null;

  if (offen) {
    return (
      <form
        action={notizHinzufuegen}
        onSubmit={() => setTimeout(() => { setOffen(false); setWert(""); }, 0)}
        className="w-full min-w-56 space-y-2"
      >
        <input type="hidden" name="id" value={id} />
        {notizen.length > 0 ? (
          <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg bg-bg p-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Bisherige Notizen</p>
            {notizen.map((n, i) => (
              <p key={i} className="text-sm text-ink">
                <span className="whitespace-pre-wrap">{n.text}</span>
                <span className="block text-xs text-muted">{n.am}</span>
              </p>
            ))}
          </div>
        ) : null}
        <label htmlFor={`notiz-${id}`} className="sr-only">
          Notiz zu {firma}
        </label>
        <textarea
          id={`notiz-${id}`}
          name="notiz"
          rows={4}
          required
          maxLength={4000}
          autoFocus
          ref={feld}
          value={wert}
          onChange={(e) => setWert(e.target.value)}
          placeholder="z. B. will Online-Buchung, ruft nach dem Urlaub zurück …"
          className="block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        {letzte && wert === "" ? (
          <button
            type="button"
            onClick={() => {
              const neu = `${letzte.text}\n`;
              setWert(neu);
              // Cursor ans Ende, damit man direkt dahinter weiterschreibt
              requestAnimationFrame(() => {
                feld.current?.focus();
                feld.current?.setSelectionRange(neu.length, neu.length);
              });
            }}
            className="text-sm font-semibold text-brand underline-offset-2 hover:underline"
          >
            An letzter Notiz weiterschreiben
          </button>
        ) : null}
        <div className="flex gap-2">
          <button className={buttonClass("primary", "min-h-9 px-3 text-sm")}>Speichern</button>
          <button type="button" onClick={() => { setOffen(false); setWert(""); }} className={buttonClass("secondary", "min-h-9 px-3 text-sm")}>
            Abbrechen
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-start gap-1.5">
      {letzte ? (
        <p className="min-w-0 flex-1 text-sm text-ink">
          <span className="line-clamp-3 whitespace-pre-wrap">{letzte.text}</span>
          <span className="block text-xs text-muted">
            {letzte.am}
            {notizen.length > 1 ? ` · ${notizen.length === 3 ? "mind. " : ""}${notizen.length} Notizen` : ""}
          </span>
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
