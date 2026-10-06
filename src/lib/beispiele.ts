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
};

const ZEITEN_STANDARD = [
  { tage: "Montag", zeit: "geschlossen" },
  { tage: "Dienstag – Freitag", zeit: "9:00 – 18:30" },
  { tage: "Samstag", zeit: "8:30 – 14:00" },
  { tage: "Sonntag", zeit: "geschlossen" },
];

export const BRANCHEN = ["friseur", "barber", "imbiss", "cafe", "handwerk"] as const;
export type BrancheId = (typeof BRANCHEN)[number];

export const BRANCHE_INFO: Record<BrancheId, { label: string; symbol: string }> = {
  friseur: { label: "Friseur", symbol: "✂" },
  barber: { label: "Barbershop", symbol: "💈" },
  imbiss: { label: "Imbiss & Kebap", symbol: "🥙" },
  cafe: { label: "Café", symbol: "☕" },
  handwerk: { label: "Handwerk", symbol: "🔨" },
};

const BETRIEBE: Record<BrancheId, Betrieb> = {
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
};

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
  const marke = (woerter.find((w) => w.length > 2 && !/^(salon|café|cafe|tischlerei|barbershop|friseur|imbiss)$/i.test(w)) ?? woerter[0]).toUpperCase();
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
