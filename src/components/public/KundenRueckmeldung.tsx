"use client";

import { useActionState, useState } from "react";
import { kundenRueckmeldung, type FormStatus } from "@/app/(public)/actions";
import { Feld, Hinweis, Input, Textarea, buttonClass } from "@/components/ui";
import { Honeypot } from "./Honeypot";

/** I1: „Ja, so nehmen“ oder „Etwas ändern“ – geht direkt an die betreuende Person */
export function KundenRueckmeldung({ code }: { code: string }) {
  const [status, aktion, laeuft] = useActionState<FormStatus, FormData>(kundenRueckmeldung, {});
  const [art, setArt] = useState<"passt" | "aendern" | null>((status.werte?.art as "passt" | "aendern") ?? null);
  const f = status.fehler ?? {};

  if (status.ok) {
    return (
      <div role="status" className="rounded-xl bg-ok-light p-5">
        <p className="text-lg font-bold text-ok">{status.werte?.art === "passt" ? "Danke – wir machen Ihre Website fertig! 🎉" : "Danke, Ihre Wünsche sind angekommen!"}</p>
        <p className="mt-1 text-ink">
          {status.werte?.art === "passt"
            ? "Wir melden uns, sobald die Seite online geht."
            : "Wir setzen Ihre Änderungen um und melden uns, sobald Sie sich die neue Version ansehen können."}
        </p>
      </div>
    );
  }

  return (
    <form action={aktion} noValidate className="relative space-y-4">
      <Honeypot />
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="art" value={art ?? ""} />
      {status.meldung ? <Hinweis art="fehler">{status.meldung}</Hinweis> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          aria-pressed={art === "passt"}
          onClick={() => setArt("passt")}
          className={`flex min-h-20 flex-col items-center justify-center rounded-xl border-2 px-4 py-3 text-lg font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] motion-reduce:transform-none ${
            art === "passt" ? "border-ok bg-ok-light text-ok" : "border-line bg-surface text-ink hover:border-ok"
          }`}
        >
          <span aria-hidden className="text-2xl">
            👍
          </span>
          Ja, so nehmen
        </button>
        <button
          type="button"
          aria-pressed={art === "aendern"}
          onClick={() => setArt("aendern")}
          className={`flex min-h-20 flex-col items-center justify-center rounded-xl border-2 px-4 py-3 text-lg font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] motion-reduce:transform-none ${
            art === "aendern" ? "border-brand bg-brand-light text-brand" : "border-line bg-surface text-ink hover:border-brand"
          }`}
        >
          <span aria-hidden className="text-2xl">
            ✏️
          </span>
          Etwas ändern
        </button>
      </div>

      {art ? (
        <>
          <Feld
            label={art === "aendern" ? "Was sollen wir ändern?" : "Möchten Sie noch etwas dazusagen?"}
            name="text"
            pflicht={art === "aendern"}
            hinweis={art === "aendern" ? "Am besten alles auf einmal – z. B. „Logo größer, Öffnungszeiten am Samstag bis 14 Uhr“." : "Optional"}
            fehler={f.text}
          >
            <Textarea name="text" rows={4} defaultValue={status.werte?.text} aria-invalid={!!f.text} />
          </Feld>
          <Feld label="Ihr Name" name="name" hinweis="Optional">
            <Input name="name" autoComplete="name" defaultValue={status.werte?.name} />
          </Feld>
          <button disabled={laeuft} className={buttonClass("primary", "w-full sm:w-auto sm:px-8")}>
            {laeuft ? "Wird gesendet …" : art === "passt" ? "Freigeben" : "Änderungen senden"}
          </button>
        </>
      ) : null}
    </form>
  );
}
