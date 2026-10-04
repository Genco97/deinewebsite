import { FIRMA } from "@/lib/firma";
import type { PaketId } from "@/lib/pakete";

/** Was nach der Fertigstellung passiert */
export const BETREUUNG = ["offen", "uebergabe", "sorglos"] as const;
export type Betreuung = (typeof BETREUUNG)[number];

export const BETREUUNG_LABEL: Record<Betreuung, string> = {
  offen: "Noch offen",
  uebergabe: "Übergabe",
  sorglos: "Sorglos-Paket",
};

export function istBetreuung(v: unknown): v is Betreuung {
  return typeof v === "string" && (BETREUUNG as readonly string[]).includes(v);
}

/** „19 €“ → 19 */
const betrag = (s: string | null) => Number((s ?? "").replace(/[^\d,]/g, "").replace(",", ".")) || 0;

/** Standardbetrag des Sorglos-Pakets für ein Paket */
export function sorglosStandard(paket: PaketId) {
  return paket === "premium" ? betrag(FIRMA.hostingProMonatPro) : betrag(FIRMA.hostingProMonat);
}
