import type { Metadata } from "next";
import Link from "next/link";
import { Kopf } from "@/components/crm/Kopf";
import { KarteAnsicht, type KartenLead, type StatusZahlen } from "@/components/crm/KarteAnsicht";
import { StatusBadge } from "@/components/crm/StatusBadge";
import type { LeadStatus } from "@/lib/status";
import { PositionenSuchen } from "@/components/crm/PositionenSuchen";
import { Karte, buttonClass } from "@/components/ui";
import { holeProfil } from "@/lib/crm";
import { createClient } from "@/lib/supabase/server";
import { positionZuruecksetzen } from "./actions";

export const metadata: Metadata = { title: "Karte" };
// Positionen suchen braucht etwas Zeit (1 Anfrage pro Sekunde)
export const maxDuration = 60;

const WICHTIG: LeadStatus[] = ["interessiert", "demo", "angebot", "rueckruf"];

export default async function KartenSeite({ searchParams }: PageProps<"/crm/karte">) {
  const profil = await holeProfil();
  const admin = profil.rolle === "admin";
  const sp = await searchParams;
  const team = admin && sp.alle === "1";
  const supabase = await createClient();

  let abfrage = supabase
    .from("leads")
    .select("id, firma, branche, adresse, bezirk, status, lat, lng, besuch_geplant, einwilligung_wie")
    .eq("geo_status", "ok")
    .not("lat", "is", null)
    .limit(3000);
  if (!team) abfrage = abfrage.eq("besitzer_id", profil.id);

  let offen = supabase.from("leads").select("id", { count: "exact", head: true }).is("geo_status", null).not("adresse", "is", null);
  let fehlt = supabase
    .from("leads")
    .select("id, firma, adresse, bezirk, status, besitzer:profiles!leads_besitzer_id_fkey(name)", { count: "exact" })
    .eq("geo_status", "nicht_gefunden")
    .order("firma")
    .limit(30);
  let ohneAdresse = supabase.from("leads").select("id", { count: "exact", head: true }).is("adresse", null);
  // Alle Leads für die Zahlen je Status – auch die ohne Pin
  let alle = supabase.from("leads").select("status, geo_status, lat").limit(5000);
  // Wichtige Leads, die (noch) keinen Pin haben
  let wichtig = supabase
    .from("leads")
    .select("id, firma, adresse, bezirk, status, geo_status, besitzer:profiles!leads_besitzer_id_fkey(name)")
    .in("status", WICHTIG)
    .or("geo_status.is.null,geo_status.neq.ok,lat.is.null")
    .order("firma")
    .limit(100);
  if (!team) {
    offen = offen.eq("besitzer_id", profil.id);
    fehlt = fehlt.eq("besitzer_id", profil.id);
    ohneAdresse = ohneAdresse.eq("besitzer_id", profil.id);
    alle = alle.eq("besitzer_id", profil.id);
    wichtig = wichtig.eq("besitzer_id", profil.id);
  }

  const [{ data }, o, f, a, z, w] = await Promise.all([abfrage, offen, fehlt, ohneAdresse, alle, wichtig]);
  const leads = (data ?? []) as KartenLead[];
  const zahlen: StatusZahlen = {};
  for (const l of (z.data ?? []) as { status: LeadStatus; geo_status: string | null; lat: number | null }[]) {
    const e = (zahlen[l.status] ??= { alle: 0, ohnePin: 0 });
    e.alle += 1;
    if (l.geo_status !== "ok" || l.lat === null) e.ohnePin += 1;
  }
  type OhnePin = { id: string; firma: string; adresse: string | null; bezirk: string | null; status: LeadStatus; geo_status: string | null; besitzer: { name: string } | null };
  const wichtige = (w.data ?? []) as unknown as OhnePin[];
  const fehlende = (f.data ?? []) as unknown as OhnePin[];
  const grund = (l: OhnePin) => (!l.adresse ? "Keine Adresse" : l.geo_status === "nicht_gefunden" ? "Adresse nicht gefunden" : "Position noch nicht gesucht");

  return (
    <>
      <Kopf titel="Karte" text={team ? "Alle Leads im Team auf einen Blick." : "Deine Leads auf einen Blick. Tippe auf einen Pin."}>
        {admin ? (
          <Link href={team ? "/crm/karte" : "/crm/karte?alle=1"} className={buttonClass("secondary")}>
            {team ? "Nur meine Leads" : "Ganzes Team zeigen"}
          </Link>
        ) : null}
      </Kopf>

      {(o.count ?? 0) > 0 ? (
        <div className="mb-4">
          <PositionenSuchen offen={o.count ?? 0} team={team} />
        </div>
      ) : null}

      <KarteAnsicht leads={leads} zahlen={zahlen} />

      {wichtige.length > 0 ? (
        <Karte className="mt-6 overflow-hidden border-amber-300">
          <div className="border-b border-line px-4 py-3 sm:px-5">
            <h2 className="font-bold text-ink">Wichtige Leads ohne Pin</h2>
            <p className="text-sm text-muted">Interessiert, Demo, Angebot und Rückruf, die nicht auf der Karte sind.</p>
          </div>
          <ul className="divide-y divide-line">
            {wichtige.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
                <div className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">{l.firma}</span>
                  <span className="block text-sm text-muted">
                    {grund(l)}
                    {l.adresse ? `: ${[l.adresse, l.bezirk].filter(Boolean).join(", ")}` : ""}
                  </span>
                </div>
                <span className="flex items-center gap-2 text-sm text-muted">
                  <StatusBadge status={l.status} />
                  {team && l.besitzer ? l.besitzer.name : null}
                </span>
                <Link href={`/crm/leads/${l.id}`} className={buttonClass("secondary", "px-3 text-sm")}>
                  Adresse korrigieren
                </Link>
              </li>
            ))}
          </ul>
        </Karte>
      ) : null}

      {(f.count ?? 0) > 0 || (a.count ?? 0) > 0 ? (
        <Karte className="mt-6 overflow-hidden">
          <h2 className="border-b border-line px-4 py-3 font-bold text-ink sm:px-5">Nicht auf der Karte</h2>
          {(a.count ?? 0) > 0 ? (
            <p className="border-b border-line px-4 py-3 text-sm text-muted sm:px-5">
              {a.count} {a.count === 1 ? "Lead hat" : "Leads haben"} keine Adresse.
            </p>
          ) : null}
          {fehlende.length > 0 ? (
            <ul className="divide-y divide-line">
              {fehlende.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-5">
                  <Link href={`/crm/leads/${l.id}`} className="min-w-0 hover:text-brand">
                    <span className="block truncate font-semibold text-ink">{l.firma}</span>
                    <span className="block truncate text-sm text-muted">
                      Adresse nicht gefunden: {[l.adresse, l.bezirk].filter(Boolean).join(", ")}
                    </span>
                  </Link>
                  <span className="ml-auto flex items-center gap-2 text-sm text-muted">
                    <StatusBadge status={l.status} />
                    {team && l.besitzer ? l.besitzer.name : null}
                  </span>
                  <form action={positionZuruecksetzen}>
                    <input type="hidden" name="id" value={l.id} />
                    <button className={buttonClass("ghost", "shrink-0 px-3 text-sm")}>Nochmal suchen</button>
                  </form>
                </li>
              ))}
            </ul>
          ) : null}
          {(f.count ?? 0) > 0 ? (
            <p className="border-t border-line px-4 py-3 text-xs text-muted sm:px-5">
              Tipp: Adresse beim Lead korrigieren (z. B. „Hauptstraße 7“ und Bezirk „2340 Mödling“) – dann wird sie automatisch neu gesucht.
            </p>
          ) : null}
        </Karte>
      ) : null}
    </>
  );
}
