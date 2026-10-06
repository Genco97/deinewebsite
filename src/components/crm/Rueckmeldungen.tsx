import { KopierFeld } from "@/components/crm/KopierFeld";
import { rueckmeldungErledigt } from "@/app/crm/rueckmeldungen/actions";

export type Rueckmeldung = { id: string; art: "passt" | "aendern"; text: string | null; name: string | null; erledigt: boolean; created_at: string };

const ZEIT = new Intl.DateTimeFormat("de-AT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Vienna" });

export function kundenLink(code: string) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${site}/p/${code}`;
}

/** Eine Kunden-Rückmeldung mit „Erledigt“-Knopf */
export function RueckmeldungZeile({ r, zurueck, firma }: { r: Rueckmeldung; zurueck: string; firma?: string }) {
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${r.erledigt ? "border-line bg-bg" : r.art === "passt" ? "border-ok/30 bg-ok-light" : "border-brand/30 bg-brand-light"}`}>
      <span aria-hidden className="pt-0.5 text-lg">
        {r.art === "passt" ? "👍" : "✏️"}
      </span>
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold text-ink">
          {firma ? `${firma}: ` : ""}
          {r.art === "passt" ? "Ja, so nehmen" : "Bitte ändern"}
          <span className="font-normal text-muted">
            {" "}
            · {ZEIT.format(new Date(r.created_at))}
            {r.name ? ` · ${r.name}` : ""}
          </span>
        </p>
        {r.text ? <p className="mt-0.5 whitespace-pre-line text-ink">{r.text}</p> : null}
      </div>
      {!r.erledigt ? (
        <form action={rueckmeldungErledigt}>
          <input type="hidden" name="id" value={r.id} />
          <input type="hidden" name="zurueck" value={zurueck} />
          <button className="min-h-9 rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-ink hover:border-ok hover:text-ok">Erledigt</button>
        </form>
      ) : (
        <span className="text-xs font-semibold text-muted">erledigt</span>
      )}
    </div>
  );
}

/** Privater Link für den Kunden + seine Rückmeldungen */
export function KundenLinkBox({ code, rueckmeldungen, zurueck, id, schmal = false }: { code: string; rueckmeldungen: Rueckmeldung[]; zurueck: string; id: string; schmal?: boolean }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-ink">Kunden-Link (Fortschritt + Rückmeldung zur Demo)</p>
      <KopierFeld wert={kundenLink(code)} label="Kunden-Link" id={`kundenlink-${id}`} schmal={schmal} />
      {rueckmeldungen.length > 0 ? (
        <div className="space-y-1.5 pt-1">
          {rueckmeldungen
            .slice()
            .sort((a, b) => Number(a.erledigt) - Number(b.erledigt) || b.created_at.localeCompare(a.created_at))
            .slice(0, 5)
            .map((r) => (
              <RueckmeldungZeile key={r.id} r={r} zurueck={zurueck} />
            ))}
        </div>
      ) : null}
    </div>
  );
}
