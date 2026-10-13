import "server-only";
import Stripe from "stripe";

/** Stripe-Zugang. Ohne Schlüssel (noch nicht bei Vercel eingetragen) gibt es null – dann ist Online-Zahlung aus. */
export function holeStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
