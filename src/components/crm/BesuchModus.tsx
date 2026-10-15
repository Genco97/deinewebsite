"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { besuchKeinInteresse, besuchNichtDa, besuchOk } from "@/app/crm/besuch/actions";

export type BesuchLead = {
  id: string;
  firma: string;
  branche: string | null;
  adresse: string | null;
  bezirk: string | null;
  lat: number | null;
  lng: number | null;
  telefon: string | null;
  ansprechpartner: string | null;
  letzter_besuch: string | null;
};

type Punkt = { lat: number; lng: number };

/** Entfernung in Metern (Luftlinie) */
function meter(a: Punkt, b: Punkt) {
  const r = Math.PI / 180;
  const x = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lng - a.lng) * r) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
const weg = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toLocaleString("de-AT", { maximumFractionDigits: 1 })} km`);

/** Rückruf-Zeitpunkte zum Antippen (Ortszeit des Handys = Wien) */
function zeiten() {
  const um = (tage: number, h: number) => {
    const d = new Date();
    d.setDate(d.getDate() + tage);
    d.setHours(h, 0, 0, 0);
    return d;
  };
  const montag = (() => {
    const d = new Date();
    const bis = ((8 - d.getDay()) % 7) || 7;
    return um(bis, 10);
  })();
  const liste = [
    { label: "Heute 16:00", d: um(0, 16) },
    { label: "Morgen 10:00", d: um(1, 10) },
    { label: "Morgen 16:00", d: um(1, 16) },
    { label: "Nächste Woche", d: montag },
  ];
  return liste.filter((z) => z.d.getTime() > Date.now() + 15 * 60000);
}

const knopf = "flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-4 text-[17px] font-bold transition active:scale-[.98] disabled:opacity-50";
const feld = "mt-1.5 block min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function BesuchModus({ leads, heuteBesucht, ziel }: { leads: BesuchLead[]; heuteBesucht: number; ziel: number }) {
  const [liste, setListe] = useState(leads);
  const [ort, setOrt] = useState<Punkt | null>(null);
  const [ortMeldung, setOrtMeldung] = useState("");
  const [geschafft, setGeschafft] = useState(heuteBesucht);
  const [ansicht, setAnsicht] = useState<"karte" | "ok">("karte");
  const [name, setName] = useState("");
  const [telefon, setTelefon] = useState("");
  const [wann, setWann] = useState<string>("");
  const [eigen, setEigen] = useState("");
  const [meldung, setMeldung] = useState("");
  const [erfolg, setErfolg] = useState("");
  const [laeuft, starten] = useTransition();

  const sortiert = useMemo(() => {
    if (!ort) return liste.map((l) => ({ l, m: null as number | null }));
    return liste
      .map((l) => ({ l, m: l.lat != null && l.lng != null ? meter(ort, { lat: l.lat, lng: l.lng }) : null }))
      .sort((a, b) => (a.m ?? 9e9) - (b.m ?? 9e9));
  }, [liste, ort]);
  const jetzt = sortiert[0];
  const danach = sortiert.slice(1, 4);
  const optionen = useMemo(() => zeiten(), []);

  function standort() {
    if (!navigator.geolocation) return setOrtMeldung("Dein Handy gibt keinen Standort frei.");
    setOrtMeldung("Standort wird gesucht …");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setOrt({ lat: p.coords.latitude, lng: p.coords.longitude });
        setOrtMeldung("");
      },
      () => setOrtMeldung("Kein Standort – bitte im Browser erlauben. Sortiert nach Bezirk."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function fertig(id: string, text: string) {
    setListe((l) => l.filter((x) => x.id !== id));
    setGeschafft((g) => g + 1);
    setAnsicht("karte");
    setName("");
    setTelefon("");
    setWann("");
    setEigen("");
    setMeldung("");
    setErfolg(text);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function aktion(fn: () => Promise<{ ok: boolean; meldung?: string }>, id: string, text: string) {
    setMeldung("");
    setErfolg("");
    starten(async () => {
      const r = await fn();
      if (r.ok) fertig(id, text);
      else setMeldung(r.meldung ?? "Das hat nicht geklappt.");
    });
  }

  const prozent = Math.min(100, Math.round((geschafft / ziel) * 100));

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">Besuch-Modus</h1>
          <p className="text-sm text-muted">
            Heute: <b className="text-ink">{geschafft}</b> von {ziel} Besuchen · {liste.length} offen
          </p>
        </div>
        <button type="button" onClick={standort} className="min-h-11 shrink-0 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink">
          {ort ? "📍 Neu orten" : "📍 In der Nähe"}
        </button>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
        <div className="h-full rounded-full bg-ok transition-all" style={{ width: `${prozent}%` }} />
      </div>
      {ortMeldung ? <p className="mb-3 text-sm text-muted">{ortMeldung}</p> : null}
      {erfolg ? (
        <p role="status" className="mb-3 rounded-xl bg-ok-light px-4 py-3 text-sm font-semibold text-ok">
          ✓ {erfolg}
        </p>
      ) : null}

      {!jetzt ? (
        <div className="rounded-2xl border border-line bg-surface p-6 text-center">
          <p className="text-lg font-bold text-ink">Alles besucht 🎉</p>
          <p className="mt-1 text-sm text-muted">Für heute gibt es keine offenen Betriebe ohne Zustimmung mit Adresse.</p>
          <Link href="/crm/leads?liste=unvollstaendig" className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand">
            Adressen ergänzen →
          </Link>
        </div>
      ) : ansicht === "karte" ? (
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <p className="text-sm text-muted">
            {jetzt.m != null ? <b className="text-ink">📍 {weg(jetzt.m)}</b> : null}
            {jetzt.m != null && jetzt.l.bezirk ? " · " : ""}
            {jetzt.l.bezirk}
          </p>
          <h2 className="mt-1 text-2xl font-bold leading-tight text-ink">{jetzt.l.firma}</h2>
          <p className="mt-1 text-muted">
            {jetzt.l.adresse}
            {jetzt.l.branche ? ` · ${jetzt.l.branche}` : ""}
          </p>
          <div className="mt-3 flex gap-4 text-sm font-semibold">
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(jetzt.l.adresse ?? jetzt.l.firma)}`} target="_blank" rel="noopener noreferrer" className="text-brand">
              Route →
            </a>
            <Link href={`/crm/leads/${jetzt.l.id}`} className="text-brand">
              Lead öffnen →
            </Link>
          </div>

          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              disabled={laeuft}
              onClick={() => {
                setTelefon(jetzt.l.telefon ?? "");
                setName(jetzt.l.ansprechpartner ?? "");
                setWann(optionen[0]?.d.toISOString() ?? "");
                setAnsicht("ok");
                setMeldung("");
                setErfolg("");
              }}
              className={`${knopf} bg-ok text-white`}
            >
              ✓ OK zum Anrufen bekommen
            </button>
            <button type="button" disabled={laeuft} onClick={() => aktion(() => besuchNichtDa(jetzt.l.id), jetzt.l.id, `${jetzt.l.firma}: nicht angetroffen – kommt morgen wieder.`)} className={`${knopf} border border-line bg-surface text-ink`}>
              Niemand da – später nochmal
            </button>
            <button type="button" disabled={laeuft} onClick={() => aktion(() => besuchKeinInteresse(jetzt.l.id), jetzt.l.id, `${jetzt.l.firma}: kein Interesse.`)} className={`${knopf} border border-danger/30 bg-danger-light text-danger`}>
              Kein Interesse
            </button>
            <button
              type="button"
              disabled={laeuft}
              onClick={() => setListe((l) => [...l.filter((x) => x.id !== jetzt.l.id), jetzt.l])}
              className="w-full py-2 text-sm font-semibold text-muted"
            >
              Überspringen
            </button>
          </div>
          {meldung ? <p role="alert" className="mt-3 text-sm font-semibold text-danger">{meldung}</p> : null}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const termin = wann === "eigen" ? (eigen ? new Date(eigen).toISOString() : "") : wann;
            aktion(() => besuchOk(jetzt.l.id, name, telefon, termin), jetzt.l.id, `${jetzt.l.firma}: OK gespeichert – Rückruf ist eingetragen.`);
          }}
          className="rounded-2xl border border-ok/40 bg-surface p-5 shadow-sm"
        >
          <p className="text-sm font-semibold text-ok">OK bekommen</p>
          <h2 className="text-xl font-bold text-ink">{jetzt.l.firma}</h2>
          <label className="mt-4 block text-sm font-semibold text-muted">
            Mit wem gesprochen?
            <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="off" placeholder="Vor- und Nachname" className={feld} />
          </label>
          <label className="mt-3 block text-sm font-semibold text-muted">
            Telefon {jetzt.l.telefon ? <span className="font-normal">(schon eingetragen)</span> : null}
            <input value={telefon} onChange={(e) => setTelefon(e.target.value)} disabled={!!jetzt.l.telefon} required={!jetzt.l.telefon} inputMode="tel" autoComplete="off" placeholder="0660 …" className={`${feld} disabled:opacity-60`} />
          </label>
          <p className="mt-3 text-sm font-semibold text-muted">Wann anrufen?</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {optionen.map((o) => {
              const v = o.d.toISOString();
              return (
                <button key={o.label} type="button" aria-pressed={wann === v} onClick={() => setWann(v)} className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${wann === v ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink"}`}>
                  {o.label}
                </button>
              );
            })}
            <button type="button" aria-pressed={wann === "eigen"} onClick={() => setWann("eigen")} className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${wann === "eigen" ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink"}`}>
              Anderer Termin
            </button>
          </div>
          {wann === "eigen" ? <input type="datetime-local" value={eigen} onChange={(e) => setEigen(e.target.value)} required className={`${feld} mt-2`} /> : null}
          <p className="mt-4 rounded-xl bg-bg px-3 py-2 text-xs text-muted">
            Gespeichert wird: Zustimmung „Persönlich beim Besuch“ mit Datum und Name – danach ist die Nummer antippbar und WhatsApp frei.
          </p>
          {meldung ? <p role="alert" className="mt-3 text-sm font-semibold text-danger">{meldung}</p> : null}
          <button disabled={laeuft} className={`${knopf} mt-4 bg-ok text-white`}>
            {laeuft ? "Speichert …" : "Speichern & nächster Betrieb"}
          </button>
          <button type="button" onClick={() => setAnsicht("karte")} className="mt-2 w-full py-2 text-sm font-semibold text-muted">
            Zurück
          </button>
        </form>
      )}

      {danach.length > 0 && ansicht === "karte" ? (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-muted">Danach</p>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {danach.map(({ l, m }) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">{l.firma}</span>
                  <span className="block truncate text-sm text-muted">{l.adresse}</span>
                </span>
                {m != null ? <span className="shrink-0 text-sm font-semibold text-ink">{weg(m)}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
