import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KontaktFormular } from "@/components/crm/KontaktFormular";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { VerkaufFormular } from "@/components/crm/VerkaufFormular";
import { Hinweis, Karte, Select, Textarea, buttonClass, inputClass } from "@/components/ui";
import { holeProfil } from "@/lib/crm";
import { mapsSuche } from "@/lib/besuche";
import { EINWILLIGUNG_ARTEN } from "@/lib/einwilligung";
import { PHASE_INFO, type Phase } from "@/lib/projekte";
import { mailtoLink, vorlageFuellen, type Vorlage } from "@/lib/vorlagen";
import { PAKET_NAMEN, type PaketId } from "@/lib/pakete";
import { DEAL_STATUS_LABEL, LEAD_STATUS, STATUS_LABEL, type LeadStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { datum, datumZeit, euro, heuteWien, isoZuWienLokal } from "@/lib/zeit";
import { ausRundeEntfernen, besucheEinplanen } from "../../besuche/actions";
import { einwilligungSetzen, notizHinzufuegen, rueckrufSetzen, statusSetzen } from "../actions";

export const metadata: Metadata = { title: "Lead" };

const QUELLE: Record<string, string> = {
  manuell: "manuell angelegt",
  csv: "per CSV-Import",
  "anfrage:demo": "aus einer Website-Anfrage (Gratis-Demo)",
  "anfrage:beratung": "aus einer Website-Anfrage (Beratung)",
  "anfrage:rueckruf": "aus einer Website-Anfrage (Rückruf)",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Abschnitt({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <Karte className="p-4 sm:p-5">
      <h2 className="mb-4 font-bold text-ink">{titel}</h2>
      {children}
    </Karte>
  );
}

export default async function LeadDetail({ params, searchParams }: PageProps<"/crm/leads/[id]">) {
  const { id } = await params;
  const { fehler } = await searchParams;
  if (!UUID.test(id)) notFound();

  const profil = await holeProfil();
  const admin = profil.rolle === "admin";
  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("id, firma, ansprechpartner, branche, telefon, email, adresse, bezirk, status, naechster_rueckruf, quelle, einwilligung_wie, einwilligung_am, besuch_geplant, letzter_besuch, created_at")
    .eq("id", id)
    .maybeSingle();
  // RLS: fremde Leads liefern keine Zeile → 404
  if (!lead) notFound();

  const [{ data: verlauf }, { data: deals }, { data: vorlagenRoh }] = await Promise.all([
    supabase
      .from("lead_verlauf")
      .select("id, art, text, created_at, autor:profiles!lead_verlauf_autor_id_fkey(name)")
      .eq("lead_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("deals")
      .select("id, paket, betrag, status, projekt_phase, website_url, created_at")
      .eq("lead_id", id)
      .order("created_at"),
    supabase.from("vorlagen").select("id, titel, betreff, text, reihenfolge").order("reihenfolge"),
  ]);

  const status = lead.status as LeadStatus;
  const gesperrt = status === "nicht_anrufen";
  // Telefonnummer bei „nicht anrufen“ gar nicht erst an den Browser schicken
  const kontakt = { ...lead, telefon: gesperrt ? null : lead.telefon };
  const statusButtons = LEAD_STATUS.filter((s) => s !== "verkauft");
  const anrufErlaubt = !gesperrt && !!lead.einwilligung_wie;
  const ausAnfrage = lead.quelle.startsWith("anfrage:");
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const website = (deals ?? []).find((d) => d.website_url)?.website_url ?? "[Link einfügen]";
  const platzhalter: Record<string, string> = {
    anrede: lead.ansprechpartner ? `Guten Tag ${lead.ansprechpartner}` : "Guten Tag",
    firma: lead.firma,
    ansprechpartner: lead.ansprechpartner ?? "",
    mein_name: profil.name.trim() || profil.email,
    meine_email: profil.email,
    demo_link: `${site}/demo`,
    website,
  };
  const mails = ((vorlagenRoh ?? []) as Vorlage[]).map((v) => ({
    ...v,
    link: lead.email
      ? mailtoLink(lead.email, vorlageFuellen(v.betreff, platzhalter), vorlageFuellen(v.text, platzhalter))
      : null,
  }));

  return (
    <>
      <Link href="/crm/leads" className="mb-3 inline-flex min-h-11 items-center text-sm text-brand hover:underline">
        ← Alle Leads
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{lead.firma}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-muted">
            <StatusBadge status={status} />
            {[lead.branche, lead.bezirk].filter(Boolean).join(" · ")}
          </p>
        </div>
        {anrufErlaubt && lead.telefon ? (
          <a href={`tel:${lead.telefon.replace(/[^+0-9]/g, "")}`} className={buttonClass("primary")}>
            Anrufen: {lead.telefon}
          </a>
        ) : null}
      </div>

      {typeof fehler === "string" ? (
        <div className="mb-4">
          <Hinweis art="fehler">{fehler}</Hinweis>
        </div>
      ) : null}

      {gesperrt ? (
        <div className="mb-4">
          <Hinweis art="fehler">
            <strong>Nicht anrufen.</strong> Die Telefonnummer ist ausgeblendet.{" "}
            {admin ? "Als Admin kannst du die Sperre aufheben." : "Nur ein Admin kann das zurücksetzen."}
          </Hinweis>
        </div>
      ) : null}

      {!gesperrt ? (
        <div className="mb-4">
          {anrufErlaubt ? (
            <Hinweis art="ok">
              <strong>Anruf und E-Mail erlaubt.</strong> Einwilligung: {lead.einwilligung_wie}
              {lead.einwilligung_am ? `, ${datumZeit(lead.einwilligung_am)}` : ""}.
            </Hinweis>
          ) : (
            <Hinweis art="warnung">
              <strong>Keine Einwilligung – nicht anrufen und keine Werbe-E-Mail schicken.</strong> Das ist in Österreich
              auch bei Firmen verboten (§ 174 TKG). Erlaubt: persönlich vorbeischauen oder einen Brief schicken. Sagt der
              Betrieb, dass du dich melden darfst, trag es unten bei „Einwilligung“ ein.
            </Hinweis>
          )}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Abschnitt titel="Status">
            {gesperrt && !admin ? (
              <p className="text-sm text-muted">Der Status ist gesperrt.</p>
            ) : gesperrt && admin ? (
              <form action={statusSetzen}>
                <input type="hidden" name="id" value={lead.id} />
                <input type="hidden" name="status" value="neu" />
                <button className={buttonClass("danger")}>Sperre aufheben (Status „Neu“)</button>
              </form>
            ) : (
              <div className="flex flex-wrap gap-2">
                {statusButtons.map((s) => (
                  <form key={s} action={statusSetzen}>
                    <input type="hidden" name="id" value={lead.id} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      aria-pressed={s === status}
                      className={`min-h-11 rounded-lg border px-3 text-sm font-semibold ${
                        s === status
                          ? "border-brand bg-brand text-white"
                          : s === "nicht_anrufen"
                            ? "border-danger/30 text-danger hover:bg-danger-light"
                            : "border-line text-ink hover:border-brand hover:text-brand"
                      }`}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  </form>
                ))}
              </div>
            )}
          </Abschnitt>

          {!gesperrt ? (
            <Abschnitt titel={anrufErlaubt ? "Nächster Rückruf" : "Nächster Termin (Besuch)"}>
              <form action={rueckrufSetzen} className="space-y-3">
                <input type="hidden" name="id" value={lead.id} />
                <label htmlFor="rueckruf" className="sr-only">
                  Datum und Uhrzeit
                </label>
                <input
                  id="rueckruf"
                  name="rueckruf"
                  type="datetime-local"
                  defaultValue={isoZuWienLokal(lead.naechster_rueckruf)}
                  className={inputClass}
                />
                <label className="flex min-h-11 items-center gap-3 text-sm text-muted">
                  <input type="checkbox" name="als_rueckruf" defaultChecked className="h-5 w-5 accent-brand" />
                  Status auf „Rückruf“ setzen
                </label>
                <div className="flex flex-wrap gap-2">
                  <button className={buttonClass("primary")}>Rückruf speichern</button>
                </div>
              </form>
              {lead.naechster_rueckruf ? (
                <form action={rueckrufSetzen} className="mt-2">
                  <input type="hidden" name="id" value={lead.id} />
                  <input type="hidden" name="rueckruf" value="" />
                  <button className={buttonClass("ghost")}>Rückruf entfernen</button>
                </form>
              ) : null}
            </Abschnitt>
          ) : null}

          <Abschnitt titel="Notizen und Verlauf">
            <form action={notizHinzufuegen} className="space-y-2">
              <input type="hidden" name="id" value={lead.id} />
              <label htmlFor="notiz" className="sr-only">
                Neue Notiz
              </label>
              <Textarea name="notiz" rows={3} placeholder="Was wurde besprochen?" required />
              <button className={buttonClass("secondary")}>Notiz speichern</button>
            </form>
            <ol className="mt-5 space-y-4 border-l-2 border-line pl-4">
              {(verlauf ?? []).map((v) => {
                const autor = (v.autor as unknown as { name: string } | null)?.name;
                return (
                  <li key={v.id} className="relative">
                    <span
                      aria-hidden
                      className={`absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-surface ${
                        v.art === "notiz" ? "bg-brand" : "bg-line"
                      }`}
                    />
                    <p className={`whitespace-pre-wrap ${v.art === "notiz" ? "text-ink" : "text-sm text-muted"}`}>{v.text}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {datumZeit(v.created_at)}
                      {autor ? ` · ${autor}` : ""}
                    </p>
                  </li>
                );
              })}
              <li className="relative">
                <span aria-hidden className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-surface bg-line" />
                <p className="text-sm text-muted">Lead angelegt – {QUELLE[lead.quelle] ?? lead.quelle}</p>
                <p className="mt-0.5 text-xs text-muted">{datumZeit(lead.created_at)}</p>
              </li>
            </ol>
          </Abschnitt>
        </div>

        <div className="space-y-6">
          {!gesperrt && status !== "verkauft" && status !== "kein_interesse" ? (
            <Abschnitt titel="Besuch vor Ort">
              <p className="mb-3 text-sm text-muted">
                {lead.letzter_besuch ? `Zuletzt vor Ort: ${datumZeit(lead.letzter_besuch)}` : "Noch nie besucht."}
                {lead.adresse ? (
                  <>
                    {" "}
                    <a href={mapsSuche(lead)} target="_blank" rel="noopener noreferrer" className="text-brand underline">
                      Auf der Karte
                    </a>
                  </>
                ) : null}
              </p>
              {lead.besuch_geplant ? (
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink">Geplant für {datum(`${lead.besuch_geplant}T12:00:00Z`)}</p>
                  <Link href={`/crm/besuche?tag=${lead.besuch_geplant}`} className={buttonClass("ghost", "px-3 text-sm")}>
                    Zur Runde
                  </Link>
                  <form action={ausRundeEntfernen}>
                    <input type="hidden" name="id" value={lead.id} />
                    <input type="hidden" name="zurueck" value={`/crm/leads/${lead.id}`} />
                    <button className={buttonClass("ghost", "px-3 text-sm text-muted")}>Nicht mehr einplanen</button>
                  </form>
                </div>
              ) : (
                <form action={besucheEinplanen} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <input type="hidden" name="ids" value={lead.id} />
                  <input type="hidden" name="zurueck" value={`/crm/leads/${lead.id}`} />
                  <div className="flex-1">
                    <label htmlFor="besuch-tag" className="mb-1.5 block text-sm font-semibold text-ink">
                      Besuchen am
                    </label>
                    <input id="besuch-tag" name="tag" type="date" min={heuteWien()} defaultValue={heuteWien()} required className={inputClass} />
                  </div>
                  <button className={buttonClass("secondary")}>Einplanen</button>
                </form>
              )}
            </Abschnitt>
          ) : null}

          {!gesperrt ? (
            <Abschnitt titel="Einwilligung zu Anruf und E-Mail">
              {anrufErlaubt ? (
                <form action={einwilligungSetzen} className="space-y-2">
                  <input type="hidden" name="id" value={lead.id} />
                  <input type="hidden" name="wie" value="" />
                  <p className="text-sm text-muted">
                    Widerruft der Betrieb die Einwilligung, entferne sie hier. Danach nicht mehr anrufen oder mailen.
                  </p>
                  <button className={buttonClass("ghost")}>Einwilligung entfernen</button>
                </form>
              ) : (
                <form action={einwilligungSetzen} className="space-y-3">
                  <input type="hidden" name="id" value={lead.id} />
                  <p className="text-sm text-muted">
                    Nur eintragen, wenn der Betrieb wirklich zugestimmt hat. Datum und dein Name werden gespeichert.
                  </p>
                  <label htmlFor="wie" className="block text-sm font-semibold text-ink">
                    Wie hat der Betrieb zugestimmt?
                  </label>
                  <Select id="wie" name="wie" required defaultValue="">
                    <option value="" disabled>
                      Bitte wählen
                    </option>
                    {EINWILLIGUNG_ARTEN.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </Select>
                  <button className={buttonClass("secondary")}>Einwilligung eintragen</button>
                </form>
              )}
            </Abschnitt>
          ) : null}

          {!gesperrt && mails.length > 0 ? (
            <Abschnitt titel="E-Mail schreiben">
              {!lead.email ? (
                <p className="text-sm text-muted">Trag unten eine E-Mail-Adresse ein, dann kannst du Vorlagen verwenden.</p>
              ) : (
                <>
                  {!anrufErlaubt && !ausAnfrage ? (
                    <p className="mb-3 text-sm text-amber-900">
                      Ohne Einwilligung nur schreiben, wenn der Betrieb dich darum gebeten hat – keine Werbe-E-Mails.
                    </p>
                  ) : null}
                  <p className="mb-3 text-sm text-muted">Öffnet dein E-Mail-Programm mit fertigem Text. Vor dem Senden kurz prüfen.</p>
                  <div className="flex flex-wrap gap-2">
                    {mails.map((m) => (
                      <a key={m.id} href={m.link!} className={buttonClass("secondary", "px-3 text-sm")}>
                        {m.titel}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </Abschnitt>
          ) : null}

          <Abschnitt titel="Kontakt">
            <KontaktFormular lead={kontakt} telefonSperre={gesperrt} />
          </Abschnitt>

          <Abschnitt titel="Verkauf">
            {(deals ?? []).length > 0 ? (
              <ul className="mb-4 divide-y divide-line rounded-lg border border-line">
                {(deals ?? []).map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                    <span>
                      <span className="font-semibold text-ink">{PAKET_NAMEN[d.paket as PaketId]}</span>{" "}
                      <span className="text-muted">
                        · {DEAL_STATUS_LABEL[d.status]}
                        {d.status !== "storniert" ? (
                          <>
                            {" · "}
                            <Link href="/crm/projekte" className="text-brand hover:underline">
                              {PHASE_INFO[d.projekt_phase as Phase]?.label ?? d.projekt_phase}
                            </Link>
                          </>
                        ) : null}
                      </span>
                    </span>
                    <span className="font-semibold">{euro(d.betrag)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {gesperrt ? (
              <p className="text-sm text-muted">Für gesperrte Leads kann kein Verkauf gemeldet werden.</p>
            ) : (deals ?? []).some((d) => d.status !== "storniert") ? (
              <p className="text-sm text-muted">
                Für diesen Lead ist bereits ein Verkauf eingetragen. Änderungen macht ein Gründer unter Admin → Deals.
              </p>
            ) : (
              <VerkaufFormular leadId={lead.id} />
            )}
          </Abschnitt>
        </div>
      </div>
    </>
  );
}
