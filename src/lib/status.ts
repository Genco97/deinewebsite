export const LEAD_STATUS = [
  "neu",
  "nicht_erreicht",
  "rueckruf",
  "interessiert",
  "demo",
  "angebot",
  "verkauft",
  "kein_interesse",
  "nicht_anrufen",
] as const;

export type LeadStatus = (typeof LEAD_STATUS)[number];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  neu: "Neu",
  nicht_erreicht: "Nicht erreicht",
  rueckruf: "Rückruf",
  interessiert: "Interessiert",
  demo: "Demo",
  angebot: "Angebot",
  verkauft: "Verkauft",
  kein_interesse: "Kein Interesse",
  nicht_anrufen: "Nicht anrufen",
};

export const STATUS_FARBE: Record<LeadStatus, string> = {
  neu: "bg-brand-light text-brand",
  nicht_erreicht: "bg-stone-100 text-muted",
  rueckruf: "bg-amber-50 text-amber-800",
  interessiert: "bg-brand-light text-brand",
  demo: "bg-brand-light text-brand",
  angebot: "bg-amber-50 text-amber-800",
  verkauft: "bg-ok-light text-ok",
  kein_interesse: "bg-stone-100 text-muted",
  nicht_anrufen: "bg-danger-light text-danger",
};

/** Status, bei denen kein Rückruf mehr fällig ist */
export const ABGESCHLOSSEN: LeadStatus[] = ["verkauft", "kein_interesse", "nicht_anrufen"];

export function istLeadStatus(v: unknown): v is LeadStatus {
  return typeof v === "string" && (LEAD_STATUS as readonly string[]).includes(v);
}

export const DEAL_STATUS_LABEL: Record<string, string> = {
  gemeldet: "Gemeldet",
  offen: "Offen",
  angezahlt: "Angezahlt",
  voll_bezahlt: "Voll bezahlt",
  storniert: "Storniert",
};

/** Pin-Farben auf der Karte (gut unterscheidbar, mit weißem Rand) */
export const STATUS_PIN: Record<LeadStatus, string> = {
  neu: "#2f6db5",
  nicht_erreicht: "#78716c",
  rueckruf: "#d97706",
  interessiert: "#7c3aed",
  demo: "#0891b2",
  angebot: "#db2777",
  verkauft: "#16a34a",
  kein_interesse: "#d6d3d1",
  nicht_anrufen: "#b42318",
};
