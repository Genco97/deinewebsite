const TZ = "Europe/Vienna";

/** Offset (Minuten) von Europe/Vienna gegenüber UTC zu einem Zeitpunkt */
function offsetMinuten(datum: Date) {
  const teile = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(datum);
  const g = (t: string) => Number(teile.find((p) => p.type === t)?.value);
  const alsUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
  return Math.round((alsUtc - datum.getTime()) / 60000);
}

/** „2026-10-03T10:00“ (Wiener Ortszeit) → ISO-UTC */
export function wienZuIso(lokal: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(lokal);
  if (!m) return null;
  const naiv = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let d = new Date(naiv - offsetMinuten(new Date(naiv)) * 60000);
  d = new Date(naiv - offsetMinuten(d) * 60000); // Sommerzeit-Grenzen korrigieren
  return d.toISOString();
}

/** ISO → „2026-10-03T10:00“ in Wiener Ortszeit (für datetime-local) */
export function isoZuWienLokal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const lokal = new Date(d.getTime() + offsetMinuten(d) * 60000);
  return lokal.toISOString().slice(0, 16);
}

/** Beginn des heutigen Tages und der Woche (Montag) in Wien, als ISO */
export function wienGrenzen(jetzt = new Date()) {
  const heute = isoZuWienLokal(jetzt.toISOString()).slice(0, 10);
  const tagStart = wienZuIso(`${heute}T00:00`)!;
  const morgen = new Date(Date.parse(`${heute}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);
  const tagEnde = wienZuIso(`${morgen}T00:00`)!;
  const wochentag = (new Date(`${heute}T12:00:00Z`).getUTCDay() + 6) % 7; // 0 = Montag
  const montag = new Date(Date.parse(`${heute}T00:00:00Z`) - wochentag * 86400000).toISOString().slice(0, 10);
  const wocheStart = wienZuIso(`${montag}T00:00`)!;
  return { tagStart, tagEnde, wocheStart };
}

export function datumZeit(iso: string | null) {
  if (!iso) return "–";
  return new Intl.DateTimeFormat("de-AT", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function datum(iso: string | null) {
  if (!iso) return "–";
  return new Intl.DateTimeFormat("de-AT", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(iso),
  );
}

export function uhrzeit(iso: string | null) {
  if (!iso) return "–";
  return new Intl.DateTimeFormat("de-AT", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function euro(betrag: number | string | null) {
  return new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(Number(betrag ?? 0));
}
