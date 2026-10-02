"use client";

import { useActionState } from "react";
import { leadAnlegen, type AktionStatus } from "@/app/crm/leads/actions";
import { Feld, Hinweis, Input, buttonClass } from "@/components/ui";

export function LeadAnlegen() {
  const [s, aktion, laeuft] = useActionState<AktionStatus, FormData>(leadAnlegen, {});
  return (
    <details className="group rounded-xl border border-line bg-surface">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
        Lead anlegen
        <span aria-hidden className="text-xl text-brand group-open:rotate-45">+</span>
      </summary>
      <form action={aktion} className="space-y-3 border-t border-line p-4">
        {s.meldung ? <Hinweis art="fehler">{s.meldung}</Hinweis> : null}
        <Feld label="Firma" name="firma" pflicht>
          <Input name="firma" required />
        </Feld>
        <div className="grid gap-3 sm:grid-cols-2">
          <Feld label="Ansprechperson" name="ansprechpartner">
            <Input name="ansprechpartner" />
          </Feld>
          <Feld label="Branche" name="branche">
            <Input name="branche" />
          </Feld>
          <Feld label="Telefon" name="telefon">
            <Input name="telefon" type="tel" inputMode="tel" />
          </Feld>
          <Feld label="E-Mail" name="email">
            <Input name="email" type="email" inputMode="email" />
          </Feld>
          <Feld label="Adresse" name="adresse">
            <Input name="adresse" />
          </Feld>
          <Feld label="Bezirk" name="bezirk">
            <Input name="bezirk" placeholder="z. B. 1070" />
          </Feld>
        </div>
        <button disabled={laeuft} className={buttonClass("primary", "w-full sm:w-auto")}>
          {laeuft ? "Wird angelegt …" : "Lead anlegen"}
        </button>
      </form>
    </details>
  );
}
