"use client";

import { useActionState } from "react";
import { nameSpeichern, passwortAendern, tageszielSpeichern, type ProfilStatus } from "./actions";
import { Feld, Hinweis, Input, buttonClass } from "@/components/ui";

export function NameFormular({ name }: { name: string }) {
  const [s, aktion, laeuft] = useActionState<ProfilStatus, FormData>(nameSpeichern, {});
  return (
    <form action={aktion} className="space-y-3">
      {s.meldung ? <Hinweis art={s.ok ? "ok" : "fehler"}>{s.meldung}</Hinweis> : null}
      <Feld label="Dein Name" name="name" hinweis="So sehen dich die anderen im CRM.">
        <Input name="name" defaultValue={name} autoComplete="name" required />
      </Feld>
      <button disabled={laeuft} className={buttonClass("primary", "w-full sm:w-auto")}>
        {laeuft ? "Speichert …" : "Name speichern"}
      </button>
    </form>
  );
}

export function TageszielFormular({ ziel }: { ziel: number }) {
  const [s, aktion, laeuft] = useActionState<ProfilStatus, FormData>(tageszielSpeichern, {});
  return (
    <form action={aktion} className="space-y-3">
      {s.meldung ? <Hinweis art={s.ok ? "ok" : "fehler"}>{s.meldung}</Hinweis> : null}
      <Feld
        label="Kontakte pro Tag"
        name="tagesziel"
        hinweis="Zählt jeden Lead, bei dem du heute etwas einträgst: Notiz, Status, Rückruf, Besuch oder Verkauf."
      >
        <Input name="tagesziel" type="number" inputMode="numeric" min={1} max={500} defaultValue={ziel} required />
      </Feld>
      <button disabled={laeuft} className={buttonClass("secondary", "w-full sm:w-auto")}>
        {laeuft ? "Speichert …" : "Tagesziel speichern"}
      </button>
    </form>
  );
}

export function PasswortFormular() {
  const [s, aktion, laeuft] = useActionState<ProfilStatus, FormData>(passwortAendern, {});
  return (
    <form action={aktion} className="space-y-3">
      {s.meldung ? <Hinweis art={s.ok ? "ok" : "fehler"}>{s.meldung}</Hinweis> : null}
      <Feld label="Neues Passwort" name="passwort" hinweis="Mindestens 8 Zeichen">
        <Input name="passwort" type="password" autoComplete="new-password" minLength={8} required />
      </Feld>
      <Feld label="Neues Passwort wiederholen" name="passwort2">
        <Input name="passwort2" type="password" autoComplete="new-password" minLength={8} required />
      </Feld>
      <button disabled={laeuft} className={buttonClass("secondary", "w-full sm:w-auto")}>
        {laeuft ? "Speichert …" : "Passwort ändern"}
      </button>
    </form>
  );
}
