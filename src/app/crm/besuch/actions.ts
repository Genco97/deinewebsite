"use server";

import { revalidatePath } from "next/cache";
import { holeProfil } from "@/lib/crm";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Ergebnis = { ok: boolean; meldung?: string };

function neuLaden(id: string) {
  revalidatePath("/crm/besuch");
  revalidatePath("/crm/leads");
  revalidatePath(`/crm/leads/${id}`);
  revalidatePath("/crm");
}

async function ladeLead(id: string) {
  if (!UUID.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("leads").select("id, status, telefon, ansprechpartner, einwilligung_wie").eq("id", id).maybeSingle();
  return data ? { supabase, lead: data } : null;
}

/** Vor Ort das OK zum Anrufen bekommen: Zustimmung, Ansprechpartner, Telefon und Rückruf in einem Schritt. */
export async function besuchOk(id: string, name: string, telefon: string, termin: string): Promise<Ergebnis> {
  const profil = await holeProfil();
  const x = await ladeLead(id);
  if (!x) return { ok: false, meldung: "Betrieb nicht gefunden." };
  const { supabase, lead } = x;
  if (lead.status === "nicht_anrufen" || lead.status === "verkauft") return { ok: false, meldung: "Dieser Betrieb ist gesperrt oder schon Kunde." };

  const n = name.trim().slice(0, 100);
  const t = telefon.trim().slice(0, 50);
  if (!n) return { ok: false, meldung: "Bitte trag ein, mit wem du gesprochen hast." };
  if (!lead.telefon && t.replace(/\D/g, "").length < 6) return { ok: false, meldung: "Bitte trag eine Telefonnummer ein." };
  const zeit = Date.parse(termin);
  if (!Number.isFinite(zeit)) return { ok: false, meldung: "Bitte wähle, wann angerufen werden soll." };

  const update: Record<string, unknown> = {
    einwilligung_wie: lead.einwilligung_wie ?? "Persönlich beim Besuch",
    status: "rueckruf",
    naechster_rueckruf: new Date(zeit).toISOString(),
    letzter_besuch: new Date().toISOString(),
    besuch_geplant: null,
  };
  if (!lead.ansprechpartner) update.ansprechpartner = n;
  if (!lead.telefon && t) update.telefon = t;
  const { error } = await supabase.from("leads").update(update).eq("id", lead.id);
  if (error) return { ok: false, meldung: "Speichern hat nicht geklappt. Bitte nochmal versuchen." };

  const wann = new Date(zeit).toLocaleString("de-AT", { timeZone: "Europe/Vienna", weekday: "short", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
  await supabase.from("lead_verlauf").insert({
    lead_id: lead.id,
    autor_id: profil.id,
    art: "besuch",
    text: `Besuch: OK zum Anrufen bekommen – von ${n}${t && !lead.telefon ? ` (Tel. ${t})` : ""}. Rückruf ${wann}.`,
  });
  neuLaden(lead.id);
  return { ok: true };
}

/** Niemand angetroffen – Lead bleibt offen, taucht heute aber nicht mehr auf. */
export async function besuchNichtDa(id: string): Promise<Ergebnis> {
  const profil = await holeProfil();
  const x = await ladeLead(id);
  if (!x) return { ok: false, meldung: "Betrieb nicht gefunden." };
  const { supabase, lead } = x;
  const { error } = await supabase.from("leads").update({ letzter_besuch: new Date().toISOString(), besuch_geplant: null }).eq("id", lead.id);
  if (error) return { ok: false, meldung: "Speichern hat nicht geklappt." };
  await supabase.from("lead_verlauf").insert({ lead_id: lead.id, autor_id: profil.id, art: "besuch", text: "Besuch: niemand angetroffen – später nochmal." });
  neuLaden(lead.id);
  return { ok: true };
}

export async function besuchKeinInteresse(id: string): Promise<Ergebnis> {
  const profil = await holeProfil();
  const x = await ladeLead(id);
  if (!x) return { ok: false, meldung: "Betrieb nicht gefunden." };
  const { supabase, lead } = x;
  if (lead.status === "verkauft") return { ok: false, meldung: "Dieser Betrieb ist schon Kunde." };
  const { error } = await supabase
    .from("leads")
    .update({ status: "kein_interesse", naechster_rueckruf: null, letzter_besuch: new Date().toISOString(), besuch_geplant: null })
    .eq("id", lead.id);
  if (error) return { ok: false, meldung: "Speichern hat nicht geklappt." };
  await supabase.from("lead_verlauf").insert({ lead_id: lead.id, autor_id: profil.id, art: "besuch", text: "Besuch: kein Interesse." });
  neuLaden(lead.id);
  return { ok: true };
}
