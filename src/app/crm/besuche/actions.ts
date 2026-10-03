"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BESUCH_ERGEBNISSE, istBesuchErgebnis } from "@/lib/besuche";
import { holeProfil } from "@/lib/crm";
import { createClient } from "@/lib/supabase/server";
import { text } from "@/lib/validierung";
import { istTag } from "@/lib/zeit";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function zurueck(ziel: string, fehler?: string): never {
  redirect(fehler ? `${ziel}${ziel.includes("?") ? "&" : "?"}fehler=${encodeURIComponent(fehler)}` : ziel);
}

/** Zieladresse nach der Aktion – nur interne CRM-Pfade */
function ziel(fd: FormData) {
  const z = text(fd, "zurueck", 300);
  return z.startsWith("/crm") && !z.startsWith("//") ? z : "/crm/besuche";
}

export async function besucheEinplanen(fd: FormData) {
  await holeProfil();
  const tag = text(fd, "tag", 10);
  const ids = fd.getAll("ids").filter((v): v is string => typeof v === "string" && UUID.test(v));
  const z = ziel(fd);
  if (!istTag(tag)) zurueck(z, "Bitte wähle einen Tag.");
  if (ids.length === 0) zurueck(z, "Bitte wähle mindestens einen Betrieb aus.");

  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ besuch_geplant: tag }).in("id", ids.slice(0, 200));
  revalidatePath("/crm/besuche");
  revalidatePath("/crm");
  ids.forEach((id) => revalidatePath(`/crm/leads/${id}`));
  if (error) zurueck(z, "Das Einplanen hat nicht geklappt. Bitte versuch es nochmal.");
  zurueck(z);
}

export async function ausRundeEntfernen(fd: FormData) {
  const id = text(fd, "id", 50);
  const supabase = await createClient();
  await supabase.from("leads").update({ besuch_geplant: null }).eq("id", id);
  revalidatePath("/crm/besuche");
  revalidatePath(`/crm/leads/${id}`);
  revalidatePath("/crm");
  zurueck(ziel(fd));
}

export async function besuchErfassen(fd: FormData) {
  const profil = await holeProfil();
  const id = text(fd, "id", 50);
  const ergebnis = text(fd, "ergebnis", 30);
  const z = ziel(fd);
  if (!UUID.test(id) || !istBesuchErgebnis(ergebnis)) zurueck(z, "Ungültige Eingabe.");
  const e = BESUCH_ERGEBNISSE[ergebnis];

  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("id, status, einwilligung_wie").eq("id", id).maybeSingle();
  if (!lead) zurueck(z, "Betrieb nicht gefunden.");

  const update: Record<string, unknown> = { letzter_besuch: new Date().toISOString(), besuch_geplant: null };
  if (e.status && lead.status !== "verkauft" && lead.status !== "nicht_anrufen") update.status = e.status;
  if (e.status === "kein_interesse") update.naechster_rueckruf = null;
  const einwilligung = fd.get("einwilligung") === "on" && ergebnis !== "nicht_angetroffen";
  if (einwilligung && !lead.einwilligung_wie && lead.status !== "nicht_anrufen") {
    update.einwilligung_wie = "Persönlich beim Besuch";
  }

  const { error } = await supabase.from("leads").update(update).eq("id", id);
  if (error) zurueck(z, "Das Speichern hat nicht geklappt. Bitte versuch es nochmal.");

  const notiz = text(fd, "notiz", 1000);
  await supabase.from("lead_verlauf").insert({
    lead_id: id,
    autor_id: profil.id,
    art: "besuch",
    text: `Besuch: ${e.label}${notiz ? `\n${notiz}` : ""}`,
  });

  revalidatePath("/crm/besuche");
  revalidatePath(`/crm/leads/${id}`);
  revalidatePath("/crm");
  zurueck(z);
}
