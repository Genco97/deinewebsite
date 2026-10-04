"use server";

import { revalidatePath } from "next/cache";
import { holeProfil } from "@/lib/crm";
import { geocode, pause } from "@/lib/geocode";
import { createClient } from "@/lib/supabase/server";

export type PositionenStand = { rest: number; gefunden: number; nichtGefunden: number; fehler?: string };

const PRO_AUFRUF = 5;

/**
 * Sucht für ein paar Leads ohne Position die Koordinaten (1 Anfrage/Sekunde).
 * Die Seite ruft das so lange auf, bis nichts mehr offen ist.
 */
export async function positionenSuchen(team = false): Promise<PositionenStand> {
  const profil = await holeProfil();
  const nurMeine = !(team && profil.rolle === "admin");
  const supabase = await createClient();
  let offen = supabase
    .from("leads")
    .select("id, adresse, bezirk")
    .is("geo_status", null)
    .not("adresse", "is", null)
    .order("created_at", { ascending: false })
    .limit(PRO_AUFRUF);
  if (nurMeine) offen = offen.eq("besitzer_id", profil.id);
  const { data } = await offen;

  let gefunden = 0;
  let nichtGefunden = 0;
  let fehler: string | undefined;
  for (const [i, l] of (data ?? []).entries()) {
    if (i > 0) await pause(1100);
    try {
      const pos = await geocode(l);
      await supabase
        .from("leads")
        .update(pos ? { lat: pos.lat, lng: pos.lng, geo_status: "ok" } : { geo_status: "nicht_gefunden" })
        .eq("id", l.id);
      if (pos) gefunden++;
      else nichtGefunden++;
    } catch {
      fehler = "Der Kartendienst antwortet gerade nicht. Bitte später nochmal versuchen.";
      break;
    }
  }

  let rest = supabase.from("leads").select("id", { count: "exact", head: true }).is("geo_status", null).not("adresse", "is", null);
  if (nurMeine) rest = rest.eq("besitzer_id", profil.id);
  const { count } = await rest;
  if (gefunden || nichtGefunden) revalidatePath("/crm/karte");
  return { rest: count ?? 0, gefunden, nichtGefunden, fehler };
}

/** Adresse nicht gefunden → nach Korrektur erneut suchen lassen */
export async function positionZuruecksetzen(fd: FormData) {
  const id = fd.get("id");
  if (typeof id !== "string") return;
  const supabase = await createClient();
  await supabase.from("leads").update({ geo_status: null, lat: null, lng: null }).eq("id", id);
  revalidatePath("/crm/karte");
}
