"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { anrufErgebnis, type Ergebnis } from "@/app/crm/anrufen/actions";
import { Gespraechshilfe } from "@/components/crm/Gespraechshilfe";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { Karte, buttonClass } from "@/components/ui";
import type { LeadStatus } from "@/lib/status";
import { heuteWien, isoZuWienLokal, tagVerschieben } from "@/lib/zeit";

export type AnrufLead = {
  id: string;
  firma: string;
  ansprechpartner: string | null;
  branche: string | null;
  telefon: string;
  adresse: string | null;
  bezirk: string | null;
  status: LeadStatus;
  naechster_rueckruf: string | null;
  grund: "rueckruf" | "neu" | "wieder";
  notizen: { text: string; created_at: string }[];
};

const UHR = new Intl.DateTimeFormat("de-AT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Vienna" });
const TAG = new Intl.DateTimeFormat("de-AT", { day: "2-digit", month: "2-digit", timeZone: "Europe/Vienna" });

/** Schnellwahl für den nächsten Anruf (Wiener Ortszeit „YYYY-MM-DDTHH:mm“) */
function zeitVorschlaege() {
  const jetzt = isoZuWienLokal(new Date().toISOString());
  const heute = heuteWien();
  const stunde = Number(jetzt.slice(11, 13));
  const v: { label: string; wert: string }[] = [];
  if (stunde < 15) v.push({ label: "Heute 16:00", wert: `${heute}T16:00` });
  v.push({ label: "Morgen 10:00", wert: `${tagVerschieben(heute, 1)}T10:00` });
  v.push({ label: "In 2 Tagen", wert: `${tagVerschieben(heute, 2)}T10:00` });
  v.push({ label: "In 1 Woche", wert: `${tagVerschieben(heute, 7)}T10:00` });
  return v;
}

const GRUND: Record<AnrufLead["grund"], (l: AnrufLead) => string> = {
  rueckruf: (l) => `Rückruf fällig · ${TAG.format(new Date(l.naechster_rueckruf!))} ${UHR.format(new Date(l.naechster_rueckruf!))}`,
  neu: () => "Neuer Lead · erster Anruf",
  wieder: () => "Nicht erreicht · nochmal probieren",
};

const KNOEPFE: { ergebnis: Ergebnis; label: string; taste: string; klasse: string }[] = [
  { ergebnis: "nicht_erreicht", label: "Nicht erreicht", taste: "1", klasse: "border-line bg-surface text-ink hover:border-muted" },
  { ergebnis: "rueckruf", label: "Rückruf", taste: "2", klasse: "border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-500" },
  { ergebnis: "interessiert", label: "Interessiert", taste: "3", klasse: "border-ok/40 bg-ok-light text-ok hover:border-ok" },
];

export function AnrufModus({
  leads: start,
  tagesziel,
  heuteKontakte,
  meinName,
  ohneEinwilligung,
}: {
  leads: AnrufLead[];
  tagesziel: number;
  heuteKontakte: number;
  meinName: string;
  ohneEinwilligung: number;
}) {
  // Eigene Kopie: Die Liste bleibt stabil, auch wenn der Server nach jedem Speichern neu lädt
  const [leads] = useState(start);
  const [nr, setNr] = useState(0);
  const [erledigt, setErledigt] = useState(0);
  const [wahl, setWahl] = useState<Ergebnis | null>(null);
  const [wann, setWann] = useState("");
  const [notiz, setNotiz] = useState("");
  const [meldung, setMeldung] = useState<string | null>(null);
  const [zuletzt, setZuletzt] = useState<string | null>(null);
  const [laeuft, starten] = useTransition();

  const lead = leads[nr];
  const kontakte = heuteKontakte + erledigt;
  const zielAnteil = Math.min(100, (kontakte / Math.max(1, tagesziel)) * 100);

  function weiter(text?: string) {
    if (text && lead) setZuletzt(`${lead.firma}: ${text}`);
    setNr((n) => n + 1);
    setWahl(null);
    setWann("");
    setNotiz("");
    setMeldung(null);
  }

  function speichern(ergebnis: Ergebnis, zeit = wann) {
    if (!lead || laeuft) return;
    if ((ergebnis === "rueckruf" || ergebnis === "interessiert") && !zeit) {
      setWahl(ergebnis);
      return;
    }
    starten(async () => {
      const r = await anrufErgebnis({ id: lead.id, ergebnis, notiz, wann: zeit || undefined });
      if (!r.ok) return setMeldung(r.meldung);
      setErledigt((e) => e + 1);
      weiter(r.text);
    });
  }

  // Tasten 1–3 für die Ergebnisse, solange man nicht gerade tippt
  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      const ziel = e.target as HTMLElement;
      if (ziel.closest("input, textarea, select") || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = KNOEPFE.find((x) => x.taste === e.key);
      if (k) {
        e.preventDefault();
        speichern(k.ergebnis);
      }
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  });

  if (!lead) {
    return (
      <Karte className="mx-auto max-w-xl p-8 text-center">
        <p className="text-5xl" aria-hidden>
          🎉
        </p>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-ink">Liste geschafft!</h1>
        <p className="mt-2 text-muted">
          Du hast {erledigt} {erledigt === 1 ? "Anruf" : "Anrufe"} eingetragen. Heute sind es {kontakte} von {tagesziel} Kontakten.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/crm/zahlen" className={buttonClass("primary")}>
            Zum Dashboard
          </Link>
          <Link href="/crm/besuche" className={buttonClass("secondary")}>
            Besuche planen
          </Link>
        </div>
      </Karte>
    );
  }

  const vorschlaege = zeitVorschlaege();
  const tel = lead.telefon.replace(/[^+0-9]/g, "");

  return (
    <div>
      {/* Fortschritt */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Anruf-Modus</p>
          <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Anruf {nr + 1} von {leads.length}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-48">
            <p className="text-sm text-muted">
              Heute <strong className="text-ink">{kontakte}</strong> von {tagesziel} Kontakten
            </p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-brand-light" aria-hidden>
              <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${zielAnteil}%` }} />
            </div>
          </div>
          <Link href="/crm/zahlen" className={buttonClass("secondary", "px-4")}>
            Beenden
          </Link>
        </div>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
        <div className="h-full bg-brand transition-[width] duration-300" style={{ width: `${(nr / leads.length) * 100}%` }} />
      </div>

      {zuletzt ? (
        <p role="status" className="mb-4 rounded-lg bg-ok-light px-4 py-2 text-sm font-semibold text-ok">
          ✓ Gespeichert – {zuletzt}
        </p>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Karte key={lead.id} className="p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-brand-light px-3 py-1 text-sm font-semibold text-brand">{GRUND[lead.grund](lead)}</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink">{lead.firma}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-muted">
            <StatusBadge status={lead.status} />
            {[lead.ansprechpartner, lead.branche, lead.bezirk].filter(Boolean).join(" · ")}
          </p>

          <a
            href={`tel:${tel}`}
            className="mt-5 flex min-h-14 items-center justify-center gap-3 rounded-xl bg-brand px-5 text-xl font-bold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-brand-hover active:scale-[0.98] motion-reduce:transform-none"
          >
            <span aria-hidden>📞</span> {lead.telefon}
          </a>

          {lead.notizen.length ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Zuletzt</p>
              <ul className="mt-1.5 space-y-1.5">
                {lead.notizen.map((n) => (
                  <li key={n.created_at} className="rounded-lg bg-bg px-3 py-2 text-sm text-ink">
                    <span className="text-muted">{TAG.format(new Date(n.created_at))}:</span> {n.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <label className="mt-5 block text-sm font-semibold text-ink">
            Notiz (optional)
            <textarea
              value={notiz}
              onChange={(e) => setNotiz(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="z. B. Chefin ab 14 Uhr da, will Preise per Mail"
              className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-base font-normal focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <p className="mt-5 text-sm font-semibold text-ink">Wie ist es gelaufen?</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {KNOEPFE.map((k) => (
              <button
                key={k.ergebnis}
                type="button"
                disabled={laeuft}
                aria-pressed={wahl === k.ergebnis}
                onClick={() => speichern(k.ergebnis)}
                className={`flex min-h-16 flex-col items-center justify-center rounded-xl border-2 px-1 text-[15px] font-bold leading-tight sm:px-2 sm:text-base transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-60 motion-reduce:transform-none ${k.klasse} ${
                  wahl === k.ergebnis ? "ring-2 ring-brand ring-offset-2" : ""
                }`}
              >
                {k.label}
                <kbd className="mt-0.5 hidden text-[11px] font-normal opacity-60 sm:block">Taste {k.taste}</kbd>
              </button>
            ))}
          </div>

          {wahl === "rueckruf" || wahl === "interessiert" ? (
            <div className="mt-4 rounded-xl border border-line bg-bg p-4">
              <p className="text-sm font-semibold text-ink">{wahl === "interessiert" ? "Wann meldest du dich wieder (z. B. nach der Demo)?" : "Wann rufst du wieder an?"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {vorschlaege.map((v) => (
                  <button
                    key={v.wert}
                    type="button"
                    disabled={laeuft}
                    onClick={() => speichern(wahl, v.wert)}
                    className="min-h-11 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <label className="flex-1 text-sm text-muted">
                  <span className="sr-only">Eigene Zeit</span>
                  <input
                    type="datetime-local"
                    value={wann}
                    min={`${heuteWien()}T00:00`}
                    onChange={(e) => setWann(e.target.value)}
                    className="block min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-base text-ink"
                  />
                </label>
                <button type="button" disabled={!wann || laeuft} onClick={() => speichern(wahl)} className={buttonClass("primary")}>
                  Speichern & weiter
                </button>
              </div>
            </div>
          ) : null}

          {meldung ? (
            <p role="alert" className="mt-3 rounded-lg bg-danger-light px-3 py-2 text-sm font-semibold text-danger">
              {meldung}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-sm">
            <div className="flex flex-wrap gap-1">
              <button type="button" disabled={laeuft} onClick={() => speichern("kein_interesse")} className="min-h-11 rounded-lg px-3 font-semibold text-muted hover:bg-line/50 hover:text-ink">
                Kein Interesse
              </button>
              <button type="button" disabled={laeuft} onClick={() => speichern("nicht_anrufen")} className="min-h-11 rounded-lg px-3 font-semibold text-danger hover:bg-danger-light">
                Will keine Anrufe
              </button>
            </div>
            <div className="flex gap-1">
              <Link href={`/crm/leads/${lead.id}`} target="_blank" className="inline-flex min-h-11 items-center rounded-lg px-3 font-semibold text-brand hover:bg-brand-light">
                Lead öffnen
              </Link>
              <button type="button" disabled={laeuft} onClick={() => weiter()} className="min-h-11 rounded-lg px-3 font-semibold text-brand hover:bg-brand-light">
                Überspringen →
              </button>
            </div>
          </div>
        </Karte>

        <div className="space-y-4">
          <Gespraechshilfe firma={lead.firma} ansprechpartner={lead.ansprechpartner} branche={lead.branche} meinName={meinName} offen />
          {ohneEinwilligung > 0 ? (
            <p className="px-1 text-sm text-muted">
              Hier sind nur Leads mit Einwilligung. {ohneEinwilligung} weitere Leads ohne Einwilligung findest du unter{" "}
              <Link href="/crm/besuche" className="font-semibold text-brand hover:underline">
                Besuche
              </Link>
              .
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
