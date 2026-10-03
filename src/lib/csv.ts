/** Einfacher CSV-Parser: erkennt ; oder , als Trenner, unterstützt Anführungszeichen. */
export function parseCsv(inhalt: string): string[][] {
  const text = inhalt.replace(/^﻿/, "");
  const ersteZeile = text.split(/\r?\n/, 1)[0] ?? "";
  const trenner = (ersteZeile.match(/;/g)?.length ?? 0) >= (ersteZeile.match(/,/g)?.length ?? 0) ? ";" : ",";

  const zeilen: string[][] = [];
  let zeile: string[] = [];
  let feld = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          feld += '"';
          i++;
        } else inQuotes = false;
      } else feld += c;
    } else if (c === '"') inQuotes = true;
    else if (c === trenner) {
      zeile.push(feld);
      feld = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      zeile.push(feld);
      zeilen.push(zeile);
      zeile = [];
      feld = "";
    } else feld += c;
  }
  if (feld || zeile.length) {
    zeile.push(feld);
    zeilen.push(zeile);
  }
  return zeilen.filter((z) => z.some((f) => f.trim() !== ""));
}

/** Wert für CSV-Export maskieren (inkl. Schutz vor Formel-Injection in Excel) */
export function csvWert(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function zuCsv(kopf: string[], zeilen: unknown[][]): string {
  return "﻿" + [kopf, ...zeilen].map((z) => z.map(csvWert).join(";")).join("\r\n");
}
