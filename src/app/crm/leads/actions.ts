"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { holeProfil, nurAdmin } from "@/lib/crm";
import { istEinwilligungArt } from "@/lib/einwilligung";
import { PAKETE, istPaket } from "@/lib/pakete";
import { OHNE_SCHRITT, schrittAusFormular } from "@/lib/schritt";
import { istLeadStatus, type LeadStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import type { ImportZeile } from "@/lib/csv-import";
import { istEmail, text } from "@/lib/validierung";

export type Duplikat = { id: string | null; firma: string; adresse: string | null; bei_mir: boolean; besitzer: string };
export type AktionStatus = { meldung?: string; ok?: boolean; duplikate?: Duplikat[]; werte?: Record<string, string> };

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
  // Eingaben zurückgeben, damit das Formular bei einem Hinweis nicht leer ist
  const werte = Object.fromEntries(
    ["firma", "ansprechpartner", "branche", "telefon", "email", "adresse", "bezirk"].map((k) => [k, text(fd, k)]),
  );
  if (!firma) return { meldung: "Bitte gib den Namen der Firma ein.", werte };
  if (email && !istEmail(email)) return { meldung: "Die E-Mail-Adresse sieht nicht gültig aus.", werte };
  const telefon = text(fd, "telefon", 50);

  const supabase = await createClient();
  // Gibt es den Betrieb schon (gleiche Nummer oder gleicher Name)? Prüft im ganzen Team.
  if (fd.get("trotzdem") !== "1") {
    const { data: doppelt } = await supabase.rpc("lead_duplikate", { p_telefon: telefon, p_firma: firma });
    if (doppelt && doppelt.length > 0) {
      return {
        meldung: doppelt.length === 1 ? "Diesen Betrieb gibt es vielleicht schon:" : "Diese Betriebe gibt es vielleicht schon:",
        duplikate: doppelt as Duplikat[],
        werte,
      };
    }
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      firma,
      ansprechpartner: text(fd, "ansprechpartner") || null,
      branche: text(fd, "branche") || null,
      telefon: telefon || null,
      email: email || null,
      adresse: text(fd, "adresse") || null,
      bezirk: text(fd, "bezirk", 100) || null,
      besitzer_id: profil.id,
    })
    .select("id")
    .single();

  if (error || !data) return { meldung: fehlerText(error?.message), werte };
  revalidatePath("/crm/leads");
  redirect(`/crm/leads/${data.id}`);
}

// ---------------------------------------------------------------------------
// CSV-Import
// ---------------------------------------------------------------------------
export async function leadsImportieren(
  zeilen: ImportZeile[],
  besitzerId?: string,
): Promise<{ ok: boolean; meldung: string; importiert?: number; doppelt?: number }> {
  const profil = await holeProfil();
  const supabase = await createClient();

  // Nur Gründer dürfen Leads beim Import einer anderen aktiven Person zuteilen
  let besitzer = profil.id;
  if (besitzerId && besitzerId !== profil.id) {
    if (profil.rolle !== "admin") return { ok: false, meldung: "Nur Gründer können Leads anderen zuteilen." };
    const { data: person } = await supabase.from("profiles").select("id").eq("id", besitzerId).eq("aktiv", true).maybeSingle();
    if (!person) return { ok: false, meldung: "Die gewählte Person ist nicht aktiv." };
    besitzer = person.id;
  }
  if (!Array.isArray(zeilen) || zeilen.length === 0) return { ok: false, meldung: "Keine Zeilen zum Importieren." };
  if (zeilen.length > 2000) return { ok: false, meldung: "Bitte höchstens 2.000 Zeilen pro Import." };

  const s = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const bereinigt = zeilen
    .map((z) => {
      const email = s(z.email);
      return {
        lead: {
          firma: s(z.firma),
          ansprechpartner: s(z.ansprechpartner) || null,
          branche: s(z.branche) || null,
          telefon: s(z.telefon, 50) || null,
          email: email && istEmail(email) ? email : null,
          adresse: s(z.adresse) || null,
          bezirk: s(z.bezirk, 100) || null,
        },
        notiz: s(z.notiz, 3800),
      };
    })
    .filter((z) => z.lead.firma);

  // Doppelte Telefonnummern (bei eigenen Leads bzw. als Admin bei allen) überspringen
  const nummern = bereinigt.map((z) => z.lead.telefon).filter((t): t is string => !!t);
  const vorhanden = new Set<string>();
  for (let i = 0; i < nummern.length; i += 300) {
    const { data } = await supabase.from("leads").select("telefon").in("telefon", nummern.slice(i, i + 300));
    data?.forEach((d) => d.telefon && vorhanden.add(d.telefon));
  }
  const gesehen = new Set<string>();
  const neu = bereinigt.filter(({ lead }) => {
    if (!lead.telefon) return true;
    if (vorhanden.has(lead.telefon) || gesehen.has(lead.telefon)) return false;
    gesehen.add(lead.telefon);
    return true;
  });

  for (let i = 0; i < neu.length; i += 500) {
    const block = neu.slice(i, i + 500);
    const { data, error } = await supabase
      .from("leads")
      .insert(block.map((z) => ({ ...z.lead, quelle: "csv", besitzer_id: besitzer })))
      .select("id");
    if (error || !data) return { ok: false, meldung: `Import nach ${i} Zeilen abgebrochen. Bitte prüfe die Datei.` };

    // Zusatzinfos aus der Datei als Notiz beim jeweiligen Lead (Reihenfolge wie eingefügt)
    const notizen = data
      .map((d, j) => ({ lead_id: d.id as string, notiz: block[j]?.notiz }))
      .filter((n) => n.notiz)
      .map((n) => ({ lead_id: n.lead_id, autor_id: profil.id, art: "notiz", text: `Aus dem CSV-Import:\n${n.notiz}` }));
    if (notizen.length) await supabase.from("lead_verlauf").insert(notizen);
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
/** Rücksprung nach einer Aktion – nur interne CRM-Pfade */
function zielPfad(fd: FormData, standard: string) {
  const z = text(fd, "zurueck", 300);
  return z.startsWith("/crm") && !z.startsWith("//") ? z : standard;
}

const mitParam = (ziel: string, k: string, v: string) => `${ziel}${ziel.includes("?") ? "&" : "?"}${k}=${encodeURIComponent(v)}`;

/**
 * Status ändern und dabei den nächsten Schritt festlegen.
 * Ohne Status (Knopf „Nur nächsten Schritt speichern“) wird nur der Schritt gespeichert.
 * „Kein Interesse“ und „Nicht anrufen“ brauchen keinen Schritt – geplante Termine werden gelöscht.
 */
export async function statusSetzen(fd: FormData) {
  const id = text(fd, "id", 50);
  const status = text(fd, "status", 30);
  const ziel = zielPfad(fd, `/crm/leads/${id}`);
  if (status && !istLeadStatus(status)) return;
  const supabase = await createClient();

  let update: Record<string, unknown>;
  if (fd.get("entsperren") === "1") {
    // Admin hebt „Nicht anrufen“ auf
    update = { status: "neu" };
  } else if (status && OHNE_SCHRITT.includes(status as LeadStatus)) {
    update = { status, naechster_rueckruf: null, besuch_geplant: null };
  } else {
    const schritt = schrittAusFormular(fd);
    if (!schritt.ok) redirect(mitParam(ziel, "fehler", schritt.meldung));
    update = { ...(status ? { status } : {}), ...schritt.update };
  }

  const { error } = await supabase.from("leads").update(update).eq("id", id);
  revalidatePath(`/crm/leads/${id}`);
  revalidatePath("/crm/leads");
  revalidatePath("/crm/besuche");
  revalidatePath("/crm");
  if (error) redirect(mitParam(ziel, "fehler", fehlerText(error.message)));
  if (ziel !== `/crm/leads/${id}`) redirect(ziel);
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

export async function einwilligungSetzen(fd: FormData) {
  const id = text(fd, "id", 50);
  const wie = text(fd, "wie", 50);
  // Leerer Wert = Einwilligung entfernen (z. B. weil der Betrieb sie widerrufen hat)
  if (wie && !istEinwilligungArt(wie)) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ einwilligung_wie: wie || null })
    .eq("id", id);
  revalidatePath(`/crm/leads/${id}`);
  revalidatePath("/crm");
  if (error) redirect(`/crm/leads/${id}?fehler=${encodeURIComponent(fehlerText(error.message))}`);
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
    if (!Number.isFinite(roh) || roh < paket.preis) return { meldung: "Pro startet bei 2.000 €. Bitte gib den vereinbarten Betrag ein." };
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

// ---------------------------------------------------------------------------
// Zuteilen (nur Gründer)
// ---------------------------------------------------------------------------
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function leadsZuteilen(fd: FormData) {
  const admin = await nurAdmin();
  const zurueck = text(fd, "zurueck", 300);
  const ziel = zurueck.startsWith("/crm") && !zurueck.startsWith("//") ? zurueck : "/crm/leads";
  const fehler = (m: string) => redirect(`${ziel}${ziel.includes("?") ? "&" : "?"}fehler=${encodeURIComponent(m)}`);

  const ids = [...new Set(fd.getAll("ids").filter((v): v is string => typeof v === "string" && UUID.test(v)))].slice(0, 500);
  const besitzerId = text(fd, "besitzer", 50);
  if (ids.length === 0) fehler("Bitte wähle mindestens einen Lead aus.");

  const supabase = await createClient();
  const { data: person } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("id", besitzerId)
    .eq("aktiv", true)
    .maybeSingle();
  if (!person) fehler("Bitte wähle eine aktive Person aus.");

  const { error } = await supabase
    .from("leads")
    .update({ besitzer_id: person!.id, besuch_geplant: null })
    .in("id", ids);
  if (error) fehler("Das Zuteilen hat nicht geklappt. Bitte versuch es nochmal.");

  const von = admin.name.trim() || admin.email;
  const an = person!.name.trim() || person!.email;
  await supabase
    .from("lead_verlauf")
    .insert(ids.map((id) => ({ lead_id: id, autor_id: admin.id, art: "system", text: `Zugeteilt an ${an} (von ${von})` })));

  revalidatePath("/crm/leads");
  revalidatePath("/crm");
  ids.forEach((id) => revalidatePath(`/crm/leads/${id}`));
  redirect(`${ziel}${ziel.includes("?") ? "&" : "?"}ok=${encodeURIComponent(`${ids.length} ${ids.length === 1 ? "Lead" : "Leads"} an ${an} zugeteilt.`)}`);
}
