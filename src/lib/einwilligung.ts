/**
 * Einwilligung zu Anruf und E-Mail (§ 174 TKG 2021).
 * Ohne Einwilligung dürfen Betriebe nicht zu Werbezwecken angerufen oder angemailt werden –
 * auch Firmen nicht. Erlaubt sind dann nur ein persönlicher Besuch oder ein Brief.
 */
export const EINWILLIGUNG_ARTEN = [
  "Persönlich beim Besuch",
  "Kunde hat selbst angerufen",
  "Per E-Mail oder Brief",
  "Website-Formular",
] as const;

export function istEinwilligungArt(v: string): v is (typeof EINWILLIGUNG_ARTEN)[number] {
  return (EINWILLIGUNG_ARTEN as readonly string[]).includes(v);
}

/** Text auf der Website – wird so auch im CRM festgehalten. */
export const EINWILLIGUNG_TEXT =
  "Sie dürfen mich zu meiner Anfrage und zu Ihren Angeboten telefonisch und per E-Mail kontaktieren. Diese Einwilligung kann ich jederzeit widerrufen.";
