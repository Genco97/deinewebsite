import type { Metadata } from "next";
import Link from "next/link";
import { Kopf } from "@/components/crm/Kopf";
import { KarteAnsicht, type KartenLead } from "@/components/crm/KarteAnsicht";
import { PositionenSuchen } from "@/components/crm/PositionenSuchen";
import { Karte, buttonClass } from "@/components/ui";
import { holeProfil } from "@/lib/crm";
import { createClient } from "@/lib/supabase/server";
import { positionZuruecksetzen } from "./actions";

export const metadata: Metadata = { title: "Karte" };
// Positionen suchen braucht etwas Zeit (1 Anfrage pro Sekunde)
export const maxDuration = 60;

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
    .select("id, firma, adresse, bezirk", { count: "exact" })
    .eq("geo_status", "nicht_gefunden")
    .order("firma")
    .limit(30);
  let ohneAdresse = supabase.from("leads").select("id", { count: "exact", head: true }).is("adresse", null);
  if (!team) {
    offen = offen.eq("besitzer_id", profil.id);
    fehlt = fehlt.eq("besitzer_id", profil.id);
    ohneAdresse = ohneAdresse.eq("besitzer_id", profil.id);
  }

  const [{ data }, o, f, a] = await Promise.all([abfrage, offen, fehlt, ohneAdresse]);
  const leads = (data ?? []) as KartenLead[];

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

      <KarteAnsicht leads={leads} />

      {(f.count ?? 0) > 0 || (a.count ?? 0) > 0 ? (
        <Karte className="mt-6 overflow-hidden">
          <h2 className="border-b border-line px-4 py-3 font-bold text-ink sm:px-5">Nicht auf der Karte</h2>
          {(a.count ?? 0) > 0 ? (
            <p className="border-b border-line px-4 py-3 text-sm text-muted sm:px-5">
              {a.count} {a.count === 1 ? "Lead hat" : "Leads haben"} keine Adresse.
            </p>
          ) : null}
          {(f.data ?? []).length > 0 ? (
            <ul className="divide-y divide-line">
              {(f.data ?? []).map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-2 sm:px-5">
                  <Link href={`/crm/leads/${l.id}`} className="min-w-0 hover:text-brand">
                    <span className="block truncate font-semibold text-ink">{l.firma}</span>
                    <span className="block truncate text-sm text-muted">
                      Adresse nicht gefunden: {[l.adresse, l.bezirk].filter(Boolean).join(", ")}
                    </span>
                  </Link>
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
