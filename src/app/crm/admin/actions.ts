"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nurAdmin } from "@/lib/crm";
import { PAKETE, istPaket } from "@/lib/pakete";
import { createClient } from "@/lib/supabase/server";
import { text } from "@/lib/validierung";

const DEAL_STATUS = ["gemeldet", "offen", "angezahlt", "voll_bezahlt", "storniert"] as const;
type DealStatus = (typeof DEAL_STATUS)[number];
const istDealStatus = (v: string): v is DealStatus => (DEAL_STATUS as readonly string[]).includes(v);

function zurueck(tab: string, fehler?: string): never {
  revalidatePath("/crm/admin");
  redirect(`/crm/admin?tab=${tab}${fehler ? `&fehler=${encodeURIComponent(fehler)}` : ""}`);
}

function betragLesen(roh: string) {
  if (!roh.trim()) return null;
  const n = Number(roh.replace(/\s/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

// ---------------------------------------------------------------------------
// Anfrage → Lead
// ---------------------------------------------------------------------------
export async function anfrageUebernehmen(fd: FormData) {
  const admin = await nurAdmin();
  const id = text(fd, "id", 50);
  const besitzer = text(fd, "besitzer", 50) || admin.id;
  const supabase = await createClient();

  const { data: a } = await supabase.from("anfragen").select("*").eq("id", id).single();
  if (!a) zurueck("anfragen", "Anfrage nicht gefunden.");
  if (a.lead_id) zurueck("anfragen", "Diese Anfrage wurde schon übernommen.");

  const status = a.art === "demo" ? "demo" : a.art === "beratung" ? "interessiert" : "rueckruf";
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      firma: a.firma || a.name,
      ansprechpartner: a.name,
      branche: a.branche,
      telefon: a.telefon,
      email: a.email,
      status,
      quelle: `anfrage:${a.art}`,
      besitzer_id: besitzer,
    })
    .select("id")
    .single();
  if (error || !lead) zurueck("anfragen", "Lead konnte nicht angelegt werden.");

  const artText = { demo: "Gratis-Demo", beratung: "Beratung", rueckruf: "Rückruf" }[a.art as string] ?? a.art;
  const notiz = [
    `Anfrage über die Website: ${artText}${a.paket ? ` (Paket ${a.paket})` : ""}`,
    a.wuensche ? `Wünsche: ${a.wuensche}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  await supabase.from("lead_verlauf").insert({ lead_id: lead.id, autor_id: admin.id, art: "system", text: notiz });
  await supabase.from("anfragen").update({ lead_id: lead.id }).eq("id", id);

  revalidatePath("/crm/leads");
  zurueck("anfragen");
}

// ---------------------------------------------------------------------------
// Deals
// ---------------------------------------------------------------------------
export async function dealAnlegen(fd: FormData) {
  const admin = await nurAdmin();
  const leadId = text(fd, "lead_id", 50) || null;
  const partnerId = text(fd, "partner_id", 50) || admin.id;
  const paketId = text(fd, "paket", 20);
  const status = text(fd, "status", 20);
  if (!istPaket(paketId)) zurueck("deals", "Bitte wähle ein Paket.");
  if (!istDealStatus(status)) zurueck("deals", "Ungültiger Status.");
  const paket = PAKETE.find((p) => p.id === paketId)!;
  const betrag = betragLesen(text(fd, "betrag", 20)) ?? paket.preis;

  const supabase = await createClient();
  const { error } = await supabase.from("deals").insert({
    lead_id: leadId,
    partner_id: partnerId,
    paket: paket.id,
    betrag,
    status,
    aenderungsrunden_inkl: paket.aenderungsrunden,
    notiz: text(fd, "notiz", 1000) || null,
  });
  if (error) zurueck("deals", "Deal konnte nicht angelegt werden.");
  if (leadId) await supabase.from("leads").update({ status: "verkauft", naechster_rueckruf: null }).eq("id", leadId);
  zurueck("deals");
}

export async function dealAktualisieren(fd: FormData) {
  await nurAdmin();
  const id = text(fd, "id", 50);
  const status = text(fd, "status", 20);
  if (!istDealStatus(status)) zurueck("deals", "Ungültiger Status.");
  const update: Record<string, unknown> = { status };
  const betrag = betragLesen(text(fd, "betrag", 20));
  if (betrag !== null) update.betrag = betrag;
  const genutzt = Number(text(fd, "aenderungsrunden_genutzt", 5));
  if (Number.isInteger(genutzt) && genutzt >= 0) update.aenderungsrunden_genutzt = genutzt;
  const inkl = Number(text(fd, "aenderungsrunden_inkl", 5));
  if (Number.isInteger(inkl) && inkl >= 0) update.aenderungsrunden_inkl = inkl;

  const supabase = await createClient();
  const { data: alt } = await supabase.from("deals").select("status").eq("id", id).single();
  if (alt?.status === "voll_bezahlt" && status !== "voll_bezahlt") {
    zurueck("deals", "Ein voll bezahlter Deal kann nicht zurückgesetzt werden – die Provisionen sind schon entstanden.");
  }
  const { error } = await supabase.from("deals").update(update).eq("id", id);
  if (error) zurueck("deals", "Deal konnte nicht gespeichert werden.");
  revalidatePath("/crm/partner");
  zurueck("deals");
}

export async function dealVollBezahlt(fd: FormData) {
  await nurAdmin();
  const id = text(fd, "id", 50);
  const supabase = await createClient();
  // Der Datenbank-Trigger legt dabei die Provisionen (20 / 5 / 2 %) an.
  const { error } = await supabase.from("deals").update({ status: "voll_bezahlt" }).eq("id", id);
  if (error) zurueck("deals", "Deal konnte nicht auf voll bezahlt gesetzt werden.");
  revalidatePath("/crm/partner");
  zurueck("deals");
}

// ---------------------------------------------------------------------------
// Provisionen
// ---------------------------------------------------------------------------
export async function provisionAusbezahlt(fd: FormData) {
  await nurAdmin();
  const ids = fd.getAll("id").filter((v): v is string => typeof v === "string").slice(0, 500);
  if (ids.length === 0) zurueck("provisionen");
  const supabase = await createClient();
  const { error } = await supabase
    .from("provisionen")
    .update({ ausbezahlt: true, ausbezahlt_am: new Date().toISOString() })
    .in("id", ids)
    .eq("ausbezahlt", false);
  if (error) zurueck("provisionen", "Konnte nicht gespeichert werden.");
  revalidatePath("/crm/partner");
  zurueck("provisionen");
}
