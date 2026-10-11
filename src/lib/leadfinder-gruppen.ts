/**
 * Branchengruppen für den Lead Finder: Name → OpenStreetMap-Filter.
 * Bewusst ohne "server-only", damit auch die Oberfläche die Namen kennt.
 */
export const GRUPPEN: Record<string, string[]> = {
  "Friseur & Beauty": [
    '["shop"~"^(hairdresser|beauty|nail_salon|massage|tattoo)$"]',
    '["amenity"="hairdresser"]',
    '["craft"="hairdresser"]',
  ],
  Gastro: ['["amenity"~"^(restaurant|cafe|bar|pub|fast_food|ice_cream|biergarten)$"]'],
  Handwerk: ['["craft"]', '["shop"~"^(electronics_repair|locksmith)$"]'],
  "Handel & Geschäfte": [
    '["shop"~"^(clothes|shoes|florist|bakery|butcher|gift|jewelry|books|bicycle|furniture|kiosk|tailor|optician|pet|toys|variety_store|convenience|second_hand|antiques|art|interior_decoration)$"]',
  ],
  "Auto & Mobilität": [
    '["shop"~"^(car_repair|car|car_parts|tyres|motorcycle)$"]',
    '["amenity"~"^(car_wash|driving_school)$"]',
  ],
  "Gesundheit & Fitness": [
    '["amenity"~"^(dentist|doctors|veterinary|physiotherapist)$"]',
    '["healthcare"]',
    '["leisure"~"^(fitness_centre|sports_centre)$"]',
  ],
  Dienstleister: [
    '["office"~"^(lawyer|accountant|tax_advisor|insurance|estate_agent|consulting|company)$"]',
    '["shop"~"^(laundry|dry_cleaning|travel_agency|copyshop)$"]',
  ],
};

export const GRUPPEN_NAMEN = Object.keys(GRUPPEN);

/** Ein Treffer aus OpenStreetMap */
export type Fund = {
  /** z. B. "node/123" – eindeutig pro Treffer */
  key: string;
  firma: string;
  branche: string;
  telefon: string;
  email: string;
  adresse: string;
  /** PLZ + Ort, falls in OSM eingetragen */
  bezirk: string;
  /** Facebook oder Instagram in OSM eingetragen */
  social: boolean;
  lat: number | null;
  lng: number | null;
  osm: string;
  /** gibt es im CRM schon (gleiche Nummer oder gleicher Name) */
  vorhanden: boolean;
};
