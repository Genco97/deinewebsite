import "server-only";
import { GRUPPEN, type Fund } from "@/lib/leadfinder-gruppen";

/** Nominatim und Overpass verlangen eine erkennbare Kennung */
const KENNUNG = "UrsprungCRM/1.0 (Lead Finder)";

const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
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

/** Gebiet zu einem Ortsnamen (Stadt, Bezirk, Gemeinde) in AT, DE, CH oder LI */
export async function gebietSuchen(ort: string): Promise<{ areaId: number; name: string } | null> {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=at,de,ch,li&q=" + encodeURIComponent(ort);
  const r = await fetch(url, {
    headers: { "User-Agent": KENNUNG, "Accept-Language": "de" },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Nominatim ${r.status}`);
  const liste = (await r.json()) as { osm_type?: string; osm_id?: number; display_name?: string }[];
  const rel = liste.find((x) => x.osm_type === "relation" && typeof x.osm_id === "number");
  if (!rel || typeof rel.osm_id !== "number") return null;
  return { areaId: 3_600_000_000 + rel.osm_id, name: rel.display_name ?? ort };
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
  return `[out:json][timeout:45];area(${areaId})->.a;(${teile.join("")});out center tags ${MAX_FUNDE};`;
}

async function overpass(q: string): Promise<OsmElement[]> {
  let fehler: unknown = new Error("Overpass nicht erreichbar");
  for (const ep of OVERPASS) {
    try {
      const r = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": KENNUNG },
        body: "data=" + encodeURIComponent(q),
        signal: AbortSignal.timeout(50_000),
        cache: "no-store",
      });
      if (r.ok) return ((await r.json()) as { elements?: OsmElement[] }).elements ?? [];
      fehler = new Error(`Overpass ${r.status}`);
    } catch (e) {
      fehler = e;
    }
  }
  throw fehler;
}

/** Betriebe ohne Website-Eintrag in OSM – noch ohne Abgleich mit dem CRM */
export async function funde(areaId: number, gruppen: string[]): Promise<{ liste: Fund[]; limit: boolean }> {
  const elemente = await overpass(abfrage(areaId, gruppen));
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

/* Gleiche Normalisierung wie in der Datenbank (tel_norm / firma_norm) */
export function telNorm(t: string | null | undefined) {
  const d = (t ?? "").replace(/\D/g, "");
  const n = d.startsWith("0043") ? "0" + d.slice(4) : d.startsWith("43") && d.length >= 10 ? "0" + d.slice(2) : d;
  return n.length >= 6 ? n : null;
}

export function firmaNorm(f: string | null | undefined) {
  const s = (f ?? "")
    .toLowerCase()
    .replace(/(^|[^a-zäöüß0-9])(e\.?\s?u\.?|og|kg|gmbh|gesmbh|co)(?![a-zäöüß0-9])/g, " ")
    .replace(/[^a-z0-9äöüß]+/g, " ")
    .trim();
  return s || null;
}
