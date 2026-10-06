// Gesprächshilfe fürs Telefonat und den Besuch – kurze, ehrliche Sätze, keine Druck-Tricks.

/** Ein Satz, der zur Branche passt: warum gerade dieser Betrieb eine Website braucht */
const BRANCHEN_SATZ: { muster: RegExp; satz: string }[] = [
  { muster: /friseur|frisör|salon|barber|haar/i, satz: "Viele suchen heute am Handy nach „Friseur in der Nähe“ – und buchen dort, wo sie Preise und freie Termine sehen." },
  { muster: /kebap|kebab|döner|imbiss|pizza|restaurant|gastro|lokal|grill/i, satz: "Hungrige Gäste schauen zuerst am Handy, was es gibt und ob offen ist – ohne Lieferando-Provision für Sie." },
  { muster: /caf[eé]|konditor|bäck|baeck/i, satz: "Wer ein Café sucht, will Fotos, Öffnungszeiten und die Karte sehen, bevor er vorbeikommt." },
  { muster: /tischler|install|elektr|maler|bau|dach|handwerk|schlosser|fliesen/i, satz: "Bevor jemand einen Handwerker anruft, schaut er sich fast immer zuerst die Website und Referenzen an." },
  { muster: /kosmetik|nagel|nail|massage|beauty|studio/i, satz: "Neue Kundinnen wollen vorher Bilder und Preise sehen – und am liebsten gleich online einen Termin." },
];

export function branchenSatz(branche: string | null) {
  return BRANCHEN_SATZ.find((b) => b.muster.test(branche ?? ""))?.satz ?? "Die meisten neuen Kunden schauen heute zuerst am Handy nach – und gehen dorthin, wo sie gleich alles Wichtige finden.";
}

export function einstieg(o: { meinName: string; ansprechpartner: string | null; firma: string }) {
  const anrede = o.ansprechpartner ? `Grüß Gott, spreche ich mit ${o.ansprechpartner}?` : `Grüß Gott, spreche ich mit der Inhaberin oder dem Inhaber von ${o.firma}?`;
  return [
    anrede,
    `Mein Name ist ${o.meinName} von Ursprung aus Wien. Wir machen Websites für Betriebe wie Ihren.`,
    "Ich mach's kurz: Wir bauen Ihnen kostenlos eine Demo-Website. Wenn sie Ihnen gefällt, zahlen Sie einen Fixpreis – wenn nicht, zahlen Sie nichts.",
    "Darf ich Ihnen so eine Demo schicken?",
  ];
}

export const EINWAENDE: { einwand: string; antwort: string }[] = [
  {
    einwand: "Zu teuer",
    antwort: "Verstehe ich. Deshalb sehen Sie die Seite zuerst – kostenlos. Erst wenn sie Ihnen gefällt, reden wir übers Geld. Basic kostet einmalig 500 €, ohne Abo.",
  },
  {
    einwand: "Keine Zeit",
    antwort: "Genau deshalb machen wir fast alles. Sie schicken uns ein paar Fotos und Öffnungszeiten, den Rest übernehmen wir. Darf ich Sie in einer ruhigeren Minute nochmal anrufen?",
  },
  {
    einwand: "Brauch ich nicht",
    antwort: "Das hören wir oft – bis jemand nach Ihnen sucht und Sie nicht findet. Schauen Sie sich die Demo einfach an, das kostet nichts und verpflichtet zu nichts.",
  },
  {
    einwand: "Hab schon Instagram / Facebook",
    antwort: "Super, das bleibt auch so. Die Website verlinkt darauf. Aber bei Google erscheint man mit einer eigenen Seite viel besser – und sie gehört ganz Ihnen.",
  },
  {
    einwand: "Schicken Sie mir was per E-Mail",
    antwort: "Mach ich gern. Damit es zu Ihnen passt: Was ist Ihnen bei einer Website am wichtigsten – Anrufe, Termine oder dass man Sie bei Google findet?",
  },
  {
    einwand: "Muss ich mir überlegen",
    antwort: "Klar. Wann passt es Ihnen, dass ich mich nochmal melde? Dann trage ich mir das gleich ein.",
  },
];

export const ABSCHLUSS = [
  "Frag nach der E-Mail-Adresse für den Demo-Link.",
  "Mach einen fixen Termin für den Rückruf aus.",
  "Will die Person keine Anrufe mehr: Status „Nicht anrufen“ setzen.",
];
