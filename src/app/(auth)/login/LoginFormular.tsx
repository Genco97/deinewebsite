"use client";

import { useActionState } from "react";
import { anmelden, type AuthStatus } from "../actions";
import { Feld, Hinweis, Input, buttonClass } from "@/components/ui";

export function LoginFormular({ weiter }: { weiter: string }) {
  const [s, aktion, laeuft] = useActionState<AuthStatus, FormData>(anmelden, {});
  return (
    <form action={aktion} className="space-y-4">
      <input type="hidden" name="weiter" value={weiter} />
      {s.meldung ? <Hinweis art="fehler">{s.meldung}</Hinweis> : null}
      <Feld label="E-Mail" name="email">
        <Input name="email" type="email" autoComplete="email" inputMode="email" defaultValue={s.email} required />
      </Feld>
      <Feld label="Passwort" name="passwort">
        <Input name="passwort" type="password" autoComplete="current-password" required />
      </Feld>
      <button type="submit" disabled={laeuft} className={buttonClass("primary", "w-full")}>
        {laeuft ? "Anmelden …" : "Anmelden"}
      </button>
    </form>
  );
}
