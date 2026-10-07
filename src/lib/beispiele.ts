import type { PaketId } from "@/lib/pakete";

// Erfundene Betriebe für die Beispiel-Websites. Alle Angaben sind ausgedacht.

export type Leistung = { id: string; name: string; text: string; preis: number; dauer?: number; symbol: string };

export type Betrieb = {
  branche: BrancheId;
  /** „Friseur in 1070 Wien“ */
  art: string;
  name: string;
  /** Kurzer Markenname für das Pro-Design, z. B. „MILA“ */
  marke: string;
  inhaberin: string;
  strasse: string;
  plz: string;
  ort: string;
  bezirk: string;
  seit: number;
  telefon: string;
  telefonLink: string;
  email: string;
  slogan: string;
  einleitung: string;
  oeffnungszeiten: { tage: string; zeit: string }[];
  leistungen: Leistung[];
  preisHinweis: string;
  team: { name: string; rolle: string; farbe: string }[];
  bewertungen: { name: string; text: string }[];
  fragen: { f: string; a: string }[];
  galerie: { titel: string; farbe: string }[];
  /** Business-Hero: „Ihr Haar in <betont> Händen.“ */
  hero: [string, string, string];
  /** Pro-Hero, drei Teile wie oben */
  proHero: [string, string, string];
  heroFarbe: string;
  aktion: string;
  aktionKurz: string;
  wunsch: string;
  naechster: { klein: string; gross: string };
  zahlen: { zahl: number; komma?: number; text: string }[];
  buchung: { titel: string; text: string; schritt: string; erledigt: string };
  abschied: string;
  chat: string[];
  stil: Stil;
  bewertung: { sterne: number; anzahl: number };
  vertrauen: string;
  funktion: Funktion;
  /** Fotos (Unsplash-Lizenz) aus public/beispiele/ */
  bild?: { hero: string; einblick?: string };
};

const ZEITEN_STANDARD = [
  { tage: "Montag", zeit: "geschlossen" },
  { tage: "Dienstag – Freitag", zeit: "9:00 – 18:30" },
  { tage: "Samstag", zeit: "8:30 – 14:00" },
  { tage: "Sonntag", zeit: "geschlossen" },
];

export const BRANCHEN = ["friseur", "barber", "imbiss", "cafe", "handwerk", "nagel", "schneiderei", "hundesalon", "kfz"] as const;
export type BrancheId = (typeof BRANCHEN)[number];

export const BRANCHE_INFO: Record<BrancheId, { label: string; symbol: string }> = {
  friseur: { label: "Friseur", symbol: "✂" },
  barber: { label: "Barbershop", symbol: "💈" },
  imbiss: { label: "Imbiss & Kebap", symbol: "🥙" },
  cafe: { label: "Café", symbol: "☕" },
  handwerk: { label: "Handwerk", symbol: "🔨" },
  nagel: { label: "Nagelstudio", symbol: "💅" },
  schneiderei: { label: "Schneiderei", symbol: "🧵" },
  hundesalon: { label: "Hundesalon", symbol: "🐕" },
  kfz: { label: "Kfz-Werkstatt", symbol: "🔧" },
};

type Basis = Omit<Betrieb, "stil" | "bewertung" | "vertrauen" | "funktion" | "bild">;

const BASIS: Record<BrancheId, Basis> = {
  friseur: {
    branche: "friseur",
    art: "Friseur",
    name: "Salon Mila",
    marke: "MILA",
    inhaberin: "Mila Novak",
    strasse: "Beispielgasse 12",
    plz: "1070",
    ort: "Wien",
    bezirk: "Neubau",
    seit: 2012,
    telefon: "01 234 56 78",
    telefonLink: "tel:+4312345678",
    email: "hallo@salon-mila.example",
    slogan: "Gute Haare. Gute Laune. Mitten im Siebten.",
    einleitung: "Seit 2012 schneiden, färben und stylen wir in Neubau – mit Zeit für ein Gespräch und ehrlicher Beratung.",
    oeffnungszeiten: ZEITEN_STANDARD,
    leistungen: [
      { id: "damen", name: "Damenhaarschnitt", text: "Waschen, Schneiden, Föhnen", preis: 52, dauer: 60, symbol: "✂" },
      { id: "herren", name: "Herrenhaarschnitt", text: "Waschen, Schneiden, Styling", preis: 32, dauer: 30, symbol: "◆" },
      { id: "farbe", name: "Färben", text: "Ansatz oder ganze Länge", preis: 68, dauer: 90, symbol: "◐" },
      { id: "straehnen", name: "Strähnen & Balayage", text: "Natürlich oder kräftig", preis: 110, dauer: 150, symbol: "✺" },
      { id: "kinder", name: "Kinderhaarschnitt", text: "Bis 12 Jahre", preis: 18, dauer: 20, symbol: "☺" },
      { id: "styling", name: "Hochsteckfrisur", text: "Für Hochzeit, Ball und Feste", preis: 65, dauer: 60, symbol: "❀" },
    ],
    preisHinweis: "Alle Preise inklusive Beratung, Waschen und Pflege.",
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
    fragen: [
      { f: "Muss ich einen Termin ausmachen?", a: "Am besten ja – dann haben wir genug Zeit für Sie. Samstags nehmen wir auch spontan Kundinnen und Kunden dran, wenn es sich ausgeht." },
      { f: "Kann ich mit Karte zahlen?", a: "Ja, mit Bankomat-, Kredit-Karte und Handy." },
      { f: "Verwenden Sie schonende Farben?", a: "Wir arbeiten mit ammoniakfreien Farben und beraten Sie gern, was zu Ihrem Haar passt." },
    ],
    galerie: [
      { titel: "Balayage", farbe: "linear-gradient(135deg,#f6d5b8,#c98b5e 55%,#7c4a2d)" },
      { titel: "Kurzhaarschnitt", farbe: "linear-gradient(160deg,#3f3a36,#8c7b6b)" },
      { titel: "Hochsteckfrisur", farbe: "linear-gradient(135deg,#f3e7dc,#d9b8a0 60%,#b07d62)" },
      { titel: "Kupfer-Ton", farbe: "linear-gradient(135deg,#f0a36b,#b4532a 60%,#6b2a12)" },
      { titel: "Herrenschnitt", farbe: "linear-gradient(135deg,#d6d3cd,#7b7770)" },
      { titel: "Locken-Pflege", farbe: "linear-gradient(135deg,#efe1cf,#a78463 70%)" },
    ],
    hero: ["Ihr Haar in ", "besten", " Händen."],
    proHero: ["Haare, die", "Geschichten", "erzählen."],
    heroFarbe: "linear-gradient(150deg,#f6d5b8,#c98b5e 50%,#7c4a2d)",
    aktion: "Termin anfragen",
    aktionKurz: "Termin",
    wunsch: "z. B. Balayage, am liebsten Samstag",
    naechster: { klein: "Nächster freier Termin", gross: "Dienstag, 10:30" },
    zahlen: [
      { zahl: 12, text: "Jahre in Neubau" },
      { zahl: 4.9, komma: 1, text: "Sterne auf Google" },
      { zahl: 8400, text: "zufriedene Köpfe" },
    ],
    buchung: { titel: "Termin.", text: "Leistung wählen, Tag wählen, Uhrzeit wählen – fertig. Rund um die Uhr, auch wenn der Salon geschlossen ist.", schritt: "Leistung", erledigt: "Termin gebucht!" },
    abschied: "Wir sehen uns im Siebten.",
    chat: ["Was kostet Färben?", "Wann habt ihr offen?", "Wo seid ihr?", "Termin buchen"],
  },

  barber: {
    branche: "barber",
    art: "Barbershop",
    name: "Barbershop Kemal",
    marke: "KEMAL",
    inhaberin: "Kemal Aydın",
    strasse: "Beispielstraße 48",
    plz: "1100",
    ort: "Wien",
    bezirk: "Favoriten",
    seit: 2018,
    telefon: "0660 123 45 67",
    telefonLink: "tel:+436601234567",
    email: "termin@kemals-barbershop.example",
    slogan: "Frischer Schnitt. Scharfe Kontur. Ohne Warten.",
    einleitung: "Fades, Bartpflege und klassische Rasur mit dem heißen Tuch – seit 2018 in Favoriten, sechs Tage die Woche.",
    oeffnungszeiten: [
      { tage: "Montag – Freitag", zeit: "9:00 – 20:00" },
      { tage: "Samstag", zeit: "9:00 – 18:00" },
      { tage: "Sonntag", zeit: "geschlossen" },
    ],
    leistungen: [
      { id: "schnitt", name: "Haarschnitt", text: "Waschen, Schneiden, Styling", preis: 22, dauer: 30, symbol: "✂" },
      { id: "fade", name: "Skin Fade", text: "Mit Rasierer-Übergang", preis: 26, dauer: 40, symbol: "◆" },
      { id: "bart", name: "Bart trimmen", text: "Kontur mit Klinge", preis: 15, dauer: 20, symbol: "◐" },
      { id: "kombi", name: "Schnitt & Bart", text: "Das Komplett-Paket", preis: 35, dauer: 50, symbol: "✺" },
      { id: "rasur", name: "Nassrasur", text: "Mit heißem Tuch", preis: 20, dauer: 30, symbol: "❀" },
      { id: "kinder", name: "Kinderschnitt", text: "Bis 12 Jahre", preis: 15, dauer: 20, symbol: "☺" },
    ],
    preisHinweis: "Mit und ohne Termin – Termin geht schneller.",
    team: [
      { name: "Kemal", rolle: "Inhaber, Fades", farbe: "#b45309" },
      { name: "Deniz", rolle: "Bart & Rasur", farbe: "#1d4ed8" },
      { name: "Luka", rolle: "Kinder & Klassiker", farbe: "#0f766e" },
    ],
    bewertungen: [
      { name: "Marko P.", text: "Bester Fade im Zehnten. Kein Warten, weil ich online gebucht hab." },
      { name: "Ahmet Y.", text: "Die Nassrasur mit dem heißen Tuch ist ein Erlebnis. Sehr sauber gearbeitet." },
      { name: "Stefan K.", text: "Mein Sohn geht jetzt freiwillig zum Friseur. Das sagt alles." },
    ],
    fragen: [
      { f: "Kann ich ohne Termin kommen?", a: "Ja, gerne. Mit Termin kommen Sie aber sofort dran." },
      { f: "Kann ich mit Karte zahlen?", a: "Ja, bar, mit Bankomat-, Kreditkarte und Handy." },
      { f: "Machen Sie auch Augenbrauen?", a: "Ja, Augenbrauen und Ohren sind bei jedem Schnitt gratis dabei." },
    ],
    galerie: [
      { titel: "Skin Fade", farbe: "linear-gradient(160deg,#1f2937,#6b7280)" },
      { titel: "Bart-Kontur", farbe: "linear-gradient(135deg,#3f2a1d,#a16207)" },
      { titel: "Crop Top", farbe: "linear-gradient(135deg,#374151,#9ca3af)" },
      { titel: "Nassrasur", farbe: "linear-gradient(135deg,#e5e7eb,#9ca3af 60%,#4b5563)" },
      { titel: "Klassisch", farbe: "linear-gradient(135deg,#78350f,#d6a76a)" },
      { titel: "Kinderschnitt", farbe: "linear-gradient(135deg,#bfdbfe,#3b82f6)" },
    ],
    hero: ["Ihr Schnitt. ", "Scharf", " wie nie."],
    proHero: ["Schnitte, die", "Eindruck", "machen."],
    heroFarbe: "linear-gradient(150deg,#d6a76a,#78350f 55%,#1f2937)",
    aktion: "Termin buchen",
    aktionKurz: "Termin",
    wunsch: "z. B. Fade und Bart, am liebsten nach 17 Uhr",
    naechster: { klein: "Nächster freier Termin", gross: "Heute, 16:40" },
    zahlen: [
      { zahl: 6, text: "Tage die Woche offen" },
      { zahl: 4.9, komma: 1, text: "Sterne auf Google" },
      { zahl: 15000, text: "frische Schnitte" },
    ],
    buchung: { titel: "Termin.", text: "Schnitt wählen, Tag wählen, Uhrzeit wählen – fertig. Kein Warten im Laden.", schritt: "Leistung", erledigt: "Termin gebucht!" },
    abschied: "Wir sehen uns in Favoriten.",
    chat: ["Was kostet ein Fade?", "Wann habt ihr offen?", "Wo seid ihr?", "Termin buchen"],
  },

  imbiss: {
    branche: "imbiss",
    art: "Imbiss",
    name: "Anatolia Kebap",
    marke: "ANATOLIA",
    inhaberin: "Mehmet Demir",
    strasse: "Beispielplatz 3",
    plz: "1160",
    ort: "Wien",
    bezirk: "Ottakring",
    seit: 2009,
    telefon: "01 987 65 43",
    telefonLink: "tel:+4319876543",
    email: "bestellen@anatolia-kebap.example",
    slogan: "Frisch vom Spieß. Jeden Tag bis Mitternacht.",
    einleitung: "Seit 2009 machen wir unser Fleisch, unser Brot und unsere Saucen selbst – schnell, ehrlich und mit Herz.",
    oeffnungszeiten: [
      { tage: "Montag – Donnerstag", zeit: "10:00 – 23:00" },
      { tage: "Freitag – Samstag", zeit: "10:00 – 24:00" },
      { tage: "Sonntag", zeit: "11:00 – 22:00" },
    ],
    leistungen: [
      { id: "kebap", name: "Kebap im Brot", text: "Kalb oder Huhn, hausgemachtes Brot", preis: 6, symbol: "◆" },
      { id: "duerum", name: "Dürüm", text: "Im Fladen gerollt", preis: 7, symbol: "◐" },
      { id: "teller", name: "Kebap-Teller", text: "Mit Reis, Salat und Pommes", preis: 12, symbol: "✺" },
      { id: "falafel", name: "Falafel", text: "Vegetarisch, mit Hummus", preis: 7, symbol: "❀" },
      { id: "lahmacun", name: "Lahmacun", text: "Türkische Pizza", preis: 5, symbol: "✂" },
      { id: "menue", name: "Mittagsmenü", text: "Kebap, Pommes, Getränk", preis: 10, symbol: "☺" },
    ],
    preisHinweis: "Zum Mitnehmen oder hier essen. Brot und Saucen hausgemacht.",
    team: [
      { name: "Mehmet", rolle: "Inhaber, am Spieß", farbe: "#b91c1c" },
      { name: "Ayşe", rolle: "Brot & Saucen", farbe: "#c2410c" },
      { name: "Emre", rolle: "Kassa & Lieferung", farbe: "#0f766e" },
    ],
    bewertungen: [
      { name: "Lukas H.", text: "Das Brot ist der Wahnsinn. Bester Kebap in Ottakring, ohne Diskussion." },
      { name: "Sabine W.", text: "Schnell, sauber und immer freundlich. Die Falafel sind top." },
      { name: "Daniel M.", text: "Hab online vorbestellt und konnte gleich mitnehmen. Perfekt in der Mittagspause." },
    ],
    fragen: [
      { f: "Kann ich vorbestellen?", a: "Ja, online oder telefonisch. Sie holen ab, ohne zu warten." },
      { f: "Gibt es vegetarische Speisen?", a: "Ja, Falafel, Halloumi und verschiedene Salate." },
      { f: "Ist das Fleisch halal?", a: "Ja, unser gesamtes Fleisch ist halal." },
    ],
    galerie: [
      { titel: "Vom Spieß", farbe: "linear-gradient(135deg,#f59e0b,#b45309 60%,#78350f)" },
      { titel: "Hausbrot", farbe: "linear-gradient(135deg,#fde68a,#d97706)" },
      { titel: "Teller", farbe: "linear-gradient(135deg,#fecaca,#dc2626 60%,#7f1d1d)" },
      { titel: "Falafel", farbe: "linear-gradient(135deg,#bbf7d0,#65a30d 60%,#3f6212)" },
      { titel: "Saucen", farbe: "linear-gradient(135deg,#fef3c7,#fca5a5)" },
      { titel: "Lahmacun", farbe: "linear-gradient(135deg,#fdba74,#c2410c)" },
    ],
    hero: ["Kebap, wie er ", "sein", " soll."],
    proHero: ["Frisch vom", "Spieß", "in die Hand."],
    heroFarbe: "linear-gradient(150deg,#fde68a,#f59e0b 45%,#b91c1c)",
    aktion: "Jetzt vorbestellen",
    aktionKurz: "Bestellen",
    wunsch: "z. B. 2 × Kebap, Abholung 12:30",
    naechster: { klein: "Abholbereit in", gross: "ca. 10 Minuten" },
    zahlen: [
      { zahl: 15, text: "Jahre in Ottakring" },
      { zahl: 4.8, komma: 1, text: "Sterne auf Google" },
      { zahl: 90000, text: "Kebap im Jahr" },
    ],
    buchung: { titel: "Bestellen.", text: "Gericht wählen, Tag wählen, Abholzeit wählen – fertig. Kein Warten an der Kassa.", schritt: "Gericht", erledigt: "Bestellung aufgenommen!" },
    abschied: "Wir sehen uns in Ottakring.",
    chat: ["Was kostet ein Kebap?", "Wann habt ihr offen?", "Gibt es vegetarisch?", "Vorbestellen"],
  },

  cafe: {
    branche: "cafe",
    art: "Café",
    name: "Café Linde",
    marke: "LINDE",
    inhaberin: "Clara Hofer",
    strasse: "Beispielgasse 7",
    plz: "1080",
    ort: "Wien",
    bezirk: "Josefstadt",
    seit: 2016,
    telefon: "01 456 78 90",
    telefonLink: "tel:+4314567890",
    email: "servus@cafe-linde.example",
    slogan: "Guter Kaffee. Hausgemachte Torten. Zeit für sich.",
    einleitung: "Seit 2016 rösten wir unseren Kaffee selbst und backen jeden Morgen frisch – mitten in der Josefstadt.",
    oeffnungszeiten: [
      { tage: "Montag – Freitag", zeit: "7:30 – 19:00" },
      { tage: "Samstag – Sonntag", zeit: "9:00 – 18:00" },
    ],
    leistungen: [
      { id: "melange", name: "Wiener Melange", text: "Aus eigener Röstung", preis: 4, symbol: "◐" },
      { id: "fruehstueck", name: "Linde-Frühstück", text: "Gebäck, Ei, Aufstriche, Kaffee", preis: 14, symbol: "☺" },
      { id: "torte", name: "Torte des Tages", text: "Hausgemacht", preis: 5, symbol: "❀" },
      { id: "bowl", name: "Mittagsbowl", text: "Saisonal und vegetarisch", preis: 12, symbol: "✺" },
      { id: "brunch", name: "Wochenend-Brunch", text: "Sa & So, bitte reservieren", preis: 26, symbol: "◆" },
      { id: "torte-bestellen", name: "Torte bestellen", text: "Für Geburtstag & Feste", preis: 45, symbol: "✂" },
    ],
    preisHinweis: "Alles frisch und hausgemacht. Auch zum Mitnehmen.",
    team: [
      { name: "Clara", rolle: "Inhaberin, Rösterei", farbe: "#92400e" },
      { name: "Paul", rolle: "Konditor", farbe: "#be185d" },
      { name: "Nora", rolle: "Service", farbe: "#0f766e" },
    ],
    bewertungen: [
      { name: "Eva S.", text: "Die beste Melange der Josefstadt und die Topfentorte ist ein Traum." },
      { name: "Michael B.", text: "Gemütlich, ruhig, gutes WLAN. Mein zweites Büro." },
      { name: "Julia R.", text: "Brunch am Sonntag online reserviert – Tisch war fertig gedeckt. Herrlich!" },
    ],
    fragen: [
      { f: "Kann ich einen Tisch reservieren?", a: "Ja, online oder telefonisch. Zum Brunch am Wochenende empfehlen wir es sehr." },
      { f: "Gibt es vegane Optionen?", a: "Ja, jeden Tag mindestens eine vegane Torte und Hafermilch ohne Aufpreis." },
      { f: "Sind Hunde erlaubt?", a: "Natürlich! Wasser für den Hund gibt's gratis dazu." },
    ],
    galerie: [
      { titel: "Melange", farbe: "linear-gradient(135deg,#fef3c7,#a16207 60%,#451a03)" },
      { titel: "Topfentorte", farbe: "linear-gradient(135deg,#fff7ed,#fdba74)" },
      { titel: "Frühstück", farbe: "linear-gradient(135deg,#fef9c3,#facc15 60%,#a16207)" },
      { titel: "Gastgarten", farbe: "linear-gradient(135deg,#d9f99d,#4d7c0f)" },
      { titel: "Rösterei", farbe: "linear-gradient(160deg,#451a03,#a16207)" },
      { titel: "Brunch", farbe: "linear-gradient(135deg,#fce7f3,#db2777 70%)" },
    ],
    hero: ["Kaffee mit ", "Zeit", " zum Genießen."],
    proHero: ["Kaffee, der", "Momente", "macht."],
    heroFarbe: "linear-gradient(150deg,#fef3c7,#d6a76a 50%,#451a03)",
    aktion: "Tisch reservieren",
    aktionKurz: "Reservieren",
    wunsch: "z. B. Brunch für 4 Personen, Sonntag 10 Uhr",
    naechster: { klein: "Heute frisch", gross: "Topfentorte" },
    zahlen: [
      { zahl: 9, text: "Jahre in der Josefstadt" },
      { zahl: 4.8, komma: 1, text: "Sterne auf Google" },
      { zahl: 52000, text: "Melangen im Jahr" },
    ],
    buchung: { titel: "Reservieren.", text: "Angebot wählen, Tag wählen, Uhrzeit wählen – fertig. Ihr Tisch wartet auf Sie.", schritt: "Angebot", erledigt: "Tisch reserviert!" },
    abschied: "Wir sehen uns in der Josefstadt.",
    chat: ["Was kostet der Brunch?", "Wann habt ihr offen?", "Wo seid ihr?", "Tisch reservieren"],
  },

  handwerk: {
    branche: "handwerk",
    art: "Tischlerei",
    name: "Tischlerei Berger",
    marke: "BERGER",
    inhaberin: "Martin Berger",
    strasse: "Beispielweg 21",
    plz: "1210",
    ort: "Wien",
    bezirk: "Floridsdorf",
    seit: 1998,
    telefon: "01 271 82 83",
    telefonLink: "tel:+4312718283",
    email: "office@tischlerei-berger.example",
    slogan: "Möbel nach Maß. Aus Wien, für Ihr Zuhause.",
    einleitung: "Seit 1998 planen und bauen wir Küchen, Schränke und Möbel nach Maß – mit Holz aus Österreich und fixem Liefertermin.",
    oeffnungszeiten: [
      { tage: "Montag – Donnerstag", zeit: "7:00 – 16:00" },
      { tage: "Freitag", zeit: "7:00 – 12:00" },
      { tage: "Samstag – Sonntag", zeit: "geschlossen" },
    ],
    leistungen: [
      { id: "kueche", name: "Küche nach Maß", text: "Planung, Bau und Montage", preis: 6900, symbol: "◆" },
      { id: "schrank", name: "Einbauschrank", text: "Auch für Dachschrägen", preis: 1900, symbol: "◐" },
      { id: "tisch", name: "Esstisch", text: "Massivholz, Ihre Wunschgröße", preis: 1400, symbol: "✺" },
      { id: "bad", name: "Badmöbel", text: "Feuchtraumgeeignet", preis: 1200, symbol: "❀" },
      { id: "reparatur", name: "Reparatur", text: "Türen, Fenster, Möbel", preis: 90, symbol: "✂" },
      { id: "beratung", name: "Beratung vor Ort", text: "Wir messen kostenlos aus", preis: 0, symbol: "☺" },
    ],
    preisHinweis: "Richtpreise – Sie bekommen nach dem Ausmessen ein fixes Angebot.",
    team: [
      { name: "Martin", rolle: "Tischlermeister", farbe: "#78350f" },
      { name: "Sandra", rolle: "Planung & Büro", farbe: "#1d4ed8" },
      { name: "Florian", rolle: "Montage", farbe: "#15803d" },
    ],
    bewertungen: [
      { name: "Familie K.", text: "Unsere Küche ist genau so geworden wie geplant – und pünktlich fertig." },
      { name: "Petra G.", text: "Der Schrank unter der Dachschräge nutzt jeden Zentimeter. Großartige Arbeit." },
      { name: "Robert H.", text: "Faires Angebot, sauberer Einbau, alles weggeräumt. Gerne wieder." },
    ],
    fragen: [
      { f: "Kostet das Ausmessen etwas?", a: "Nein. Wir kommen kostenlos zu Ihnen, messen aus und beraten Sie." },
      { f: "Wie lange dauert eine Küche?", a: "Meist 6 bis 8 Wochen ab Auftrag. Den genauen Termin bekommen Sie fix zugesagt." },
      { f: "Welches Holz verwenden Sie?", a: "Vorwiegend Eiche, Nuss und Lärche aus Österreich – auf Wunsch auch lackierte Fronten." },
    ],
    galerie: [
      { titel: "Küche Eiche", farbe: "linear-gradient(135deg,#fde68a,#b45309 60%,#78350f)" },
      { titel: "Einbauschrank", farbe: "linear-gradient(135deg,#f5f5f4,#a8a29e)" },
      { titel: "Esstisch Nuss", farbe: "linear-gradient(135deg,#a16207,#451a03)" },
      { titel: "Badmöbel", farbe: "linear-gradient(135deg,#e0f2fe,#0369a1)" },
      { titel: "Werkstatt", farbe: "linear-gradient(160deg,#44403c,#a8a29e)" },
      { titel: "Dachschräge", farbe: "linear-gradient(135deg,#fef3c7,#d97706)" },
    ],
    hero: ["Möbel, die ", "genau", " passen."],
    proHero: ["Holz, das", "Räume", "verändert."],
    heroFarbe: "linear-gradient(150deg,#fde68a,#b45309 50%,#451a03)",
    aktion: "Angebot anfragen",
    aktionKurz: "Termin",
    wunsch: "z. B. Einbauschrank fürs Schlafzimmer, ca. 3 m breit",
    naechster: { klein: "Nächster Termin zum Ausmessen", gross: "Donnerstag, 9:00" },
    zahlen: [
      { zahl: 27, text: "Jahre Meisterbetrieb" },
      { zahl: 4.9, komma: 1, text: "Sterne auf Google" },
      { zahl: 1200, text: "Küchen & Möbel gebaut" },
    ],
    buchung: { titel: "Ausmessen.", text: "Wunsch wählen, Tag wählen, Uhrzeit wählen – wir kommen kostenlos zu Ihnen.", schritt: "Wunsch", erledigt: "Termin vereinbart!" },
    abschied: "Wir kommen zu Ihnen.",
    chat: ["Was kostet eine Küche?", "Wann habt ihr offen?", "Kostet Ausmessen etwas?", "Termin vereinbaren"],
  },
  nagel: {
    branche: "nagel",
    art: "Nagelstudio",
    name: "Nails by Lea",
    marke: "LEA",
    inhaberin: "Lea Horvat",
    strasse: "Beispielgasse 5",
    plz: "1060",
    ort: "Wien",
    bezirk: "Mariahilf",
    seit: 2019,
    telefon: "0676 234 56 78",
    telefonLink: "tel:+436762345678",
    email: "termin@nailsbylea.example",
    slogan: "Schöne Nägel. Entspannte Stunde. Mitten in Mariahilf.",
    einleitung: "Seit 2019 machen wir Gel, Acryl und Maniküre mit Liebe zum Detail – hygienisch, in Ruhe und mit fixem Termin.",
    oeffnungszeiten: [
      { tage: "Montag", zeit: "geschlossen" },
      { tage: "Dienstag – Freitag", zeit: "10:00 – 19:00" },
      { tage: "Samstag", zeit: "9:00 – 15:00" },
      { tage: "Sonntag", zeit: "geschlossen" },
    ],
    leistungen: [
      { id: "manikuere", name: "Maniküre", text: "Feilen, Nagelhaut, Lack", preis: 32, dauer: 45, symbol: "✺" },
      { id: "gel", name: "Gel-Neumodellage", text: "Natürlich oder mit Farbe", preis: 55, dauer: 90, symbol: "◆" },
      { id: "auffuellen", name: "Auffüllen", text: "Nach 3–4 Wochen", preis: 42, dauer: 75, symbol: "◐" },
      { id: "pedikuere", name: "Pediküre", text: "Mit Fußbad und Lack", preis: 39, dauer: 60, symbol: "❀" },
      { id: "nailart", name: "Nail-Art", text: "Pro Nagel", preis: 3, dauer: 10, symbol: "✂" },
      { id: "wimpern", name: "Wimpern färben", text: "Mit Augenbrauen-Form", preis: 22, dauer: 25, symbol: "☺" },
    ],
    preisHinweis: "Alle Preise inklusive Pflege und Beratung.",
    team: [
      { name: "Lea", rolle: "Inhaberin, Gel & Nail-Art", farbe: "#be185d" },
      { name: "Mira", rolle: "Maniküre & Pediküre", farbe: "#9d174d" },
      { name: "Sara", rolle: "Wimpern & Brauen", farbe: "#db2777" },
    ],
    bewertungen: [
      { name: "Julia K.", text: "Meine Gelnägel halten vier Wochen ohne Abplatzen. Und Lea nimmt sich wirklich Zeit." },
      { name: "Nina P.", text: "Super sauber, entspannte Musik, und die Nail-Art war genau wie auf meinem Foto." },
      { name: "Tamara S.", text: "Online gebucht, pünktlich drangekommen, perfekte Pediküre. Gerne wieder!" },
    ],
    fragen: [
      { f: "Wie lange hält Gel?", a: "Meist 3 bis 4 Wochen. Danach füllen wir auf – das ist schonender als jedes Mal neu zu machen." },
      { f: "Kann ich ein Foto als Vorlage mitbringen?", a: "Sehr gern! Zeigen Sie uns Ihr Wunschdesign, wir sagen Ihnen gleich, was möglich ist." },
      { f: "Wie hygienisch arbeiten Sie?", a: "Alle Werkzeuge werden nach jeder Kundin sterilisiert, Feilen gibt es nur einmal." },
    ],
    galerie: [
      { titel: "Nude-Gel", farbe: "linear-gradient(135deg,#fde2e4,#f5c6cb 60%,#e8a0a8)" },
      { titel: "French", farbe: "linear-gradient(160deg,#fff,#fbe4e6 60%,#f4c2c7)" },
      { titel: "Bordeaux", farbe: "linear-gradient(135deg,#9f1239,#4c0519)" },
      { titel: "Glitzer", farbe: "linear-gradient(135deg,#fdf2f8,#f9a8d4 50%,#c084fc)" },
      { titel: "Pediküre", farbe: "linear-gradient(135deg,#ffe4e6,#fda4af)" },
      { titel: "Nail-Art", farbe: "linear-gradient(135deg,#fbcfe8,#be185d)" },
    ],
    hero: ["Nägel, die ", "Freude", " machen."],
    proHero: ["Nägel, die", "Blicke", "fangen."],
    heroFarbe: "linear-gradient(150deg,#fde2e4,#f9a8d4 50%,#9d174d)",
    aktion: "Termin buchen",
    aktionKurz: "Termin",
    wunsch: "z. B. Gel-Neumodellage in Nude, Samstag Vormittag",
    naechster: { klein: "Nächster freier Termin", gross: "Mittwoch, 14:30" },
    zahlen: [
      { zahl: 6, text: "Jahre in Mariahilf" },
      { zahl: 4.9, komma: 1, text: "Sterne auf Google" },
      { zahl: 7500, text: "Maniküren" },
    ],
    buchung: { titel: "Termin.", text: "Behandlung wählen, Tag wählen, Uhrzeit wählen – fertig. Rund um die Uhr.", schritt: "Behandlung", erledigt: "Termin gebucht!" },
    abschied: "Wir sehen uns in Mariahilf.",
    chat: ["Was kostet Gel?", "Wann habt ihr offen?", "Wie lange hält Gel?", "Termin buchen"],
  },

  schneiderei: {
    branche: "schneiderei",
    art: "Änderungsschneiderei",
    name: "Schneiderei Aydin",
    marke: "AYDIN",
    inhaberin: "Selma Aydin",
    strasse: "Beispielstraße 33",
    plz: "1150",
    ort: "Wien",
    bezirk: "Rudolfsheim-Fünfhaus",
    seit: 2005,
    telefon: "01 892 33 44",
    telefonLink: "tel:+4318923344",
    email: "office@schneiderei-aydin.example",
    slogan: "Passt nicht? Passt bald. Änderungen in 3 Tagen.",
    einleitung: "Seit 2005 kürzen, enger machen und reparieren wir alles, was Sie lieben – vom Jeans-Saum bis zum Hochzeitskleid.",
    oeffnungszeiten: [
      { tage: "Montag – Freitag", zeit: "9:00 – 18:00" },
      { tage: "Samstag", zeit: "9:00 – 13:00" },
      { tage: "Sonntag", zeit: "geschlossen" },
    ],
    leistungen: [
      { id: "kuerzen", name: "Hose kürzen", text: "Mit Original-Saum möglich", preis: 14, symbol: "✂" },
      { id: "enger", name: "Enger machen", text: "Hose, Rock oder Kleid", preis: 22, symbol: "◆" },
      { id: "reissverschluss", name: "Reißverschluss", text: "Neu einnähen", preis: 18, symbol: "◐" },
      { id: "sakko", name: "Sakko anpassen", text: "Ärmel, Taille, Schultern", preis: 35, symbol: "✺" },
      { id: "kleid", name: "Brautkleid", text: "Anpassung mit Anprobe", preis: 120, symbol: "❀" },
      { id: "vorhang", name: "Vorhänge", text: "Kürzen und säumen", preis: 25, symbol: "☺" },
    ],
    preisHinweis: "Richtpreise – den genauen Preis sagen wir Ihnen bei der Abgabe.",
    team: [
      { name: "Selma", rolle: "Schneidermeisterin", farbe: "#1e3a5f" },
      { name: "Kemal", rolle: "Leder & Reißverschlüsse", farbe: "#334155" },
      { name: "Ana", rolle: "Kleider & Brautmode", farbe: "#9f1239" },
    ],
    bewertungen: [
      { name: "Markus B.", text: "Drei Hosen gekürzt, nach zwei Tagen fertig, perfekt gemacht. Fairer Preis." },
      { name: "Elif T.", text: "Mein Brautkleid saß am Ende wie angegossen. Danke, Ana!" },
      { name: "Peter W.", text: "Reißverschluss an der Lederjacke getauscht – sieht aus wie neu." },
    ],
    fragen: [
      { f: "Wie lange dauert eine Änderung?", a: "Meist 3 Werktage. Mit Express-Service oft schon am nächsten Tag." },
      { f: "Muss ich zur Anprobe kommen?", a: "Bei Hosen reicht es, wenn Sie die gewünschte Länge abstecken. Bei Kleidern und Sakkos machen wir eine kurze Anprobe." },
      { f: "Kann ich mit Karte zahlen?", a: "Ja, bar oder mit Karte." },
    ],
    galerie: [
      { titel: "Saum", farbe: "linear-gradient(135deg,#1e3a5f,#334155)" },
      { titel: "Brautkleid", farbe: "linear-gradient(135deg,#fff,#f1f5f9 60%,#cbd5e1)" },
      { titel: "Sakko", farbe: "linear-gradient(135deg,#475569,#1e293b)" },
      { titel: "Leder", farbe: "linear-gradient(135deg,#78350f,#451a03)" },
      { titel: "Vorhänge", farbe: "linear-gradient(135deg,#e0e7ff,#a5b4fc)" },
      { titel: "Werkstatt", farbe: "repeating-linear-gradient(90deg,#1e3a5f 0 8px,#2c5282 8px 16px)" },
    ],
    hero: ["Kleidung, die wieder ", "passt", "."],
    proHero: ["Mode, die", "perfekt", "sitzt."],
    heroFarbe: "repeating-linear-gradient(120deg,#1e3a5f 0 14px,#2c5282 14px 28px)",
    aktion: "Abgabe vormerken",
    aktionKurz: "Abgabe",
    wunsch: "z. B. 2 Hosen kürzen, Abgabe Montag",
    naechster: { klein: "Abholbereit in", gross: "3 Werktagen" },
    zahlen: [
      { zahl: 20, text: "Jahre im 15. Bezirk" },
      { zahl: 4.8, komma: 1, text: "Sterne auf Google" },
      { zahl: 30000, text: "Änderungen" },
    ],
    buchung: { titel: "Abgabe.", text: "Änderung wählen, Tag wählen, Uhrzeit wählen – wir haben Zeit für Sie, ohne Warten.", schritt: "Änderung", erledigt: "Abgabe vorgemerkt!" },
    abschied: "Wir sehen uns im Fünfzehnten.",
    chat: ["Was kostet Hose kürzen?", "Wann habt ihr offen?", "Wie lange dauert es?", "Abgabe vormerken"],
  },

  hundesalon: {
    branche: "hundesalon",
    art: "Hundesalon",
    name: "Fellglück",
    marke: "FELLGLÜCK",
    inhaberin: "Tanja Huber",
    strasse: "Beispielweg 8",
    plz: "1220",
    ort: "Wien",
    bezirk: "Donaustadt",
    seit: 2015,
    telefon: "0664 345 67 89",
    telefonLink: "tel:+436643456789",
    email: "wuff@fellglueck.example",
    slogan: "Gepflegt, gebadet, glücklich – mit viel Geduld.",
    einleitung: "Seit 2015 pflegen wir Hunde aller Größen in Ruhe und ohne Stress – mit Termin, damit Ihr Liebling nie warten muss.",
    oeffnungszeiten: [
      { tage: "Montag – Freitag", zeit: "8:00 – 17:00" },
      { tage: "Samstag", zeit: "8:00 – 12:00" },
      { tage: "Sonntag", zeit: "geschlossen" },
    ],
    leistungen: [
      { id: "baden", name: "Baden & Föhnen", text: "Mit mildem Shampoo", preis: 35, dauer: 60, symbol: "◐" },
      { id: "scheren", name: "Komplett-Schur", text: "Baden, Scheren, Föhnen", preis: 55, dauer: 120, symbol: "✂" },
      { id: "trimmen", name: "Trimmen", text: "Für Rauhaar-Rassen", preis: 60, dauer: 120, symbol: "◆" },
      { id: "krallen", name: "Krallen schneiden", text: "Auch ohne Termin", preis: 10, dauer: 15, symbol: "☺" },
      { id: "welpe", name: "Welpen-Eingewöhnung", text: "Erstes Kennenlernen", preis: 20, dauer: 30, symbol: "❀" },
      { id: "entfilzen", name: "Entfilzen", text: "Pro Viertelstunde", preis: 12, dauer: 15, symbol: "✺" },
    ],
    preisHinweis: "Der Preis hängt von Größe und Fell ab – siehe Tabelle.",
    team: [
      { name: "Tanja", rolle: "Inhaberin, Groomerin", farbe: "#0f766e" },
      { name: "Jakob", rolle: "Baden & Trimmen", farbe: "#155e75" },
      { name: "Luna", rolle: "Bürohund", farbe: "#a16207" },
    ],
    bewertungen: [
      { name: "Familie R.", text: "Unser ängstlicher Pudel geht inzwischen gern hin. Tanja hat unglaublich viel Geduld." },
      { name: "Sandra M.", text: "Perfekter Schnitt, sauber, und der Hund riecht noch Tage später gut." },
      { name: "Thomas K.", text: "Termin online gebucht, auf die Minute pünktlich. Sehr empfehlenswert." },
    ],
    fragen: [
      { f: "Darf ich dabei bleiben?", a: "Beim ersten Mal gern. Viele Hunde sind aber ruhiger, wenn Herrchen oder Frauchen kurz spazieren geht." },
      { f: "Wie oft sollte mein Hund zum Scheren?", a: "Je nach Rasse alle 6 bis 10 Wochen. Wir beraten Sie gern." },
      { f: "Nehmen Sie auch große Hunde?", a: "Ja, wir haben eine Hebebadewanne für Hunde bis 60 kg." },
    ],
    galerie: [
      { titel: "Pudel", farbe: "linear-gradient(135deg,#f5f5f4,#d6d3d1)" },
      { titel: "Golden Retriever", farbe: "linear-gradient(135deg,#fde68a,#d97706)" },
      { titel: "Yorkshire", farbe: "linear-gradient(135deg,#a8a29e,#57534e)" },
      { titel: "Badewanne", farbe: "linear-gradient(135deg,#ccfbf1,#14b8a6)" },
      { titel: "Welpe", farbe: "linear-gradient(135deg,#fef3c7,#fcd34d)" },
      { titel: "Schnauzer", farbe: "linear-gradient(135deg,#d6d3d1,#44403c)" },
    ],
    hero: ["Ihr Hund in ", "besten", " Pfoten."],
    proHero: ["Fell, das", "glänzt", "und Hunde, die strahlen."],
    heroFarbe: "linear-gradient(150deg,#ccfbf1,#14b8a6 50%,#0f766e)",
    aktion: "Termin buchen",
    aktionKurz: "Termin",
    wunsch: "z. B. Golden Retriever, Baden & Krallen",
    naechster: { klein: "Nächster freier Termin", gross: "Freitag, 10:00" },
    zahlen: [
      { zahl: 10, text: "Jahre in der Donaustadt" },
      { zahl: 4.9, komma: 1, text: "Sterne auf Google" },
      { zahl: 9000, text: "glückliche Hunde" },
    ],
    buchung: { titel: "Termin.", text: "Pflege wählen, Tag wählen, Uhrzeit wählen – Ihr Hund muss nie warten.", schritt: "Pflege", erledigt: "Termin gebucht!" },
    abschied: "Wir sehen uns in der Donaustadt.",
    chat: ["Was kostet Baden?", "Wann habt ihr offen?", "Nehmt ihr große Hunde?", "Termin buchen"],
  },

  kfz: {
    branche: "kfz",
    art: "Kfz-Werkstatt",
    name: "Kfz Hofer",
    marke: "HOFER",
    inhaberin: "Stefan Hofer",
    strasse: "Beispielstraße 120",
    plz: "1230",
    ort: "Wien",
    bezirk: "Liesing",
    seit: 2001,
    telefon: "01 699 12 34",
    telefonLink: "tel:+4316991234",
    email: "werkstatt@kfz-hofer.example",
    slogan: "Pickerl, Service, Reifen – ehrlich und mit Fixpreis.",
    einleitung: "Seit 2001 reparieren wir Autos aller Marken – mit Kostenvoranschlag vorher und ohne böse Überraschungen.",
    oeffnungszeiten: [
      { tage: "Montag – Donnerstag", zeit: "7:30 – 17:00" },
      { tage: "Freitag", zeit: "7:30 – 13:00" },
      { tage: "Samstag – Sonntag", zeit: "geschlossen" },
    ],
    leistungen: [
      { id: "pickerl", name: "§57a-Pickerl", text: "Begutachtung aller Marken", preis: 79, dauer: 60, symbol: "◆" },
      { id: "service", name: "Service", text: "Nach Herstellervorgabe", preis: 189, dauer: 180, symbol: "◐" },
      { id: "reifen", name: "Reifenwechsel", text: "Inkl. Auswuchten", preis: 49, dauer: 45, symbol: "✺" },
      { id: "bremsen", name: "Bremsen", text: "Beläge vorne", preis: 160, dauer: 120, symbol: "❀" },
      { id: "klima", name: "Klimaservice", text: "Füllen und prüfen", preis: 89, dauer: 60, symbol: "☺" },
      { id: "diagnose", name: "Fehlerdiagnose", text: "Mit Auslesen", preis: 45, dauer: 30, symbol: "✂" },
    ],
    preisHinweis: "Fixpreise für die meisten Autos – vor jeder Reparatur bekommen Sie einen Kostenvoranschlag.",
    team: [
      { name: "Stefan", rolle: "Kfz-Meister", farbe: "#ea580c" },
      { name: "Milan", rolle: "Mechatroniker", farbe: "#334155" },
      { name: "Petra", rolle: "Büro & Termine", farbe: "#0f766e" },
    ],
    bewertungen: [
      { name: "Andreas L.", text: "Ehrliche Werkstatt. Hat mir gesagt, was wirklich nötig ist – und was nicht." },
      { name: "Claudia F.", text: "Pickerl-Termin online gebucht, nach einer Stunde fertig. Top!" },
      { name: "Mario S.", text: "Kostenvoranschlag hat genau gestimmt. Komme seit Jahren her." },
    ],
    fragen: [
      { f: "Bekomme ich einen Leihwagen?", a: "Ja, gegen Voranmeldung haben wir zwei Ersatzautos." },
      { f: "Machen Sie alle Marken?", a: "Ja, wir arbeiten an allen gängigen Marken – auch an Hybrid-Autos." },
      { f: "Wann ist mein Pickerl fällig?", a: "Das steht auf der Plakette. Sie können bis zu einem Monat davor und vier Monate danach kommen." },
    ],
    galerie: [
      { titel: "Werkstatt", farbe: "linear-gradient(135deg,#374151,#111827)" },
      { titel: "Hebebühne", farbe: "linear-gradient(135deg,#4b5563,#ea580c)" },
      { titel: "Reifen", farbe: "linear-gradient(135deg,#1f2937,#000)" },
      { titel: "Diagnose", farbe: "linear-gradient(135deg,#0f766e,#134e4a)" },
      { titel: "Bremsen", farbe: "linear-gradient(135deg,#9a3412,#431407)" },
      { titel: "Service", farbe: "linear-gradient(135deg,#e5e7eb,#9ca3af)" },
    ],
    hero: ["Ihr Auto in ", "guten", " Händen."],
    proHero: ["Autos, die", "laufen", "wie am ersten Tag."],
    heroFarbe: "linear-gradient(150deg,#4b5563,#111827 55%,#ea580c)",
    aktion: "Termin buchen",
    aktionKurz: "Termin",
    wunsch: "z. B. Pickerl für VW Golf, Baujahr 2016",
    naechster: { klein: "Nächster Pickerl-Termin", gross: "Morgen, 8:00" },
    zahlen: [
      { zahl: 24, text: "Jahre in Liesing" },
      { zahl: 4.8, komma: 1, text: "Sterne auf Google" },
      { zahl: 40000, text: "Autos repariert" },
    ],
    buchung: { titel: "Termin.", text: "Leistung wählen, Tag wählen, Uhrzeit wählen – Ihr Auto kommt sofort dran.", schritt: "Leistung", erledigt: "Termin gebucht!" },
    abschied: "Wir sehen uns in Liesing.",
    chat: ["Was kostet das Pickerl?", "Wann habt ihr offen?", "Gibt es einen Leihwagen?", "Termin buchen"],
  },
};

// ---------------------------------------------------------------------------
// Pro Branche: eigener Look (B2), eigene Funktion (C1), eigene Beispielwerte (F1)
// ---------------------------------------------------------------------------

export type Stil = {
  /** Seitenhintergrund, Kartenfläche, tiefe Fläche (Galerie/Fußzeile) */
  bg: string;
  flaeche: string;
  tief: string;
  ink: string;
  muted: string;
  linie: string;
  akzent: string;
  /** Schrift auf dem Akzent */
  aufAkzent: string;
  /** Zweite Akzentfarbe (Knöpfe, Hervorhebungen) */
  akzent2: string;
  dunkel: boolean;
  schrift: "serif" | "sans" | "display";
  /** Verlauf im Pro-Design */
  pro: [string, string, string];
};

type Gericht = { name: string; text: string; preis: number };

export type Funktion =
  | { art: "preistabelle"; titel: string; text: string; spalten: [string, string, string]; zeilen: { name: string; preise: (number | null)[] }[]; hinweis?: string }
  | { art: "wartezeit"; titel: string; text: string; minuten: number; vorIhnen: number; stuehle: number }
  | { art: "speisekarte"; titel: string; text: string; modus: "bestellen" | "reservieren"; kategorien: { name: string; gerichte: Gericht[] }[] }
  | { art: "projekte"; titel: string; text: string; gebiet: string[]; projekte: { titel: string; ort: string; text: string; vorher: string; nachher: string }[] }
  | { art: "termin"; titel: string; text: string; hinweis?: string };

type Extra = { stil: Stil; bewertung: { sterne: number; anzahl: number }; vertrauen: string; funktion: Funktion; bild?: { hero: string; einblick?: string } };

const EXTRA: Record<BrancheId, Extra> = {
  friseur: {
    stil: { bg: "#fbf4f1", flaeche: "#ffffff", tief: "#3b1d27", ink: "#2d1a20", muted: "#7a5c64", linie: "#efdcd9", akzent: "#b0546a", aufAkzent: "#ffffff", akzent2: "#7a2e43", dunkel: false, schrift: "serif", pro: ["#ec4899", "#db2777", "#f43f5e"] },
    bewertung: { sterne: 4.8, anzahl: 63 },
    vertrauen: "Seit 2012 in Neubau",
    bild: { hero: "/beispiele/friseur.jpg", einblick: "/beispiele/friseur-einblick.jpg" },
    funktion: {
      art: "preistabelle",
      titel: "Preise nach Haarlänge",
      text: "Kein Rätselraten: So viel kostet Ihr Besuch – je nach Länge Ihrer Haare.",
      spalten: ["kurz", "mittel", "lang"],
      zeilen: [
        { name: "Waschen, Schneiden, Föhnen", preise: [42, 52, 62] },
        { name: "Färben (Ansatz)", preise: [58, 58, 64] },
        { name: "Färben (ganze Länge)", preise: [62, 68, 85] },
        { name: "Strähnen & Balayage", preise: [null, 110, 140] },
        { name: "Föhnen & Styling", preise: [24, 29, 34] },
      ],
      hinweis: "Online-Termin direkt im nächsten Schritt.",
    },
  },
  barber: {
    stil: { bg: "#111111", flaeche: "#1b1b1b", tief: "#000000", ink: "#f5f5f4", muted: "#a8a29e", linie: "#2e2e2e", akzent: "#c9a24a", aufAkzent: "#111111", akzent2: "#e6c77a", dunkel: true, schrift: "display", pro: ["#d4a72c", "#b45309", "#f59e0b"] },
    bewertung: { sterne: 4.7, anzahl: 128 },
    vertrauen: "Ohne Termin, 6 Tage die Woche",
    bild: { hero: "/beispiele/barber.jpg", einblick: "/beispiele/barber-einblick.jpg" },
    funktion: { art: "wartezeit", titel: "Jetzt ohne Termin", text: "Schauen Sie vorher nach, wie lange Sie warten – oder buchen Sie gleich einen fixen Termin.", minuten: 15, vorIhnen: 2, stuehle: 3 },
  },
  imbiss: {
    stil: { bg: "#fff8ec", flaeche: "#ffffff", tief: "#3a0d0d", ink: "#2a1608", muted: "#7c5a3a", linie: "#f3e1c4", akzent: "#d62828", aufAkzent: "#ffffff", akzent2: "#fcbf49", dunkel: false, schrift: "sans", pro: ["#f59e0b", "#ea580c", "#dc2626"] },
    bewertung: { sterne: 4.6, anzahl: 312 },
    vertrauen: "Täglich bis 24 Uhr",
    bild: { hero: "/beispiele/imbiss.jpg", einblick: "/beispiele/imbiss-einblick.jpg" },
    funktion: {
      art: "speisekarte",
      titel: "Speisekarte",
      text: "Gleich online bestellen – zum Abholen in 10 Minuten oder geliefert.",
      modus: "bestellen",
      kategorien: [
        { name: "Kebap", gerichte: [
          { name: "Kebap im Brot", text: "Kalb oder Huhn, Hausbrot", preis: 6 },
          { name: "Dürüm", text: "Im Fladen gerollt", preis: 7 },
          { name: "Kebap-Teller", text: "Mit Reis, Salat, Pommes", preis: 12 },
          { name: "Falafel im Brot", text: "Vegetarisch, mit Hummus", preis: 7 },
        ] },
        { name: "Pizza & Pide", gerichte: [
          { name: "Lahmacun", text: "Türkische Pizza", preis: 5 },
          { name: "Pide Käse", text: "Mit Ei auf Wunsch", preis: 9 },
          { name: "Pizza Margherita", text: "30 cm", preis: 9 },
        ] },
        { name: "Getränke", gerichte: [
          { name: "Ayran", text: "Hausgemacht", preis: 2 },
          { name: "Cola 0,33 l", text: "", preis: 2.5 },
          { name: "Çay", text: "Türkischer Tee", preis: 1.5 },
        ] },
      ],
    },
  },
  cafe: {
    stil: { bg: "#f6f1e7", flaeche: "#fffdf8", tief: "#23372a", ink: "#23302a", muted: "#6b6a58", linie: "#e6dcc8", akzent: "#3f6b4f", aufAkzent: "#ffffff", akzent2: "#b5835a", dunkel: false, schrift: "serif", pro: ["#4d9a6a", "#2f7a50", "#b5835a"] },
    bewertung: { sterne: 4.8, anzahl: 187 },
    vertrauen: "Eigene Rösterei seit 2016",
    bild: { hero: "/beispiele/cafe.jpg", einblick: "/beispiele/cafe-einblick.jpg" },
    funktion: {
      art: "speisekarte",
      titel: "Frühstück & Karte",
      text: "Schauen Sie, worauf Sie Lust haben – und reservieren Sie gleich Ihren Tisch.",
      modus: "reservieren",
      kategorien: [
        { name: "Frühstück", gerichte: [
          { name: "Linde-Frühstück", text: "Gebäck, Ei, Aufstriche, Kaffee", preis: 14 },
          { name: "Avocado-Toast", text: "Mit pochiertem Ei", preis: 11 },
          { name: "Granola-Bowl", text: "Joghurt, Obst, Honig", preis: 8 },
        ] },
        { name: "Kaffee", gerichte: [
          { name: "Wiener Melange", text: "Aus eigener Röstung", preis: 4 },
          { name: "Cappuccino", text: "Auch mit Hafermilch", preis: 4.2 },
          { name: "Einspänner", text: "Mit Schlagobers", preis: 4.8 },
        ] },
        { name: "Mehlspeisen", gerichte: [
          { name: "Topfentorte", text: "Hausgemacht", preis: 5 },
          { name: "Apfelstrudel", text: "Mit Vanillesauce", preis: 5.5 },
        ] },
      ],
    },
  },
  handwerk: {
    stil: { bg: "#f4efe8", flaeche: "#ffffff", tief: "#1f3327", ink: "#1f2a22", muted: "#6b6256", linie: "#e4dacb", akzent: "#2f4f3a", aufAkzent: "#ffffff", akzent2: "#a0703c", dunkel: false, schrift: "sans", pro: ["#d97706", "#a16207", "#16a34a"] },
    bewertung: { sterne: 5.0, anzahl: 18 },
    vertrauen: "Meisterbetrieb seit 1998",
    bild: { hero: "/beispiele/handwerk.jpg", einblick: "/beispiele/handwerk-einblick.jpg" },
    funktion: {
      art: "projekte",
      titel: "Unsere Projekte",
      text: "Echte Arbeiten aus der Gegend – vorher und nachher. Ihr Projekt? Schicken Sie uns ein Foto.",
      gebiet: ["Floridsdorf", "Donaustadt", "Brigittenau", "Korneuburg", "Gerasdorf"],
      projekte: [
        { titel: "Küche in Eiche", ort: "1210 Wien", text: "Alte Einbauküche raus, maßgefertigte Eichenküche rein – in 6 Wochen.", vorher: "linear-gradient(135deg,#d6d3d1,#a8a29e)", nachher: "linear-gradient(135deg,#fde68a,#b45309 60%,#78350f)" },
        { titel: "Schrank unter der Dachschräge", ort: "2100 Korneuburg", text: "Jeder Zentimeter genutzt, mit Schiebetüren.", vorher: "linear-gradient(135deg,#e7e5e4,#c8bfb2)", nachher: "linear-gradient(135deg,#f5f5f4,#d6c3a5 60%,#a0703c)" },
        { titel: "Esstisch aus Nuss", ort: "1220 Wien", text: "2,40 m Massivholz für die ganze Familie.", vorher: "linear-gradient(135deg,#e5e7eb,#9ca3af)", nachher: "linear-gradient(135deg,#a16207,#451a03)" },
      ],
    },
  },
  nagel: {
    stil: { bg: "#fdf4f6", flaeche: "#ffffff", tief: "#4a1029", ink: "#3a1726", muted: "#8a5b6c", linie: "#f5dbe3", akzent: "#be185d", aufAkzent: "#ffffff", akzent2: "#f9a8d4", dunkel: false, schrift: "serif", pro: ["#ec4899", "#c026d3", "#a855f7"] },
    bewertung: { sterne: 4.9, anzahl: 94 },
    vertrauen: "Seit 2019 in Mariahilf",
    bild: { hero: "/beispiele/nagel.jpg", einblick: "/beispiele/nagel-einblick.jpg" },
    funktion: { art: "termin", titel: "Termin in 20 Sekunden", text: "Behandlung wählen, Tag und Uhrzeit wählen – fertig. Auch am Abend und am Wochenende.", hinweis: "Bestätigung kommt sofort per E-Mail." },
  },
  schneiderei: {
    stil: { bg: "#f3f5f9", flaeche: "#ffffff", tief: "#14253d", ink: "#16243a", muted: "#5b6b82", linie: "#dde3ec", akzent: "#1e3a5f", aufAkzent: "#ffffff", akzent2: "#c2410c", dunkel: false, schrift: "sans", pro: ["#3b82f6", "#2563eb", "#f97316"] },
    bewertung: { sterne: 4.8, anzahl: 142 },
    vertrauen: "Fertig in 3 Werktagen",
    bild: { hero: "/beispiele/schneiderei.jpg", einblick: "/beispiele/schneiderei-einblick.jpg" },
    funktion: {
      art: "preistabelle",
      titel: "Was kostet meine Änderung?",
      text: "Richtpreise für die häufigsten Änderungen – den genauen Preis sagen wir Ihnen bei der Abgabe.",
      spalten: ["Hose", "Rock/Kleid", "Sakko"],
      zeilen: [
        { name: "Kürzen", preise: [14, 18, 28] },
        { name: "Enger machen", preise: [22, 26, 35] },
        { name: "Reißverschluss neu", preise: [18, 22, 30] },
        { name: "Ärmel kürzen", preise: [null, 20, 26] },
      ],
      hinweis: "Express in 24 Stunden: + 50 %",
    },
  },
  hundesalon: {
    stil: { bg: "#f0f9f7", flaeche: "#ffffff", tief: "#103b37", ink: "#12322e", muted: "#55716c", linie: "#d5ebe6", akzent: "#0f766e", aufAkzent: "#ffffff", akzent2: "#f59e0b", dunkel: false, schrift: "sans", pro: ["#14b8a6", "#0d9488", "#f59e0b"] },
    bewertung: { sterne: 4.9, anzahl: 76 },
    vertrauen: "Geduldig seit 2015",
    bild: { hero: "/beispiele/hundesalon.jpg", einblick: "/beispiele/hundesalon-einblick.jpg" },
    funktion: {
      art: "preistabelle",
      titel: "Preise nach Hundegröße",
      text: "Klein wie ein Yorkie, mittel wie ein Beagle, groß wie ein Golden Retriever.",
      spalten: ["klein", "mittel", "groß"],
      zeilen: [
        { name: "Baden & Föhnen", preise: [35, 45, 60] },
        { name: "Komplett-Schur", preise: [55, 70, 90] },
        { name: "Trimmen", preise: [60, 75, 95] },
        { name: "Krallen schneiden", preise: [10, 10, 12] },
      ],
      hinweis: "Bei verfilztem Fell kommt Entfilzen dazu (12 € pro Viertelstunde).",
    },
  },
  kfz: {
    stil: { bg: "#16191f", flaeche: "#1f242c", tief: "#0b0d11", ink: "#f3f4f6", muted: "#9ca3af", linie: "#2d333d", akzent: "#f97316", aufAkzent: "#111111", akzent2: "#fdba74", dunkel: true, schrift: "display", pro: ["#f97316", "#ea580c", "#eab308"] },
    bewertung: { sterne: 4.8, anzahl: 211 },
    vertrauen: "Alle Marken seit 2001",
    bild: { hero: "/beispiele/kfz.jpg", einblick: "/beispiele/kfz-einblick.jpg" },
    funktion: { art: "termin", titel: "Pickerl & Service online buchen", text: "Leistung wählen, Tag und Uhrzeit wählen – Ihr Auto kommt sofort dran.", hinweis: "Kostenvoranschlag vor jeder Reparatur." },
  },
};

const BETRIEBE = Object.fromEntries(
  (Object.keys(BASIS) as BrancheId[]).map((k) => {
    const e = EXTRA[k];
    const zahlen = BASIS[k].zahlen.map((z) => (z.text.includes("Sterne") ? { ...z, zahl: e.bewertung.sterne } : z));
    return [k, { ...BASIS[k], ...e, zahlen }];
  }),
) as Record<BrancheId, Betrieb>;

/** Der Friseursalon bleibt das Standard-Beispiel. */
export const SALON = BETRIEBE.friseur;

export function istBranche(wert: unknown): wert is BrancheId {
  return typeof wert === "string" && (BRANCHEN as readonly string[]).includes(wert);
}

/** Name aus der Adresszeile: nur Buchstaben, Ziffern und übliche Zeichen, max. 40 Zeichen */
export function bereinigterName(wert: unknown) {
  if (typeof wert !== "string") return "";
  return wert
    .replace(/[^\p{L}\p{N} &.,'’\-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

/** Betrieb für die Beispielseite – mit Branche und Namen aus der Vorschau auf der Startseite */
export function betriebFuer(branche: unknown, name?: unknown): Betrieb {
  const b = BETRIEBE[istBranche(branche) ? branche : "friseur"];
  const eigener = bereinigterName(name);
  if (!eigener) return b;
  const woerter = eigener.split(" ");
  const marke = (woerter.find((w) => w.length > 2 && !/^(salon|café|cafe|tischlerei|barbershop|friseur|imbiss|schneiderei|kfz|nails|by)$/i.test(w)) ?? woerter[0]).toUpperCase();
  return { ...b, name: eigener, marke: marke.slice(0, 14) };
}

type Suchparameter = Promise<Record<string, string | string[] | undefined>>;

export async function betriebAusSuche(sp: Suchparameter) {
  const s = await sp;
  const erstes = (w: string | string[] | undefined) => (Array.isArray(w) ? w[0] : w);
  return betriebFuer(erstes(s.branche), erstes(s.name));
}

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
    text: "Eigenes Design mit Animationen, Online-Buchung und einem KI-Assistenten, der Fragen Ihrer Kunden beantwortet.",
    paket: "premium",
  },
};

export const euroGanz = (n: number) => `${n.toLocaleString("de-AT")} €`;

/** „ab 52 €“ – bei 0 „kostenlos“ */
export const abPreis = (n: number) => (n === 0 ? "kostenlos" : `ab ${euroGanz(n)}`);
