import { GRUPPEN, type Fund } from "@/lib/leadfinder-gruppen";

const OVERPASS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];
export const MAX_FUNDE = 800;

const DE: Record<string, string> = {
  hairdresser: "Friseur",
  beauty: "Kosmetik",
  nail_salon: "Nagelstudio",
  massage: "Massage",
  tattoo: "Tattoo",
  restaurant: "Restaurant",
  cafe: "Café",
  bar: "Bar",
  pub: "Pub",
  fast_food: "Imbiss",
  ice_cream: "Eissalon",
  biergarten: "Biergarten",
  electronics_repair: "Reparatur",
  locksmith: "Schlüsseldienst",
  clothes: "Mode",
  shoes: "Schuhe",
  florist: "Blumen",
  bakery: "Bäckerei",
  butcher: "Fleischerei",
  gift: "Geschenke",
  jewelry: "Schmuck",
  books: "Buchhandlung",
  bicycle: "Fahrrad",
  furniture: "Möbel",
  kiosk: "Kiosk",
  tailor: "Schneiderei",
  optician: "Optiker",
  pet: "Tierbedarf",
  toys: "Spielwaren",
  variety_store: "Gemischtwaren",
  convenience: "Nahversorger",
  second_hand: "Second Hand",
  antiques: "Antiquitäten",
  art: "Kunst",
  interior_decoration: "Einrichtung",
  car_repair: "KFZ-Werkstatt",
  car: "Autohandel",
  car_parts: "Autoteile",
  tyres: "Reifen",
  motorcycle: "Motorrad",
  car_wash: "Autowäsche",
  driving_school: "Fahrschule",
  dentist: "Zahnarzt",
  doctors: "Arzt",
  veterinary: "Tierarzt",
  physiotherapist: "Physiotherapie",
  fitness_centre: "Fitnessstudio",
  sports_centre: "Sportzentrum",
  lawyer: "Rechtsanwalt",
  accountant: "Buchhaltung",
  tax_advisor: "Steuerberater",
  insurance: "Versicherung",
  estate_agent: "Immobilien",
  consulting: "Beratung",
  company: "Firma",
  laundry: "Wäscherei",
  dry_cleaning: "Reinigung",
  travel_agency: "Reisebüro",
  copyshop: "Copyshop",
  carpenter: "Tischler",
  electrician: "Elektriker",
  plumber: "Installateur",
  painter: "Maler",
  roofer: "Dachdecker",
  gardener: "Gärtner",
};

function branchenName(t: Record<string, string>) {
  const roh = t.shop || t.amenity || t.craft || t.office || t.healthcare || t.leisure || "";
  return DE[roh] ?? roh.replace(/_/g, " ");
}

/** Fehler mit einer Meldung, die man im CRM anzeigen kann */
export class SuchFehler extends Error {}

function grund(e: unknown): string {
  if (e instanceof SuchFehler) return e.message;
  if (e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")) return "Zeitüberschreitung";
  // Browser („Load failed“, „Failed to fetch“) und Node („fetch failed“): keine Antwort bekommen
  if (e instanceof TypeError) return "keine Verbindung";
  return e instanceof Error ? e.message : String(e);
}

type Gebiet = { areaId: number; name: string };

async function nominatim(ort: string): Promise<Gebiet | null> {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=at,de,ch,li&q=" + encodeURIComponent(ort);
  const r = await fetch(url, {
    headers: { "Accept-Language": "de" },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!r.ok) throw new SuchFehler(`Nominatim ${r.status}`);
  const liste = (await r.json()) as { osm_type?: string; osm_id?: number; display_name?: string }[];
  const rel = liste.find((x) => x.osm_type === "relation" && typeof x.osm_id === "number");
  if (!rel || typeof rel.osm_id !== "number") return null;
  return { areaId: 3_600_000_000 + rel.osm_id, name: rel.display_name ?? ort };
}

/** Ersatz, falls Nominatim Anfragen vom Server ablehnt */
async function photon(ort: string): Promise<Gebiet | null> {
  const url = "https://photon.komoot.io/api/?limit=10&lang=de&q=" + encodeURIComponent(ort);
  const r = await fetch(url, { signal: AbortSignal.timeout(10_000), cache: "no-store" });
  if (!r.ok) throw new SuchFehler(`Photon ${r.status}`);
  const j = (await r.json()) as {
    features?: { properties?: { osm_type?: string; osm_id?: number; name?: string; countrycode?: string; state?: string; country?: string } }[];
  };
  const p = (j.features ?? [])
    .map((f) => f.properties ?? {})
    .find((x) => x.osm_type === "R" && typeof x.osm_id === "number" && ["AT", "DE", "CH", "LI"].includes((x.countrycode ?? "").toUpperCase()));
  if (!p || typeof p.osm_id !== "number") return null;
  return { areaId: 3_600_000_000 + p.osm_id, name: [p.name, p.state, p.country].filter(Boolean).join(", ") || ort };
}

/** Gebiet zu einem Ortsnamen (Stadt, Bezirk, Gemeinde) in AT, DE, CH oder LI */
export async function gebietSuchen(ort: string): Promise<Gebiet | null> {
  const fehler: string[] = [];
  for (const quelle of [nominatim, photon]) {
    try {
      const g = await quelle(ort);
      if (g) return g;
    } catch (e) {
      fehler.push(grund(e));
      console.error("[leadfinder] Ortssuche", quelle.name, e);
    }
  }
  if (fehler.length === 2) throw new SuchFehler(`Ortssuche nicht erreichbar (${fehler.join(", ")})`);
  return null;
}

type OsmElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function abfrage(areaId: number, gruppen: string[]) {
  const filter = '[!"website"][!"contact:website"][!"url"][!"contact:url"]["name"]';
  const teile = gruppen.flatMap((g) => (GRUPPEN[g] ?? []).map((sel) => `nwr${sel}${filter}(area.a);`));
  return `[out:json][timeout:25];area(${areaId})->.a;(${teile.join("")});out center tags ${MAX_FUNDE};`;
}

async function overpass(q: string, headers: Record<string, string>, budgetMs: number): Promise<OsmElement[]> {
  const fehler: string[] = [];
  const ende = Date.now() + budgetMs;
  for (const ep of OVERPASS) {
    const rest = ende - Date.now();
    if (rest < 5_000) break;
    const host = new URL(ep).host;
    try {
      const r = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
        body: "data=" + encodeURIComponent(q),
        signal: AbortSignal.timeout(Math.min(20_000, rest)),
        cache: "no-store",
      });
      if (!r.ok) {
        fehler.push(`${host} ${r.status}`);
        continue;
      }
      const j = (await r.json()) as { elements?: OsmElement[]; remark?: string };
      // Overpass meldet eine Zeitüberschreitung manchmal mit Status 200 und einem Hinweis
      if (j.remark && /timed out|out of memory/i.test(j.remark) && !(j.elements ?? []).length) {
        fehler.push(`${host} Zeitüberschreitung`);
        continue;
      }
      return j.elements ?? [];
    } catch (e) {
      fehler.push(`${host} ${grund(e)}`);
    }
  }
  console.error("[leadfinder] Overpass", fehler);
  throw new SuchFehler(`OpenStreetMap nicht erreichbar (${fehler.join(", ") || "Zeitlimit"})`);
}

/** Betriebe ohne Website-Eintrag in OSM – noch ohne Abgleich mit dem CRM */
export async function funde(
  areaId: number,
  gruppen: string[],
  opts: { headers?: Record<string, string>; budgetMs?: number } = {},
): Promise<{ liste: Fund[]; limit: boolean }> {
  const elemente = await overpass(abfrage(areaId, gruppen), opts.headers ?? {}, opts.budgetMs ?? 30_000);
  const liste = elemente
    .filter((e) => e.tags?.name)
    .map((e): Fund => {
      const t = e.tags ?? {};
      const strasse = [t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(" ");
      const ort = [t["addr:postcode"], t["addr:city"]].filter(Boolean).join(" ");
      const tel = (t.phone || t["contact:phone"] || t["contact:mobile"] || "").split(";")[0].trim();
      return {
        key: `${e.type}/${e.id}`,
        firma: t.name.trim().slice(0, 200),
        branche: branchenName(t),
        telefon: tel.slice(0, 50),
        email: (t.email || t["contact:email"] || "").split(";")[0].trim().slice(0, 200),
        adresse: strasse.slice(0, 200),
        bezirk: ort.slice(0, 100),
        social: !!(t["contact:facebook"] || t.facebook || t["contact:instagram"] || t.instagram),
        lat: e.lat ?? e.center?.lat ?? null,
        lng: e.lon ?? e.center?.lon ?? null,
        osm: `https://www.openstreetmap.org/${e.type}/${e.id}`,
        vorhanden: false,
      };
    });
  return { liste, limit: elemente.length >= MAX_FUNDE };
}
