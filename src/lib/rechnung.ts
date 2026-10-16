import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Legt zu einer bezahlten Online-Zahlung genau eine Rechnung an (fortlaufende Nummer aus der Datenbank).
 * Ein Fehler hier darf die Buchung der Zahlung nie verhindern – deshalb nur loggen.
 */
export async function rechnungAnlegen(zahlungId: string, dealId: string, betrag: number, bezahltAm: Date) {
  try {
    const db = createAdminClient();
    const { data: vorhanden } = await db.from("rechnungen").select("id").eq("zahlung_id", zahlungId).maybeSingle();
    if (vorhanden) return;
    const { data: nummer, error: nrFehler } = await db.rpc("naechste_rechnungsnummer");
    if (nrFehler || !nummer) throw new Error(nrFehler?.message ?? "keine Rechnungsnummer");
    const tag = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Vienna" }).format(bezahltAm); // JJJJ-MM-TT
    const { error } = await db.from("rechnungen").insert({ nummer, zahlung_id: zahlungId, deal_id: dealId, datum: tag, betrag });
    if (error) throw new Error(error.message);
  } catch (e) {
    console.error("Rechnung konnte nicht angelegt werden", e instanceof Error ? e.message : e);
  }
}

export const RECHNUNG_NR = /^R-\d{4}-\d{4,}$/;
