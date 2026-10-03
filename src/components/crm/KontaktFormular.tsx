"use client";

import { useActionState } from "react";
import { kontaktSpeichern, type AktionStatus } from "@/app/crm/leads/actions";
import { Feld, Hinweis, Input, buttonClass } from "@/components/ui";

type Lead = {
  id: string;
  firma: string;
  ansprechpartner: string | null;
  branche: string | null;
  telefon: string | null;
  email: string | null;
  adresse: string | null;
  bezirk: string | null;
};

export function KontaktFormular({ lead, telefonSperre }: { lead: Lead; telefonSperre: boolean }) {
  const [s, aktion, laeuft] = useActionState<AktionStatus, FormData>(kontaktSpeichern, {});
  return (
    <form action={aktion} className="space-y-3">
      <input type="hidden" name="id" value={lead.id} />
      {s.meldung ? <Hinweis art={s.ok ? "ok" : "fehler"}>{s.meldung}</Hinweis> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Feld label="Firma" name="firma">
          <Input name="firma" defaultValue={lead.firma} required />
        </Feld>
        <Feld label="Ansprechperson" name="ansprechpartner">
          <Input name="ansprechpartner" defaultValue={lead.ansprechpartner ?? ""} />
        </Feld>
        <Feld label="Branche" name="branche">
          <Input name="branche" defaultValue={lead.branche ?? ""} />
        </Feld>
        {telefonSperre ? (
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-ink">Telefon</p>
            <p className="flex min-h-11 items-center rounded-lg border border-danger/30 bg-danger-light px-3 text-sm text-danger">
              Ausgeblendet – nicht anrufen
            </p>
          </div>
        ) : (
          <Feld label="Telefon" name="telefon">
            <Input name="telefon" type="tel" inputMode="tel" defaultValue={lead.telefon ?? ""} />
          </Feld>
        )}
        <Feld label="E-Mail" name="email">
          <Input name="email" type="email" inputMode="email" defaultValue={lead.email ?? ""} />
        </Feld>
        <Feld label="Bezirk" name="bezirk">
          <Input name="bezirk" defaultValue={lead.bezirk ?? ""} />
        </Feld>
      </div>
      <Feld label="Adresse" name="adresse">
        <Input name="adresse" defaultValue={lead.adresse ?? ""} />
      </Feld>
      <button disabled={laeuft} className={buttonClass("secondary", "w-full sm:w-auto")}>
        {laeuft ? "Speichert …" : "Kontakt speichern"}
      </button>
    </form>
  );
}
