import "server-only";
import QRCode from "qrcode";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Kurze Adresse für die Karte, z. B. „ursprung.at/k“ */
export function karteBasis() {
  return `${SITE.replace(/^https?:\/\//, "")}/k`;
}

export function karteLink(code: string) {
  return `${SITE}/k/${code}`;
}

/** „AB2CD3EF“ → „AB2C-D3EF“ (leichter abzutippen) */
export function codeLesbar(code: string) {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/** QR-Code als SVG-Text (ohne Rand, mittlere Fehlerkorrektur – übersteht kleine Knicke). */
export async function qrSvg(text: string) {
  return QRCode.toString(text, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#16243A", light: "#0000" } });
}

/**
 * Empfänger-Adresse aus den Lead-Feldern.
 * „bezirk“ kommt in verschiedenen Formen vor: „1210 Wien“, „1210 21. Floridsdorf“, „2340 Mödling“.
 */
export function empfaengerZeilen(l: { firma: string; ansprechpartner: string | null; adresse: string | null; bezirk: string | null }) {
  const plz = l.bezirk?.match(/\b\d{4}\b/)?.[0] ?? null;
  const ortRoh = (l.bezirk ?? "").replace(/\b\d{4}\b/, "").trim();
  const ort = plz?.startsWith("1") ? "Wien" : ortRoh || null;
  return [l.firma, l.ansprechpartner ? `z. H. ${l.ansprechpartner}` : null, l.adresse, [plz, ort].filter(Boolean).join(" ") || null].filter(
    (z): z is string => !!z,
  );
}
