import type { Metadata } from "next";
import Link from "next/link";
import { Kopf } from "@/components/crm/Kopf";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { RueckmeldungZeile, type Rueckmeldung } from "@/components/crm/Rueckmeldungen";
import { Karte, buttonClass } from "@/components/ui";
import { holeProfil } from "@/lib/crm";
import { PAKET_NAMEN, type PaketId } from "@/lib/pakete";
import { PHASE_INFO, type Phase } from "@/lib/projekte";
import { AKTIV } from "@/lib/schritt";
import { ABGESCHLOSSEN, type LeadStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { datum, datumZeit, euro, heuteWien, tagVerschieben, uhrzeit, wienGrenzen } from "@/lib/zeit";

export const metadata: Metadata = { title: "Heute" };

type LeadZeile = {
  id: string;
  firma: string;
  branche: string | null;
  status: LeadStatus;
  naechster_rueckruf: string | null;
  einwilligung_wie: string | null;
};

function LeadListe({
  leads,
  leer,
  zeit,
  rot = false,
}: {
  leads: LeadZeile[];
  leer: string;
  zeit: (l: LeadZeile) => string;
  rot?: boolean;
}) {
  if (leads.length === 0) return <p className="px-4 py-6 text-sm text-muted sm:px-5">{leer}</p>;
  return (
    <ul className="divide-y divide-line">
      {leads.map((l) => (
        <li key={l.id}>
          <Link
            href={`/crm/leads/${l.id}`}
            className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 hover:bg-bg sm:px-5"
          >
            <span className="min-w-0">
              <span className="block truncate font-semibold text-ink">{l.firma}</span>
              <span className="block truncate text-sm text-muted">
                {l.branche ?? "–"}
                {l.einwilligung_wie ? null : <span className="text-amber-800"> · kein Anruf, nur Besuch/Brief</span>}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <span className={`text-sm font-semibold ${rot ? "text-danger" : "text-ink"}`}>{zeit(l)}</span>
              <StatusBadge status={l.status} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Block({ titel, anzahl, rot, children }: { titel: string; anzahl: number; rot?: boolean; children: React.ReactNode }) {
  return (
    <Karte className={rot && anzahl > 0 ? "border-danger/40" : ""}>
      <h2 className="flex items-center justify-between border-b border-line px-4 py-3 font-bold text-ink sm:px-5">
        <span className={rot && anzahl > 0 ? "text-danger" : ""}>{titel}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-sm ${rot && anzahl > 0 ? "bg-danger-light text-danger" : "bg-bg text-muted"}`}
        >
          {anzahl}
        </span>
      </h2>
      {children}
    </Karte>
  );
}

export default async function Heute() {
  const profil = await holeProfil();
  const supabase = await createClient();
  const { tagEnde, wocheStart } = wienGrenzen();
  const jetzt = new Date().toISOString();
  const offen = `(${ABGESCHLOSSEN.join(",")})`;
  const felder = "id, firma, branche, status, naechster_rueckruf, einwilligung_wie";

  const vor7Tagen = new Date(Date.parse(jetzt) - 7 * 86400000).toISOString();
  const admin = profil.rolle === "admin";
  const [neu, heute, ueberfaellig, angebote, verkaeufe, besuche, projekte, ohneSchritt, rueck] = await Promise.all([
    supabase
      .from("leads")
      .select("id, firma, ansprechpartner, branche, telefon, email, status, quelle, einwilligung_wie, created_at")
      .like("quelle", "anfrage:%")
      .in("status", ["demo", "interessiert", "rueckruf"])
      .gte("created_at", vor7Tagen)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("leads")
      .select(felder)
      .gte("naechster_rueckruf", jetzt)
      .lt("naechster_rueckruf", tagEnde)
      .not("status", "in", offen)
      .order("naechster_rueckruf"),
    supabase
      .from("leads")
      .select(felder)
      .lt("naechster_rueckruf", jetzt)
      .not("status", "in", offen)
      .order("naechster_rueckruf")
      .limit(50),
    supabase.from("leads").select(felder).eq("status", "angebot").order("updated_at", { ascending: false }).limit(50),
    supabase
      .from("deals")
      .select("id, paket, betrag, status, created_at, leads(firma)")
      .gte("created_at", wocheStart)
      .neq("status", "storniert")
      .order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("besitzer_id", profil.id)
      .lte("besuch_geplant", heuteWien())
      .not("status", "in", offen),
    admin
      ? supabase
          .from("deals")
          .select("id, projekt_faellig, projekt_phase, leads(firma)")
          .neq("status", "storniert")
          .neq("projekt_phase", "online")
          .lte("projekt_faellig", tagVerschieben(heuteWien(), 2))
          .order("projekt_faellig")
      : Promise.resolve({ data: [] }),
    supabase
      .from("leads")
      .select(felder, { count: "exact" })
      .in("status", AKTIV)
      .is("naechster_rueckruf", null)
      .is("besuch_geplant", null)
      .order("status_seit")
      .limit(20),
    supabase
      .from("kunden_feedback")
      .select("id, art, text, name, erledigt, created_at, deals(lead_id, leads(firma))")
      .eq("erledigt", false)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const rueckmeldungen = (rueck.data ?? []) as unknown as (Rueckmeldung & { deals: { lead_id: string | null; leads: { firma: string } | null } | null })[];
  const faelligeProjekte = (projekte.data ?? []) as unknown as {
    id: string;
    projekt_faellig: string;
    projekt_phase: Phase;
    leads: { firma: string } | null;
  }[];

  const deals = (verkaeufe.data ?? []) as unknown as {
    id: string;
    paket: PaketId;
    betrag: number;
    created_at: string;
    leads: { firma: string } | null;
  }[];
  const summe = deals.reduce((s, d) => s + Number(d.betrag), 0);
  const vorname = profil.name.split(" ")[0];
  const neueAnfragen = (neu.data ?? []) as {
    id: string;
    firma: string;
    ansprechpartner: string | null;
    branche: string | null;
    telefon: string | null;
    email: string | null;
    status: LeadStatus;
    quelle: string;
    einwilligung_wie: string | null;
    created_at: string;
  }[];
  const ART: Record<string, string> = {
    "anfrage:demo": "Gratis-Demo",
    "anfrage:beratung": "Beratung",
    "anfrage:rueckruf": "Rückruf",
  };

  return (
    <>
      <Kopf titel={vorname ? `Hallo ${vorname}` : "Heute"} text={`Dein Überblick für ${datum(jetzt)}.`}>
        {besuche.count ? (
          <Link href="/crm/besuche" className={buttonClass("secondary")}>
            Besuche heute: {besuche.count}
          </Link>
        ) : null}
        <Link href="/crm/leads" className={buttonClass("primary")}>
          Zu den Leads
        </Link>
      </Kopf>

      {rueckmeldungen.length > 0 ? (
        <Karte className="mb-6 border-2 border-ok/50">
          <h2 className="flex items-center justify-between border-b border-line bg-ok-light px-4 py-3 font-bold text-ink sm:px-5">
            <span>💬 Rückmeldungen von Kunden</span>
            <span className="rounded-full bg-ok px-2.5 py-0.5 text-sm text-white">{rueckmeldungen.length}</span>
          </h2>
          <ul className="space-y-2 p-3 sm:p-4">
            {rueckmeldungen.map((r) => (
              <li key={r.id}>
                <RueckmeldungZeile r={r} zurueck="/crm" firma={r.deals?.leads?.firma ?? "Kunde"} />
                {r.deals?.lead_id ? (
                  <Link href={`/crm/leads/${r.deals.lead_id}`} className="ml-10 mt-1 inline-flex min-h-9 items-center text-sm font-semibold text-brand hover:underline">
                    Zum Kunden →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </Karte>
      ) : null}

      {neueAnfragen.length > 0 ? (
        <Karte className="mb-6 border-2 border-brand">
          <h2 className="flex items-center justify-between border-b border-line bg-brand-light px-4 py-3 font-bold text-ink sm:px-5">
            <span>Neue Website-Anfragen für {profil.rolle === "admin" ? "das Team" : "dich"}</span>
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-sm text-white">{neueAnfragen.length}</span>
          </h2>
          <ul className="divide-y divide-line">
            {neueAnfragen.map((l) => (
              <li key={l.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <Link href={`/crm/leads/${l.id}`} className="min-w-0 hover:text-brand">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{l.firma}</span>
                    <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand">
                      {ART[l.quelle] ?? "Anfrage"}
                    </span>
                  </span>
                  <span className="block truncate text-sm text-muted">
                    {[l.ansprechpartner, l.branche].filter(Boolean).join(" · ") || "–"} · {datumZeit(l.created_at)}
                  </span>
                  {l.einwilligung_wie ? null : (
                    <span className="block text-sm text-amber-800">Kein Anruf erlaubt – per E-Mail antworten</span>
                  )}
                </Link>
                <span className="flex shrink-0 gap-2">
                  {l.telefon && l.einwilligung_wie ? (
                    <a href={`tel:${l.telefon.replace(/[^+0-9]/g, "")}`} className={buttonClass("primary", "flex-1 sm:flex-none")}>
                      Anrufen
                    </a>
                  ) : null}
                  {l.email ? (
                    <a href={`mailto:${l.email}`} className={buttonClass("secondary", "flex-1 sm:flex-none")}>
                      E-Mail
                    </a>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </Karte>
      ) : null}

      {(() => {
        const listen = [
          {
            id: "ueberfaellig",
            titel: "Überfällige Rückrufe",
            kurz: "überfällig",
            anzahl: ueberfaellig.data?.length ?? 0,
            rot: true,
            leer: "Nichts überfällig",
            inhalt: (
              <LeadListe
                leads={(ueberfaellig.data ?? []) as LeadZeile[]}
                leer=""
                zeit={(l) => datumZeit(l.naechster_rueckruf)}
                rot
              />
            ),
          },
          {
            id: "heute",
            titel: "Rückrufe heute",
            kurz: "heute",
            anzahl: heute.data?.length ?? 0,
            leer: "Keine Rückrufe mehr heute",
            inhalt: <LeadListe leads={(heute.data ?? []) as LeadZeile[]} leer="" zeit={(l) => uhrzeit(l.naechster_rueckruf)} />,
          },
          {
            id: "ohne-schritt",
            titel: "Ohne nächsten Schritt",
            kurz: "ohne Schritt",
            anzahl: ohneSchritt.count ?? 0,
            rot: true,
            leer: "Jeder Lead hat einen nächsten Schritt",
            inhalt: <LeadListe leads={(ohneSchritt.data ?? []) as LeadZeile[]} leer="" zeit={() => "planen"} rot />,
          },
          {
            id: "angebote",
            titel: "Offene Angebote",
            kurz: "Angebote",
            anzahl: angebote.data?.length ?? 0,
            leer: "Keine offenen Angebote",
            inhalt: (
              <LeadListe
                leads={(angebote.data ?? []) as LeadZeile[]}
                leer=""
                zeit={(l) => (l.naechster_rueckruf ? datum(l.naechster_rueckruf) : "")}
              />
            ),
          },
          ...(admin
            ? [
                {
                  id: "projekte",
                  titel: "Projekte fällig",
                  kurz: "Projekte",
                  anzahl: faelligeProjekte.length,
                  rot: true,
                  leer: "Keine Projekte fällig",
                  inhalt: (
                    <ul className="divide-y divide-line">
                      {faelligeProjekte.map((p) => (
                        <li key={p.id}>
                          <Link
                            href="/crm/projekte"
                            className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 hover:bg-bg sm:px-5"
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-ink">{p.leads?.firma ?? "–"}</span>
                              <span className="block text-sm text-muted">{PHASE_INFO[p.projekt_phase].label}</span>
                            </span>
                            <span
                              className={`shrink-0 text-sm font-semibold ${p.projekt_faellig < heuteWien() ? "text-danger" : "text-ink"}`}
                            >
                              {datum(`${p.projekt_faellig}T12:00:00Z`)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ),
                },
              ]
            : []),
          {
            id: "verkaeufe",
            titel: "Verkäufe dieser Woche",
            kurz: "Verkäufe",
            anzahl: deals.length,
            leer: "Diese Woche noch keine Verkäufe",
            inhalt: (
              <>
                <ul className="divide-y divide-line">
                  {deals.map((d) => (
                    <li key={d.id} className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 sm:px-5">
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-ink">{d.leads?.firma ?? "–"}</span>
                        <span className="block text-sm text-muted">
                          {PAKET_NAMEN[d.paket]} · {datum(d.created_at)}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold text-ink">{euro(d.betrag)}</span>
                    </li>
                  ))}
                </ul>
                <p className="flex justify-between border-t border-line px-4 py-3 text-sm font-semibold sm:px-5">
                  <span>Summe</span>
                  <span>{euro(summe)}</span>
                </p>
              </>
            ),
          },
        ];
        const offen = listen.filter((l) => l.anzahl > 0);
        const erledigt = listen.filter((l) => l.anzahl === 0);
        return (
          <>
            {/* Kurzüberblick: Zahlen zum Antippen, springen zur Liste */}
            <nav aria-label="Kurzüberblick" className="-mx-4 mb-5 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
              {listen.map((l) => {
                const warnung = l.rot && l.anzahl > 0;
                return (
                  <a
                    key={l.id}
                    href={l.anzahl > 0 ? `#${l.id}` : undefined}
                    className={`flex shrink-0 snap-start scroll-ml-4 items-baseline gap-1.5 rounded-full border px-3.5 py-2 text-sm ${
                      warnung
                        ? "border-danger/30 bg-danger-light text-danger"
                        : l.anzahl > 0
                          ? "border-line bg-surface text-ink"
                          : "border-line bg-bg text-muted"
                    }`}
                  >
                    <span className="text-base font-bold">{l.anzahl}</span> {l.kurz}
                  </a>
                );
              })}
            </nav>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
              {offen.map((l) => (
                <div key={l.id} id={l.id} className="min-w-0 scroll-mt-20">
                  <Block titel={l.titel} anzahl={l.anzahl} rot={l.rot}>
                    {l.inhalt}
                  </Block>
                </div>
              ))}
            </div>

            {erledigt.length > 0 ? (
              <Karte className="mt-5 px-4 py-3 sm:px-5 lg:mt-6">
                <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
                  {erledigt.map((l) => (
                    <li key={l.id} className="flex items-center gap-1.5">
                      <span aria-hidden className="font-bold text-ok">✓</span>
                      {l.leer}
                    </li>
                  ))}
                </ul>
              </Karte>
            ) : null}
          </>
        );
      })()}
    </>
  );
}
