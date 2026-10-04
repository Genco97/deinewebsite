/**
 * Alle Firmendaten an einer Stelle. `null` = noch nicht bekannt → wird auf der Seite
 * als gelb markierter Platzhalter angezeigt (siehe <Angabe>).
 */
export const FIRMA = {
  name: "Ursprung",
  /** z. B. "e.U.", "OG", "GmbH" */
  rechtsform: null as string | null,
  /** Bei e.U.: Vor- und Nachname der Inhaberin/des Inhabers; bei OG/GmbH: Gesellschafter bzw. Geschäftsführung */
  vertretung: null as string | null,
  strasse: null as string | null,
  plz: null as string | null,
  ort: "Wien",
  land: "Österreich",
  telefon: null as string | null,
  email: null as string | null,
  uid: null as string | null,
  /** nur wenn im Firmenbuch eingetragen (e.U., OG, GmbH …) */
  firmenbuchnummer: null as string | null,
  firmenbuchgericht: null as string | null,
  /** Wortlaut laut Gewerbeschein */
  gewerbe: null as string | null,
  /** z. B. „Magistratisches Bezirksamt für den 7. Bezirk“ */
  gewerbebehoerde: null as string | null,
  kammer: "Wirtschaftskammer Wien",
  /** true = Kleinunternehmer (keine USt.), false = Preise mit USt., null = noch offen */
  kleinunternehmer: null as boolean | null,
  /** Hosting & Wartung pro Monat bei Basic und Business (inkl. Domain) */
  hostingProMonat: "19 €" as string | null,
  /** Hosting & Wartung pro Monat bei Pro (inkl. Buchungssystem) */
  hostingProMonatPro: "39 €" as string | null,
};

export function firmenname() {
  return FIRMA.rechtsform ? `${FIRMA.name} ${FIRMA.rechtsform}` : FIRMA.name;
}

/** Hinweis zur Umsatzsteuer bei Preisen */
export function preisHinweis(): string | null {
  if (FIRMA.kleinunternehmer === true) return "keine USt. (Kleinunternehmer)";
  if (FIRMA.kleinunternehmer === false) return "zzgl. 20 % USt.";
  return null;
}
