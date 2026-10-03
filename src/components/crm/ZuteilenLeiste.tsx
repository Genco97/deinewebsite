"use client";

import { useEffect, useState } from "react";
import { leadsZuteilen } from "@/app/crm/leads/actions";
import { Select, buttonClass } from "@/components/ui";
import type { Person } from "@/lib/crm";

/** Gründer: markierte Leads einer Person zuteilen. Die Häkchen stehen in der Liste (form="zuteilen"). */
export function ZuteilenLeiste({ personen, zurueck }: { personen: Person[]; zurueck: string }) {
  const [anzahl, setAnzahl] = useState(0);

  const sichtbare = () =>
    [...document.querySelectorAll<HTMLInputElement>('input[name="ids"][form="zuteilen"]')].filter(
      (i) => i.offsetParent !== null,
    );

  useEffect(() => {
    const zaehlen = () => setAnzahl(new Set(sichtbare().filter((i) => i.checked).map((i) => i.value)).size);
    document.addEventListener("change", zaehlen);
    return () => document.removeEventListener("change", zaehlen);
  }, []);

  function alle(an: boolean) {
    sichtbare().forEach((i) => (i.checked = an));
    setAnzahl(an ? sichtbare().length : 0);
  }

  return (
    <form
      id="zuteilen"
      action={leadsZuteilen}
      className="mb-4 flex flex-col gap-2 rounded-xl border border-brand/30 bg-brand-light p-3 sm:flex-row sm:items-center"
    >
      <input type="hidden" name="zurueck" value={zurueck} />
      <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-ink">
        <input type="checkbox" onChange={(e) => alle(e.target.checked)} className="h-5 w-5 accent-brand" />
        Alle markieren
      </label>
      <span className="text-sm text-muted sm:mr-auto">{anzahl} markiert</span>
      <label htmlFor="besitzer" className="sr-only">
        Zuteilen an
      </label>
      <Select id="besitzer" name="besitzer" required defaultValue="" className="sm:max-w-60">
        <option value="" disabled>
          Zuteilen an …
        </option>
        {personen.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name.trim() || p.email}
            {p.rolle === "admin" ? " (Gründer)" : ""}
          </option>
        ))}
      </Select>
      <button disabled={anzahl === 0} className={buttonClass("primary")}>
        Zuteilen
      </button>
    </form>
  );
}
