import { GRUPPEN, type Fund } from "@/lib/leadfinder-gruppen";

const OVERPASS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://z.overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
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

/** Kartenausschnitt: Süd, West, Nord, Ost */
export type Bbox = [number, number, number, number];
type Gebiet = { areaId: number; name: string; bbox?: Bbox };

function bboxVon(v: unknown): Bbox | undefined {
  if (!Array.isArray(v) || v.length !== 4) return undefined;
  const z = v.map(Number);
  return z.every(Number.isFinite) ? (z as Bbox) : undefined;
}

async function nominatim(ort: string): Promise<Gebiet | null> {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=at,de,ch,li&q=" + encodeURIComponent(ort);
  const r = await fetch(url, {
    headers: { "Accept-Language": "de" },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!r.ok) throw new SuchFehler(`Nominatim ${r.status}`);
  const liste = (await r.json()) as { osm_type?: string; osm_id?: number; display_name?: string; boundingbox?: string[] }[];
  const rel = liste.find((x) => x.osm_type === "relation" && typeof x.osm_id === "number");
  if (!rel || typeof rel.osm_id !== "number") return null;
  // Nominatim: [Süd, Nord, West, Ost]
  const bb = rel.boundingbox;
  return { areaId: 3_600_000_000 + rel.osm_id, name: rel.display_name ?? ort, bbox: bb ? bboxVon([bb[0], bb[2], bb[1], bb[3]]) : undefined };
}

/** Ersatz, falls Nominatim Anfragen vom Server ablehnt */
async function photon(ort: string): Promise<Gebiet | null> {
  const url = "https://photon.komoot.io/api/?limit=10&lang=de&q=" + encodeURIComponent(ort);
  const r = await fetch(url, { signal: AbortSignal.timeout(10_000), cache: "no-store" });
  if (!r.ok) throw new SuchFehler(`Photon ${r.status}`);
  const j = (await r.json()) as {
    features?: { properties?: { osm_type?: string; osm_id?: number; name?: string; countrycode?: string; state?: string; country?: string; extent?: number[] } }[];
  };
  const p = (j.features ?? [])
    .map((f) => f.properties ?? {})
    .find((x) => x.osm_type === "R" && typeof x.osm_id === "number" && ["AT", "DE", "CH", "LI"].includes((x.countrycode ?? "").toUpperCase()));
  if (!p || typeof p.osm_id !== "number") return null;
  // Photon: [West, Nord, Ost, Süd]
  const ex = p.extent;
  return {
    areaId: 3_600_000_000 + p.osm_id,
    name: [p.name, p.state, p.country].filter(Boolean).join(", ") || ort,
    bbox: ex && ex.length === 4 ? bboxVon([ex[3], ex[0], ex[1], ex[2]]) : undefined,
  };
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

/** Kopf und Ortsfilter der Abfrage: über das Gebiet (area) oder über den Kartenausschnitt */
function ortsfilter(areaId: number, bbox?: Bbox) {
  return bbox ? { kopf: "", filter: `(${bbox.join(",")})` } : { kopf: `area(${areaId})->.a;`, filter: "(area.a)" };
}

function abfrage(areaId: number, gruppen: string[], bbox?: Bbox) {
  const o = ortsfilter(areaId, bbox);
  const filter = '[!"website"][!"contact:website"][!"url"][!"contact:url"]["name"]';
  const teile = gruppen.flatMap((g) => (GRUPPEN[g] ?? []).map((sel) => `nwr${sel}${filter}${o.filter};`));
  return `[out:json][timeout:25];${o.kopf}(${teile.join("")});out center tags ${MAX_FUNDE};`;
}

/** Merkt sich während einer Suche, welche Server versagen und welcher gut antwortet */
type Zustand = { schlecht: Set<string>; gut?: string };

/**
 * Fragt die Overpass-Server nacheinander. Eine leere Liste glaubt sie nicht sofort (manche Server
 * liefern bei Überlast oder ohne Gebietsindex leer statt Fehler) – erst wenn kein Server etwas findet, gilt „leer“.
 */
type Antwort =
  | { art: "ok"; host: string; elemente: OsmElement[] }
  | { art: "leer"; host: string }
  | { art: "fehler"; host: string; text: string };

/** Eine Anfrage an einen Server; bricht ab, wenn `alle` abgebrochen wird oder die Zeit um ist */
async function versuch(
  ep: string,
  q: string,
  headers: Record<string, string>,
  ende: number,
  leerPruefen: boolean,
  alle: AbortController,
): Promise<Antwort> {
  const host = new URL(ep).host;
  const ctl = new AbortController();
  const stopp = () => ctl.abort();
  alle.signal.addEventListener("abort", stopp);
  const timer = setTimeout(stopp, Math.max(1_000, Math.min(20_000, ende - Date.now())));
  try {
    const r = await fetch(ep, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
      body: "data=" + encodeURIComponent(q),
      signal: ctl.signal,
      cache: "no-store",
    });
    if (!r.ok) return { art: "fehler", host, text: `${host} ${r.status}` };
    const j = (await r.json()) as { elements?: OsmElement[]; remark?: string };
    const el = j.elements ?? [];
    // Überlastete Server antworten oft mit Status 200, leerer Liste und einem Hinweis – das ist kein „0 Treffer“
    if (j.remark && !el.length && /error|busy|timed out|memory|too many/i.test(j.remark)) return { art: "fehler", host, text: `${host} überlastet` };
    if (!el.length && leerPruefen) return { art: "leer", host };
    return { art: "ok", host, elemente: el };
  } catch (e) {
    return { art: "fehler", host, text: `${host} ${grund(e)}` };
  } finally {
    clearTimeout(timer);
    alle.signal.removeEventListener("abort", stopp);
  }
}

/**
 * Fragt die Overpass-Server gestaffelt: Antwortet der erste nicht binnen 4 s, startet der nächste
 * (der erste läuft weiter) – wer zuerst brauchbar antwortet, gewinnt, die anderen werden abgebrochen.
 * Eine leere Liste glaubt sie nicht sofort (manche Server liefern bei Überlast leer statt Fehler) –
 * erst wenn kein Server etwas findet, gilt „leer“.
 */
async function overpass(
  q: string,
  headers: Record<string, string>,
  ende: number,
  leerPruefen: boolean,
  z: Zustand = { schlecht: new Set() },
  einig = 2,
): Promise<{ elemente: OsmElement[]; server: string }> {
  const fehler: string[] = [];
  let leerVon: string | null = null;
  let leerAnzahl = 0;
  // Zuletzt guten Server zuerst, schon versagende überspringen (sind alle durch, von vorn)
  let reihe = [...OVERPASS].sort((a, b) => Number(new URL(b).host === z.gut) - Number(new URL(a).host === z.gut));
  if (reihe.every((ep) => z.schlecht.has(new URL(ep).host))) z.schlecht.clear();
  reihe = reihe.filter((ep) => !z.schlecht.has(new URL(ep).host));

  const alle = new AbortController();
  const aktiv = new Set<Promise<Antwort>>();
  let naechster = 0;
  const starten = () => {
    if (naechster >= reihe.length || ende - Date.now() < 3_000) return;
    const p: Promise<Antwort> = versuch(reihe[naechster++], q, headers, ende, leerPruefen, alle).then((a) => {
      aktiv.delete(p);
      return a;
    });
    aktiv.add(p);
  };

  starten();
  try {
    while (aktiv.size > 0) {
      const warten = new Promise<null>((res) => setTimeout(() => res(null), 4_000));
      const a = await Promise.race([...aktiv, warten]);
      if (a === null) {
        starten(); // der Erste ist langsam – den Nächsten dazunehmen
        continue;
      }
      if (a.art === "ok") {
        z.gut = a.host;
        return { elemente: a.elemente, server: a.host };
      }
      if (a.art === "leer") {
        leerVon ??= a.host;
        leerAnzahl++;
        // Zwei Server sind sich einig: wirklich leer
        if (leerAnzahl >= einig) return { elemente: [], server: a.host };
      } else {
        fehler.push(a.text);
        z.schlecht.add(a.host);
      }
      starten();
    }
  } finally {
    alle.abort();
  }
  if (leerVon) {
    // Meldet nur ein einziger Server „leer“, während die anderen ausfielen, ist das keine verlässliche Antwort
    if (leerAnzahl < 2 && fehler.length > 0) {
      throw new SuchFehler(`Nur ${leerVon} hat geantwortet und meldet keine Treffer – das ist unsicher, weil die anderen Server ausfielen (${fehler.join(", ")})`);
    }
    return { elemente: [], server: leerVon };
  }
  console.error("[leadfinder] Overpass", fehler);
  throw new SuchFehler(`OpenStreetMap nicht erreichbar (${fehler.join(", ") || "Zeitlimit"})`);
}

/** Wie viele Betriebe dieser Branchen gibt es im Gebiet insgesamt (mit und ohne Website)? */
async function zaehlen(areaId: number, gruppen: string[], headers: Record<string, string>, ende: number, z: Zustand, bbox?: Bbox): Promise<number | null> {
  const o = ortsfilter(areaId, bbox);
  const teile = gruppen.flatMap((g) => (GRUPPEN[g] ?? []).map((sel) => `nwr${sel}["name"]${o.filter};`));
  try {
    const { elemente } = await overpass(`[out:json][timeout:25];${o.kopf}(${teile.join("")});out count;`, headers, ende, false, z);
    const t = elemente.find((e) => e.type === "count")?.tags?.total;
    return t !== undefined && Number.isFinite(Number(t)) ? Number(t) : null;
  } catch {
    return null;
  }
}

export type FundeErgebnis = {
  liste: Fund[];
  limit: boolean;
  /** nur bei 0 Treffern: Betriebe dieser Branchen im Gebiet insgesamt */
  gesamt?: number | null;
  /** welcher Overpass-Server geantwortet hat */
  server?: string;
  /** Treffer stammen aus dem Kartenausschnitt (kann Nachbarorte enthalten) */
  ausschnitt?: boolean;
  /** Branchen, die nicht abgefragt werden konnten (Server überlastet / Zeitlimit) */
  fehlend?: string[];
};

/** Eine kleine Abfrage pro Branche statt einer riesigen – das schaffen auch die kostenlosen Server */
async function sammeln(
  areaId: number,
  gruppen: string[],
  headers: Record<string, string>,
  ende: number,
  z: Zustand,
  bbox?: Bbox,
): Promise<{ elemente: OsmElement[]; server: string; fehlend: string[] }> {
  const alle = new Map<string, OsmElement>();
  let fehlend: string[] = [];
  let server = "";
  let ersterFehler: unknown;
  const durchgang = async (liste: string[]) => {
    const nochOffen: string[] = [];
    for (const g of liste) {
      try {
        const r = await overpass(abfrage(areaId, [g], bbox), headers, ende, true, z);
        server = r.server;
        for (const e of r.elemente) alle.set(`${e.type}/${e.id}`, e);
      } catch (e) {
        nochOffen.push(g);
        ersterFehler ??= e;
      }
    }
    return nochOffen;
  };
  fehlend = await durchgang(gruppen);
  // Gescheiterte Branchen noch einmal versuchen (Server erholen sich oft nach kurzer Zeit)
  if (fehlend.length > 0 && fehlend.length < gruppen.length && ende - Date.now() > 5_000) {
    z.schlecht.clear();
    fehlend = await durchgang(fehlend);
  }
  if (fehlend.length === gruppen.length) throw ersterFehler;
  return { elemente: [...alle.values()], server, fehlend };
}

/** Betriebe ohne Website-Eintrag in OSM – noch ohne Abgleich mit dem CRM */
export async function funde(
  areaId: number,
  gruppen: string[],
  opts: { headers?: Record<string, string>; budgetMs?: number; bbox?: Bbox } = {},
): Promise<FundeErgebnis> {
  const headers = opts.headers ?? {};
  const ende = Date.now() + (opts.budgetMs ?? 90_000);
  const z: Zustand = { schlecht: new Set() };
  const erst = await sammeln(areaId, gruppen, headers, ende, z);
  let { elemente, server } = erst;
  const { fehlend } = erst;
  let ausschnitt = false;
  if (elemente.length === 0) {
    // Nichts gefunden: nicht gleich glauben. Manche Server liefern bei Überlast oder ohne Gebietsindex „leer“.
    // Darum einmal die gesamte Abfrage bei mehreren Servern gegenprüfen …
    try {
      const r = await overpass(abfrage(areaId, gruppen), headers, ende, true, z, 99);
      ({ elemente, server } = r);
    } catch {
      /* bleibt bei „leer“ */
    }
    // … und sonst über den Kartenausschnitt statt über das Gebiet suchen
    if (elemente.length === 0 && opts.bbox) {
      try {
        const r2 = await overpass(abfrage(areaId, gruppen, opts.bbox), headers, ende, true, z, 99);
        if (r2.elemente.length > 0) {
          ({ elemente, server } = r2);
          ausschnitt = true;
        }
      } catch {
        /* bleibt bei „leer“ */
      }
    }
  }
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
  const gesamt = liste.length === 0 ? await zaehlen(areaId, gruppen, headers, Math.max(ende, Date.now() + 8_000), z, opts.bbox) : undefined;
  return { liste, limit: elemente.length >= MAX_FUNDE * gruppen.length, gesamt, server, ausschnitt, fehlend };
}
