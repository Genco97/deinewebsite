"use client";

import { useState } from "react";
import { inputClass } from "@/components/ui";
import type { SchrittVorgabe } from "@/lib/schritt";
import { heuteWien } from "@/lib/zeit";

/**
 * Pflichtfelder „Wie geht es weiter?“ – vorbeischauen (Tag) oder anrufen/erinnern (Tag + Uhrzeit).
 * Anrufen wird nur angeboten, wenn der Betrieb eingewilligt hat.
 */
export function NaechsterSchritt({ vorgabe, anrufOk, idPrefix }: { vorgabe: SchrittVorgabe; anrufOk: boolean; idPrefix: string }) {
  const [art, setArt] = useState(vorgabe.art);
  const knopf = (aktiv: boolean) =>
    `flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-semibold ${
      aktiv ? "border-brand bg-brand-light text-brand" : "border-line text-ink hover:border-brand"
    }`;
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-semibold text-ink">Wie geht es weiter?</legend>
      <div className="flex gap-2">
        <label className={knopf(art === "besuch")}>
          <input type="radio" name="schritt_art" value="besuch" checked={art === "besuch"} onChange={() => setArt("besuch")} className="sr-only" />
          Vorbeischauen
        </label>
        <label className={knopf(art === "rueckruf")}>
          <input type="radio" name="schritt_art" value="rueckruf" checked={art === "rueckruf"} onChange={() => setArt("rueckruf")} className="sr-only" />
          {anrufOk ? "Anrufen" : "Erinnern"}
        </label>
      </div>
      <div className="flex gap-2">
        <label htmlFor={`${idPrefix}-tag`} className="sr-only">
          Tag
        </label>
        <input id={`${idPrefix}-tag`} name="schritt_tag" type="date" min={heuteWien()} defaultValue={vorgabe.tag} required className={inputClass} />
        {art === "rueckruf" ? (
          <>
            <label htmlFor={`${idPrefix}-zeit`} className="sr-only">
              Uhrzeit
            </label>
            <input id={`${idPrefix}-zeit`} name="schritt_zeit" type="time" defaultValue={vorgabe.zeit} className={`${inputClass} w-32 shrink-0`} />
          </>
        ) : null}
      </div>
      {art === "rueckruf" && !anrufOk ? (
        <p className="text-xs text-amber-800">Ohne Einwilligung nicht anrufen – nur als Erinnerung, z. B. für einen vereinbarten Termin.</p>
      ) : null}
    </fieldset>
  );
}
