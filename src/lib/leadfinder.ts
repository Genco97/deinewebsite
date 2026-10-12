import "server-only";

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
