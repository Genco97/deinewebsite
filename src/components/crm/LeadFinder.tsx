"use client";

import { useState, useTransition } from "react";
import { fundeAbgleichen, fundeImportieren, fundeVomServer } from "@/app/crm/leadfinder/actions";
import { Hinweis, Input, Karte, Select, buttonClass } from "@/components/ui";
import type { Person } from "@/lib/crm";
import { GRUPPEN_NAMEN, type Fund } from "@/lib/leadfinder-gruppen";
import { SuchFehler, funde as osmFunde, gebietSuchen } from "@/lib/leadfinder-suche";

export function LeadFinder({ personen, ichId }: { personen: Person[]; ichId: string }) {
  const [ort, setOrt] = useState("Wien");
  const [gruppen, setGruppen] = useState<string[]>(GRUPPEN_NAMEN);
  const [nurTelefon, setNurTelefon] = useState(true);
  const [ohneSocial, setOhneSocial] = useState(false);
  const [besitzer, setBesitzer] = useState(ichId);
  const [funde, setFunde] = useState<Fund[]>([]);
  const [gewaehlt, setGewaehlt] = useState<Set<string>>(new Set());
  const [gebiet, setGebiet] = useState("");
  const [meldung, setMeldung] = useState<{ art: "ok" | "fehler" | "info"; text: string } | null>(null);
  const [sucht, sucheStarten] = useTransition();
  const [importiert, importStarten] = useTransition();

  const neue = funde.filter((f) => !f.vorhanden);

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
        try {
          ({ liste, limit, gesamt } = await osmFunde(g.areaId, gruppen));
        } catch (e1) {
          const s = await fundeVomServer(g.areaId, gruppen);
          if (!s.ok) {
            const vomBrowser = e1 instanceof Error ? e1.message : "Fehler";
            throw new SuchFehler(`Handy: ${vomBrowser} – Server: ${s.meldung}`);
          }
          ({ liste, limit, gesamt } = s);
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
        // Vorausgewählt: alles, was es im CRM noch nicht gibt
        setGewaehlt(new Set(ergebnis.filter((f) => !f.vorhanden).map((f) => f.key)));
        const kurz = g.name.split(",").slice(0, 2).join(",");
        let text = `${ergebnis.length} Betriebe ohne Website-Eintrag gefunden (Gebiet: ${kurz}).`;
        if (liste.length === 0 && gesamt === 0) {
          text = `Im Gebiet „${kurz}“ kennt OpenStreetMap keinen Betrieb dieser Branchen. Wahrscheinlich ist das Gebiet falsch oder zu klein – probier „${suchort}, Österreich“ oder eine größere Gemeinde.`;
        } else if (liste.length === 0 && gesamt) {
          text = `Im Gebiet „${kurz}“ gibt es ${gesamt} Betriebe dieser Branchen, aber bei allen ist in OpenStreetMap eine Website eingetragen. Probier weitere Branchen oder einen anderen Ort.`;
        } else if (liste.length === 0) {
          text = `Im Gebiet „${kurz}“ habe ich keine Betriebe ohne Website-Eintrag gefunden. Probier weitere Branchen oder einen anderen Ort.`;
        } else if (ergebnis.length === 0) {
          text = `${liste.length} Betriebe ohne Website-Eintrag gefunden, aber keiner passt zu deinen Haken (Telefonnummer / Social). Nimm die Haken weg.`;
        }
        setMeldung({ art: "info", text: limit ? `${text} Das Limit ist erreicht – such für mehr einzelne Bezirke.` : text });
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

  function alleUmschalten() {
    setGewaehlt(gewaehlt.size === neue.length ? new Set() : new Set(neue.map((f) => f.key)));
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

        <button type="button" onClick={suchen} disabled={sucht || importiert} className={buttonClass("primary", "w-full sm:w-auto")}>
          {sucht ? "Suche läuft …" : "Leads suchen"}
        </button>
        {sucht && <p className="text-sm text-muted">Das kann bis zu einer Minute dauern.</p>}
      </Karte>

      {meldung && <Hinweis art={meldung.art === "info" ? "info" : meldung.art}>{meldung.text}</Hinweis>}

      {funde.length > 0 && (
        <Karte className="p-4 sm:p-5">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-ink">{funde.length} Treffer</h2>
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
                onClick={uebernehmen}
                disabled={importiert || sucht || gewaehlt.size === 0}
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
                checked={gewaehlt.size === neue.length}
                onChange={alleUmschalten}
                className="h-4 w-4 accent-brand"
              />
              Alle neuen auswählen
            </label>
          )}

          <ul className="divide-y divide-line">
            {funde.map((f) => {
              const google = `https://www.google.com/search?q=${encodeURIComponent(`${f.firma} ${f.adresse || f.bezirk || ort}`)}`;
              return (
                <li key={f.key} className={`flex items-start gap-3 py-3 ${f.vorhanden ? "opacity-60" : ""}`}>
                  <input
                    type="checkbox"
                    disabled={f.vorhanden}
                    checked={gewaehlt.has(f.key)}
                    onChange={() => eintragUmschalten(f.key)}
                    aria-label={`${f.firma} auswählen`}
                    className="mt-1.5 h-5 w-5 shrink-0 accent-brand"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">
                      {f.firma}
                      {f.vorhanden && <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-muted">schon im CRM</span>}
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
        „Keine Website in OpenStreetMap“ heißt nicht automatisch „hat keine Website“ – darum der Google-Check. Übernommene
        Leads haben keine Einwilligung: Anrufe und E-Mails sind erst nach Einwilligung erlaubt (§ 174 TKG), bis dahin
        persönlicher Besuch oder Brief.
      </p>
    </div>
  );
}
