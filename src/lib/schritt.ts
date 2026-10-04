import type { LeadStatus } from "@/lib/status";
import { heuteWien, isoZuWienLokal, istTag, tagVerschieben, wienZuIso } from "@/lib/zeit";

/** Status, nach denen kein nächster Schritt mehr nötig ist */
export const OHNE_SCHRITT: LeadStatus[] = ["verkauft", "kein_interesse", "nicht_anrufen"];

/** Status, bei denen ein Lead „liegen bleiben“ kann */
export const AKTIV: LeadStatus[] = ["nicht_erreicht", "rueckruf", "interessiert", "demo", "angebot"];

/** Ab so vielen Tagen im selben Status wird ein aktiver Lead markiert */
export const LIEGT_TAGE = 14;

export type SchrittArt = "besuch" | "rueckruf";

export type SchrittVorgabe = { art: SchrittArt; tag: string; zeit: string };

type LeadSchritt = { naechster_rueckruf: string | null; besuch_geplant: string | null; einwilligung_wie: string | null };

/** Vorbelegung für das Formular: bestehender Schritt oder in einer Woche vorbeischauen */
export function schrittVorgabe(l: LeadSchritt, inTagen = 7): SchrittVorgabe {
  const heute = heuteWien();
  if (l.naechster_rueckruf) {
    const lokal = isoZuWienLokal(l.naechster_rueckruf);
    if (lokal.slice(0, 10) >= heute) return { art: "rueckruf", tag: lokal.slice(0, 10), zeit: lokal.slice(11, 16) };
  }
  if (l.besuch_geplant && l.besuch_geplant >= heute) return { art: "besuch", tag: l.besuch_geplant, zeit: "10:00" };
  return { art: "besuch", tag: tagVerschieben(heute, inTagen), zeit: "10:00" };
}

/** Liest „nächster Schritt“ aus dem Formular → Felder für leads.update */
export function schrittAusFormular(
  fd: FormData,
): { ok: true; update: { besuch_geplant: string | null; naechster_rueckruf: string | null } } | { ok: false; meldung: string } {
  const art = fd.get("schritt_art");
  const tag = fd.get("schritt_tag");
  const zeit = fd.get("schritt_zeit");
  if (art !== "besuch" && art !== "rueckruf") return { ok: false, meldung: "Bitte wähle, wie es weitergeht." };
  if (!istTag(tag)) return { ok: false, meldung: "Bitte gib an, wann es weitergeht." };
  if (tag < heuteWien()) return { ok: false, meldung: "Der nächste Schritt darf nicht in der Vergangenheit liegen." };
  if (art === "besuch") return { ok: true, update: { besuch_geplant: tag, naechster_rueckruf: null } };
  const z = typeof zeit === "string" && /^\d{2}:\d{2}$/.test(zeit) ? zeit : "10:00";
  const iso = wienZuIso(`${tag}T${z}`);
  if (!iso) return { ok: false, meldung: "Die Uhrzeit ist ungültig." };
  return { ok: true, update: { besuch_geplant: null, naechster_rueckruf: iso } };
}

/** „liegt seit 18 Tagen“ – nur für aktive Leads ab LIEGT_TAGE */
export function liegtSeit(status: LeadStatus, seit: string | null, jetzt = Date.now()) {
  if (!seit || !AKTIV.includes(status)) return null;
  const tage = Math.floor((jetzt - Date.parse(seit)) / 86400000);
  return tage >= LIEGT_TAGE ? tage : null;
}
