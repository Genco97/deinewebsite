import Link from "next/link";
import { Karte } from "@/components/ui";
import { PAKET_NAMEN, istPaket } from "@/lib/pakete";
import type { FeedEintrag, Sortierung, TeamZeile } from "@/lib/team";

const SPALTEN: { key: Sortierung; label: string; kurz: string }[] = [
  { key: "kontakte", label: "Kontakte", kurz: "Kontakte" },
  { key: "ziel_tage", label: "Tagesziel erreicht", kurz: "Ziel" },
  { key: "besuche", label: "Besuche", kurz: "Besuche" },
  { key: "verkaeufe", label: "Verkäufe", kurz: "Verkäufe" },
];

function Initialen({ name, ich }: { name: string; ich: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${ich ? "bg-brand text-white" : "bg-brand-light text-brand"}`}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

/** E3: Wochentabelle fürs ganze Team – sortierbar über die Spaltenköpfe */
export function TeamTabelle({
  zeilen,
  sortiert,
  link,
}: {
  zeilen: TeamZeile[];
  sortiert: Sortierung;
  /** Link für eine andere Sortierung; ohne Link sind die Köpfe nicht klickbar */
  link?: (s: Sortierung) => string;
}) {
  const max = Math.max(1, ...zeilen.map((z) => z.kontakte));
  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-line bg-bg text-xs uppercase tracking-wide text-muted">
        <tr>
          <th className="w-10 px-4 py-2.5 font-semibold">#</th>
          <th className="px-2 py-2.5 font-semibold">Name</th>
          {SPALTEN.map((s) => {
            const aktiv = s.key === sortiert;
            const inhalt = (
              <>
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.kurz}</span>
                {aktiv ? <span aria-hidden> ▼</span> : null}
              </>
            );
            return (
              <th
                key={s.key}
                aria-sort={aktiv ? "descending" : undefined}
                className={`px-2 py-2.5 text-right font-semibold last:pr-4 ${s.key === "kontakte" ? "" : "hidden sm:table-cell"}`}
              >
                {link ? (
                  <Link href={link(s.key)} className={`inline-flex min-h-8 items-center hover:text-brand ${aktiv ? "text-brand" : ""}`}>
                    {inhalt}
                  </Link>
                ) : (
                  inhalt
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {zeilen.map((z, i) => (
          <tr key={z.profil_id} className={z.ich ? "bg-brand-light/50" : ""}>
            <td className="px-4 py-3 font-semibold text-muted">{i === 0 && z[sortiert] > 0 ? "🏆" : i + 1}</td>
            <td className="px-2 py-3">
              <span className="flex items-center gap-3">
                <Initialen name={z.name} ich={z.ich} />
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">
                    {z.name}
                    {z.ich ? <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Du</span> : null}
                  </span>
                  <span className="block text-xs text-muted sm:hidden">
                    Ziel {z.ziel_tage}× · {z.besuche} Bes. · {z.verkaeufe} Verk.
                  </span>
                </span>
              </span>
            </td>
            <td className="px-2 py-3 text-right last:pr-4">
              <span className="flex items-center justify-end gap-2">
                <span className="hidden h-2 w-24 overflow-hidden rounded-full bg-brand-light md:block" aria-hidden>
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${(z.kontakte / max) * 100}%` }} />
                </span>
                <span className="w-10 font-semibold text-ink">{z.kontakte}</span>
              </span>
            </td>
            <td className="hidden px-2 py-3 text-right text-ink sm:table-cell">
              {z.ziel_tage} <span className="text-muted">{z.ziel_tage === 1 ? "Tag" : "Tage"}</span>
            </td>
            <td className="hidden px-2 py-3 text-right text-ink sm:table-cell">{z.besuche}</td>
            <td className="hidden px-2 py-3 pr-4 text-right font-semibold text-ink sm:table-cell">{z.verkaeufe}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const UHR = new Intl.DateTimeFormat("de-AT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Vienna" });
const TAG = new Intl.DateTimeFormat("de-AT", { weekday: "long", timeZone: "Europe/Vienna" });

function wann(iso: string, jetzt = Date.now()) {
  const min = Math.round((jetzt - Date.parse(iso)) / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min.`;
  if (min < 6 * 60) return `vor ${Math.round(min / 60)} Std.`;
  const tagIso = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Vienna" });
  const d = new Date(iso);
  const heute = tagIso(new Date(jetzt));
  const gestern = tagIso(new Date(jetzt - 86400000));
  if (tagIso(d) === heute) return `heute ${UHR.format(d)}`;
  if (tagIso(d) === gestern) return `gestern ${UHR.format(d)}`;
  return `${TAG.format(d)} ${UHR.format(d)}`;
}

function satz(e: FeedEintrag) {
  const wer = e.ich ? "Du" : e.name;
  switch (e.art) {
    case "verkauf": {
      const [paket, firma] = e.text.split("|");
      const name = istPaket(paket) ? PAKET_NAMEN[paket] : paket;
      return firma
        ? { symbol: "🎉", text: `${wer} ${e.ich ? "hast" : "hat"} ${firma} verkauft`, zusatz: `Paket ${name}` }
        : { symbol: "🎉", text: `${wer} ${e.ich ? "hast" : "hat"} eine Website verkauft`, zusatz: `Paket ${name}` };
    }
    case "demo":
      return { symbol: "🖥️", text: `${wer} ${e.ich ? "hast" : "hat"} eine Demo vereinbart` };
    case "ziel":
      return { symbol: "🎯", text: `${wer} ${e.ich ? "hast" : "hat"} das Tagesziel erreicht`, zusatz: `${e.text} Kontakte` };
    case "neu":
      return { symbol: "👋", text: e.ich ? "Du bist neu im Team – willkommen!" : `${e.name} ist neu im Team – sag Servus!` };
  }
}

const FARBE: Record<FeedEintrag["art"], string> = {
  verkauf: "bg-ok-light",
  demo: "bg-brand-light",
  ziel: "bg-amber-50",
  neu: "bg-brand-light",
};

/** H3: was im Team los ist – Verkäufe, Demos, erreichte Tagesziele, neue Leute */
export function TeamFeed({ eintraege, max = 8 }: { eintraege: FeedEintrag[]; max?: number }) {
  return (
    <Karte className="p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-bold text-ink">Was im Team los ist</h2>
        <Link href="/crm/team" className="text-sm font-semibold text-brand hover:underline">
          Zum Team
        </Link>
      </div>
      {eintraege.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Diese Woche ist noch nichts passiert. Der erste Erfolg landet hier!</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {eintraege.slice(0, max).map((e, i) => {
            const s = satz(e);
            return (
              <li key={`${e.art}-${e.zeit}-${i}`} className="flex items-start gap-3">
                <span aria-hidden className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${FARBE[e.art]}`}>
                  {s.symbol}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug text-ink">{s.text}</span>
                  <span className="block text-xs text-muted">
                    {s.zusatz ? `${s.zusatz} · ` : ""}
                    {wann(e.zeit)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Karte>
  );
}
