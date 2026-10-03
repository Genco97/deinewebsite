import type { Metadata } from "next";
import Link from "next/link";
import { Kopf } from "@/components/crm/Kopf";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { Karte, buttonClass } from "@/components/ui";
import { holeProfil } from "@/lib/crm";
import { PAKET_NAMEN, type PaketId } from "@/lib/pakete";
import { ABGESCHLOSSEN, type LeadStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { datum, datumZeit, euro, heuteWien, uhrzeit, wienGrenzen } from "@/lib/zeit";

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
  const [neu, heute, ueberfaellig, angebote, verkaeufe, besuche] = await Promise.all([
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
  ]);

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

      <div className="grid gap-6 lg:grid-cols-2">
        <Block titel="Überfällige Rückrufe" anzahl={ueberfaellig.data?.length ?? 0} rot>
          <LeadListe
            leads={(ueberfaellig.data ?? []) as LeadZeile[]}
            leer="Nichts überfällig. Gut gemacht."
            zeit={(l) => datumZeit(l.naechster_rueckruf)}
            rot
          />
        </Block>

        <Block titel="Rückrufe heute" anzahl={heute.data?.length ?? 0}>
          <LeadListe
            leads={(heute.data ?? []) as LeadZeile[]}
            leer="Für heute sind keine weiteren Rückrufe geplant."
            zeit={(l) => uhrzeit(l.naechster_rueckruf)}
          />
        </Block>

        <Block titel="Offene Angebote" anzahl={angebote.data?.length ?? 0}>
          <LeadListe
            leads={(angebote.data ?? []) as LeadZeile[]}
            leer="Keine offenen Angebote."
            zeit={(l) => (l.naechster_rueckruf ? datum(l.naechster_rueckruf) : "")}
          />
        </Block>

        <Block titel="Verkäufe dieser Woche" anzahl={deals.length}>
          {deals.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted sm:px-5">Diese Woche noch keine Verkäufe.</p>
          ) : (
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
          )}
        </Block>
      </div>
    </>
  );
}
