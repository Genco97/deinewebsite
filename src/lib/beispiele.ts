import type { PaketId } from "@/lib/pakete";

// Erfundener Friseursalon für die Beispiel-Websites. Alle Angaben sind ausgedacht.
export const SALON = {
  name: "Salon Mila",
  inhaberin: "Mila Novak",
  strasse: "Beispielgasse 12",
  plz: "1070",
  ort: "Wien",
  telefon: "01 234 56 78",
  telefonLink: "tel:+4312345678",
  email: "hallo@salon-mila.example",
  slogan: "Gute Haare. Gute Laune. Mitten im Siebten.",
  einleitung:
    "Seit 2012 schneiden, färben und stylen wir in Neubau – mit Zeit für ein Gespräch und ehrlicher Beratung.",
  oeffnungszeiten: [
    { tage: "Montag", zeit: "geschlossen" },
    { tage: "Dienstag – Freitag", zeit: "9:00 – 18:30" },
    { tage: "Samstag", zeit: "8:30 – 14:00" },
    { tage: "Sonntag", zeit: "geschlossen" },
  ],
  leistungen: [
    { id: "damen", name: "Damenhaarschnitt", text: "Waschen, Schneiden, Föhnen", preis: 52, dauer: 60 },
    { id: "herren", name: "Herrenhaarschnitt", text: "Waschen, Schneiden, Styling", preis: 32, dauer: 30 },
    { id: "farbe", name: "Färben", text: "Ansatz oder ganze Länge", preis: 68, dauer: 90 },
    { id: "straehnen", name: "Strähnen & Balayage", text: "Natürlich oder kräftig", preis: 110, dauer: 150 },
    { id: "kinder", name: "Kinderhaarschnitt", text: "Bis 12 Jahre", preis: 18, dauer: 20 },
    { id: "styling", name: "Hochsteckfrisur", text: "Für Hochzeit, Ball und Feste", preis: 65, dauer: 60 },
  ],
  team: [
    { name: "Mila", rolle: "Inhaberin, Farbe", farbe: "#c2410c" },
    { name: "Jonas", rolle: "Herrenschnitte", farbe: "#0f766e" },
    { name: "Selin", rolle: "Hochsteckfrisuren", farbe: "#7c3aed" },
  ],
  bewertungen: [
    { name: "Katharina M.", text: "Endlich eine Friseurin, die zuhört. Die Farbe ist genau so geworden, wie ich wollte." },
    { name: "Thomas R.", text: "Schnell, freundlich und fairer Preis. Komme seit Jahren her." },
    { name: "Anna L.", text: "Meine Hochsteckfrisur für die Hochzeit hat den ganzen Abend gehalten. Danke, Selin!" },
  ],
} as const;

export type Leistung = (typeof SALON.leistungen)[number];

export const THEMEN = ["ursprung", "basic", "business", "pro"] as const;
export type Thema = (typeof THEMEN)[number];

export const THEMA_INFO: Record<Thema, { label: string; kurz: string; text: string; paket: PaketId | null }> = {
  ursprung: {
    label: "Ursprung",
    kurz: "Unser Stil",
    text: "Ruhig, klar und gut lesbar – so wie diese Seite. Ein Stil, der zu fast jedem Betrieb passt.",
    paket: null,
  },
  basic: {
    label: "Basic",
    kurz: "Einfach & schnell",
    text: "Eine Seite mit allem Wichtigen: Leistungen, Preise, Öffnungszeiten und Kontakt. Schnell online, schnell gefunden.",
    paket: "basis",
  },
  business: {
    label: "Business",
    kurz: "Mehr Auftritt",
    text: "Mehr Gestaltung und mehr Inhalt: Team, Bewertungen, Galerie, häufige Fragen und ein Anfrage-Formular.",
    paket: "business",
  },
  pro: {
    label: "Pro",
    kurz: "Das volle Programm",
    text: "Eigenes Design mit Animationen, Online-Terminbuchung und einem KI-Assistenten, der Fragen Ihrer Kunden beantwortet.",
    paket: "premium",
  },
};

export const euroGanz = (n: number) => `${n.toLocaleString("de-AT")} €`;
