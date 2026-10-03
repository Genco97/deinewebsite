export type PaketId = "basis" | "business" | "premium";

export type Paket = {
  id: PaketId;
  name: string;
  preis: number;
  preisText: string;
  ab?: boolean;
  hinweis?: string;
  leistungen: string[];
  zahlung: string;
  button: string;
  aenderungsrunden: number;
};

export const PAKETE: Paket[] = [
  {
    id: "basis",
    name: "Basic",
    preis: 500,
    preisText: "500 €",
    leistungen: [
      "1 Seite, optimiert fürs Handy",
      "Kontakt, Öffnungszeiten und Karte",
      "Eintrag bei Google (Unternehmensprofil)",
      "Online in 7 Tagen",
      "1 Korrektur von Texten und Fotos",
    ],
    zahlung: "Erst Demo ansehen, dann zahlen.",
    button: "Gratis-Demo anfordern",
    aenderungsrunden: 1,
  },
  {
    id: "business",
    name: "Business",
    preis: 800,
    preisText: "800 €",
    hinweis: "Meistgewählt",
    leistungen: [
      "Bis zu 5 Unterseiten",
      "Anfrage-Formular und Galerie",
      "Lokales SEO für Ihre Gegend",
      "Online in 10 Tagen",
      "1 Änderungsrunde",
    ],
    zahlung: "Erst Demo ansehen, dann zahlen.",
    button: "Gratis-Demo anfordern",
    aenderungsrunden: 1,
  },
  {
    id: "premium",
    name: "Pro",
    preis: 2000,
    preisText: "2.000 €",
    ab: true,
    leistungen: [
      "Eigenes Design statt Vorlage",
      "Online-Buchung oder Shop",
      "Erweitertes SEO",
      "Persönliches Erstgespräch",
      "2 Änderungsrunden",
    ],
    zahlung: "30 % Anzahlung nach dem Erstgespräch.",
    button: "Beratung anfragen",
    aenderungsrunden: 2,
  },
];

export const PAKET_NAMEN: Record<PaketId, string> = {
  basis: "Basic",
  business: "Business",
  premium: "Pro",
};

export function istPaket(wert: unknown): wert is PaketId {
  return wert === "basis" || wert === "business" || wert === "premium";
}
