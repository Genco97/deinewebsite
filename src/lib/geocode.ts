import "server-only";

// Adresse → Koordinaten über OpenStreetMap Nominatim.
// Nutzungsregeln: höchstens 1 Anfrage pro Sekunde, eindeutiger User-Agent.
// https://operations.osmfoundation.org/policies/nominatim/

const BASIS = process.env.NOMINATIM_URL ?? "https://nominatim.openstreetmap.org";
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://deinewebsite-woad.vercel.app").replace(/\/$/, "");

type Adresse = { adresse: string | null; bezirk: string | null };

/** „Nordbahnstraße 34/4“ → „Nordbahnstraße 34“, „Engerthstraße 241–247“ → „Engerthstraße 241“ */
function strasse(a: string) {
  return a
    .replace(/\s*\/.*$/, "")
    .replace(/(\d+[a-z]?)\s*[–-]\s*\d+[a-z]?/i, "$1")
    .trim();
}

/** „1020 Wien“, „2340 Mödling“ oder nur „1070“ → PLZ und Ort */
function plzOrt(bezirk: string | null) {
  const b = (bezirk ?? "").trim();
  const plz = /\b(\d{4})\b/.exec(b)?.[1] ?? null;
  let ort = b.replace(/\b\d{4}\b/, "").replace(/[,.-]/g, " ").trim() || null;
  if (!ort && plz?.startsWith("1")) ort = "Wien";
  return { plz, ort };
}

async function frage(params: Record<string, string>) {
  const url = new URL("/search", BASIS);
  for (const [k, v] of Object.entries({ ...params, format: "jsonv2", limit: "1", countrycodes: "at" })) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: { "User-Agent": `Ursprung-CRM/1.0 (+${SITE})`, "Accept-Language": "de" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const daten = (await res.json()) as { lat: string; lon: string }[];
  const t = daten[0];
  if (!t) return null;
  const lat = Number(t.lat);
  const lng = Number(t.lon);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

export const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Liefert Koordinaten oder null (nicht gefunden). Wirft bei Netzwerk-/Serverfehlern. */
export async function geocode(l: Adresse) {
  if (!l.adresse) return null;
  const { plz, ort } = plzOrt(l.bezirk);
  const genau = await frage({
    street: strasse(l.adresse),
    ...(plz ? { postalcode: plz } : {}),
    ...(ort ? { city: ort } : {}),
  });
  if (genau) return genau;
  await pause(1100);
  return frage({ q: [l.adresse, l.bezirk, "Österreich"].filter(Boolean).join(", ") });
}
