import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RechnungAnsicht } from "@/components/public/RechnungAnsicht";
import { RECHNUNG_NR } from "@/lib/rechnung";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Rechnung", robots: { index: false, follow: false }, referrer: "no-referrer" };

/** Rechnung zu einer bezahlten Zahlung. Erreichbar nur mit dem Kundenlink (Code) und der Rechnungsnummer. */
export default async function RechnungSeite({ params }: PageProps<"/rechnung/[code]/[nummer]">) {
  const p = await params;
  const code = decodeURIComponent(p.code).toLowerCase().replace(/[^0-9a-f]/g, "").slice(0, 32);
  const nummer = decodeURIComponent(p.nummer);
  if (code.length !== 32 || !RECHNUNG_NR.test(nummer)) notFound();

  const db = createAdminClient();
  const { data: deal } = await db.from("deals").select("id, paket, betrag, lead_id").eq("kunden_code", code).maybeSingle();
  if (!deal) notFound();
  const { data: r } = await db.from("rechnungen").select("nummer, datum, betrag, zahlung_id").eq("deal_id", deal.id).eq("nummer", nummer).maybeSingle();
  if (!r) notFound();
  const { data: lead } = deal.lead_id
    ? await db.from("leads").select("firma, ansprechpartner, adresse, bezirk").eq("id", deal.lead_id).maybeSingle()
    : { data: null };
  const { data: davor } = await db.from("zahlungen").select("id").eq("deal_id", deal.id).eq("status", "bezahlt").neq("id", r.zahlung_id).limit(1);

  return (
    <RechnungAnsicht
      nummer={r.nummer}
      datum={r.datum}
      betrag={Number(r.betrag)}
      gesamt={Number(deal.betrag)}
      paket={deal.paket}
      vorherBezahlt={(davor ?? []).length > 0}
      lead={lead}
    />
  );
}
