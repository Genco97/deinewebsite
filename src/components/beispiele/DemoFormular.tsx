"use client";

import { useState } from "react";

/** Anfrage-Formular für die Beispiel-Website – sendet nichts. */
export function DemoFormular({ knopf, feld, akzent }: { knopf: string; feld: string; akzent: string }) {
  const [gesendet, setGesendet] = useState(false);
  if (gesendet) {
    return (
      <p role="status" className="rounded-xl p-5 font-semibold" style={{ background: `${akzent}14`, color: akzent }}>
        Danke! Auf einer echten Website kommt Ihre Anfrage jetzt per E-Mail beim Salon an. In diesem Beispiel wird nichts gesendet.
      </p>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setGesendet(true);
      }}
      className="space-y-3"
    >
      <label className="block text-sm font-semibold">
        Name
        <input required className={feld} autoComplete="off" />
      </label>
      <label className="block text-sm font-semibold">
        Telefon oder E-Mail
        <input required className={feld} autoComplete="off" />
      </label>
      <label className="block text-sm font-semibold">
        Ihr Wunsch
        <textarea rows={3} className={feld} placeholder="z. B. Balayage, am liebsten Samstag" />
      </label>
      <button className="min-h-11 w-full rounded-full px-6 font-semibold text-white" style={{ background: akzent }}>
        {knopf}
      </button>
    </form>
  );
}
