"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { demoAnfordern, type FormStatus } from "@/app/(public)/actions";
import { Feld, Hinweis, Input, Textarea, buttonClass } from "@/components/ui";
import { EINWILLIGUNG_TEXT } from "@/lib/einwilligung";
import type { PaketId } from "@/lib/pakete";
import { Honeypot } from "./Honeypot";

const SCHRITT_1 = ["firma", "name", "erreichbar", "agb"];

/** Zwei Schritte: erst nur das Nötigste, dann optional mehr. Beides steckt im selben Formular. */
export function DemoFormular({ paket, button, vorgabe }: { paket: PaketId; button: string; vorgabe?: Record<string, string> }) {
  const [status, aktion, laeuft] = useActionState<FormStatus, FormData>(demoAnfordern, {});
  const [schritt, setSchritt] = useState<1 | 2>(1);
  const [fehler1, setFehler1] = useState<Record<string, string>>({});
  const [letzterStatus, setLetzterStatus] = useState(status);
  const form = useRef<HTMLFormElement>(null);
  const w = status.werte ?? vorgabe ?? {};

  // Kommt vom Server ein Fehler aus Schritt 1 zurück, zeigen wir wieder Schritt 1
  if (status !== letzterStatus) {
    setLetzterStatus(status);
    if (status.fehler && SCHRITT_1.some((k) => status.fehler?.[k])) setSchritt(1);
    setFehler1({});
  }
  const f = { ...(status.fehler ?? {}), ...fehler1 };

  function weiter() {
    const fd = new FormData(form.current!);
    const wert = (k: string) => String(fd.get(k) ?? "").trim();
    const neu: Record<string, string> = {};
    if (!wert("firma")) neu.firma = "Bitte geben Sie den Namen Ihres Betriebs an.";
    if (!wert("name")) neu.name = "Bitte geben Sie Ihren Namen an.";
    if (!wert("erreichbar")) neu.erreichbar = "Bitte geben Sie eine Telefonnummer oder E-Mail-Adresse an.";
    if (fd.get("agb") !== "on") neu.agb = "Bitte bestätigen Sie die AGB und die Datenschutzerklärung.";
    setFehler1(neu);
    if (Object.keys(neu).length === 0) setSchritt(2);
  }

  return (
    <form ref={form} action={aktion} noValidate className="relative">
      <Honeypot />
      <input type="hidden" name="paket" value={paket} />

      <div className="mb-5" aria-hidden>
        <div className="flex gap-1.5">
          <span className="h-1.5 flex-1 rounded-full bg-brand" />
          <span className={`h-1.5 flex-1 rounded-full transition-colors ${schritt === 2 ? "bg-brand" : "bg-line"}`} />
        </div>
      </div>
      <p className="text-sm font-semibold uppercase tracking-wide text-brand" aria-live="polite">
        {schritt === 1 ? "Schritt 1 von 2 · dauert 30 Sekunden" : "Schritt 2 von 2 · alles freiwillig"}
      </p>
      <h2 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
        {schritt === 1 ? "Wie erreichen wir Sie?" : "Möchten Sie uns mehr verraten?"}
      </h2>

      {status.meldung && schritt === 1 && Object.keys(f).length > 0 ? (
        <div className="mt-4">
          <Hinweis art="fehler">{status.meldung}</Hinweis>
        </div>
      ) : null}
      {status.meldung && !status.fehler ? (
        <div className="mt-4">
          <Hinweis art="fehler">{status.meldung}</Hinweis>
        </div>
      ) : null}

      {/* Schritt 1 */}
      <div className={`mt-5 space-y-4 ${schritt === 1 ? "" : "hidden"}`}>
        <Feld label="Name Ihres Betriebs" name="firma" pflicht fehler={f.firma}>
          <Input name="firma" autoComplete="organization" defaultValue={w.firma} aria-invalid={!!f.firma} />
        </Feld>
        <Feld label="Ihr Name" name="name" pflicht fehler={f.name}>
          <Input name="name" autoComplete="name" defaultValue={w.name} aria-invalid={!!f.name} />
        </Feld>
        <Feld label="Telefon oder E-Mail" name="erreichbar" pflicht fehler={f.erreichbar} hinweis="Eins von beiden genügt.">
          <Input name="erreichbar" inputMode="email" autoComplete="email" defaultValue={w.erreichbar} aria-invalid={!!f.erreichbar} />
        </Feld>
        <div className="space-y-1.5">
          <label className="flex min-h-11 items-start gap-3 text-sm text-muted">
            <input type="checkbox" name="agb" defaultChecked={w.agb === "on"} className="mt-1 h-5 w-5 shrink-0 accent-brand" />
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
        <button type="button" onClick={weiter} className={buttonClass("primary", "w-full")}>
          Weiter
        </button>
        <p className="text-center text-sm text-muted">Danach optional: Branche, Wünsche und ein zweiter Kontaktweg.</p>
      </div>

      {/* Schritt 2 */}
      <div className={`mt-5 space-y-4 ${schritt === 2 ? "" : "hidden"}`}>
        <Feld label="Branche" name="branche" hinweis="z. B. Friseur, Tischlerei, Café">
          <Input name="branche" defaultValue={w.branche} />
        </Feld>
        <Feld label="Ihre Wünsche" name="wuensche" hinweis="Was soll die Website können? Gibt es eine bestehende Seite?">
          <Textarea name="wuensche" rows={4} defaultValue={w.wuensche} />
        </Feld>
        <Feld label="Zweiter Kontaktweg" name="zweit" fehler={f.zweit} hinweis="Falls Sie oben nur eins angegeben haben: Telefon oder E-Mail zusätzlich.">
          <Input name="zweit" inputMode="email" defaultValue={w.zweit} aria-invalid={!!f.zweit} />
        </Feld>

        <label className="flex min-h-11 items-start gap-3 text-sm text-muted">
          <input type="checkbox" name="kontakt" defaultChecked={w.kontakt === "on"} className="mt-1 h-5 w-5 shrink-0 accent-brand" />
          <span>
            {EINWILLIGUNG_TEXT} <span className="text-muted/80">(freiwillig)</span>
          </span>
        </label>

        <div className="flex items-center justify-between rounded-lg border border-line bg-bg px-4 py-3">
          <span className="text-sm font-semibold text-ink">Heute fällig</span>
          <span className="font-serif text-2xl font-semibold text-ink">0 €</span>
        </div>

        <button type="submit" disabled={laeuft} className={buttonClass("primary", "w-full")}>
          {laeuft ? "Wird gesendet …" : button}
        </button>
        <button type="button" onClick={() => setSchritt(1)} className="flex min-h-11 w-full items-center justify-center text-sm font-medium text-muted hover:text-ink">
          ← Zurück zu Schritt 1
        </button>
        <p className="text-center text-sm text-muted">
          {paket === "premium"
            ? "Unverbindlich. Eine Anzahlung wird erst nach dem Erstgespräch fällig."
            : "Unverbindlich. Sie zahlen erst, wenn Ihnen die Website gefällt."}
        </p>
      </div>
    </form>
  );
}
