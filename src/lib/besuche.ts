export const BESUCH_ERGEBNISSE = {
  nicht_angetroffen: { label: "Nicht angetroffen", status: null },
  flyer: { label: "Flyer abgegeben", status: null },
  interesse: { label: "Interesse", status: "interessiert" },
  demo: { label: "Demo vereinbart", status: "demo" },
  kein_interesse: { label: "Kein Interesse", status: "kein_interesse" },
} as const;

export type BesuchErgebnis = keyof typeof BESUCH_ERGEBNISSE;

export function istBesuchErgebnis(v: string): v is BesuchErgebnis {
  return v in BESUCH_ERGEBNISSE;
}

type MitAdresse = { adresse: string | null; bezirk: string | null };

export function adresseText(l: MitAdresse) {
  return [l.adresse, l.bezirk].filter(Boolean).join(", ");
}

function ort(l: MitAdresse) {
  return `${adresseText(l)}, Österreich`;
}

/** Google Maps: einzelne Adresse */
export function mapsSuche(l: MitAdresse) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ort(l))}`;
}

/** Google Maps: Route vom aktuellen Standort über alle Stopps (max. 10) */
export function mapsRoute(stopps: MitAdresse[]) {
  const s = stopps.filter((l) => l.adresse).slice(0, 10);
  if (s.length === 0) return null;
  const ziel = s[s.length - 1];
  const zwischen = s.slice(0, -1).map(ort).join("|");
  return (
    `https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=${encodeURIComponent(ort(ziel))}` +
    (zwischen ? `&waypoints=${encodeURIComponent(zwischen)}` : "")
  );
}
