// Minimaler iCalendar-Export (RFC 5545) für das Kalender-Abo

export type KalenderEintrag = {
  art: "rueckruf" | "besuch";
  lead_id: string;
  firma: string;
  adresse: string | null;
  bezirk: string | null;
  telefon: string | null;
  zeitpunkt: string | null;
  tag: string | null;
  anruf_ok: boolean;
};

const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Zeilen über 75 Byte umbrechen (Folgezeile beginnt mit Leerzeichen) */
function falten(zeile: string) {
  const bytes = new TextEncoder();
  const teile: string[] = [];
  let aktuell = "";
  for (const z of zeile) {
    if (bytes.encode(aktuell + z).length > (teile.length ? 74 : 75)) {
      teile.push(aktuell);
      aktuell = "";
    }
    aktuell += z;
  }
  teile.push(aktuell);
  return teile.join("\r\n ");
}

const utc = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const tagFormat = (tag: string) => tag.replace(/-/g, "");
const naechsterTag = (tag: string) => new Date(Date.parse(`${tag}T12:00:00Z`) + 86400000).toISOString().slice(0, 10);

export function kalenderIcs(eintraege: KalenderEintrag[], site: string) {
  const jetzt = utc(new Date().toISOString());
  const zeilen = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ursprung//CRM//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Ursprung CRM",
    "X-WR-TIMEZONE:Europe/Vienna",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];
  for (const e of eintraege) {
    const ort = [e.adresse, e.bezirk].filter(Boolean).join(", ");
    const link = `${site}/crm/leads/${e.lead_id}`;
    const titel = e.art === "besuch" ? `Besuch: ${e.firma}` : `${e.anruf_ok ? "Anrufen" : "Erinnerung"}: ${e.firma}`;
    const info = [
      e.art === "rueckruf" && e.anruf_ok && e.telefon ? `Telefon: ${e.telefon}` : null,
      e.art === "rueckruf" && !e.anruf_ok ? "Keine Einwilligung – nicht anrufen." : null,
      `Im CRM öffnen: ${link}`,
    ]
      .filter(Boolean)
      .join("\n");

    let zeit: string[];
    if (e.art === "besuch" && e.tag) {
      zeit = [`DTSTART;VALUE=DATE:${tagFormat(e.tag)}`, `DTEND;VALUE=DATE:${tagFormat(naechsterTag(e.tag))}`, "TRANSP:TRANSPARENT"];
    } else if (e.zeitpunkt) {
      const ende = new Date(Date.parse(e.zeitpunkt) + 15 * 60000).toISOString();
      zeit = [`DTSTART:${utc(e.zeitpunkt)}`, `DTEND:${utc(ende)}`];
    } else {
      continue;
    }
    zeilen.push(
      "BEGIN:VEVENT",
      `UID:${e.art}-${e.lead_id}@ursprung-crm`,
      `DTSTAMP:${jetzt}`,
      ...zeit,
      `SUMMARY:${esc(titel)}`,
      `DESCRIPTION:${esc(info)}`,
      `URL:${link}`,
      ...(ort ? [`LOCATION:${esc(`${ort}, Österreich`)}`] : []),
      // Erinnerung: Anruf 10 Minuten vorher, Besuch am Tag um 8 Uhr
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(titel)}`,
      e.art === "besuch" ? "TRIGGER:PT8H" : "TRIGGER:-PT10M",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  zeilen.push("END:VCALENDAR");
  return zeilen.map(falten).join("\r\n") + "\r\n";
}
