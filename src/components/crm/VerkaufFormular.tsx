"use client";

import { useActionState, useState } from "react";
import { verkaufMelden, type AktionStatus } from "@/app/crm/leads/actions";
import { Feld, Hinweis, Input, buttonClass } from "@/components/ui";
import { PAKETE, type PaketId } from "@/lib/pakete";

export function VerkaufFormular({ leadId }: { leadId: string }) {
  const [s, aktion, laeuft] = useActionState<AktionStatus, FormData>(verkaufMelden, {});
  const [paket, setPaket] = useState<PaketId>("business");
  if (s.ok) return <Hinweis art="ok">{s.meldung}</Hinweis>;

  return (
    <form action={aktion} className="space-y-3">
      <input type="hidden" name="id" value={leadId} />
      {s.meldung ? <Hinweis art="fehler">{s.meldung}</Hinweis> : null}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">Paket</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {PAKETE.map((p) => (
            <label
              key={p.id}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 ${
                paket === p.id ? "border-brand bg-brand-light" : "border-line bg-surface"
              }`}
            >
              <input
                type="radio"
                name="paket"
                value={p.id}
                checked={paket === p.id}
                onChange={() => setPaket(p.id)}
                className="h-5 w-5 accent-brand"
              />
              <span>
                <span className="block font-semibold text-ink">{p.name}</span>
                <span className="block text-sm text-muted">
                  {p.ab ? "ab " : ""}
                  {p.preisText}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {paket === "premium" ? (
        <Feld label="Vereinbarter Betrag (€)" name="betrag" hinweis="Mindestens 2.000 €">
          <Input name="betrag" inputMode="decimal" placeholder="2000" required />
        </Feld>
      ) : null}
      <button disabled={laeuft} className={buttonClass("primary", "w-full sm:w-auto")}>
        {laeuft ? "Wird gemeldet …" : "Verkauf melden"}
      </button>
    </form>
  );
}
