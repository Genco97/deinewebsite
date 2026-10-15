"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { telefonEintragen } from "@/app/crm/leads/actions";

/** „+ Nummer eintragen“ direkt in der Lead-Liste – für Leads ohne Telefonnummer. */
export function NummerEintragen({ id, gross }: { id: string; gross: boolean }) {
  const router = useRouter();
  const [offen, setOffen] = useState(false);
  const [wert, setWert] = useState("");
  const [fehler, setFehler] = useState<string | null>(null);
  const [doppelt, setDoppelt] = useState<{ id: string | null; firma: string; besitzer: string }[]>([]);
  const [laeuft, starten] = useTransition();
  const hoehe = gross ? "min-h-12 text-base" : "min-h-9 text-sm";

  function speichern(trotzdem = false) {
    setFehler(null);
    starten(async () => {
      const r = await telefonEintragen(id, wert, trotzdem);
      if (!r.ok) {
        setFehler(r.meldung ?? "Das hat nicht geklappt.");
        setDoppelt(r.doppelt ?? []);
        return;
      }
      setOffen(false);
      setWert("");
      setDoppelt([]);
      router.refresh();
    });
  }

  if (!offen) {
    return (
      <button
        type="button"
        onClick={() => setOffen(true)}
        className={`flex ${hoehe} flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg border-[1.5px] border-dashed border-brand/35 bg-surface px-3 font-semibold text-brand hover:border-brand`}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nummer eintragen
      </button>
    );
  }

  return (
    <form
      className="flex-1 space-y-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        speichern();
      }}
    >
      <label className="sr-only" htmlFor={`tel-${id}`}>
        Telefonnummer
      </label>
      <div className="flex gap-2">
        <input
          id={`tel-${id}`}
          type="tel"
          inputMode="tel"
          autoComplete="off"
          autoFocus
          value={wert}
          onChange={(e) => setWert(e.target.value)}
          placeholder="z. B. 0664 123 45 67"
          className={`${hoehe} min-w-0 flex-1 rounded-lg border border-brand bg-surface px-3 text-ink outline-none ring-brand/20 focus:ring-4`}
        />
        <button disabled={laeuft || !wert.trim()} className={`${hoehe} rounded-lg bg-brand px-4 font-semibold text-white disabled:opacity-50`}>
          {laeuft ? "…" : "Speichern"}
        </button>
      </div>
      {fehler ? (
        <div className="text-xs text-danger">
          <p className="font-semibold">{fehler}</p>
          {doppelt.length ? (
            <ul className="mt-0.5 text-ink">
              {doppelt.map((d, i) => (
                <li key={d.id ?? i}>
                  {d.id ? (
                    <Link href={`/crm/leads/${d.id}`} className="underline">
                      {d.firma}
                    </Link>
                  ) : (
                    d.firma
                  )}{" "}
                  · bei {d.besitzer}
                </li>
              ))}
            </ul>
          ) : null}
          {doppelt.length ? (
            <button type="button" onClick={() => speichern(true)} className="mt-1 font-semibold text-brand underline">
              Trotzdem speichern
            </button>
          ) : null}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => {
          setOffen(false);
          setFehler(null);
          setDoppelt([]);
        }}
        className="text-xs font-semibold text-muted hover:text-ink"
      >
        Abbrechen
      </button>
    </form>
  );
}
