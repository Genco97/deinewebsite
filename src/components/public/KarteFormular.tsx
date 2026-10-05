"use client";

import Link from "next/link";
import { useActionState } from "react";
import { karteBestaetigen, type FormStatus } from "@/app/(public)/actions";
import { Feld, Hinweis, Input, buttonClass } from "@/components/ui";
import { Honeypot } from "./Honeypot";

export function KarteFormular({ code }: { code: string }) {
  const [status, aktion, laeuft] = useActionState<FormStatus, FormData>(karteBestaetigen, {});
  const w = status.werte ?? {};
  const f = status.fehler ?? {};

  return (
    <form action={aktion} noValidate className="relative space-y-4">
      <Honeypot />
      <input type="hidden" name="code" value={code} />
      {status.meldung ? <Hinweis art="fehler">{status.meldung}</Hinweis> : null}

      <Feld label="Ihr Name" name="name" pflicht fehler={f.name}>
        <Input name="name" autoComplete="name" defaultValue={w.name} required aria-invalid={!!f.name} />
      </Feld>
      <div className="grid gap-4 sm:grid-cols-2">
        <Feld
          label="Telefonnummer"
          name="telefon"
          hinweis="Leer lassen, wenn wir die Nummer Ihres Betriebs anrufen sollen."
          fehler={f.telefon}
        >
          <Input
            name="telefon"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={w.telefon}
            aria-invalid={!!f.telefon}
          />
        </Feld>
        <Feld label="Wann passt es Ihnen am besten?" name="zeit">
          <Input name="zeit" defaultValue={w.zeit} placeholder="z. B. Dienstag Vormittag" />
        </Feld>
      </div>

      <div className="space-y-1.5">
        <label className="flex min-h-11 items-start gap-3 text-sm text-muted">
          <input type="checkbox" name="einwilligung" className="mt-1 h-5 w-5 shrink-0 accent-brand" />
          <span>
            Ja, Sie dürfen mich wegen einer Website für meinen Betrieb anrufen und mir dazu auch eine E-Mail
            schreiben. Ich kann das jederzeit widerrufen. Mehr in der{" "}
            <Link href="/datenschutz" className="text-brand underline">
              Datenschutzerklärung
            </Link>
            .
          </span>
        </label>
        {f.einwilligung ? <p className="text-sm font-medium text-danger">{f.einwilligung}</p> : null}
      </div>

      <button type="submit" disabled={laeuft} className={buttonClass("primary", "w-full sm:w-auto")}>
        {laeuft ? "Wird gesendet …" : "Ja, rufen Sie mich an"}
      </button>
    </form>
  );
}
