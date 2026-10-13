"use client";

import { useState, useTransition } from "react";
import { fundeAbgleichen, fundeImportieren, fundePruefen, fundeVomServer } from "@/app/crm/leadfinder/actions";
import { Hinweis, Input, Karte, Select, buttonClass } from "@/components/ui";
import type { Person } from "@/lib/crm";
import { GRUPPEN_NAMEN, type Fund } from "@/lib/leadfinder-gruppen";
import { SuchFehler, funde as osmFunde, gebietSuchen } from "@/lib/leadfinder-suche";

/** Sortierung nach der Prüfung: qualifiziert zuerst, dann unklar/ungeprüft, dann ausgeschieden */
const rang = (f: Fund) => (f.pruefung === "keine" ? 0 : f.pruefung === "unklar" ? 1 : !f.pruefung ? 2 : 3);

export function LeadFinder({ personen, ichId, stand: start }: { personen: Person[]; ichId: string; stand: { benutzt: number; limit: number; rest: number } }) {
  const [stand, setStand] = useState(start);
  const [ort, setOrt] = useState("Wien");
  const [gruppen, setGruppen] = useState<string[]>(GRUPPEN_NAMEN);
  const [nurTelefon, setNurTelefon] = useState(false);
  const [ohneSocial, setOhneSocial] = useState(false);
  const [besitzer, setBesitzer] = useState(ichId);
  const [funde, setFunde] = useState<Fund[]>([]);
  const [gewaehlt, setGewaehlt] = useState<Set<string>>(new Set());
  const [gebiet, setGebiet] = useState("");
  const [meldung, setMeldung] = useState<{ art: "ok" | "fehler" | "info"; text: string } | null>(null);
  const [sucht, sucheStarten] = useTransition();
  const [importiert, importStarten] = useTransition();
  const [prueft, pruefStarten] = useTransition();
  const [fortschritt, setFortschritt] = useState("");

  const neue = funde.filter((f) => !f.vorhanden);
  // Nur Betriebe, die Google als „ohne Website“ bestätigt hat, sind qualifiziert
  const ungeprueft = funde.filter((f) => !f.vorhanden && !f.pruefung);
  const qualifiziert = funde.filter((f) => !f.vorhanden && f.pruefung === "keine");
  const wahlbar = (f: Fund) => !f.vorhanden && f.pruefung !== "hat" && f.pruefung !== "geschlossen";

  function umschalten(name: string) {
    setGruppen((g) => (g.includes(name) ? g.filter((x) => x !== name) : [...g, name]));
  }

  function suchen() {
    setMeldung(null);
    const suchort = ort.trim();
    if (suchort.length < 2) return setMeldung({ art: "fehler", text: "Bitte gib einen Ort ein, z. B. „Wien“ oder „Neubau, Wien“." });
    if (gruppen.length === 0) return setMeldung({ art: "fehler", text: "Bitte wähle mindestens eine Branche." });
    sucheStarten(async () => {
      try {
        // Die Anfragen an OpenStreetMap laufen direkt von hier (Browser) – von Servern aus werden sie oft abgelehnt
        const g = await gebietSuchen(suchort);
        if (!g) {
          setFunde([]);
          setMeldung({ art: "fehler", text: `Zu „${suchort}“ habe ich kein Gebiet gefunden. Probier z. B. „Graz, Österreich“.` });
          return;
        }
        // Erst direkt vom Handy; klappt das nicht, dieselbe Abfrage über den Server
        let liste: Fund[];
        let limit: boolean;
        let gesamt: number | null | undefined;
        let server: string | undefined;
        let ausschnitt: boolean | undefined;
        let fehlend: string[] | undefined;
        try {
          ({ liste, limit, gesamt, server, ausschnitt, fehlend } = await osmFunde(g.areaId, gruppen, { bbox: g.bbox }));
        } catch (e1) {
          const s = await fundeVomServer(g.areaId, gruppen, g.bbox);
          if (!s.ok) {
            const vomBrowser = e1 instanceof Error ? e1.message : "Fehler";
            throw new SuchFehler(`Handy: ${vomBrowser} – Server: ${s.meldung}`);
          }
          ({ liste, limit, gesamt, server, ausschnitt, fehlend } = s);
        }
        const gesehen = new Set<string>();
        const gefiltert = liste.filter((f) => {
          if (nurTelefon && !f.telefon) return false;
          if (ohneSocial && f.social) return false;
          const k = `${f.firma}|${f.adresse}`.toLowerCase();
          if (gesehen.has(k)) return false;
          gesehen.add(k);
          return true;
        });
        const schonDa = new Set(await fundeAbgleichen(gefiltert.map(({ key, firma, telefon }) => ({ key, firma, telefon }))));
        const ergebnis = gefiltert
          .map((f) => ({ ...f, vorhanden: schonDa.has(f.key) }))
          .sort(
            (a, c) =>
              Number(a.vorhanden) - Number(c.vorhanden) || Number(!!c.telefon) - Number(!!a.telefon) || a.firma.localeCompare(c.firma, "de"),
          );
        setFunde(ergebnis);
        setGebiet(g.name);
        // Nichts vorausgewählt: qualifiziert ist erst, was die Google-Prüfung bestätigt
        setGewaehlt(new Set());
        const kurz = g.name.split(",").slice(0, 2).join(",");
        let text = `${ergebnis.length} Betriebe ohne Website-Eintrag in OpenStreetMap gefunden (Gebiet: ${kurz}). Klick auf „Auf Website prüfen“, damit Google bestätigt, ob sie wirklich keine haben.`;
        if (liste.length === 0 && gesamt === 0) {
          text = `Im Gebiet „${kurz}“ kennt OpenStreetMap keinen Betrieb dieser Branchen. Wahrscheinlich ist das Gebiet falsch oder zu klein – probier „${suchort}, Österreich“ oder eine größere Gemeinde.`;
        } else if (liste.length === 0 && gesamt) {
          text = `Im Gebiet „${kurz}“ gibt es ${gesamt} Betriebe dieser Branchen, aber bei allen ist in OpenStreetMap eine Website eingetragen. Probier weitere Branchen oder einen anderen Ort.`;
        } else if (liste.length === 0) {
          text = `Im Gebiet „${kurz}“ habe ich keine Betriebe ohne Website-Eintrag gefunden. Probier weitere Branchen oder einen anderen Ort.`;
        } else if (ergebnis.length === 0) {
          text = `${liste.length} Betriebe ohne Website-Eintrag gefunden, aber keiner passt zu deinen Haken (Telefonnummer / Social). Nimm die Haken weg.`;
        }
        const ohneNummer = liste.filter((f) => !f.telefon).length;
        if (nurTelefon && ohneNummer > 0) text += ` ${ohneNummer} weitere ohne Telefonnummer sind ausgeblendet – nimm den Haken „nur mit Telefonnummer“ weg, um sie zu sehen.`;
        if (ausschnitt && liste.length > 0) text += " Das Gebiet selbst lieferte nichts, deshalb habe ich den Kartenausschnitt durchsucht – das kann Nachbarorte enthalten.";
        if (limit) text += " Das Limit ist erreicht – such für mehr einzelne Bezirke.";
        if (fehlend && fehlend.length > 0) text += ` Nicht abgefragt werden konnten: ${fehlend.join(", ")} – such diese gleich nochmal einzeln.`;
        if (server) text += ` (Quelle: ${server})`;
        setMeldung({ art: "info", text });
      } catch (e) {
        setFunde([]);
        setGewaehlt(new Set());
        const detail = e instanceof SuchFehler ? e.message : e instanceof Error ? e.message : "unbekannter Fehler";
        setMeldung({
          art: "fehler",
          text: `Die Suche hat nicht geklappt – ${detail}. Probier es gleich nochmal oder such einen einzelnen Bezirk (z. B. „Neubau, Wien“).`,
        });
      }
    });
  }

  function uebernehmen() {
    const auswahl = funde.filter((f) => gewaehlt.has(f.key) && !f.vorhanden);
    setMeldung(null);
    importStarten(async () => {
      const r = await fundeImportieren(auswahl, besitzer);
      setMeldung({ art: r.ok ? "ok" : "fehler", text: r.meldung });
      if (r.ok) {
        // Übernommene gelten jetzt als vorhanden
        const keys = new Set(auswahl.map((f) => f.key));
        setFunde((l) => l.map((f) => (keys.has(f.key) ? { ...f, vorhanden: true } : f)));
        setGewaehlt(new Set());
      }
    });
  }

  function pruefen() {
    // Nie mehr abfragen, als das Monatslimit noch erlaubt
    const offen = funde.filter((f) => !f.vorhanden && !f.pruefung).slice(0, stand.rest);
    if (offen.length === 0) return;
    setMeldung(null);
    pruefStarten(async () => {
      let fertig = 0;
      let stopp: string | undefined;
      for (let i = 0; i < offen.length && !stopp; i += 25) {
        setFortschritt(`Google-Prüfung: ${fertig} von ${offen.length} …`);
        const block = offen.slice(i, i + 25).map(({ key, firma, adresse, bezirk, lat, lng }) => ({ key, firma, adresse, bezirk, lat, lng }));
        const r = await fundePruefen(block);
        if (r.stand) setStand(r.stand);
        if (!r.ok) {
          stopp = r.meldung;
          break;
        }
        if (r.meldung) stopp = r.meldung;
        const nach = new Map(r.ergebnisse.map((e) => [e.key, e]));
        fertig += block.length;
        setFunde((l) =>
          l.map((f) => {
            const e = nach.get(f.key);
            return e ? { ...f, pruefung: e.status, website: e.website, telefon: f.telefon || e.telefon || "" } : f;
          }),
        );
        // Auswahl nachführen: nur „keine Website“ bleibt/wird gewählt, „unklar“ nur auf Wunsch
        setGewaehlt((g) => {
          const n = new Set(g);
          for (const e of r.ergebnisse) {
            if (e.status === "keine") n.add(e.key);
            else n.delete(e.key);
          }
          return n;
        });
      }
      setFortschritt("");
      setFunde((l) => [...l].sort((a, c) => Number(a.vorhanden) - Number(c.vorhanden) || rang(a) - rang(c)));
      setMeldung(
        stopp
          ? { art: "fehler", text: `Die Prüfung wurde abgebrochen: ${stopp}` }
          : { art: "ok", text: "Prüfung fertig. Vorausgewählt sind nur Betriebe, die bei Google keine Website haben." },
      );
    });
  }

  function alleUmschalten() {
    const frei = neue.filter(wahlbar);
    setGewaehlt(gewaehlt.size === frei.length ? new Set() : new Set(frei.map((f) => f.key)));
  }

  function eintragUmschalten(key: string) {
    setGewaehlt((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  }

  return (
    <div className="space-y-5">
      <Karte className="space-y-4 p-4 sm:p-5">
        <div className="space-y-1.5">
          <label htmlFor="ort" className="block text-sm font-semibold text-ink">
            Ort
          </label>
          <Input
            name="ort"
            value={ort}
            onChange={(e) => setOrt(e.target.value)}
            placeholder="Wien, Neubau Wien, Graz, München, Zürich …"
            maxLength={100}
          />
          <p className="text-sm text-muted">Stadt, Bezirk oder Gemeinde. Bei großen Städten lieber bezirksweise suchen.</p>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold text-ink">Branchen</legend>
          <div className="flex flex-wrap gap-2">
            {GRUPPEN_NAMEN.map((g) => (
              <label
                key={g}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm"
              >
                <input type="checkbox" checked={gruppen.includes(g)} onChange={() => umschalten(g)} className="h-4 w-4 accent-brand" />
                {g}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm">
            <input type="checkbox" checked={nurTelefon} onChange={(e) => setNurTelefon(e.target.checked)} className="h-4 w-4 accent-brand" />
            nur mit Telefonnummer
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm">
            <input type="checkbox" checked={ohneSocial} onChange={(e) => setOhneSocial(e.target.checked)} className="h-4 w-4 accent-brand" />
            ohne Facebook/Instagram
          </label>
        </div>

        <button type="button" onClick={suchen} disabled={sucht || importiert || prueft} className={buttonClass("primary", "w-full sm:w-auto")}>
          {sucht ? "Suche läuft …" : "Leads suchen"}
        </button>
        {sucht && <p className="text-sm text-muted">Das kann bis zu einer Minute dauern.</p>}
      </Karte>

      <p className={`text-sm ${stand.rest <= 0 ? "font-semibold text-danger" : stand.rest <= stand.limit * 0.2 ? "font-semibold text-ink" : "text-muted"}`}>
        Google-Prüfungen diesen Monat: {stand.benutzt} von {stand.limit}
        {stand.rest <= 0 ? " – Limit erreicht, keine weiteren Prüfungen bis nächsten Monat." : ` – noch ${stand.rest} frei.`}
      </p>

      {meldung && <Hinweis art={meldung.art === "info" ? "info" : meldung.art}>{meldung.text}</Hinweis>}

      {funde.length > 0 && (
        <Karte className="p-4 sm:p-5">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-ink">{funde.length} Treffer</h2>
              <p className="text-sm text-muted">
                {qualifiziert.length} qualifiziert (bei Google keine Website) · {ungeprueft.length} noch ungeprüft
              </p>
              {gebiet && <p className="line-clamp-1 text-xs text-muted">{gebiet}</p>}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {personen.length > 1 && (
                <Select name="besitzer" value={besitzer} onChange={(e) => setBesitzer(e.target.value)} aria-label="Zuteilen an">
                  {personen.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id === ichId ? "Mir zuteilen" : `Zuteilen an ${p.name || p.email}`}
                    </option>
                  ))}
                </Select>
              )}
              <button
                type="button"
                onClick={pruefen}
                disabled={prueft || importiert || sucht || ungeprueft.length === 0 || stand.rest <= 0}
                className={buttonClass("secondary")}
              >
                {prueft ? fortschritt || "Prüfe …" : `Auf Website prüfen (${Math.min(ungeprueft.length, stand.rest)} Google-Abfragen)`}
              </button>
              <button
                type="button"
                onClick={uebernehmen}
                disabled={importiert || sucht || prueft || gewaehlt.size === 0}
                className={buttonClass("primary")}
              >
                {importiert ? "Übernehme …" : `${gewaehlt.size} als Leads übernehmen`}
              </button>
            </div>
          </div>

          {neue.length > 0 && (
            <label className="mb-2 flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={gewaehlt.size > 0 && gewaehlt.size === neue.filter(wahlbar).length}
                onChange={alleUmschalten}
                className="h-4 w-4 accent-brand"
              />
              Alle möglichen auswählen
            </label>
          )}

          <ul className="divide-y divide-line">
            {funde.map((f) => {
              const google = `https://www.google.com/search?q=${encodeURIComponent(`${f.firma} ${f.adresse || f.bezirk || ort}`)}`;
              return (
                <li key={f.key} className={`flex items-start gap-3 py-3 ${!wahlbar(f) ? "opacity-60" : ""}`}>
                  <input
                    type="checkbox"
                    disabled={!wahlbar(f)}
                    checked={gewaehlt.has(f.key)}
                    onChange={() => eintragUmschalten(f.key)}
                    aria-label={`${f.firma} auswählen`}
                    className="mt-1.5 h-5 w-5 shrink-0 accent-brand"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">
                      {f.firma}
                      {f.vorhanden && <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-muted">schon im CRM</span>}
                      {f.pruefung === "keine" && <span className="ml-2 rounded-full bg-ok-light px-2 py-0.5 text-xs font-medium text-ok">✓ keine Website</span>}
                      {f.pruefung === "hat" && (
                        <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-muted">hat Website</span>
                      )}
                      {f.pruefung === "geschlossen" && (
                        <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-muted">geschlossen</span>
                      )}
                      {f.pruefung === "unklar" && (
                        <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-muted">bei Google unklar</span>
                      )}
                      {f.social && <span className="ml-2 rounded-full bg-ok-light px-2 py-0.5 text-xs font-medium text-ok">Social vorhanden</span>}
                    </p>
                    <p className="text-sm text-muted">
                      {[f.branche, [f.adresse, f.bezirk].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-4 text-sm">
                      {f.telefon ? <span className="text-ink">{f.telefon}</span> : <span className="text-muted">keine Nummer</span>}
                      <a href={google} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-brand hover:underline">
                        Google prüfen
                      </a>
                      <a href={f.osm} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-brand hover:underline">
                        OSM
                      </a>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Karte>
      )}

      <p className="text-sm text-muted">
        Qualifiziert ist ein Lead erst, wenn der Google-Check „keine Website“ bestätigt. Bis dahin heißt „keine Website in
        OpenStreetMap“ nur, dass dort keine eingetragen ist. Übernommene
        Leads haben keine Einwilligung: Anrufe und E-Mails sind erst nach Einwilligung erlaubt (§ 174 TKG), bis dahin
        persönlicher Besuch oder Brief.
      </p>
    </div>
  );
}
