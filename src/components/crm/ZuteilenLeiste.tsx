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
      className={`mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-brand/30 bg-brand-light px-3 py-1.5 sm:flex-nowrap sm:py-3 ${anzahl > 0 ? "max-sm:fixed max-sm:inset-x-3 max-sm:bottom-3 max-sm:z-30 max-sm:mb-0 max-sm:py-3 max-sm:shadow-xl" : ""}`}
    >
      <input type="hidden" name="zurueck" value={zurueck} />
      <label className="flex min-h-10 items-center gap-3 text-sm font-semibold text-ink">
        <input type="checkbox" onChange={(e) => alle(e.target.checked)} className="h-5 w-5 accent-brand" />
        Alle markieren
      </label>
      <span className="ml-auto text-sm text-muted">{anzahl} markiert</span>
      {/* Am Handy erst sichtbar, wenn etwas markiert ist */}
      <div className={`flex w-full items-center gap-2 sm:w-auto ${anzahl > 0 ? "" : "max-sm:hidden"}`}>
        <label htmlFor="besitzer" className="sr-only">
          Zuteilen an
        </label>
        <Select id="besitzer" name="besitzer" required defaultValue="" className="min-w-0 flex-1 sm:max-w-60">
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
      </div>
    </form>
  );
}
