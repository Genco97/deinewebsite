import type { Metadata } from "next";
import Link from "next/link";
import { Kopf } from "@/components/crm/Kopf";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { Hinweis, Karte, buttonClass, inputClass } from "@/components/ui";
import { NaechsterSchritt } from "@/components/crm/NaechsterSchritt";
import { BESUCH_ERGEBNISSE, adresseText, mapsRoute, mapsSuche, type BesuchErgebnis } from "@/lib/besuche";
import { holeProfil } from "@/lib/crm";
import { ABGESCHLOSSEN, type LeadStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { datum, heuteWien, istTag, tagKurz, tagVerschieben } from "@/lib/zeit";
import { EinplanenLeiste } from "@/components/crm/EinplanenLeiste";
import { ausRundeEntfernen, besucheEinplanen, besuchErfassen } from "./actions";

export const metadata: Metadata = { title: "Besuche" };

type Stopp = {
  id: string;
  firma: string;
  branche: string | null;
  adresse: string | null;
  bezirk: string | null;
  status: LeadStatus;
  telefon: string | null;
  einwilligung_wie: string | null;
  besuch_geplant: string | null;
  letzter_besuch: string | null;
};

const FELDER = "id, firma, branche, adresse, bezirk, status, telefon, einwilligung_wie, besuch_geplant, letzter_besuch";
const offen = `(${ABGESCHLOSSEN.join(",")})`;
const nachOrt = (a: Stopp, b: Stopp) =>
  (a.bezirk ?? "").localeCompare(b.bezirk ?? "", "de") || (a.adresse ?? "").localeCompare(b.adresse ?? "", "de");

const ERGEBNIS_KNOPF: Record<BesuchErgebnis, string> = {
  nicht_angetroffen: "border-line text-muted hover:border-ink hover:text-ink",
  flyer: "border-line text-ink hover:border-brand hover:text-brand",
  interesse: "border-brand/40 text-brand hover:bg-brand-light",
  demo: "border-ok/40 text-ok hover:bg-ok-light",
  kein_interesse: "border-line text-muted hover:border-danger/40 hover:text-danger",
};

export default async function Besuche({ searchParams }: PageProps<"/crm/besuche">) {
  const sp = await searchParams;
  const profil = await holeProfil();
  const heute = heuteWien();
  const tag = istTag(sp.tag) ? sp.tag : heute;
  const bezirk = typeof sp.bezirk === "string" ? sp.bezirk.slice(0, 100) : "";
  const fehler = typeof sp.fehler === "string" ? sp.fehler : null;
  const istHeute = tag === heute;
  const hier = `/crm/besuche?tag=${tag}${bezirk ? `&bezirk=${encodeURIComponent(bezirk)}` : ""}`;

  const supabase = await createClient();
  let runde = supabase.from("leads").select(FELDER).eq("besitzer_id", profil.id).not("status", "in", offen);
  // Heute zeigt auch liegengebliebene Besuche von früheren Tagen
  runde = istHeute ? runde.lte("besuch_geplant", tag) : runde.eq("besuch_geplant", tag);

  let kandidaten = supabase
    .from("leads")
    .select(FELDER)
    .eq("besitzer_id", profil.id)
    .not("status", "in", offen)
    .is("besuch_geplant", null)
    .not("adresse", "is", null)
    .order("letzter_besuch", { ascending: true, nullsFirst: true })
    .order("bezirk")
    .limit(100);
  if (bezirk) kandidaten = kandidaten.eq("bezirk", bezirk);

  const [r, k, b] = await Promise.all([
    runde.limit(100),
    kandidaten,
    supabase
      .from("leads")
      .select("bezirk")
      .eq("besitzer_id", profil.id)
      .not("status", "in", offen)
      .not("bezirk", "is", null)
      .limit(2000),
  ]);

  const stopps = ((r.data ?? []) as Stopp[]).sort(nachOrt);
  const liste = (k.data ?? []) as Stopp[];
  const bezirke = [...new Set((b.data ?? []).map((x) => x.bezirk as string))].sort((x, y) => x.localeCompare(y, "de"));
  const route = mapsRoute(stopps);
  // Letzte Notiz je Betrieb in der Runde: wie man beim letzten Mal verblieben ist
  const notizen = new Map<string, string>();
  if (stopps.length) {
    const { data: n } = await supabase
      .from("lead_verlauf")
      .select("lead_id, text")
      .in("lead_id", stopps.map((x) => x.id))
      .eq("art", "notiz")
      .order("created_at", { ascending: false })
      .limit(500);
    for (const z of n ?? []) if (!notizen.has(z.lead_id as string)) notizen.set(z.lead_id as string, z.text as string);
  }

  return (
    <>
      <Kopf titel="Besuche" text="Plane deine Runde vor Ort und halte fest, wie jeder Besuch gelaufen ist." />

      {fehler ? (
        <div className="mb-4">
          <Hinweis art="fehler">{fehler}</Hinweis>
        </div>
      ) : null}

      {/* Tag wählen */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href={`/crm/besuche?tag=${tagVerschieben(tag, -1)}`} className={buttonClass("secondary", "px-3")} aria-label="Vorheriger Tag">
          ←
        </Link>
        <p className="min-w-40 text-center font-semibold text-ink">
          {istHeute ? "Heute" : tagKurz(tag)}
          <span className="block text-xs font-normal text-muted">{datum(`${tag}T12:00:00Z`)}</span>
        </p>
        <Link href={`/crm/besuche?tag=${tagVerschieben(tag, 1)}`} className={buttonClass("secondary", "px-3")} aria-label="Nächster Tag">
          →
        </Link>
        {!istHeute ? (
          <Link href="/crm/besuche" className={buttonClass("ghost")}>
            Zu heute
          </Link>
        ) : null}
      </div>

      <Karte className="mb-4">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <h2 className="font-bold text-ink">
            Deine Runde <span className="font-normal text-muted">· {stopps.length} {stopps.length === 1 ? "Betrieb" : "Betriebe"}</span>
          </h2>
          {route ? (
            <a href={route} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "w-full sm:w-auto")}>
              Route starten
            </a>
          ) : null}
        </div>

        {stopps.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted sm:px-5">
            Für diesen Tag ist noch nichts geplant. Wähl unten Betriebe aus und plan sie ein.
          </p>
        ) : (
          <ol className="divide-y divide-line">
            {stopps.map((s, i) => {
              const ueberfaellig = s.besuch_geplant !== null && s.besuch_geplant < tag;
              return (
                <li key={s.id} className="px-4 py-4 sm:px-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/crm/leads/${s.id}`} className="font-semibold text-ink hover:text-brand">
                          {s.firma}
                        </Link>
                        <StatusBadge status={s.status} />
                        {ueberfaellig ? (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                            offen seit {datum(`${s.besuch_geplant}T12:00:00Z`)}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-sm text-muted">
                        {[s.branche, adresseText(s) || "keine Adresse"].filter(Boolean).join(" · ")}
                        {s.letzter_besuch ? ` · zuletzt vor Ort ${datum(s.letzter_besuch)}` : ""}
                      </p>
                      {notizen.get(s.id) ? (
                        <p className="mt-1.5 line-clamp-2 rounded-lg bg-bg px-3 py-1.5 text-sm text-ink">📝 {notizen.get(s.id)}</p>
                      ) : null}

                      <div className="mt-1 flex flex-wrap gap-x-4">
                        {s.telefon && s.einwilligung_wie ? (
                          <a href={`tel:${s.telefon.replace(/[^+0-9]/g, "")}`} className="inline-flex min-h-9 items-center text-sm font-bold text-brand underline underline-offset-4">
                            {s.telefon}
                          </a>
                        ) : null}
                        {s.adresse ? (
                          <a href={mapsSuche(s)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center text-sm font-semibold text-brand hover:underline">
                            Auf der Karte
                          </a>
                        ) : null}
                        <form action={ausRundeEntfernen}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="zurueck" value={hier} />
                          <button className="inline-flex min-h-9 items-center text-sm font-semibold text-muted hover:text-ink">Aus der Runde nehmen</button>
                        </form>
                      </div>

                      {/* Ergebnis: ein Tipp genügt; Notiz, Zustimmung und nächster Schritt sind eingeklappt */}
                      <form action={besuchErfassen} className="mt-3 space-y-2">
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="zurueck" value={hier} />
                        <p className="text-sm font-semibold text-ink">Wie ist es gelaufen?</p>
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                          {(Object.keys(BESUCH_ERGEBNISSE) as BesuchErgebnis[]).map((e) => (
                            <button
                              key={e}
                              name="ergebnis"
                              value={e}
                              formNoValidate={e === "kein_interesse"}
                              className={`min-h-11 rounded-lg border bg-surface px-3 text-sm font-semibold ${ERGEBNIS_KNOPF[e]}`}
                            >
                              {BESUCH_ERGEBNISSE[e].label}
                            </button>
                          ))}
                        </div>
                        <details className="group rounded-lg border border-line">
                          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 text-sm font-semibold text-brand [&::-webkit-details-marker]:hidden">
                            Notiz, Zustimmung und nächster Schritt
                            <span aria-hidden className="transition-transform group-open:rotate-180">
                              ▾
                            </span>
                          </summary>
                          <div className="space-y-3 border-t border-line p-3">
                            <label htmlFor={`notiz-${s.id}`} className="sr-only">
                              Notiz zum Besuch
                            </label>
                            <input
                              id={`notiz-${s.id}`}
                              name="notiz"
                              placeholder="Notiz (optional), z. B. „Chefin ab 15 Uhr da“"
                              className={inputClass}
                            />
                            {s.einwilligung_wie ? (
                              <p className="text-sm text-ok">✓ Anruf erlaubt ({s.einwilligung_wie})</p>
                            ) : (
                              <label className="flex min-h-11 items-start gap-3 text-sm text-ink">
                                <input type="checkbox" name="einwilligung" className="mt-1 h-5 w-5 shrink-0 accent-brand" />
                                <span>Darf wieder anrufen und mailen (Betrieb hat zugestimmt)</span>
                              </label>
                            )}
                            <p className="text-xs text-muted">Ohne Änderung: wiederkommen in 7 Tagen.</p>
                            <NaechsterSchritt
                              vorgabe={{ art: "besuch", tag: tagVerschieben(heute, 7), zeit: "10:00" }}
                              anrufOk={!!s.einwilligung_wie}
                              idPrefix={`schritt-${s.id}`}
                            />
                          </div>
                        </details>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Karte>

      {/* Einplanen */}
      <details open={stopps.length === 0 || !!bezirk} className="group rounded-2xl border border-line bg-surface">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 font-bold text-brand sm:px-5 [&::-webkit-details-marker]:hidden">
          ＋ Betriebe zur Runde hinzufügen
          <span aria-hidden className="text-muted transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <p className="border-t border-line px-4 py-3 text-sm text-muted sm:px-5">Offene Leads mit Adresse – wer am längsten nicht besucht wurde, steht oben.</p>

        <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3 sm:px-5">
          {[["", "Alle"], ...bezirke.map((x) => [x, x])].map(([wert, titel]) => (
            <Link
              key={wert}
              href={`/crm/besuche?tag=${tag}${wert ? `&bezirk=${encodeURIComponent(wert)}` : ""}`}
              aria-current={bezirk === wert ? "true" : undefined}
              className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold ${bezirk === wert ? "border-brand bg-brand text-white" : "border-brand/40 bg-white text-brand hover:bg-brand-light"}`}
            >
              {titel}
            </Link>
          ))}
        </div>

        {liste.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted sm:px-5">
            Keine offenen Leads mit Adresse{bezirk ? " in diesem Bezirk" : ""}. Trag bei deinen Leads eine Adresse ein oder
            importiere welche unter „Leads“.
          </p>
        ) : (
          <form action={besucheEinplanen}>
            <input type="hidden" name="zurueck" value={hier} />
            <EinplanenLeiste tag={tag} heute={heute} />
            <ul className="divide-y divide-line">
              {liste.map((l) => (
                <li key={l.id}>
                  <label className="flex min-h-16 cursor-pointer items-center gap-4 px-4 py-3 hover:bg-bg has-[:checked]:bg-brand-light sm:px-5">
                    <input type="checkbox" name="ids" value={l.id} data-einplanen className="h-6 w-6 shrink-0 accent-brand" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">{l.firma}</span>
                      <span className="block text-sm text-muted">
                        {[l.branche, adresseText(l)].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-xs text-muted">
                      {l.letzter_besuch ? `zuletzt ${datum(l.letzter_besuch)}` : "noch nie besucht"}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div aria-hidden className="h-20" />
          </form>
        )}
      </details>
    </>
  );
}
