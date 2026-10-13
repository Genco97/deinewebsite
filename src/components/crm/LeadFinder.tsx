"use client";

import { useState, useTransition } from "react";
import { fundeAbgleichen, fundeImportieren, fundePruefen, fundeVomServer } from "@/app/crm/leadfinder/actions";
import { Hinweis, Input, Karte, Select, buttonClass } from "@/components/ui";
import type { Person } from "@/lib/crm";
import { GRUPPEN_NAMEN, type Fund } from "@/lib/leadfinder-gruppen";
import { SuchFehler, funde as osmFunde, gebietSuchen } from "@/lib/leadfinder-suche";

type Reiter = "qualifiziert" | "unklar" | "offen" | "raus";
const REITER: { id: Reiter; name: string }[] = [
  { id: "qualifiziert", name: "Qualifiziert" },
  { id: "unklar", name: "Unklar" },
  { id: "offen", name: "Offen" },
  { id: "raus", name: "Raus" },
];
const reiterVon = (f: Fund): Reiter =>
  f.vorhanden || f.pruefung === "hat" || f.pruefung === "geschlossen"
    ? "raus"
    : f.pruefung === "keine"
      ? "qualifiziert"
      : f.pruefung === "unklar"
        ? "unklar"
        : "offen";

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
  const [reiter, setReiter] = useState<Reiter>("offen");
  const [filterAuf, setFilterAuf] = useState(true);

  // Nur Betriebe, die Google als „ohne Website“ bestätigt hat, sind qualifiziert
  const ungeprueft = funde.filter((f) => !f.vorhanden && !f.pruefung);
  const proReiter = (id: Reiter) => funde.filter((f) => reiterVon(f) === id);
  const sichtbar = proReiter(reiter);
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
        setReiter("offen");
        setFilterAuf(ergebnis.length === 0);
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
      setReiter("qualifiziert");
      setFunde((l) => [...l].sort((a, c) => Number(a.vorhanden) - Number(c.vorhanden) || rang(a) - rang(c)));
      setMeldung(
        stopp
          ? { art: "fehler", text: `Die Prüfung wurde abgebrochen: ${stopp}` }
          : { art: "ok", text: "Prüfung fertig. Vorausgewählt sind nur Betriebe, die bei Google keine Website haben." },
      );
    });
  }

  function alleUmschalten() {
    const frei = sichtbar.filter(wahlbar);
    const alleDa = frei.length > 0 && frei.every((f) => gewaehlt.has(f.key));
    setGewaehlt((g) => {
      const n = new Set(g);
      for (const f of frei) {
        if (alleDa) n.delete(f.key);
        else n.add(f.key);
      }
      return n;
    });
  }

  function eintragUmschalten(key: string) {
    setGewaehlt((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  }

  const gewaehltAnzahl = gewaehlt.size;
  const badge = (f: Fund) => {
    const basis = "inline-flex w-fit items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold";
    if (f.vorhanden) return <span className={`${basis} bg-stone-100 text-muted`}>schon im CRM</span>;
    if (f.pruefung === "keine") return <span className={`${basis} bg-ok-light text-ok`}>✓ keine Website</span>;
    if (f.pruefung === "hat") return <span className={`${basis} bg-stone-100 text-muted`}>hat Website</span>;
    if (f.pruefung === "geschlossen") return <span className={`${basis} bg-stone-100 text-muted`}>geschlossen</span>;
    if (f.pruefung === "unklar") return <span className={`${basis} bg-amber-50 text-amber-800`}>bei Google unklar</span>;
    return <span className={`${basis} bg-stone-100 text-muted`}>noch ungeprüft</span>;
  };
  const spalten = "md:grid md:grid-cols-[36px_minmax(0,2.2fr)_minmax(0,1.4fr)_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.5fr)_110px] md:items-center md:gap-3";
  const anteil = Math.min(100, Math.round((stand.benutzt / Math.max(1, stand.limit)) * 100));
  const chip = "flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-brand/30";

  return (
    <div className={`space-y-3 ${funde.length > 0 ? "max-md:pb-24" : ""}`}>
      {/* Suche: auf dem Handy nach der Suche zu einer Zeile eingeklappt */}
      <Karte className="p-3 sm:p-4">
        {funde.length > 0 && !filterAuf && (
          <button
            type="button"
            onClick={() => setFilterAuf(true)}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-line bg-bg px-3 text-left text-sm md:hidden"
          >
            <span className="min-w-0 truncate font-semibold text-ink">
              {gebiet ? gebiet.split(",")[0] : ort} <span className="font-normal text-muted">· {gruppen.length} Branchen</span>
            </span>
            <span className="shrink-0 font-semibold text-brand">Ändern</span>
          </button>
        )}

        <div className={`${filterAuf || funde.length === 0 ? "block" : "hidden md:block"} space-y-3`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="space-y-1.5 md:w-72 md:shrink-0">
              <label htmlFor="ort" className="block text-sm font-semibold text-ink">
                Ort
              </label>
              <Input
                name="ort"
                value={ort}
                onChange={(e) => setOrt(e.target.value)}
                placeholder="Baden bei Wien, Österreich"
                maxLength={100}
              />
            </div>
            <fieldset className="min-w-0 flex-1">
              <legend className="mb-1.5 flex w-full items-center justify-between text-sm font-semibold text-ink">
                Branchen
                <button
                  type="button"
                  onClick={() => setGruppen(gruppen.length === GRUPPEN_NAMEN.length ? [] : GRUPPEN_NAMEN)}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-brand md:hidden"
                >
                  {gruppen.length === GRUPPEN_NAMEN.length ? "Alle abwählen" : "Alle wählen"}
                </button>
              </legend>
              <div className="flex flex-wrap gap-2">
                {GRUPPEN_NAMEN.map((g) => (
                  <label
                    key={g}
                    className={`${chip} ${gruppen.includes(g) ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink"} md:min-h-10`}
                  >
                    <input type="checkbox" checked={gruppen.includes(g)} onChange={() => umschalten(g)} className="sr-only" />
                    {g}
                  </label>
                ))}
              </div>
            </fieldset>
            <button
              type="button"
              onClick={suchen}
              disabled={sucht || importiert || prueft}
              className={buttonClass("primary", "w-full md:w-auto md:shrink-0")}
            >
              {sucht ? "Suche läuft …" : "Leads suchen"}
            </button>
          </div>

          <details className="group text-sm">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between border-t border-line pt-1 font-medium text-ink md:inline-flex md:min-h-9 md:gap-3 md:border-0 md:pt-0">
              Weitere Filter
              <span className="text-muted">{nurTelefon || ohneSocial ? "aktiv" : "keine aktiv"}</span>
            </summary>
            <div className="flex flex-wrap gap-2 pb-1 pt-1">
              <label className={`${chip} ${nurTelefon ? "border-brand bg-brand-light text-brand" : "border-line bg-surface"}`}>
                <input type="checkbox" checked={nurTelefon} onChange={(e) => setNurTelefon(e.target.checked)} className="h-4 w-4 accent-brand" />
                nur mit Telefonnummer
              </label>
              <label className={`${chip} ${ohneSocial ? "border-brand bg-brand-light text-brand" : "border-line bg-surface"}`}>
                <input type="checkbox" checked={ohneSocial} onChange={(e) => setOhneSocial(e.target.checked)} className="h-4 w-4 accent-brand" />
                ohne Facebook/Instagram
              </label>
            </div>
          </details>
          {sucht && <p className="text-sm text-muted">Das kann bis zu einer Minute dauern.</p>}
        </div>
      </Karte>

      {/* Google-Zähler: schmaler Balken */}
      <div className="flex items-center gap-3 px-1 text-sm">
        <span className={`shrink-0 font-semibold ${stand.rest <= 0 ? "text-danger" : "text-ink"}`}>Google-Prüfungen</span>
        <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-stone-200" role="img" aria-label={`${stand.benutzt} von ${stand.limit} benutzt`}>
          <div className={`h-full rounded-full ${stand.rest <= stand.limit * 0.2 ? "bg-danger" : "bg-brand"}`} style={{ width: `${anteil}%` }} />
        </div>
        <span className="shrink-0 text-muted">
          {stand.benutzt} / {stand.limit}
        </span>
      </div>

      {meldung && <Hinweis art={meldung.art === "info" ? "info" : meldung.art}>{meldung.text}</Hinweis>}

      {funde.length > 0 && (
        <Karte className="overflow-hidden">
          {/* Reiter */}
          <div className="flex border-b border-line px-1 md:px-3">
            {REITER.map((r) => {
              const n = proReiter(r.id).length;
              const aktiv = reiter === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReiter(r.id)}
                  aria-pressed={aktiv}
                  className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 border-b-[3px] px-1 text-[13px] md:flex-none md:px-4 md:text-sm ${
                    aktiv ? "border-brand font-bold text-brand" : "border-transparent font-medium text-muted"
                  }`}
                >
                  {r.name}
                  <span className={`rounded-full px-1.5 text-[11px] ${aktiv ? "bg-brand text-white" : "bg-stone-100 text-muted"}`}>{n}</span>
                </button>
              );
            })}
          </div>

          {/* Aktionen: am Handy feste Leiste unten, am Desktop über der Tabelle */}
          <div className="max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 max-md:border-t max-md:border-line max-md:bg-surface max-md:p-3 max-md:shadow-[0_-6px_16px_rgba(31,41,55,0.08)] md:flex md:items-center md:justify-end md:gap-2 md:border-b md:border-line md:px-3 md:py-2">
            {personen.length > 1 && (
              <div className="hidden md:block">
                <Select name="besitzer" value={besitzer} onChange={(e) => setBesitzer(e.target.value)} aria-label="Zuteilen an">
                  {personen.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id === ichId ? "Mir zuteilen" : `Zuteilen an ${p.name || p.email}`}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={pruefen}
                disabled={prueft || importiert || sucht || ungeprueft.length === 0 || stand.rest <= 0}
                className={buttonClass("secondary", "flex-1 md:flex-none")}
              >
                {prueft ? fortschritt || "Prüfe …" : `Prüfen (${Math.min(ungeprueft.length, stand.rest)})`}
              </button>
              <button
                type="button"
                onClick={uebernehmen}
                disabled={importiert || sucht || prueft || gewaehltAnzahl === 0}
                className={buttonClass("primary", "flex-[1.3] md:flex-none")}
              >
                {importiert ? "Übernehme …" : `${gewaehltAnzahl} übernehmen`}
              </button>
            </div>
          </div>

          {/* Tabellenkopf (nur Desktop) */}
          <div className={`hidden border-b border-line bg-bg px-4 py-2 text-xs font-bold text-muted ${spalten}`}>
            <input
              type="checkbox"
              checked={sichtbar.filter(wahlbar).length > 0 && sichtbar.filter(wahlbar).every((f) => gewaehlt.has(f.key))}
              onChange={alleUmschalten}
              aria-label="Alle auswählen"
              className="h-[18px] w-[18px] accent-brand"
            />
            <span>Firma</span>
            <span>Branche</span>
            <span>Adresse</span>
            <span>Telefon</span>
            <span>Google-Check</span>
            <span>Links</span>
          </div>

          {sichtbar.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              {reiter === "qualifiziert"
                ? "Noch nichts bestätigt – tipp auf „Prüfen“."
                : reiter === "offen"
                  ? "Alles geprüft."
                  : "Hier ist nichts."}
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {sichtbar.map((f) => {
                const google = `https://www.google.com/search?q=${encodeURIComponent(`${f.firma} ${f.adresse || f.bezirk || ort}`)}`;
                const adresse = [f.adresse, f.bezirk].filter(Boolean).join(", ");
                return (
                  <li key={f.key} className={`flex items-start gap-3 px-3 py-2.5 md:min-h-[46px] md:px-4 md:py-0 ${spalten} ${!wahlbar(f) ? "opacity-60" : ""}`}>
                    <input
                      type="checkbox"
                      disabled={!wahlbar(f)}
                      checked={gewaehlt.has(f.key)}
                      onChange={() => eintragUmschalten(f.key)}
                      aria-label={`${f.firma} auswählen`}
                      className="mt-1 h-[22px] w-[22px] shrink-0 accent-brand md:mt-0 md:h-[18px] md:w-[18px]"
                    />
                    <div className="min-w-0 flex-1 md:contents">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-ink md:text-sm">{f.firma}</span>
                        <span className="md:hidden">{badge(f)}</span>
                        {f.social && <span className="hidden whitespace-nowrap rounded-full bg-ok-light px-2 py-0.5 text-xs font-semibold text-ok max-md:inline-flex">Social</span>}
                      </div>
                      <p className="truncate text-[13px] text-muted md:hidden">{[f.branche, adresse].filter(Boolean).join(" · ")}</p>
                      <span className="hidden truncate text-sm text-muted md:block">{f.branche}</span>
                      <span className="hidden truncate text-sm text-muted md:block">{adresse}</span>
                      <div className="mt-0.5 flex items-center gap-4 text-[13px] md:contents">
                        <span className={`flex-1 truncate md:flex-none md:text-sm ${f.telefon ? "font-medium text-ink" : "text-muted/70"}`}>
                          {f.telefon || "keine Nummer"}
                        </span>
                        <span className="hidden md:block">{badge(f)}</span>
                        <span className="flex items-center gap-4 text-[13px] font-semibold">
                          <a href={google} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center text-brand hover:underline">
                            Google
                          </a>
                          <a href={f.osm} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center text-brand hover:underline">
                            OSM
                          </a>
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Karte>
      )}

      <p className="px-1 text-xs leading-relaxed text-muted">
        Qualifiziert ist ein Lead erst, wenn der Google-Check „keine Website“ bestätigt. Übernommene Leads haben keine Einwilligung:
        Anrufe und E-Mails sind erst danach erlaubt (§ 174 TKG), bis dahin Besuch oder Brief.
      </p>
    </div>
  );
}
