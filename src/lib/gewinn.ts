import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Monat = {
  schluessel: string; // "2026-10"
  label: string; // "Oktober 2026"
  umsatz: number;
  provisionen: number;
  topf: number;
  deals: number;
};

const MONAT_FMT = new Intl.DateTimeFormat("de-AT", { timeZone: "Europe/Vienna", month: "long", year: "numeric" });
const SCHLUESSEL_FMT = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Vienna", year: "numeric", month: "2-digit" });

/**
 * Gründer-Topf je Monat: Umsatz der voll bezahlten Deals minus Partner-Provisionen.
 * Nur für Admins sinnvoll – RLS liefert Partnern nur eigene Deals.
 */
export async function gewinnProMonat(): Promise<{ monate: Monat[]; gruender: { id: string; name: string; email: string }[] }> {
  const supabase = await createClient();
  const [{ data: deals }, { data: prov }, { data: gruender }] = await Promise.all([
    supabase.from("deals").select("id, betrag, voll_bezahlt_am").eq("status", "voll_bezahlt").limit(5000),
    supabase.from("provisionen").select("deal_id, betrag").limit(20000),
    supabase.from("profiles").select("id, name, email").eq("rolle", "admin").eq("aktiv", true).order("created_at"),
  ]);

  const provJeDeal = new Map<string, number>();
  for (const p of prov ?? []) provJeDeal.set(p.deal_id, (provJeDeal.get(p.deal_id) ?? 0) + Number(p.betrag));

  const monate = new Map<string, Monat>();
  for (const d of deals ?? []) {
    const datum = new Date(d.voll_bezahlt_am ?? Date.now());
    const schluessel = SCHLUESSEL_FMT.format(datum).slice(0, 7);
    const m =
      monate.get(schluessel) ??
      { schluessel, label: MONAT_FMT.format(datum), umsatz: 0, provisionen: 0, topf: 0, deals: 0 };
    const betrag = Number(d.betrag);
    const pv = provJeDeal.get(d.id) ?? 0;
    m.umsatz += betrag;
    m.provisionen += pv;
    m.topf += betrag - pv;
    m.deals += 1;
    monate.set(schluessel, m);
  }

  return {
    monate: [...monate.values()].sort((a, b) => b.schluessel.localeCompare(a.schluessel)),
    gruender: gruender ?? [],
  };
}
