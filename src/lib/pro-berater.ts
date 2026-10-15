import type { BrancheId } from "@/lib/beispiele";

// Pro: ein eigenes Werkzeug je Branche – der Kunde klickt sich in 3 Fragen zur passenden Leistung.
// Jede Antwort kann den Preis (p) und die Dauer (m, Minuten) ändern; „titel“ legt die Empfehlung fest.

type Option = { t: string; x: string; p?: number; m?: number; titel?: string };
export type BeraterSchritt = { frage: string; optionen: Option[] };
export type Berater = {
  kick: string;
  titel: string;
  basis: { p: number; m: number };
  schritte: BeraterSchritt[];
  /** Text hinter der Empfehlung */
  zusatz: string;
  /** Beschriftung des Knopfs am Ende */
  knopf: string;
  /** „ab“ oder „ca.“ vor dem Preis */
  preisVor?: string;
  /** Einheit der Dauer */
  dauerText?: (m: number) => string;
};

export const BERATER: Record<BrancheId, Berater> = {
  friseur: {
    kick: "Ihr Look in 3 Fragen",
    titel: "Was passt zu Ihnen?",
    basis: { p: 0, m: 0 },
    schritte: [
      { frage: "Wie lang sind Ihre Haare?", optionen: [{ t: "Kurz", x: "bis zum Ohr", p: 42, m: 45 }, { t: "Mittel", x: "bis zur Schulter", p: 52, m: 60 }, { t: "Lang", x: "über die Schulter", p: 62, m: 75 }] },
      { frage: "Was soll passieren?", optionen: [{ t: "Neuer Look", x: "frischer Schnitt", titel: "Schnitt, Beratung & Styling" }, { t: "Farbe", x: "Glanz oder Strähnen", p: 40, m: 60, titel: "Färben mit Glanz-Pflege" }, { t: "Pflege", x: "Kraft und Gesundheit", p: -10, m: -10, titel: "Tiefenpflege mit Kopfmassage" }] },
      { frage: "Wie viel Zeit haben Sie?", optionen: [{ t: "Eine Stunde", x: "schnell und gut" }, { t: "Einen Vormittag", x: "ganz in Ruhe", p: 20, m: 45 }] },
    ],
    zusatz: "Beispielwerte – der Salon legt die echten Preise fest.",
    knopf: "Dafür Termin buchen",
  },
  barber: {
    kick: "Ihr Style in 3 Fragen",
    titel: "Welcher Schnitt passt?",
    basis: { p: 22, m: 25 },
    schritte: [
      { frage: "Wie ist Ihr Haar?", optionen: [{ t: "Kurz", x: "wenig Platz", p: 0 }, { t: "Mittel", x: "viel zu formen", p: 4, m: 5 }, { t: "Lang", x: "Struktur gesucht", p: 8, m: 10 }] },
      { frage: "Was darf es sein?", optionen: [{ t: "Skin Fade", x: "ganz sauber", p: 6, m: 10, titel: "Skin Fade mit Kontur" }, { t: "Klassisch", x: "Schere und Kamm", titel: "Klassischer Schnitt" }, { t: "Bart", x: "Form und Rasur", p: 8, m: 15, titel: "Bart-Kontur mit Heißtuch" }] },
      { frage: "Dazu noch?", optionen: [{ t: "Nur Haare", x: "" }, { t: "Mit Bartpflege", x: "Öl & Kontur", p: 12, m: 15 }] },
    ],
    zusatz: "Beispielwerte.",
    knopf: "Dafür Termin buchen",
  },
  imbiss: {
    kick: "Ihr Menü in 3 Klicks",
    titel: "Worauf haben Sie Hunger?",
    basis: { p: 0, m: 8 },
    preisVor: "",
    schritte: [
      { frage: "Was darf es sein?", optionen: [{ t: "Dürüm", x: "gerollt, mit Salat", p: 7.5, titel: "Dürüm" }, { t: "Kebap im Brot", x: "der Klassiker", p: 6.9, titel: "Kebap im Fladenbrot" }, { t: "Teller", x: "Reis & Salat", p: 11.5, m: 4, titel: "Kebap-Teller" }] },
      { frage: "Wie scharf?", optionen: [{ t: "Mild", x: "" }, { t: "Mittel", x: "mit Chili", p: 0 }, { t: "Scharf", x: "wirklich scharf", p: 0 }] },
      { frage: "Dazu?", optionen: [{ t: "Nur das", x: "" }, { t: "Getränk", x: "0,33 l", p: 2.2 }, { t: "Menü", x: "Getränk + Pommes", p: 4.5, m: 3 }] },
    ],
    zusatz: "Bestellen Sie vor und holen Sie ab – ohne Warten.",
    knopf: "Jetzt vorbestellen",
    dauerText: (m) => `fertig in ca. ${m} Min.`,
  },
  cafe: {
    kick: "Ihr Genuss in 3 Fragen",
    titel: "Wonach ist Ihnen heute?",
    basis: { p: 0, m: 0 },
    preisVor: "",
    schritte: [
      { frage: "Wie ist Ihre Stimmung?", optionen: [{ t: "Ruhig", x: "gemütlich", titel: "Melange & ein Stück Torte" }, { t: "Hungrig", x: "etwas Richtiges", titel: "Frühstück mit Eierspeis" }, { t: "Zum Mitnehmen", x: "schnell los", titel: "Kaffee & Gebäck to go" }] },
      { frage: "Wie süß?", optionen: [{ t: "Herzhaft", x: "", p: 8.9 }, { t: "Süß", x: "Torte & Co.", p: 7.5 }] },
      { frage: "Wie viele sind Sie?", optionen: [{ t: "Allein", x: "", p: 3.9 }, { t: "Zu zweit", x: "", p: 8.4 }, { t: "Gruppe", x: "ab 4 Personen", p: 16.8 }] },
    ],
    zusatz: "Mit Tischreservierung – auch für größere Gruppen.",
    knopf: "Tisch reservieren",
    dauerText: (m) => (m ? `ca. ${m} Min. Zeit` : "für jede Zeit"),
  },
  handwerk: {
    kick: "Ihr Auftrag in 3 Fragen",
    titel: "Was kostet mein Projekt?",
    basis: { p: 0, m: 0 },
    preisVor: "ca.",
    schritte: [
      { frage: "Was ist zu tun?", optionen: [{ t: "Reparatur", x: "etwas ist kaputt", p: 90, titel: "Reparatur vor Ort" }, { t: "Umbau", x: "Neues bauen", p: 600, titel: "Umbau mit Planung" }, { t: "Wartung", x: "regelmäßig prüfen", p: 70, titel: "Wartung und Prüfung" }] },
      { frage: "Wie groß?", optionen: [{ t: "Klein", x: "ein Raum", p: 0 }, { t: "Mittel", x: "eine Wohnung", p: 250 }, { t: "Groß", x: "Haus oder Büro", p: 700 }] },
      { frage: "Wie dringend?", optionen: [{ t: "Diese Woche", x: "Eilauftrag", p: 80 }, { t: "Planbar", x: "in 2–3 Wochen", p: 0 }] },
    ],
    zusatz: "Unverbindliche Schätzung – genau wird es nach dem Termin vor Ort.",
    knopf: "Angebot anfragen",
    dauerText: () => "Antwort innerhalb eines Tages",
  },
  nagel: {
    kick: "Ihr Look in 3 Fragen",
    titel: "Welche Nägel passen zu Ihnen?",
    basis: { p: 0, m: 0 },
    schritte: [
      { frage: "Was haben Sie vor?", optionen: [{ t: "Natürlich", x: "gepflegt und schlicht", p: 28, m: 45, titel: "Maniküre mit Lack" }, { t: "Gel", x: "hält 3–4 Wochen", p: 45, m: 75, titel: "Gel-Nägel" }, { t: "Auffällig", x: "Farbe & Muster", p: 58, m: 90, titel: "Gel mit Nail-Art" }] },
      { frage: "Länge?", optionen: [{ t: "Kurz", x: "", p: 0 }, { t: "Mittel", x: "", p: 5, m: 10 }, { t: "Lang", x: "mit Verlängerung", p: 15, m: 25 }] },
      { frage: "Dazu noch?", optionen: [{ t: "Nur Hände", x: "" }, { t: "Mit Füßen", x: "Pediküre", p: 32, m: 45 }] },
    ],
    zusatz: "Beispielwerte.",
    knopf: "Dafür Termin buchen",
  },
  schneiderei: {
    kick: "Ihre Änderung in 3 Fragen",
    titel: "Was kostet die Änderung?",
    basis: { p: 0, m: 0 },
    preisVor: "ab",
    schritte: [
      { frage: "Was soll geändert werden?", optionen: [{ t: "Hose", x: "kürzen, weiten", p: 14, titel: "Hose kürzen oder anpassen" }, { t: "Sakko / Jacke", x: "Ärmel, Taille", p: 28, titel: "Sakko anpassen" }, { t: "Kleid", x: "Saum, Träger, Taille", p: 24, titel: "Kleid anpassen" }] },
      { frage: "Wie aufwendig?", optionen: [{ t: "Einfach", x: "Saum oder Länge", p: 0 }, { t: "Mittel", x: "Naht versetzen", p: 12 }, { t: "Aufwendig", x: "Futter, Reißverschluss", p: 26 }] },
      { frage: "Wann brauchen Sie es?", optionen: [{ t: "In einer Woche", x: "", m: 7 }, { t: "Bis übermorgen", x: "Express", p: 15, m: 2 }] },
    ],
    zusatz: "Beispielwerte – wir prüfen das Stück gern persönlich.",
    knopf: "Abgabe vormerken",
    dauerText: (m) => `fertig in ca. ${m} Tagen`,
  },
  hundesalon: {
    kick: "Das Beste für Ihren Hund",
    titel: "Wie pflegen wir Ihren Hund?",
    basis: { p: 0, m: 0 },
    schritte: [
      { frage: "Wie groß ist Ihr Hund?", optionen: [{ t: "Klein", x: "bis 10 kg", p: 35, m: 60 }, { t: "Mittel", x: "10 bis 25 kg", p: 52, m: 80 }, { t: "Groß", x: "über 25 kg", p: 72, m: 100 }] },
      { frage: "Wie ist das Fell?", optionen: [{ t: "Kurz", x: "glatt", p: 0, titel: "Baden & Pflege" }, { t: "Lang", x: "seidig, gewellt", p: 14, m: 20, titel: "Baden, Bürsten & Schur" }, { t: "Wollig", x: "Pudel & Co.", p: 25, m: 40, titel: "Komplett-Schur" }] },
      { frage: "Dazu noch?", optionen: [{ t: "Nein danke", x: "" }, { t: "Krallen & Ohren", x: "Pflege", p: 8, m: 10 }] },
    ],
    zusatz: "Beispielwerte – wir schauen uns Ihren Hund vorher an.",
    knopf: "Dafür Termin buchen",
  },
  kfz: {
    kick: "Ihr Service in 3 Fragen",
    titel: "Was braucht Ihr Auto?",
    basis: { p: 0, m: 0 },
    schritte: [
      { frage: "Worum geht es?", optionen: [{ t: "Pickerl", x: "§57a-Überprüfung", p: 69, m: 60, titel: "Pickerl-Überprüfung" }, { t: "Service", x: "Öl, Filter, Check", p: 189, m: 120, titel: "Service nach Herstellervorgabe" }, { t: "Reifen", x: "Wechsel oder neue", p: 49, m: 45, titel: "Reifenwechsel mit Auswuchten" }] },
      { frage: "Welches Auto?", optionen: [{ t: "Kleinwagen", x: "", p: 0 }, { t: "Mittelklasse", x: "", p: 20, m: 15 }, { t: "SUV / Kombi", x: "", p: 40, m: 30 }] },
      { frage: "Brauchen Sie Ersatz?", optionen: [{ t: "Nein", x: "ich warte" }, { t: "Leihwagen", x: "während der Arbeit", p: 25 }] },
    ],
    zusatz: "Beispielwerte – ein Fixpreis kommt nach Prüfung des Fahrzeugs.",
    knopf: "Termin buchen",
  },
};
