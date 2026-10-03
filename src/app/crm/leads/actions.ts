"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { holeProfil } from "@/lib/crm";
import { PAKETE, istPaket } from "@/lib/pakete";
import { istLeadStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { istEmail, text } from "@/lib/validierung";
import { wienZuIso } from "@/lib/zeit";

export type AktionStatus = { meldung?: string; ok?: boolean };

function fehlerText(msg: string | undefined) {
  if (!msg) return "Das hat nicht geklappt. Bitte versuch es nochmal.";
  if (msg.includes("Nur ein Admin")) return msg;
  return "Das hat nicht geklappt. Bitte versuch es nochmal.";
}

// ---------------------------------------------------------------------------
// Lead anlegen
// ---------------------------------------------------------------------------
export async function leadAnlegen(_v: AktionStatus, fd: FormData): Promise<AktionStatus> {
  const profil = await holeProfil();
  const firma = text(fd, "firma");
  const email = text(fd, "email");
  if (!firma) return { meldung: "Bitte gib den Namen der Firma ein." };
  if (email && !istEmail(email)) return { meldung: "Die E-Mail-Adresse sieht nicht gültig aus." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      firma,
      ansprechpartner: text(fd, "ansprechpartner") || null,
      branche: text(fd, "branche") || null,
      telefon: text(fd, "telefon", 50) || null,
      email: email || null,
      adresse: text(fd, "adresse") || null,
      bezirk: text(fd, "bezirk", 100) || null,
      besitzer_id: profil.id,
    })
    .select("id")
    .single();

  if (error || !data) return { meldung: fehlerText(error?.message) };
  revalidatePath("/crm/leads");
  redirect(`/crm/leads/${data.id}`);
}

// ---------------------------------------------------------------------------
// CSV-Import
// ---------------------------------------------------------------------------
export type ImportZeile = { firma: string; branche: string; telefon: string; adresse: string; bezirk: string };

export async function leadsImportieren(
  zeilen: ImportZeile[],
): Promise<{ ok: boolean; meldung: string; importiert?: number; doppelt?: number }> {
  const profil = await holeProfil();
  if (!Array.isArray(zeilen) || zeilen.length === 0) return { ok: false, meldung: "Keine Zeilen zum Importieren." };
  if (zeilen.length > 2000) return { ok: false, meldung: "Bitte höchstens 2.000 Zeilen pro Import." };

  const s = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const bereinigt = zeilen
    .map((z) => ({
      firma: s(z.firma),
      branche: s(z.branche) || null,
      telefon: s(z.telefon, 50) || null,
      adresse: s(z.adresse) || null,
      bezirk: s(z.bezirk, 100) || null,
    }))
    .filter((z) => z.firma);

  const supabase = await createClient();

  // Doppelte Telefonnummern (bei eigenen Leads bzw. als Admin bei allen) überspringen
  const nummern = bereinigt.map((z) => z.telefon).filter((t): t is string => !!t);
  const vorhanden = new Set<string>();
  for (let i = 0; i < nummern.length; i += 300) {
    const { data } = await supabase.from("leads").select("telefon").in("telefon", nummern.slice(i, i + 300));
    data?.forEach((d) => d.telefon && vorhanden.add(d.telefon));
  }
  const gesehen = new Set<string>();
  const neu = bereinigt.filter((z) => {
    if (!z.telefon) return true;
    if (vorhanden.has(z.telefon) || gesehen.has(z.telefon)) return false;
    gesehen.add(z.telefon);
    return true;
  });

  for (let i = 0; i < neu.length; i += 500) {
    const { error } = await supabase
      .from("leads")
      .insert(neu.slice(i, i + 500).map((z) => ({ ...z, quelle: "csv", besitzer_id: profil.id })));
    if (error) return { ok: false, meldung: `Import nach ${i} Zeilen abgebrochen. Bitte prüfe die Datei.` };
  }

  revalidatePath("/crm/leads");
  revalidatePath("/crm");
  return {
    ok: true,
    importiert: neu.length,
    doppelt: bereinigt.length - neu.length,
    meldung: `${neu.length} Leads importiert${bereinigt.length - neu.length ? `, ${bereinigt.length - neu.length} doppelte übersprungen` : ""}.`,
  };
}

// ---------------------------------------------------------------------------
// Status, Rückruf, Notiz, Kontakt
// ---------------------------------------------------------------------------
export async function statusSetzen(fd: FormData) {
  const id = text(fd, "id", 50);
  const status = text(fd, "status", 30);
  if (!istLeadStatus(status)) return;
  const supabase = await createClient();
  const update: Record<string, unknown> = { status };
  if (status === "kein_interesse" || status === "nicht_anrufen" || status === "verkauft") {
    update.naechster_rueckruf = null;
  }
  const { error } = await supabase.from("leads").update(update).eq("id", id);
  revalidatePath(`/crm/leads/${id}`);
  if (error) redirect(`/crm/leads/${id}?fehler=${encodeURIComponent(fehlerText(error.message))}`);
}

export async function rueckrufSetzen(fd: FormData) {
  const id = text(fd, "id", 50);
  const wert = text(fd, "rueckruf", 20);
  const iso = wert ? wienZuIso(wert) : null;
  const supabase = await createClient();
  const update: Record<string, unknown> = { naechster_rueckruf: iso };
  if (iso && fd.get("als_rueckruf") === "on") update.status = "rueckruf";
  const { error } = await supabase.from("leads").update(update).eq("id", id);
  revalidatePath(`/crm/leads/${id}`);
  revalidatePath("/crm");
  if (error) redirect(`/crm/leads/${id}?fehler=${encodeURIComponent(fehlerText(error.message))}`);
}

export async function notizHinzufuegen(fd: FormData) {
  const profil = await holeProfil();
  const id = text(fd, "id", 50);
  const notiz = text(fd, "notiz", 4000);
  if (!notiz) return;
  const supabase = await createClient();
  await supabase.from("lead_verlauf").insert({ lead_id: id, autor_id: profil.id, art: "notiz", text: notiz });
  revalidatePath(`/crm/leads/${id}`);
}

export async function kontaktSpeichern(_v: AktionStatus, fd: FormData): Promise<AktionStatus> {
  const id = text(fd, "id", 50);
  const firma = text(fd, "firma");
  const email = text(fd, "email");
  if (!firma) return { meldung: "Die Firma darf nicht leer sein." };
  if (email && !istEmail(email)) return { meldung: "Die E-Mail-Adresse sieht nicht gültig aus." };
  const supabase = await createClient();

  const update: Record<string, unknown> = {
    firma,
    ansprechpartner: text(fd, "ansprechpartner") || null,
    branche: text(fd, "branche") || null,
    email: email || null,
    adresse: text(fd, "adresse") || null,
    bezirk: text(fd, "bezirk", 100) || null,
  };
  // Die Telefonnummer ist bei „nicht anrufen“ ausgeblendet und wird dann nicht überschrieben.
  if (fd.has("telefon")) update.telefon = text(fd, "telefon", 50) || null;

  const { error } = await supabase.from("leads").update(update).eq("id", id);
  if (error) return { meldung: fehlerText(error.message) };
  revalidatePath(`/crm/leads/${id}`);
  return { ok: true, meldung: "Gespeichert." };
}

// ---------------------------------------------------------------------------
// Verkauf melden
// ---------------------------------------------------------------------------
export async function verkaufMelden(_v: AktionStatus, fd: FormData): Promise<AktionStatus> {
  const profil = await holeProfil();
  const id = text(fd, "id", 50);
  const paketId = text(fd, "paket", 20);
  if (!istPaket(paketId)) return { meldung: "Bitte wähle ein Paket." };
  const paket = PAKETE.find((p) => p.id === paketId)!;

  let betrag = paket.preis;
  if (paket.id === "premium") {
    const roh = Number(text(fd, "betrag", 20).replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(roh) || roh < paket.preis) return { meldung: "Premium startet bei 2.000 €. Bitte gib den vereinbarten Betrag ein." };
    betrag = Math.round(roh * 100) / 100;
  }

  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("id, besitzer_id, status").eq("id", id).single();
  if (!lead) return { meldung: "Lead nicht gefunden." };
  if (lead.status === "nicht_anrufen") return { meldung: "Für diesen Lead gilt „Nicht anrufen“." };

  const { count } = await supabase
    .from("deals")
    .select("id", { count: "exact", head: true })
    .eq("lead_id", id)
    .neq("status", "storniert");
  if (count) return { meldung: "Für diesen Lead ist bereits ein Verkauf eingetragen." };

  const { error } = await supabase.from("deals").insert({
    lead_id: id,
    partner_id: profil.rolle === "admin" ? (lead.besitzer_id ?? profil.id) : profil.id,
    paket: paket.id,
    betrag,
    status: "gemeldet",
    aenderungsrunden_inkl: paket.aenderungsrunden,
  });
  if (error) return { meldung: fehlerText(error.message) };

  await supabase.from("leads").update({ status: "verkauft", naechster_rueckruf: null }).eq("id", id);
  await supabase.from("lead_verlauf").insert({
    lead_id: id,
    autor_id: profil.id,
    art: "verkauf",
    text: `Verkauf gemeldet: ${paket.name} (${betrag.toLocaleString("de-AT")} €)`,
  });

  revalidatePath(`/crm/leads/${id}`);
  revalidatePath("/crm");
  return { ok: true, meldung: "Verkauf gemeldet. Ein Admin prüft ihn und trägt die Zahlung ein." };
}
