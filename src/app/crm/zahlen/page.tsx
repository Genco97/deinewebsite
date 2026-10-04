import type { Metadata } from "next";
import { Balken, Kennzahl, Saeulen } from "@/components/crm/Diagramme";
import { Kopf } from "@/components/crm/Kopf";
import { Karte } from "@/components/ui";
import { anzeigename, holeProfil } from "@/lib/crm";
import { STATUS_LABEL, type LeadStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { euro, heuteWien, isoZuWienLokal, wienGrenzen, wienZuIso } from "@/lib/zeit";

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

export default async function Zahlen() {
  const profil = await holeProfil();
  const admin = profil.rolle === "admin";
  const supabase = await createClient();

  const dieserMonat = heuteWien().slice(0, 7);
  const monate = Array.from({ length: 6 }, (_, i) => monatPlus(dieserMonat, i - 5));
  const seit = wienZuIso(`${monate[0]}-01T00:00`)!;
  const monatStart = wienZuIso(`${dieserMonat}-01T00:00`)!;
  const { wocheStart } = wienGrenzen();

  let besuche = supabase
    .from("lead_verlauf")
    .select("autor_id, created_at")
    .eq("art", "besuch")
    .gte("created_at", monatStart < wocheStart ? monatStart : wocheStart)
    .limit(5000);
  if (!admin) besuche = besuche.eq("autor_id", profil.id);

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
      <Kopf titel="Dashboard" text={admin ? "Wie läuft es im ganzen Team?" : "Wie läuft es bei dir?"} />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kennzahl
          titel={`Umsatz im ${monatName}`}
          wert={euro(umsatzJetzt)}
          trend={trend(umsatzJetzt, umsatzVorher)}
          zusatz={`Vormonat bis heute: ${euro(umsatzVorher)}`}
        />
        <Kennzahl
          titel={`Verkäufe im ${monatName}`}
          wert={String(verkaeufeJetzt)}
          zusatz={verkaeufeJetzt > 0 ? `Ø ${euro(umsatzJetzt / verkaeufeJetzt)}` : "noch keine"}
        />
        <Kennzahl
          titel="Abschlussquote"
          wert={quote === null ? "–" : `${quote} %`}
          zusatz={entschieden > 0 ? `${zaehler.verkauft} von ${entschieden} entschiedenen Leads` : "noch keine Ergebnisse"}
        />
        <Kennzahl titel="Besuche diese Woche" wert={String(besucheWoche)} zusatz={admin ? "im ganzen Team" : "von dir"} />
        <Kennzahl
          titel="Sorglos-Pakete"
          wert={`${euro(sorglosMonat)}`}
          zusatz={`pro Monat · ${sorglos.length} ${sorglos.length === 1 ? "Kunde" : "Kunden"}`}
        />
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
