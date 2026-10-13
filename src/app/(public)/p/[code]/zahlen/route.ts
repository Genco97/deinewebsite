import { NextResponse } from "next/server";
import { PAKET_NAMEN, istPaket } from "@/lib/pakete";
import { createAdminClient } from "@/lib/supabase/admin";
import { holeStripe, siteUrl } from "@/lib/stripe";
import { faelligBetrag, inCent } from "@/lib/zahlung";

/**
 * Kunde tippt auf „Jetzt bezahlen“: Wir legen bei Stripe eine Bezahlseite für genau den offenen Betrag an
 * und leiten dorthin weiter. Der Betrag kommt immer aus unserer Datenbank, nie aus der Adresse.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: roh } = await params;
  const code = decodeURIComponent(roh).toLowerCase().replace(/[^0-9a-f]/g, "").slice(0, 32);
  const zurueck = (hinweis: string) => NextResponse.redirect(`${siteUrl()}/p/${code}?zahlung=${hinweis}`, 303);
  if (code.length !== 32) return NextResponse.redirect(`${siteUrl()}/`, 303);

  const stripe = holeStripe();
  if (!stripe) return zurueck("nicht-moeglich");

  const db = createAdminClient();
  const { data: deal } = await db
    .from("deals")
    .select("id, paket, betrag, status, zahlung_freigegeben, kunden_code")
    .eq("kunden_code", code)
    .maybeSingle();
  if (!deal || deal.status === "storniert" || !deal.zahlung_freigegeben) return zurueck("nicht-moeglich");

  const { data: bezahlteZeilen } = await db.from("zahlungen").select("betrag").eq("deal_id", deal.id).eq("status", "bezahlt");
  const bezahlt = (bezahlteZeilen ?? []).reduce((s, z) => s + Number(z.betrag), 0);
  const faellig = faelligBetrag(deal.paket, Number(deal.betrag), bezahlt);
  if (faellig <= 0) return zurueck("schon-bezahlt");

  // Wer mehrmals tippt, bekommt dieselbe offene Bezahlseite (30 Minuten)
  const vor30 = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: offen } = await db
    .from("zahlungen")
    .select("stripe_session_id, betrag")
    .eq("deal_id", deal.id)
    .eq("status", "offen")
    .gte("created_at", vor30)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (offen && Number(offen.betrag) === faellig) {
    try {
      const alt = await stripe.checkout.sessions.retrieve(offen.stripe_session_id);
      if (alt.status === "open" && alt.url) return NextResponse.redirect(alt.url, 303);
    } catch {
      // abgelaufen oder nicht abrufbar → unten eine neue anlegen
    }
  }

  const paketName = istPaket(deal.paket) ? PAKET_NAMEN[deal.paket] : deal.paket;
  const anzahlung = deal.paket === "premium" && bezahlt <= 0 && faellig < Number(deal.betrag);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: inCent(faellig),
            product_data: { name: anzahlung ? `Anzahlung Website, Paket ${paketName}` : `Website, Paket ${paketName}` },
          },
        },
      ],
      metadata: { deal_id: deal.id },
      payment_intent_data: { metadata: { deal_id: deal.id } },
      success_url: `${siteUrl()}/p/${code}?zahlung=danke`,
      cancel_url: `${siteUrl()}/p/${code}?zahlung=abgebrochen`,
      locale: "de",
    });
    if (!session.url) return zurueck("nicht-moeglich");
    await db.from("zahlungen").insert({ deal_id: deal.id, betrag: faellig, stripe_session_id: session.id });
    return NextResponse.redirect(session.url, 303);
  } catch (e) {
    console.error("Stripe-Bezahlseite konnte nicht angelegt werden", e instanceof Error ? e.message : e);
    return zurueck("nicht-moeglich");
  }
}
