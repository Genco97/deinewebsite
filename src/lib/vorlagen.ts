export type Vorlage = { id: string; titel: string; betreff: string; text: string; reihenfolge: number };

export const PLATZHALTER = [
  ["{anrede}", "„Guten Tag Frau/Herr …“ bzw. „Guten Tag“"],
  ["{firma}", "Name des Betriebs"],
  ["{ansprechpartner}", "Ansprechperson"],
  ["{mein_name}", "dein Name"],
  ["{meine_email}", "deine E-Mail"],
  ["{demo_link}", "Link zum Demo-Formular"],
  ["{website}", "Website-/Demo-Link aus dem Projekt"],
] as const;

export function vorlageFuellen(text: string, werte: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (ganz, schluessel: string) => werte[schluessel] ?? ganz);
}

export function mailtoLink(an: string, betreff: string, text: string) {
  return `mailto:${encodeURIComponent(an)}?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(text)}`;
}
