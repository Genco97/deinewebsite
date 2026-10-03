export const PHASEN = ["inhalte", "umsetzung", "freigabe", "online"] as const;
export type Phase = (typeof PHASEN)[number];

export const PHASE_INFO: Record<Phase, { label: string; text: string }> = {
  inhalte: { label: "Inhalte sammeln", text: "Texte, Fotos und Logo vom Kunden" },
  umsetzung: { label: "In Arbeit", text: "Website wird gebaut" },
  freigabe: { label: "Zur Freigabe", text: "Kunde prüft und gibt frei" },
  online: { label: "Online", text: "Fertig und veröffentlicht" },
};

export function istPhase(v: string): v is Phase {
  return (PHASEN as readonly string[]).includes(v);
}
