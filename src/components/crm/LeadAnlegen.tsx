"use client";

import Link from "next/link";
import { useActionState } from "react";
import { leadAnlegen, type AktionStatus } from "@/app/crm/leads/actions";
import { Feld, Hinweis, Input, buttonClass } from "@/components/ui";

export function LeadAnlegen() {
  const [s, aktion, laeuft] = useActionState<AktionStatus, FormData>(leadAnlegen, {});
  const doppelt = s.duplikate && s.duplikate.length > 0;
  const w = s.werte ?? {};
  return (
    <details className="group rounded-xl border border-line bg-surface open:col-span-2 md:open:col-span-1" open={doppelt || undefined}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 text-[15px] font-semibold text-ink sm:min-h-12 sm:px-4 sm:text-base [&::-webkit-details-marker]:hidden">
        Lead anlegen
        <span aria-hidden className="text-xl text-brand group-open:rotate-45">+</span>
      </summary>
      <form key={JSON.stringify(w)} action={aktion} className="space-y-3 border-t border-line p-4">
        {s.meldung && !doppelt ? <Hinweis art="fehler">{s.meldung}</Hinweis> : null}
        {doppelt ? (
          <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            <p className="font-semibold">{s.meldung}</p>
            <ul className="mt-2 space-y-1">
              {s.duplikate!.map((d, i) => (
                <li key={d.id ?? i}>
                  {d.id ? (
                    <Link href={`/crm/leads/${d.id}`} className="font-semibold underline">
                      {d.firma}
                    </Link>
                  ) : (
                    <span className="font-semibold">{d.firma}</span>
                  )}
                  {d.adresse ? ` · ${d.adresse}` : ""}
                  {d.bei_mir ? " · bei dir" : ` · bei ${d.besitzer}`}
                </li>
              ))}
            </ul>
            <p className="mt-2">Ist es ein anderer Betrieb? Dann trotzdem anlegen.</p>
          </div>
        ) : null}
        <Feld label="Firma" name="firma" pflicht>
          <Input name="firma" defaultValue={w.firma} required />
        </Feld>
        <div className="grid gap-3 sm:grid-cols-2">
          <Feld label="Ansprechperson" name="ansprechpartner">
            <Input name="ansprechpartner" defaultValue={w.ansprechpartner} />
          </Feld>
          <Feld label="Branche" name="branche">
            <Input name="branche" defaultValue={w.branche} />
          </Feld>
          <Feld label="Telefon" name="telefon">
            <Input name="telefon" defaultValue={w.telefon} type="tel" inputMode="tel" />
          </Feld>
          <Feld label="E-Mail" name="email">
            <Input name="email" defaultValue={w.email} type="email" inputMode="email" />
          </Feld>
          <Feld label="Adresse" name="adresse">
            <Input name="adresse" defaultValue={w.adresse} />
          </Feld>
          <Feld label="Bezirk" name="bezirk">
            <Input name="bezirk" defaultValue={w.bezirk} placeholder="z. B. 1070" />
          </Feld>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {doppelt ? (
            <button name="trotzdem" value="1" disabled={laeuft} className={buttonClass("secondary", "w-full sm:w-auto")}>
              Trotzdem anlegen
            </button>
          ) : (
            <button disabled={laeuft} className={buttonClass("primary", "w-full sm:w-auto")}>
              {laeuft ? "Wird angelegt …" : "Lead anlegen"}
            </button>
          )}
        </div>
      </form>
    </details>
  );
}
