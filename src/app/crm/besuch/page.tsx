import type { Metadata } from "next";
import { BesuchModus, type BesuchLead } from "@/components/crm/BesuchModus";
import { holeProfil } from "@/lib/crm";
import { createClient } from "@/lib/supabase/server";
import { wienGrenzen } from "@/lib/zeit";

export const metadata: Metadata = { title: "Besuch-Modus" };

// Offen für einen Besuch: noch keine Zustimmung, nicht abgeschlossen, mit Adresse, heute noch nicht besucht
const OFFEN = ["neu", "nicht_erreicht", "rueckruf", "interessiert", "demo"];

export default async function BesuchSeite() {
  const profil = await holeProfil();
  const supabase = await createClient();
  const { tagStart } = wienGrenzen();
  const [leads, besucht] = await Promise.all([
    supabase
      .from("leads")
      .select("id, firma, branche, adresse, bezirk, lat, lng, telefon, ansprechpartner, letzter_besuch")
      .eq("besitzer_id", profil.id)
      .is("einwilligung_wie", null)
      .in("status", OFFEN)
      .not("adresse", "is", null)
      .neq("adresse", "")
      .or(`letzter_besuch.is.null,letzter_besuch.lt.${tagStart}`)
      .order("bezirk", { ascending: true, nullsFirst: false })
      .order("adresse")
      .limit(1000),
    supabase
      .from("lead_verlauf")
      .select("id", { count: "exact", head: true })
      .eq("autor_id", profil.id)
      .eq("art", "besuch")
      .gte("created_at", tagStart),
  ]);

  return (
    <BesuchModus
      leads={(leads.data ?? []) as BesuchLead[]}
      heuteBesucht={besucht.count ?? 0}
      ziel={Math.max(1, profil.tagesziel || 15)}
    />
  );
}
