import type { Metadata } from "next";
import Link from "next/link";
import { Balken, Kennzahl, Saeulen } from "@/components/crm/Diagramme";
import { TeamFeed, TeamTabelle } from "@/components/crm/Team";
import { HeuteErledigt, TagesRing, type TagEintrag } from "@/components/crm/MeinTag";
import { Karte } from "@/components/ui";
import { anzeigename, holeProfil } from "@/lib/crm";
import { ABGESCHLOSSEN, STATUS_LABEL, type LeadStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { sortiere, teamFeed, teamWoche } from "@/lib/team";
import { datum, euro, heuteWien, isoZuWienLokal, uhrzeit, wienGrenzen, wienZuIso } from "@/lib/zeit";

export const metadata: Metadata = { title: "Dashboard" };

const TRICHTER: LeadStatus[] = ["neu", "nicht_erreicht", "rueckruf", "interessiert", "demo", "angebot", "verkauft", "kein_interesse"];
const MONAT = new Intl.DateTimeFormat("de-AT", { month: "short", timeZone: "UTC" });

/** „2026-10“ ± n Monate */
function monatPlus(m: string, n: number) {
  const [j, mo] = m.split("-").map(Number);
  const d = new Date(Date.UTC(j, mo - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

const kurzEuro = (n: number) =>
  n >= 10000 ? `${Math.round(n / 1000).toLocaleString("de-AT")} Tsd. €` : `${Math.round(n).toLocaleString("de-AT")} €`;

function trend(jetzt: number, vorher: number) {
  if (vorher === 0) return null;
  const p = Math.round(((jetzt - vorher) / vorher) * 100);
  return { text: `${p > 0 ? "+" : ""}${p} %`, gut: p >= 0 };
}

type Deal = { betrag: number; created_at: string; partner_id: string | null };

/** Einträge, die als „Kontakt“ zählen – nicht: Zuteilung durch Gründer (system) und die automatische Notiz beim CSV-Import */
const KONTAKT_ARTEN = ["notiz", "status", "rueckruf", "besuch", "verkauf"];

function gruss(jetzt = new Date()) {
  const stunde = Number(isoZuWienLokal(jetzt.toISOString()).slice(11, 13));
  if (stunde < 11) return "Guten Morgen";
  if (stunde < 18) return "Guten Tag";
  return "Guten Abend";
}

const TAG_LANG = new Intl.DateTimeFormat("de-AT", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Vienna" });

export default async function Zahlen() {
  const profil = await holeProfil();
  const admin = profil.rolle === "admin";
  const supabase = await createClient();

  const dieserMonat = heuteWien().slice(0, 7);
  const monate = Array.from({ length: 6 }, (_, i) => monatPlus(dieserMonat, i - 5));
  const seit = wienZuIso(`${monate[0]}-01T00:00`)!;
  const monatStart = wienZuIso(`${dieserMonat}-01T00:00`)!;
  const { wocheStart, tagStart, tagEnde } = wienGrenzen();
  const heute = heuteWien();
  // Wochenanfänge der letzten 6 Wochen (für den Besuchs-Verlauf)
  const wochen = Array.from({ length: 6 }, (_, i) => new Date(Date.parse(wocheStart) - (5 - i) * 7 * 86400000).toISOString());
  const besucheSeit = monatStart < wochen[0] ? monatStart : wochen[0];

  let besuche = supabase
    .from("lead_verlauf")
    .select("autor_id, created_at")
    .eq("art", "besuch")
    .gte("created_at", besucheSeit)
    .limit(5000);
  if (!admin) besuche = besuche.eq("autor_id", profil.id);

  const offen = `(${ABGESCHLOSSEN.join(",")})`;
  const [heuteRes, faelligRes] = await Promise.all([
    supabase
      .from("lead_verlauf")
      .select("lead_id, art, created_at, leads(firma)")
      .eq("autor_id", profil.id)
      .in("art", KONTAKT_ARTEN)
      .not("text", "like", "Aus dem CSV-Import%") // automatische Import-Notizen sind keine Kontakte
      .gte("created_at", tagStart)
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("leads")
      .select("id, firma, naechster_rueckruf, besuch_geplant")
      .eq("besitzer_id", profil.id)
      .not("status", "in", offen)
      .or(`naechster_rueckruf.lt.${tagEnde},besuch_geplant.lte.${heute}`)
      .order("naechster_rueckruf", { ascending: true, nullsFirst: false })
      .limit(100),
  ]);

  // Mein Tag: Kontakte heute (je Lead einmal) und was noch offen ist
  type HeuteZeile = { lead_id: string; art: string; created_at: string; leads: { firma: string } | { firma: string }[] | null };
  const erledigt = new Map<string, { firma: string; zeit: string }>();
  for (const z of (heuteRes.data ?? []) as HeuteZeile[]) {
    if (erledigt.has(z.lead_id)) continue;
    const lead = Array.isArray(z.leads) ? z.leads[0] : z.leads;
    erledigt.set(z.lead_id, { firma: lead?.firma ?? "Lead", zeit: z.created_at });
  }
  type Faellig = { id: string; firma: string; naechster_rueckruf: string | null; besuch_geplant: string | null };
  const offenListe = ((faelligRes.data ?? []) as Faellig[]).filter((l) => !erledigt.has(l.id));
  const offenInfo = (l: Faellig) => {
    if (l.besuch_geplant && l.besuch_geplant <= heute) return l.besuch_geplant < heute ? `Besuch überfällig seit ${datum(l.besuch_geplant)}` : "Besuch heute";
    if (l.naechster_rueckruf && l.naechster_rueckruf < tagStart) return `Rückruf überfällig seit ${datum(l.naechster_rueckruf)}`;
    return `Rückruf heute ${uhrzeit(l.naechster_rueckruf)}`;
  };
  const tagEintraege: TagEintrag[] = [
    ...offenListe.slice(0, 5).map((l) => ({ id: l.id, firma: l.firma, erledigt: false, info: offenInfo(l) })),
    ...[...erledigt].slice(0, 8 - Math.min(5, offenListe.length)).map(([id, e]) => ({
      id,
      firma: e.firma,
      erledigt: true,
      info: `erledigt um ${uhrzeit(e.zeit)}`,
    })),
  ];

  const naechsteWoche = new Date(Date.parse(wocheStart) + 7 * 86400000 + 12 * 3600000);
  const [team, feed] = await Promise.all([teamWoche(wocheStart, wienGrenzen(naechsteWoche).wocheStart), teamFeed(7)]);

  const [dealsRes, besucheRes, personenRes, sorglosRes, ...statusRes] = await Promise.all([
    supabase.from("deals").select("betrag, created_at, partner_id").neq("status", "storniert").gte("created_at", seit).limit(5000),
    besuche,
    admin ? supabase.from("profiles").select("id, name, email, rolle, aktiv").eq("aktiv", true) : Promise.resolve({ data: [] }),
    supabase.from("deals").select("sorglos_monat").eq("betreuung", "sorglos").neq("status", "storniert").limit(5000),
    ...TRICHTER.map((s) => supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", s)),
  ]);

  const deals = (dealsRes.data ?? []) as Deal[];
  const monatVon = (iso: string) => isoZuWienLokal(iso).slice(0, 7);
  const umsatz = (m: string) => deals.filter((d) => monatVon(d.created_at) === m).reduce((s, d) => s + Number(d.betrag), 0);
  const anzahl = (m: string) => deals.filter((d) => monatVon(d.created_at) === m).length;

  const umsatzJetzt = umsatz(dieserMonat);
  // fairer Vergleich: Vormonat nur bis zum selben Tag
  const tagImMonat = heuteWien().slice(8, 10);
  const vormonat = monatPlus(dieserMonat, -1);
  const umsatzVorher = deals
    .filter((d) => {
      const lokal = isoZuWienLokal(d.created_at);
      return lokal.slice(0, 7) === vormonat && lokal.slice(8, 10) <= tagImMonat;
    })
    .reduce((s, d) => s + Number(d.betrag), 0);
  const verkaeufeJetzt = anzahl(dieserMonat);

  const sorglos = (sorglosRes.data ?? []) as { sorglos_monat: number | null }[];
  const sorglosMonat = sorglos.reduce((s, d) => s + Number(d.sorglos_monat ?? 0), 0);

  const zaehler = Object.fromEntries(TRICHTER.map((s, i) => [s, statusRes[i].count ?? 0])) as Record<LeadStatus, number>;
  const entschieden = zaehler.verkauft + zaehler.kein_interesse;
  const quote = entschieden > 0 ? Math.round((zaehler.verkauft / entschieden) * 100) : null;

  const besuchListe = (besucheRes.data ?? []) as { autor_id: string | null; created_at: string }[];
  const besucheWoche = besuchListe.filter((b) => b.created_at >= wocheStart).length;
  const besucheProWoche = wochen.map((w, i) => {
    const bis = wochen[i + 1] ?? "9999";
    return besuchListe.filter((b) => b.created_at >= w && b.created_at < bis).length;
  });

  const rangliste = admin
    ? ((personenRes.data ?? []) as { id: string; name: string; email: string; rolle: string }[])
        .map((p) => {
          const eigene = deals.filter((d) => d.partner_id === p.id && monatVon(d.created_at) === dieserMonat);
          return {
            name: anzeigename(p) + (p.rolle === "admin" ? " (Gründer)" : ""),
            verkaeufe: eigene.length,
            umsatz: eigene.reduce((s, d) => s + Number(d.betrag), 0),
            besuche: besuchListe.filter((b) => b.autor_id === p.id && b.created_at >= monatStart).length,
          };
        })
        .sort((a, b) => b.umsatz - a.umsatz || b.verkaeufe - a.verkaeufe || b.besuche - a.besuche)
    : [];
  const rangMax = Math.max(1, ...rangliste.map((r) => r.umsatz));
  const monatName = new Intl.DateTimeFormat("de-AT", { month: "long", timeZone: "UTC" }).format(new Date(`${dieserMonat}-15T12:00:00Z`));

  return (
    <>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">{TAG_LANG.format(new Date())}</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {gruss()}, {anzeigename(profil).split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted">{admin ? "Dein Tag und wie es im ganzen Team läuft." : "Dein Tag und wie es bei dir läuft."}</p>
      </div>

      <div className="mb-6 grid items-start gap-4 lg:grid-cols-2">
        <TagesRing kontakte={erledigt.size} ziel={profil.tagesziel} />
        <HeuteErledigt eintraege={tagEintraege} gesamtOffen={offenListe.length} gesamtErledigt={erledigt.size} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kennzahl
          titel={`Umsatz im ${monatName}`}
          wert={euro(umsatzJetzt)}
          trend={trend(umsatzJetzt, umsatzVorher)}
          zusatz={`Vormonat bis heute: ${euro(umsatzVorher)}`}
          verlauf={monate.map(umsatz)}
          verlaufText="Umsatz der letzten 6 Monate"
        />
        <Kennzahl
          titel={`Verkäufe im ${monatName}`}
          wert={String(verkaeufeJetzt)}
          zusatz={verkaeufeJetzt > 0 ? `Ø ${euro(umsatzJetzt / verkaeufeJetzt)}` : "noch keine"}
          verlauf={monate.map(anzahl)}
          verlaufText="Verkäufe der letzten 6 Monate"
        />
        <Kennzahl
          titel="Abschlussquote"
          wert={quote === null ? "–" : `${quote} %`}
          zusatz={entschieden > 0 ? `${zaehler.verkauft} von ${entschieden} entschiedenen Leads` : "noch keine Ergebnisse"}
        />
        <Kennzahl
          titel="Besuche diese Woche"
          wert={String(besucheWoche)}
          zusatz={admin ? "im ganzen Team" : "von dir"}
          verlauf={besucheProWoche}
          verlaufText="Besuche der letzten 6 Wochen"
        />
        <Kennzahl
          titel="Sorglos-Pakete"
          wert={`${euro(sorglosMonat)}`}
          zusatz={`pro Monat · ${sorglos.length} ${sorglos.length === 1 ? "Kunde" : "Kunden"}`}
        />
      </div>

      <div className="mb-6 grid items-start gap-6 lg:grid-cols-[1fr_1.4fr]">
        <TeamFeed eintraege={feed} max={6} />
        <Karte className="overflow-hidden">
          <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3">
            <h2 className="font-bold text-ink">Team diese Woche</h2>
            <Link href="/crm/team" className="text-sm font-semibold text-brand hover:underline">
              Alle Zahlen
            </Link>
          </div>
          <TeamTabelle zeilen={sortiere(team, "kontakte")} sortiert="kontakte" />
        </Karte>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Karte className="p-4 sm:p-5">
          <h2 className="font-bold text-ink">Umsatz pro Monat</h2>
          <p className="mb-4 text-sm text-muted">Gemeldete Verkäufe (ohne stornierte), letzte 6 Monate</p>
          <Saeulen
            titel="Umsatz pro Monat"
            achse={kurzEuro}
            daten={monate.map((m) => ({
              label: MONAT.format(new Date(`${m}-15T12:00:00Z`)),
              wert: umsatz(m),
              text: kurzEuro(umsatz(m)),
            }))}
          />
        </Karte>

        <Karte className="p-4 sm:p-5">
          <h2 className="font-bold text-ink">Leads nach Status</h2>
          <p className="mb-4 text-sm text-muted">{admin ? "Alle Leads im Team" : "Deine Leads"}</p>
          <Balken daten={TRICHTER.map((s) => ({ label: STATUS_LABEL[s], wert: zaehler[s], text: zaehler[s].toLocaleString("de-AT") }))} />
        </Karte>
      </div>

      {admin ? (
        <Karte className="mt-6 overflow-hidden">
          <div className="border-b border-line px-4 py-3 sm:px-5">
            <h2 className="font-bold text-ink">Rangliste {monatName}</h2>
            <p className="text-sm text-muted">Nach Umsatz, dann Verkäufen und Besuchen</p>
          </div>
          <div>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-bg text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="w-10 px-4 py-2.5 font-semibold sm:px-5">#</th>
                  <th className="px-2 py-2.5 font-semibold">Name</th>
                  <th className="hidden px-2 py-2.5 text-right font-semibold sm:table-cell">Besuche</th>
                  <th className="hidden px-2 py-2.5 text-right font-semibold sm:table-cell">Verkäufe</th>
                  <th className="px-4 py-2.5 font-semibold sm:px-5">Umsatz</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rangliste.map((r, i) => (
                  <tr key={r.name + i}>
                    <td className="px-4 py-2.5 font-semibold text-muted sm:px-5">{i + 1}</td>
                    <td className="px-2 py-2.5">
                      <span className="font-semibold text-ink">{r.name}</span>
                      <span className="block text-xs text-muted sm:hidden">
                        {r.besuche} {r.besuche === 1 ? "Besuch" : "Besuche"} · {r.verkaeufe}{" "}
                        {r.verkaeufe === 1 ? "Verkauf" : "Verkäufe"}
                      </span>
                    </td>
                    <td className="hidden px-2 py-2.5 text-right text-ink sm:table-cell">{r.besuche}</td>
                    <td className="hidden px-2 py-2.5 text-right text-ink sm:table-cell">{r.verkaeufe}</td>
                    <td className="px-4 py-2.5 sm:px-5">
                      <span className="flex items-center gap-2">
                        <span
                          className="hidden h-2.5 rounded-r bg-chart sm:block"
                          style={{ width: `${(r.umsatz / rangMax) * 60}%`, minWidth: r.umsatz > 0 ? 4 : 0 }}
                        />
                        <span className="shrink-0 font-semibold text-ink">{euro(r.umsatz)}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Karte>
      ) : null}
    </>
  );
}
