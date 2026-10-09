"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Auswahl im Tabellenkopf: filtert die Liste sofort nach einem Wert (z. B. Branche) */
export function SpaltenFilter({ name, titel, werte }: { name: string; titel: string; werte: string[] }) {
  const router = useRouter();
  const pfad = usePathname();
  const sp = useSearchParams();
  const aktuell = sp.get(name) ?? "";
  return (
    <label className="inline-flex items-center gap-1">
      <span className="sr-only">{titel} filtern</span>
      <select
        value={aktuell}
        onChange={(e) => {
          const p = new URLSearchParams(sp);
          if (e.target.value) p.set(name, e.target.value);
          else p.delete(name);
          p.delete("ok");
          p.delete("fehler");
          router.push(p.size ? `${pfad}?${p}` : pfad);
        }}
        className={`max-w-40 cursor-pointer rounded-md border bg-surface py-1 pl-2 pr-6 text-xs font-semibold uppercase tracking-wide ${
          aktuell ? "border-brand text-brand" : "border-line text-muted"
        }`}
      >
        <option value="">{titel}: alle</option>
        {aktuell && !werte.includes(aktuell) ? <option value={aktuell}>{aktuell}</option> : null}
        {werte.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>
    </label>
  );
}
