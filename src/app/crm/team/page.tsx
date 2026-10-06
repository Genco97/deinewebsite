import type { Metadata } from "next";
import Link from "next/link";
import { Kopf } from "@/components/crm/Kopf";
import { TeamFeed, TeamTabelle } from "@/components/crm/Team";
import { Karte } from "@/components/ui";
import { holeProfil } from "@/lib/crm";
import { SORTIERUNG, sortiere, teamFeed, teamWoche, type Sortierung, type TeamZeile } from "@/lib/team";
import { wienGrenzen } from "@/lib/zeit";

export const metadata: Metadata = { title: "Team" };

const TAG = new Intl.DateTimeFormat("de-AT", { day: "numeric", month: "numeric", timeZone: "Europe/Vienna" });

function Bestwert({ titel, zeilen, key_, einheit }: { titel: string; zeilen: TeamZeile[]; key_: keyof TeamZeile; einheit: string }) {
  const best = [...zeilen].sort((a, b) => Number(b[key_]) - Number(a[key_]))[0];
  const wert = best ? Number(best[key_]) : 0;
  return (
    <Karte className="p-4 sm:p-5">
      <p className="text-sm text-muted">{titel}</p>
      {wert > 0 ? (
        <>
          <p className="mt-1 font-serif text-2xl font-semibold text-ink">{best.ich ? "Du" : best.name}</p>
          <p className="text-sm font-semibold text-brand">
            {wert} {einheit}
          </p>
        </>
      ) : (
        <p className="mt-1 font-serif text-2xl font-semibold text-muted">noch offen</p>
      )}
    </Karte>
  );
}

export default async function TeamSeite({ searchParams }: PageProps<"/crm/team">) {
  await holeProfil();
  const sp = await searchParams;
  const woche = Math.max(-8, Math.min(0, Number(sp.woche) || 0));
  const sortiert: Sortierung = SORTIERUNG.includes(sp.sort as Sortierung) ? (sp.sort as Sortierung) : "kontakte";

  // Montag dieser Woche ± n Wochen (12 Uhr als Anker, damit die Zeitumstellung nicht stört)
  const montag = Date.parse(wienGrenzen().wocheStart) + 12 * 3600000;
  const von = wienGrenzen(new Date(montag + woche * 7 * 86400000)).wocheStart;
  const bis = wienGrenzen(new Date(montag + (woche + 1) * 7 * 86400000)).wocheStart;
  const [zeilen, feed] = await Promise.all([teamWoche(von, bis), teamFeed(7)]);
  const sortierteZeilen = sortiere(zeilen, sortiert);

  const summe = (k: "kontakte" | "besuche" | "verkaeufe") => zeilen.reduce((s, z) => s + z[k], 0);
  const link = (s: Sortierung, w = woche) => `/crm/team?${new URLSearchParams({ ...(w ? { woche: String(w) } : {}), ...(s !== "kontakte" ? { sort: s } : {}) })}`;
  const sonntag = new Date(Date.parse(bis) - 86400000);

  return (
    <>
      <Kopf
        titel={woche === 0 ? "Team diese Woche" : "Team in der Woche"}
        text={`${TAG.format(new Date(von))} – ${TAG.format(sonntag)} · gemeinsam ${summe("kontakte")} Kontakte, ${summe("besuche")} Besuche, ${summe("verkaeufe")} Verkäufe`}
      >
        <Link href={link(sortiert, woche - 1)} className="inline-flex min-h-11 items-center rounded-lg border border-line bg-surface px-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand">
          ← Woche davor
        </Link>
        {woche < 0 ? (
          <Link href={link(sortiert, woche + 1)} className="inline-flex min-h-11 items-center rounded-lg border border-line bg-surface px-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand">
            {woche === -1 ? "Diese Woche" : "Woche danach"} →
          </Link>
        ) : null}
      </Kopf>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Bestwert titel="Meiste Kontakte" zeilen={zeilen} key_="kontakte" einheit="Kontakte" />
        <Bestwert titel="Am öftesten Tagesziel" zeilen={zeilen} key_="ziel_tage" einheit="Tage" />
        <Bestwert titel="Meiste Besuche" zeilen={zeilen} key_="besuche" einheit="Besuche" />
        <Bestwert titel="Meiste Verkäufe" zeilen={zeilen} key_="verkaeufe" einheit="Verkäufe" />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Karte className="overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <h2 className="font-bold text-ink">Wer hat was geschafft?</h2>
            <p className="text-sm text-muted">Tipp auf eine Spalte, um danach zu sortieren. Ein Kontakt zählt je Lead und Tag einmal.</p>
            <nav aria-label="Sortieren" className="mt-2 flex flex-wrap gap-1.5 sm:hidden">
              {([["kontakte", "Kontakte"], ["ziel_tage", "Ziel"], ["besuche", "Besuche"], ["verkaeufe", "Verkäufe"]] as const).map(([k, l]) => (
                <Link
                  key={k}
                  href={link(k)}
                  aria-current={k === sortiert ? "true" : undefined}
                  className={`inline-flex min-h-9 items-center rounded-full border px-3 text-sm font-semibold ${k === sortiert ? "border-brand bg-brand text-white" : "border-line text-ink"}`}
                >
                  {l}
                </Link>
              ))}
            </nav>
          </div>
          <TeamTabelle zeilen={sortierteZeilen} sortiert={sortiert} link={(s) => link(s)} />
        </Karte>
        <TeamFeed eintraege={feed} max={12} />
      </div>
    </>
  );
}
