"use client";

import { useActionState } from "react";
import { registrieren, type AuthStatus } from "../actions";
import { Feld, Hinweis, Input, buttonClass } from "@/components/ui";

export function RegistrierenFormular({ code }: { code: string }) {
  const [s, aktion, laeuft] = useActionState<AuthStatus, FormData>(registrieren, {});
  if (s.ok) return <Hinweis art="ok">{s.meldung}</Hinweis>;
  const f = s.fehler ?? {};
  return (
    <form action={aktion} noValidate className="space-y-4">
      <input type="hidden" name="code" value={code} />
      {s.meldung ? <Hinweis art="fehler">{s.meldung}</Hinweis> : null}
      <Feld label="Dein Name" name="name" fehler={f.name}>
        <Input name="name" autoComplete="name" required />
      </Feld>
      <Feld label="E-Mail" name="email" fehler={f.email}>
        <Input name="email" type="email" inputMode="email" autoComplete="email" defaultValue={s.email} required />
      </Feld>
      <Feld label="Passwort" name="passwort" fehler={f.passwort} hinweis="Mindestens 8 Zeichen">
        <Input name="passwort" type="password" autoComplete="new-password" minLength={8} required />
      </Feld>
      <button type="submit" disabled={laeuft} className={buttonClass("primary", "w-full")}>
        {laeuft ? "Konto wird angelegt …" : "Konto anlegen"}
      </button>
    </form>
  );
}
