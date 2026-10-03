"use client";

import { useActionState } from "react";
import { passwortVergessen, type AuthStatus } from "../actions";
import { Feld, Hinweis, Input, buttonClass } from "@/components/ui";

export function PasswortVergessenFormular() {
  const [s, aktion, laeuft] = useActionState<AuthStatus, FormData>(passwortVergessen, {});
  if (s.ok) return <Hinweis art="ok">{s.meldung}</Hinweis>;
  return (
    <form action={aktion} className="space-y-4">
      {s.meldung ? <Hinweis art="fehler">{s.meldung}</Hinweis> : null}
      <Feld label="E-Mail" name="email">
        <Input name="email" type="email" inputMode="email" autoComplete="email" required />
      </Feld>
      <button type="submit" disabled={laeuft} className={buttonClass("primary", "w-full")}>
        {laeuft ? "Wird gesendet …" : "Link zum Zurücksetzen senden"}
      </button>
    </form>
  );
}
