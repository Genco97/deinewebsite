"use client";

import { useEffect, useState } from "react";
import { buttonClass, inputClass } from "@/components/ui";

/** Feste Leiste unten: wie viele Betriebe gewählt sind, für welchen Tag, einplanen. Die Häkchen stehen in der Liste (name="ids"). */
export function EinplanenLeiste({ tag, heute }: { tag: string; heute: string }) {
  const [anzahl, setAnzahl] = useState(0);
  const boxen = () => [...document.querySelectorAll<HTMLInputElement>('input[name="ids"][data-einplanen]')];

  useEffect(() => {
    const zaehlen = () => setAnzahl(boxen().filter((i) => i.checked).length);
    document.addEventListener("change", zaehlen);
    return () => document.removeEventListener("change", zaehlen);
  }, []);

  function alle() {
    const an = boxen().some((i) => !i.checked);
    boxen().forEach((i) => (i.checked = an));
    setAnzahl(an ? boxen().length : 0);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2 sm:px-5">
        <span className="text-sm text-muted">{anzahl > 0 ? `${anzahl} gewählt` : "Tippe die Betriebe an, die du besuchen willst."}</span>
        <button type="button" onClick={alle} className={buttonClass("secondary", "px-3 text-sm")}>
          {anzahl > 0 && anzahl === boxen().length ? "Keinen wählen" : "Alle wählen"}
        </button>
      </div>
      {anzahl > 0 ? (
        <div className="fixed inset-x-3 bottom-3 z-30 flex flex-wrap items-center gap-2 rounded-xl bg-brand px-4 py-3 text-white shadow-xl md:left-[calc(16rem+0.75rem)] print:hidden">
          <span className="font-semibold">{anzahl} gewählt · einplanen für</span>
          <input name="tag" type="date" defaultValue={tag} min={heute} required aria-label="Besuchen am" className={`${inputClass} w-44 text-ink`} />
          <button className={buttonClass("secondary", "ml-auto")}>Einplanen</button>
        </div>
      ) : null}
    </>
  );
}
