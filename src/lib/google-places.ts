import "server-only";
import type { Fund, Pruefstatus } from "@/lib/leadfinder-gruppen";

export type Pruefung = { key: string; status: Pruefstatus; website?: string; telefon?: string };

/** Fehler, bei dem die ganze Prüfung abgebrochen werden soll (Schlüssel, Limit …) */
export class GoogleFehler extends Error {
  constructor(
    message: string,
    readonly stopp: boolean,
  ) {
    super(message);
  }
}

type Platz = {
  displayName?: { text?: string };
  location?: { latitude: number; longitude: number };
  websiteUri?: string;
  nationalPhoneNumber?: string;
  businessStatus?: string;
};

/** Kleinbuchstaben, ohne Rechtsform und Sonderzeichen – zum Vergleichen von Namen */
function norm(t: string) {
  return t
    .toLowerCase()
    .replace(/\b(e\.?\s?u\.?|og|kg|gmbh|gesmbh|co|und|&)\b/g, " ")
    .replace(/[^a-z0-9äöüß]+/g, "");
}

function meter(a: { lat: number; lng: number }, b: { latitude: number; longitude: number }) {
  const r = 6_371_000;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.latitude - a.lat);
  const dLng = rad(b.longitude - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

/** Ist das Google-Ergebnis derselbe Betrieb wie der OSM-Treffer? Name ähnlich UND in der Nähe (oder fast exakt am Ort). */
function gleicherBetrieb(f: Pick<Fund, "firma" | "lat" | "lng">, p: Platz) {
  const a = norm(f.firma);
  const b = norm(p.displayName?.text ?? "");
  if (!a || !b) return false;
  const nameAehnlich = a === b || (Math.min(a.length, b.length) >= 4 && (a.includes(b) || b.includes(a)));
  if (f.lat === null || f.lng === null || !p.location) return nameAehnlich;
  const d = meter({ lat: f.lat, lng: f.lng }, p.location);
  return (nameAehnlich && d <= 300) || (d <= 25 && (a.slice(0, 4) === b.slice(0, 4)));
}

/** Fragt Google Places (New) nach einem Betrieb und liest daraus, ob er eine Website hat. */
export async function pruefeBetrieb(f: Pick<Fund, "key" | "firma" | "adresse" | "bezirk" | "lat" | "lng">, apiKey: string): Promise<Pruefung> {
  const body: Record<string, unknown> = {
    textQuery: [f.firma, f.adresse, f.bezirk].filter(Boolean).join(", "),
    languageCode: "de",
    regionCode: "AT",
    maxResultCount: 3,
  };
  if (f.lat !== null && f.lng !== null) {
    body.locationBias = { circle: { center: { latitude: f.lat, longitude: f.lng }, radius: 300 } };
  }
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      // websiteUri und nationalPhoneNumber gehören zur „Enterprise“-Stufe von Text Search
      "X-Goog-FieldMask": "places.displayName,places.location,places.websiteUri,places.nationalPhoneNumber,places.businessStatus",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  if (!r.ok) {
    if (r.status === 400 || r.status === 401 || r.status === 403) {
      throw new GoogleFehler(`Google lehnt den Schlüssel ab (${r.status}). Prüf, ob „Places API (New)“ aktiviert ist und die Abrechnung läuft.`, true);
    }
    if (r.status === 429) throw new GoogleFehler("Google-Limit erreicht (429).", true);
    throw new GoogleFehler(`Google antwortet mit ${r.status}.`, false);
  }
  const j = (await r.json()) as { places?: Platz[] };
  const treffer = (j.places ?? []).find((p) => gleicherBetrieb(f, p));
  if (!treffer) return { key: f.key, status: "unklar" };
  if (treffer.businessStatus === "CLOSED_PERMANENTLY") return { key: f.key, status: "geschlossen" };
  const telefon = treffer.nationalPhoneNumber?.trim() || undefined;
  if (treffer.websiteUri) return { key: f.key, status: "hat", website: treffer.websiteUri, telefon };
  return { key: f.key, status: "keine", telefon };
}
