/**
 * CSV-Zeilen → Leads. Erkennt Spalten über die Kopfzeile (mit gängigen Alternativnamen).
 * Alle übrigen Spalten (z. B. Öffnungszeiten, Quelle) landen als Notiz beim Lead.
 * Ohne Kopfzeile gilt die feste Reihenfolge: firma; branche; telefon; adresse; bezirk.
 */
export type ImportZeile = {
  firma: string;
  ansprechpartner: string;
  branche: string;
  telefon: string;
  email: string;
  adresse: string;
  bezirk: string;
  notiz: string;
};

const ALIAS: Record<string, string[]> = {
  firma: ["firma", "firmenname", "unternehmen", "betrieb", "name"],
  ansprechpartner: ["ansprechpartner", "ansprechperson", "inhaber", "inhaber/in", "inhaberin", "kontaktperson"],
  branche: ["branche", "kategorie"],
  telefon: ["telefon", "tel", "tel.", "telefonnummer", "handy", "mobil"],
  email: ["email", "e-mail", "mail"],
  adresse: ["adresse", "straße", "strasse", "anschrift"],
  plz: ["plz", "postleitzahl"],
  ort: ["ort", "stadt"],
  bezirk: ["bezirk"],
};
const IGNORIEREN = ["nr", "nr.", "#"];
const LEER = ["nicht gefunden", "-", "–", "k. a.", "k.a.", "n/a"];

const norm = (k: string) => k.trim().toLowerCase();
const wert = (v: string | undefined) => {
  const s = (v ?? "").trim();
  return LEER.includes(s.toLowerCase()) ? "" : s;
};

export function csvZuLeads(roh: string[][]): ImportZeile[] {
  if (roh.length === 0) return [];
  const kopf = roh[0].map(norm);
  const hatKopf = ALIAS.firma.some((a) => kopf.includes(a));

  if (!hatKopf) {
    return roh.map((z) => ({
      firma: wert(z[0]),
      ansprechpartner: "",
      branche: wert(z[1]),
      telefon: wert(z[2]),
      email: "",
      adresse: wert(z[3]),
      bezirk: wert(z[4]),
      notiz: "",
    }));
  }

  const index: Record<string, number> = {};
  for (const [feld, namen] of Object.entries(ALIAS)) index[feld] = kopf.findIndex((k) => namen.includes(k));
  const benutzt = new Set(Object.values(index).filter((i) => i >= 0));
  const rest = kopf
    .map((k, i) => ({ k: roh[0][i].trim(), i }))
    .filter(({ k, i }) => !benutzt.has(i) && k && !IGNORIEREN.includes(norm(k)));

  return roh.slice(1).map((z) => {
    const f = (feld: string) => (index[feld] >= 0 ? wert(z[index[feld]]) : "");
    const plzOrt = [f("plz"), f("ort")].filter(Boolean).join(" ");
    const notiz = [
      // Ist PLZ + Ort angegeben, wird der Bezirk zur Zusatzinfo
      plzOrt && f("bezirk") ? `Bezirk: ${f("bezirk")}` : "",
      ...rest.map(({ k, i }) => (wert(z[i]) ? `${k}: ${wert(z[i])}` : "")),
    ]
      .filter(Boolean)
      .join("\n");
    return {
      firma: f("firma"),
      ansprechpartner: f("ansprechpartner"),
      branche: f("branche"),
      telefon: f("telefon"),
      email: f("email"),
      adresse: f("adresse"),
      bezirk: plzOrt || f("bezirk"),
      notiz,
    };
  });
}
