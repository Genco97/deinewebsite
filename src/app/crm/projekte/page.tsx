import type { Metadata } from "next";
import Link from "next/link";
import { Kopf } from "@/components/crm/Kopf";
import { KundenLinkBox, type Rueckmeldung } from "@/components/crm/Rueckmeldungen";
import { Hinweis, Karte, buttonClass, inputClass } from "@/components/ui";
import { BETREUUNG, BETREUUNG_LABEL, sorglosStandard, type Betreuung } from "@/lib/betreuung";
import { holeProfil } from "@/lib/crm";
import { PAKET_NAMEN, type PaketId } from "@/lib/pakete";
import { PHASEN, PHASE_INFO, type Phase } from "@/lib/projekte";
import { DEAL_STATUS_LABEL } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { datum, euro, heuteWien, tagVerschieben } from "@/lib/zeit";
import { betreuungSpeichern, phaseSetzen, projektSpeichern } from "./actions";

export const metadata: Metadata = { title: "Projekte" };

type Projekt = {
  id: string;
  paket: PaketId;
  betrag: number;
  status: string;
  projekt_phase: Phase;
  projekt_faellig: string | null;
  website_url: string | null;
  aenderungsrunden_inkl: number;
  aenderungsrunden_genutzt: number;
  lead_id: string | null;
  created_at: string;
  betreuung: Betreuung;
  sorglos_monat: number | null;
  betreuung_seit: string | null;
  leads: { firma: string } | null;
  partner: { name: string } | null;
  kunden_code: string;
  kunden_feedback: Rueckmeldung[];
};

const PHASE_FARBE: Record<Phase, string> = {
  inhalte: "bg-amber-400",
  umsetzung: "bg-brand",
  freigabe: "bg-violet-500",
  online: "bg-ok",
};

function Faellig({ tag, heute }: { tag: string | null; heute: string }) {
  if (!tag) return null;
  const klasse =
    tag < heute
      ? "bg-danger-light text-danger"
      : tag <= tagVerschieben(heute, 2)
        ? "bg-amber-50 text-amber-900"
        : "bg-bg text-muted";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${klasse}`}>
      {tag < heute ? "überfällig seit " : "fällig "}
      {datum(`${tag}T12:00:00Z`)}
    </span>
  );
}

export default async function Projekte({ searchParams }: PageProps<"/crm/projekte">) {
  const sp = await searchParams;
  const profil = await holeProfil();
  const admin = profil.rolle === "admin";
  const heute = heuteWien();
  const fehler = typeof sp.fehler === "string" ? sp.fehler : null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select(
      "id, paket, betrag, status, projekt_phase, projekt_faellig, website_url, aenderungsrunden_inkl, aenderungsrunden_genutzt, betreuung, sorglos_monat, betreuung_seit, lead_id, created_at, kunden_code, kunden_feedback(id, art, text, name, erledigt, created_at), leads(firma), partner:profiles!deals_partner_id_fkey(name)",
    )
    .neq("status", "storniert")
    .order("projekt_faellig", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(300);
  const projekte = (data ?? []) as unknown as Projekt[];
  const nachPhase = (p: Phase) => projekte.filter((x) => x.projekt_phase === p);
  const sorglos = projekte.filter((x) => x.betreuung === "sorglos");
  const sorglosSumme = sorglos.reduce((s, x) => s + Number(x.sorglos_monat ?? 0), 0);
  const ueberfaellig = projekte.filter((x) => x.projekt_phase !== "online" && x.projekt_faellig && x.projekt_faellig < heute);

  return (
    <>
      <Kopf
        titel="Projekte"
        text={
          admin
            ? "Jede verkaufte Website vom Sammeln der Inhalte bis online."
            : "So weit sind die Websites deiner Kunden."
        }
      />

      {fehler ? (
        <div className="mb-4">
          <Hinweis art="fehler">{fehler}</Hinweis>
        </div>
      ) : null}

      {ueberfaellig.length > 0 ? (
        <div className="mb-6">
          <Hinweis art="fehler">
            <strong>{ueberfaellig.length === 1 ? "1 Projekt ist" : `${ueberfaellig.length} Projekte sind`} überfällig:</strong>{" "}
            {ueberfaellig.map((x) => x.leads?.firma ?? "–").join(", ")}
          </Hinweis>
        </div>
      ) : null}

      {projekte.length > 0 ? (
        <p className="mb-4 text-sm text-muted">
          Sorglos-Pakete: <strong className="text-ink">{sorglos.length}</strong> · {euro(sorglosSumme)} pro Monat
        </p>
      ) : null}

      {projekte.length === 0 ? (
        <Karte className="px-5 py-10 text-center text-muted">
          Noch keine Projekte. Sobald ein Verkauf gemeldet ist, erscheint er hier.
        </Karte>
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          {PHASEN.map((p, pi) => (
            <section key={p} aria-labelledby={`phase-${p}`} className="rounded-xl bg-line/40 p-2">
              <h2 id={`phase-${p}`} className="flex items-center justify-between px-2 py-2">
                <span className="flex items-center gap-2 font-bold text-ink">
                  <span className={`h-2.5 w-2.5 rounded-full ${PHASE_FARBE[p]}`} aria-hidden />
                  {PHASE_INFO[p].label}
                </span>
                <span className="text-sm text-muted">{nachPhase(p).length}</span>
              </h2>
              <p className="px-2 pb-2 text-xs text-muted">{PHASE_INFO[p].text}</p>

              <ul className="space-y-2">
                {nachPhase(p).length === 0 ? (
                  <li className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-sm text-muted">Leer</li>
                ) : null}
                {nachPhase(p).map((x) => (
                  <li key={x.id}>
                    <Karte className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        {x.lead_id ? (
                          <Link href={`/crm/leads/${x.lead_id}`} className="font-semibold text-ink hover:text-brand">
                            {x.leads?.firma ?? "Ohne Lead"}
                          </Link>
                        ) : (
                          <span className="font-semibold text-ink">{x.leads?.firma ?? "Ohne Lead"}</span>
                        )}
                        <span className="shrink-0 text-sm font-semibold text-ink">{euro(x.betrag)}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted">
                        {PAKET_NAMEN[x.paket]} · {DEAL_STATUS_LABEL[x.status] ?? x.status}
                        {admin && x.partner ? ` · ${x.partner.name}` : ""}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {x.kunden_feedback.some((r) => !r.erledigt) ? (
                          <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">
                            💬 {x.kunden_feedback.filter((r) => !r.erledigt).length} neue Rückmeldung
                            {x.kunden_feedback.filter((r) => !r.erledigt).length === 1 ? "" : "en"}
                          </span>
                        ) : null}
                        {p !== "online" ? <Faellig tag={x.projekt_faellig} heute={heute} /> : null}
                        <span className="rounded-full bg-bg px-2 py-0.5 text-xs text-muted">
                          Änderungen {x.aenderungsrunden_genutzt}/{x.aenderungsrunden_inkl}
                        </span>
                        {x.betreuung === "sorglos" ? (
                          <span className="rounded-full bg-ok-light px-2 py-0.5 text-xs font-semibold text-ok">
                            Sorglos · {euro(x.sorglos_monat ?? 0)}/Monat
                          </span>
                        ) : x.betreuung === "uebergabe" ? (
                          <span className="rounded-full bg-bg px-2 py-0.5 text-xs text-muted">Übergabe</span>
                        ) : p === "freigabe" || p === "online" ? (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                            Übergabe oder Sorglos klären
                          </span>
                        ) : null}
                      </div>
                      {x.website_url ? (
                        <a
                          href={x.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 block truncate text-sm text-brand underline"
                        >
                          {x.website_url.replace(/^https?:\/\//, "")}
                        </a>
                      ) : null}

                      <details className="mt-2" open={x.kunden_feedback.some((r) => !r.erledigt)}>
                        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-brand">
                          Kunden-Link & Rückmeldungen
                        </summary>
                        <div className="pt-1">
                          <KundenLinkBox code={x.kunden_code} rueckmeldungen={x.kunden_feedback} zurueck="/crm/projekte" id={x.id} schmal />
                        </div>
                      </details>

                      {admin ? (
                        <>
                          <div className="mt-3 flex gap-2">
                            {pi > 0 ? (
                              <form action={phaseSetzen} className="flex-1">
                                <input type="hidden" name="id" value={x.id} />
                                <input type="hidden" name="phase" value={PHASEN[pi - 1]} />
                                <button className={buttonClass("secondary", "w-full px-2 text-sm")} title={PHASE_INFO[PHASEN[pi - 1]].label}>
                                  ← Zurück
                                </button>
                              </form>
                            ) : null}
                            {pi < PHASEN.length - 1 ? (
                              <form action={phaseSetzen} className="flex-1">
                                <input type="hidden" name="id" value={x.id} />
                                <input type="hidden" name="phase" value={PHASEN[pi + 1]} />
                                <button
                                  className={buttonClass("primary", "w-full px-2 text-sm")}
                                  title={`Weiter zu „${PHASE_INFO[PHASEN[pi + 1]].label}“`}
                                >
                                  Weiter →
                                </button>
                              </form>
                            ) : null}
                          </div>
                          <details className="mt-2">
                            <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-brand">
                              Termin, Link, Änderungen
                            </summary>
                            <form action={projektSpeichern} className="space-y-2 pt-1">
                              <input type="hidden" name="id" value={x.id} />
                              <label className="block text-xs font-semibold text-ink">
                                Fällig am
                                <input name="faellig" type="date" defaultValue={x.projekt_faellig ?? ""} className={`${inputClass} mt-1`} />
                              </label>
                              <label className="block text-xs font-semibold text-ink">
                                Website / Demo-Link
                                <input
                                  name="website_url"
                                  type="url"
                                  placeholder="https://…"
                                  defaultValue={x.website_url ?? ""}
                                  className={`${inputClass} mt-1`}
                                />
                              </label>
                              <label className="block text-xs font-semibold text-ink">
                                Genutzte Änderungsrunden (von {x.aenderungsrunden_inkl})
                                <input
                                  name="aenderungsrunden_genutzt"
                                  type="number"
                                  min={0}
                                  max={20}
                                  defaultValue={x.aenderungsrunden_genutzt}
                                  className={`${inputClass} mt-1`}
                                />
                              </label>
                              <button className={buttonClass("secondary", "w-full")}>Speichern</button>
                            </form>
                          </details>
                          <details className="mt-1">
                            <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-brand">
                              Nach der Fertigstellung
                            </summary>
                            <form action={betreuungSpeichern} className="space-y-2 pt-1">
                              <input type="hidden" name="id" value={x.id} />
                              <label className="block text-xs font-semibold text-ink">
                                Was passiert danach?
                                <select name="betreuung" defaultValue={x.betreuung} className={`${inputClass} mt-1`}>
                                  {BETREUUNG.map((b) => (
                                    <option key={b} value={b}>
                                      {BETREUUNG_LABEL[b]}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="block text-xs font-semibold text-ink">
                                Monatsbetrag in € (nur Sorglos-Paket)
                                <input
                                  name="sorglos_monat"
                                  inputMode="decimal"
                                  defaultValue={String(x.sorglos_monat ?? sorglosStandard(x.paket)).replace(".", ",")}
                                  className={`${inputClass} mt-1`}
                                />
                              </label>
                              <label className="block text-xs font-semibold text-ink">
                                Gilt ab
                                <input
                                  name="betreuung_seit"
                                  type="date"
                                  defaultValue={x.betreuung_seit ?? heute}
                                  className={`${inputClass} mt-1`}
                                />
                              </label>
                              <button className={buttonClass("secondary", "w-full")}>Speichern</button>
                            </form>
                          </details>
                        </>
                      ) : null}
                    </Karte>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
