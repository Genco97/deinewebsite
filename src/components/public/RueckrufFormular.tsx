"use client";

import Link from "next/link";
import { useActionState } from "react";
import { rueckrufAnfordern, type FormStatus } from "@/app/(public)/actions";
import { Feld, Hinweis, Input, Textarea, buttonClass } from "@/components/ui";
import { Honeypot } from "./Honeypot";

export function RueckrufFormular() {
  const [status, aktion, laeuft] = useActionState<FormStatus, FormData>(rueckrufAnfordern, {});
  const w = status.werte ?? {};
  const f = status.fehler ?? {};

  return (
    <form action={aktion} noValidate className="relative space-y-4">
      <Honeypot />
      {status.meldung ? <Hinweis art="fehler">{status.meldung}</Hinweis> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Feld label="Ihr Name" name="name" pflicht fehler={f.name}>
          <Input name="name" autoComplete="name" defaultValue={w.name} required aria-invalid={!!f.name} />
        </Feld>
        <Feld label="Telefonnummer" name="telefon" pflicht fehler={f.telefon}>
          <Input
            name="telefon"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={w.telefon}
            required
            aria-invalid={!!f.telefon}
          />
        </Feld>
      </div>
      <Feld label="Betrieb" name="firma">
        <Input name="firma" autoComplete="organization" defaultValue={w.firma} />
      </Feld>
      <Feld label="Wann erreichen wir Sie am besten?" name="wuensche">
        <Textarea name="wuensche" rows={3} defaultValue={w.wuensche} placeholder="z. B. Dienstag am Vormittag" />
      </Feld>

      <div className="space-y-1.5">
        <label className="flex min-h-11 items-start gap-3 text-sm text-muted">
          <input type="checkbox" name="datenschutz" className="mt-1 h-5 w-5 shrink-0 accent-brand" />
          <span>
            Ich möchte zurückgerufen werden und bin einverstanden, dass Sie mich dazu anrufen und meine Angaben
            dafür verwenden. Mehr in der{" "}
            <Link href="/datenschutz" className="text-brand underline">
              Datenschutzerklärung
            </Link>
            .
          </span>
        </label>
        {f.datenschutz ? <p className="text-sm font-medium text-danger">{f.datenschutz}</p> : null}
      </div>

      <button type="submit" disabled={laeuft} className={buttonClass("primary", "w-full sm:w-auto")}>
        {laeuft ? "Wird gesendet …" : "Rückruf anfordern"}
      </button>
    </form>
  );
}
