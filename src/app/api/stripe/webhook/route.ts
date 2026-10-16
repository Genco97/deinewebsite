import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { rechnungAnlegen } from "@/lib/rechnung";
import { holeStripe } from "@/lib/stripe";
import { betragText, inCent, statusNachZahlung } from "@/lib/zahlung";

export const runtime = "nodejs";

/**
 * Stripe meldet: Eine Zahlung ist eingegangen. Wir prüfen die Signatur, buchen sie einmalig
 * (doppelte Meldungen ändern nichts) und setzen den Verkauf auf „angezahlt“ bzw. „voll bezahlt“.
 * „Voll bezahlt“ löst über die Datenbank die Provisionen aus.
 */
export async function POST(req: Request) {
  const stripe = holeStripe();
  const geheim = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !geheim) return NextResponse.json({ fehler: "nicht eingerichtet" }, { status: 503 });

  const signatur = req.headers.get("stripe-signature");
  if (!signatur) return NextResponse.json({ fehler: "keine Signatur" }, { status: 400 });
  const roh = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(roh, signatur, geheim);
  } catch {
    return NextResponse.json({ fehler: "Signatur ungültig" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    // Bei verzögerten Zahlarten (z. B. SEPA) kommt „completed“ vor dem Geld; dann warten wir auf „async_payment_succeeded“
    if (session.payment_status !== "paid") return NextResponse.json({ ok: true });
    const fehler = await zahlungBuchen(session);
    if (fehler) {
      console.error("Stripe-Webhook:", fehler);
      return NextResponse.json({ fehler }, { status: 500 });
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    await createAdminClient().from("zahlungen").update({ status: "abgelaufen" }).eq("stripe_session_id", session.id).eq("status", "offen");
  }

  return NextResponse.json({ ok: true });
}

async function zahlungBuchen(session: Stripe.Checkout.Session): Promise<string | null> {
  const db = createAdminClient();
  const { data: zahlung } = await db
    .from("zahlungen")
    .select("id, deal_id, betrag, status")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (!zahlung) return `Unbekannte Bezahlseite ${session.id}`;
  if (zahlung.status === "bezahlt") return null; // schon gebucht

  // Betrag und Währung müssen genau stimmen
  if (session.currency !== "eur" || session.amount_total !== inCent(Number(zahlung.betrag))) {
    return `Betrag passt nicht (Bezahlseite ${session.id}: ${session.amount_total} ${session.currency}, erwartet ${inCent(Number(zahlung.betrag))} eur)`;
  }

  // Nur einmal buchen: Wer das Update zuerst schafft, gewinnt
  const { data: gebucht } = await db
    .from("zahlungen")
    .update({ status: "bezahlt", bezahlt_am: new Date().toISOString() })
    .eq("id", zahlung.id)
    .neq("status", "bezahlt")
    .select("id");
  if (!gebucht || gebucht.length === 0) return null;

  const { data: deal } = await db.from("deals").select("id, betrag, lead_id, status").eq("id", zahlung.deal_id).single();
  if (!deal) return "Verkauf nicht gefunden";
  const { data: alle } = await db.from("zahlungen").select("betrag").eq("deal_id", deal.id).eq("status", "bezahlt");
  const gesamt = (alle ?? []).reduce((s, z) => s + Number(z.betrag), 0);
  const neu = statusNachZahlung(Number(deal.betrag), gesamt);

  if (deal.status !== "voll_bezahlt") {
    const { error } = await db.from("deals").update({ status: neu }).eq("id", deal.id);
    if (error) return `Status konnte nicht gesetzt werden: ${error.message}`;
  }
  await rechnungAnlegen(zahlung.id, deal.id, Number(zahlung.betrag), new Date());
  if (deal.lead_id) {
    await db.from("lead_verlauf").insert({
      lead_id: deal.lead_id,
      autor_id: null,
      art: "system",
      text: `Online-Zahlung eingegangen: ${betragText(Number(zahlung.betrag))}${neu === "voll_bezahlt" ? " – voll bezahlt" : " – angezahlt"}`,
    });
  }
  return null;
}
