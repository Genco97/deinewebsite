"use client";

import { useActionState } from "react";
import { nameSpeichern, passwortAendern, type ProfilStatus } from "./actions";
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
