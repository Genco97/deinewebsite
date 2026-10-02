"use client";

import Link from "next/link";
import { useActionState } from "react";
import { demoAnfordern, type FormStatus } from "@/app/(public)/actions";
import { Feld, Hinweis, Input, Textarea, buttonClass } from "@/components/ui";
import type { PaketId } from "@/lib/pakete";
import { Honeypot } from "./Honeypot";

export function DemoFormular({ paket, button }: { paket: PaketId; button: string }) {
  const [status, aktion, laeuft] = useActionState<FormStatus, FormData>(demoAnfordern, {});
  const w = status.werte ?? {};
  const f = status.fehler ?? {};

  return (
    <form action={aktion} noValidate className="relative space-y-4">
      <Honeypot />
      <input type="hidden" name="paket" value={paket} />
      {status.meldung ? <Hinweis art="fehler">{status.meldung}</Hinweis> : null}

      <Feld label="Name Ihres Betriebs" name="firma" pflicht fehler={f.firma}>
        <Input name="firma" autoComplete="organization" defaultValue={w.firma} required aria-invalid={!!f.firma} />
      </Feld>
      <Feld label="Ihr Name" name="name" pflicht fehler={f.name}>
        <Input name="name" autoComplete="name" defaultValue={w.name} required aria-invalid={!!f.name} />
      </Feld>
      <div className="grid gap-4 sm:grid-cols-2">
        <Feld label="E-Mail" name="email" pflicht fehler={f.email}>
          <Input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            defaultValue={w.email}
            required
            aria-invalid={!!f.email}
          />
        </Feld>
        <Feld label="Telefon" name="telefon" fehler={f.telefon} hinweis="Für kurze Rückfragen">
          <Input
            name="telefon"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={w.telefon}
            aria-invalid={!!f.telefon}
          />
        </Feld>
      </div>
      <Feld label="Branche" name="branche" hinweis="z. B. Friseur, Tischlerei, Café">
        <Input name="branche" defaultValue={w.branche} />
      </Feld>
      <Feld label="Ihre Wünsche" name="wuensche" hinweis="Was soll die Website können? Gibt es eine bestehende Seite?">
        <Textarea name="wuensche" rows={4} defaultValue={w.wuensche} />
      </Feld>

      <div className="space-y-1.5">
        <label className="flex min-h-11 items-start gap-3 text-sm text-muted">
          <input type="checkbox" name="agb" className="mt-1 h-5 w-5 shrink-0 accent-brand" />
          <span>
            Ich akzeptiere die{" "}
            <Link href="/agb" target="_blank" className="text-brand underline">
              AGB
            </Link>{" "}
            und habe die{" "}
            <Link href="/datenschutz" target="_blank" className="text-brand underline">
              Datenschutzerklärung
            </Link>{" "}
            gelesen.
          </span>
        </label>
        {f.agb ? <p className="text-sm font-medium text-danger">{f.agb}</p> : null}
      </div>

      <div className="flex items-center justify-between rounded-lg border border-line bg-bg px-4 py-3">
        <span className="text-sm font-semibold text-ink">Heute fällig</span>
        <span className="font-serif text-2xl font-semibold text-ink">0 €</span>
      </div>

      <button type="submit" disabled={laeuft} className={buttonClass("primary", "w-full")}>
        {laeuft ? "Wird gesendet …" : button}
      </button>
      <p className="text-center text-sm text-muted">
        {paket === "premium"
          ? "Unverbindlich. Eine Anzahlung wird erst nach dem Erstgespräch fällig."
          : "Unverbindlich. Sie zahlen erst, wenn Ihnen die Website gefällt."}
      </p>
    </form>
  );
}
