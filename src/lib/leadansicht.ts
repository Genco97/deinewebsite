import { AKTIV } from "@/lib/schritt";
import type { LeadStatus } from "@/lib/status";
import { isoZuWienLokal } from "@/lib/zeit";

/** Die Ansichten der Leads-Seite: „Was ist für mich zu tun?“ */
export const ANSICHTEN = ["heute", "rueckrufe", "anrufen", "besuch", "neu", "alle"] as const;
export type Ansicht = (typeof ANSICHTEN)[number];

export function istAnsicht(v: unknown): v is Ansicht {
  return typeof v === "string" && (ANSICHTEN as readonly string[]).includes(v);
}

/** Status, bei denen noch etwas zu tun ist (neu + aktive) */
export const OFFEN_STATUS: LeadStatus[] = ["neu", ...AKTIV];

/** Status ohne weiteren Schritt */
export const ABGESCHLOSSEN: LeadStatus[] = ["verkauft", "kein_interesse", "falsche_nummer", "nicht_anrufen"];

export type AktionArt = "anruf" | "rueckruf" | "besuch";
export type Aktion = {
  art: AktionArt;
  label: string;
  /** überfällig → rot */
  rot: boolean;
  /** true: Knopf wählt die Nummer (tel:), sonst führt er zum Lead */
  wahl: boolean;
};

type Zeile = {
  status: LeadStatus;
  telefon: string | null;
  einwilligung_wie: string | null;
  naechster_rueckruf: string | null;
  besuch_geplant: string | null;
};

const TAG_KURZ = new Intl.DateTimeFormat("de-AT", { day: "numeric", month: "numeric", timeZone: "Europe/Vienna" });

/**
 * Was ist als Nächstes zu tun? Aus Status, Einwilligung und geplantem Schritt abgeleitet.
 * Ohne Einwilligung gibt es keinen Anruf (§ 174 TKG), dann bleibt nur ein Besuch.
 */
export function naechsteAktion(l: Zeile, jetztIso: string, heute: string): Aktion | null {
  if (ABGESCHLOSSEN.includes(l.status)) return null;
  const darfAnrufen = !!l.einwilligung_wie && !!l.telefon;

  if (l.naechster_rueckruf && darfAnrufen) {
    const lokal = isoZuWienLokal(l.naechster_rueckruf);
    const label = lokal.slice(0, 10) === heute ? `Rückruf ${lokal.slice(11, 16)}` : `Rückruf ${TAG_KURZ.format(new Date(l.naechster_rueckruf))}`;
    return { art: "rueckruf", label, rot: l.naechster_rueckruf < jetztIso, wahl: true };
  }
  if (l.besuch_geplant) {
    const label = `Besuch ${TAG_KURZ.format(new Date(`${l.besuch_geplant}T12:00:00Z`))}`;
    return { art: "besuch", label, rot: l.besuch_geplant < heute, wahl: false };
  }
  if (darfAnrufen) {
    const label =
      l.status === "interessiert" ? "Demo anbieten" : l.status === "demo" ? "Nachfassen" : l.status === "angebot" ? "Abschluss klären" : l.status === "nicht_erreicht" ? "Nochmal anrufen" : l.status === "rueckruf" ? "Rückruf" : "Anrufen";
    return { art: "anruf", label, rot: false, wahl: true };
  }
  return { art: "besuch", label: "Besuch planen", rot: false, wahl: false };
}
