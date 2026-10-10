"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Icon, Sterne } from "@/components/beispiele/Icon";
import { abPreis, offeneTage, type Betrieb } from "@/lib/beispiele";

/*
 * Werkzeuge der Business-Beispielseite. Farben kommen über CSS-Variablen:
 * --b-bg, --b-flaeche, --b-ink, --b-muted, --b-linie, --b-akzent, --b-auf
 */

const TAG = new Intl.DateTimeFormat("de-AT", { weekday: "short" });
const DATUM = new Intl.DateTimeFormat("de-AT", { day: "numeric", month: "numeric" });
const ZEITEN = ["9:00", "10:30", "11:30", "14:00", "16:30"];

const keinAbo = () => () => {};
const heuteTag = () => new Date().toDateString();

function Danke({ text, zurueck }: { text: string; zurueck: () => void }) {
  return (
    <div role="status" className="py-8 text-center">
      <p className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--b-akzent)] text-[var(--b-auf)]">
        <Icon name="haken" className="h-6 w-6" />
      </p>
      <p className="mt-4 text-xl font-semibold">{text}</p>
      <p className="mt-2 text-sm text-[var(--b-muted)]">Beispiel – es wurde nichts gesendet. Auf einer echten Website kommt das jetzt beim Betrieb an.</p>
      <button type="button" onClick={zurueck} className="mt-4 text-sm font-semibold text-[var(--b-akzent)] underline">
        Noch einmal ausprobieren
      </button>
    </div>
  );
}

function Wahl({ an, onClick, children, aus = false }: { an: boolean; onClick: () => void; children: ReactNode; aus?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={an}
      disabled={aus}
      onClick={onClick}
      className={`min-h-12 rounded-xl border px-2 text-sm font-semibold transition disabled:line-through disabled:opacity-35 ${
        an ? "border-[var(--b-akzent)] bg-[var(--b-akzent)] text-[var(--b-auf)]" : "border-[var(--b-linie)] bg-[var(--b-flaeche)] hover:border-[var(--b-akzent)]"
      }`}
    >
      {children}
    </button>
  );
}

const feld = "mt-2 block min-h-12 w-full rounded-xl border border-[var(--b-linie)] bg-[var(--b-flaeche)] px-4 text-base text-[var(--b-ink)] focus:border-[var(--b-akzent)] focus:outline-none focus:ring-2 focus:ring-[var(--b-akzent)]/20";
const label = "mt-5 block text-[13px] font-semibold text-[var(--b-muted)]";
const knopf = "inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[var(--b-akzent)] px-6 font-semibold text-[var(--b-auf)] transition hover:-translate-y-0.5";

/** Anfrage mit Leistung, Person, Tag und Uhrzeit */
export function Anfrage({ betrieb }: { betrieb: Betrieb }) {
  const heute = useSyncExternalStore(keinAbo, heuteTag, () => "");
  const tage = heute ? offeneTage(betrieb.oeffnungszeiten, new Date(heute), 6) : [];
  const [leistung, setLeistung] = useState(betrieb.leistungen[0].id);
  const [person, setPerson] = useState("egal");
  const [tag, setTag] = useState(1);
  const [zeit, setZeit] = useState("14:00");
  const [fertig, setFertig] = useState(false);
  const l = betrieb.leistungen.find((x) => x.id === leistung) ?? betrieb.leistungen[0];
  if (fertig) return <Danke text={`Anfrage gesendet: ${l.name}${tage[tag] ? `, ${TAG.format(tage[tag])} ${DATUM.format(tage[tag])}` : ""} um ${zeit} Uhr`} zurueck={() => setFertig(false)} />;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setFertig(true);
      }}
    >
      <label className={`${label} !mt-0`}>
        {betrieb.buchung.schritt}
        <select value={leistung} onChange={(e) => setLeistung(e.target.value)} className={feld}>
          {betrieb.leistungen.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name} · {abPreis(x.preis)}
            </option>
          ))}
        </select>
      </label>
      {betrieb.aktionKurz === "Termin" && <p className={label}>Bei wem?</p>}
      <div className={`mt-2 flex-wrap gap-1 rounded-full bg-[var(--b-bg)] p-1 ${betrieb.aktionKurz === "Termin" ? "flex" : "hidden"}`}>
        {["egal", ...betrieb.team.map((t) => t.name)].map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={person === n}
            onClick={() => setPerson(n)}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold transition ${person === n ? "bg-[var(--b-flaeche)] text-[var(--b-akzent)] shadow-sm" : "text-[var(--b-muted)]"}`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className={label}>Wunschtag</p>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {tage.map((t, i) => (
          <Wahl key={t.toISOString()} an={i === tag} aus={i === 3} onClick={() => setTag(i)}>
            {TAG.format(t)}
            <small className="block text-[11px] font-normal opacity-75">{DATUM.format(t)}</small>
          </Wahl>
        ))}
      </div>
      <p className={label}>Uhrzeit</p>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {ZEITEN.map((z, i) => (
          <Wahl key={z} an={z === zeit} aus={(i + tag) % 4 === 1} onClick={() => setZeit(z)}>
            {z}
          </Wahl>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block text-[13px] font-semibold text-[var(--b-muted)]">
          Name
          <input required autoComplete="off" className={feld} />
        </label>
        <label className="block text-[13px] font-semibold text-[var(--b-muted)]">
          Telefon
          <input required autoComplete="off" inputMode="tel" className={feld} />
        </label>
      </div>
      <button className={`${knopf} mt-6`}>{betrieb.aktion}</button>
      <p className="mt-3 text-center text-sm text-[var(--b-muted)]">Bestätigung per SMS – meist innerhalb einer Stunde.</p>
    </form>
  );
}

/** Bewertungen zum Durchblättern */
export function StimmenSlider({ betrieb }: { betrieb: Betrieb }) {
  const [start, setStart] = useState(0);
  const n = betrieb.bewertungen.length;
  const zeigen = [0, 1].map((i) => betrieb.bewertungen[(start + i) % n]);
  return (
    <div>
      <ul className="grid gap-5 md:grid-cols-2" aria-live="polite">
        {zeigen.map((b, i) => (
          <li key={`${b.name}-${i}`} className={`rounded-2xl border border-white/12 bg-white/[0.06] p-7 ${i ? "hidden md:block" : ""}`}>
            <span className="text-[#f3c35b]"><Sterne /></span>
            <blockquote className="mt-4 text-[22px] leading-snug" style={{ fontFamily: "var(--b-titel)" }}>„{b.text}“</blockquote>
            <p className="mt-5 text-sm text-white/60">{b.name}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center gap-3">
        <button type="button" aria-label="Vorherige Bewertung" onClick={() => setStart((start + n - 1) % n)} className="grid h-12 w-12 place-items-center rounded-full border border-white/25 hover:bg-white/10">
          <Icon name="pfeil" className="h-[18px] w-[18px] rotate-180" />
        </button>
        <button type="button" aria-label="Nächste Bewertung" onClick={() => setStart((start + 1) % n)} className="grid h-12 w-12 place-items-center rounded-full border border-white/25 hover:bg-white/10">
          <Icon name="pfeil" className="h-[18px] w-[18px]" />
        </button>
        <span className="ml-2 flex gap-1.5" aria-hidden>
          {betrieb.bewertungen.map((b, i) => (
            <i key={b.name} className={`h-2 rounded-full transition-all ${i === start ? "w-6 bg-white" : "w-2 bg-white/30"}`} />
          ))}
        </span>
      </div>
    </div>
  );
}

/** Vorher/Nachher-Regler mit einem Foto (vorher entsättigt) */
export function VorherNachherFoto({ bild, titel }: { bild: string; titel: string }) {
  const [wert, setWert] = useState(50);
  return (
    <div className="relative h-full min-h-[380px] overflow-hidden rounded-2xl md:min-h-[460px]">
      <div className="absolute inset-0" style={{ background: `center / cover url(${bild})` }} />
      <div className="absolute inset-0 grayscale-[.9] brightness-[.8] sepia-[.15]" style={{ background: `center / cover url(${bild})`, clipPath: `inset(0 ${100 - wert}% 0 0)` }} />
      <div aria-hidden className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `${wert}%` }}>
        <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-sm font-bold text-[var(--b-akzent)] shadow-lg">‹ ›</span>
      </div>
      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-900">Vorher</span>
      <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-900">Nachher</span>
      <span className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3 py-1 text-xs text-white">Beispielbild</span>
      <input
        type="range"
        min={0}
        max={100}
        value={wert}
        onChange={(e) => setWert(Number(e.target.value))}
        aria-label={`${titel}: vorher und nachher vergleichen`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

/** Gutschein mit Betragswahl */
export function Gutschein({ betrieb, fuer }: { betrieb: Betrieb; fuer: string }) {
  const [betrag, setBetrag] = useState("50 €");
  const [fertig, setFertig] = useState(false);
  return (
    <div className="grid overflow-hidden rounded-[28px] bg-[color-mix(in_srgb,var(--b-akzent)_9%,var(--b-bg))] md:grid-cols-2">
      <div className="p-8 sm:p-14">
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-[var(--b-akzent)]">Gutscheine</p>
        <h2 className="mt-3 text-4xl leading-[1.05] sm:text-5xl" style={{ fontFamily: "var(--b-titel)" }}>Freude verschenken.</h2>
        <p className="mt-4 max-w-sm text-[var(--b-muted)]">Betrag wählen – als PDF per E-Mail oder schön verpackt zum Abholen.</p>
        {fertig ? (
          <Danke text={`Gutschein über ${betrag} bestellt`} zurueck={() => setFertig(false)} />
        ) : (
          <>
            <div className="mt-7 inline-flex flex-wrap gap-1 rounded-full bg-[var(--b-flaeche)] p-1">
              {["30 €", "50 €", "80 €", "Wunsch"].map((b) => (
                <button key={b} type="button" aria-pressed={b === betrag} onClick={() => setBetrag(b)} className={`min-h-10 rounded-full px-4 text-sm font-semibold ${b === betrag ? "bg-[var(--b-akzent)] text-[var(--b-auf)]" : "text-[var(--b-muted)]"}`}>
                  {b}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setFertig(true)} className={`${knopf} mt-6 !w-auto`}>
              <Icon name="geschenk" />
              Gutschein bestellen
            </button>
          </>
        )}
      </div>
      <div aria-hidden className="grid min-h-64 place-items-center bg-[linear-gradient(135deg,var(--b-akzent),var(--b-tief))] p-8">
        <div className="flex h-52 w-full max-w-sm -rotate-[5deg] flex-col justify-between rounded-2xl border border-white/35 bg-white/15 p-6 text-white shadow-2xl backdrop-blur">
          <span className="text-xs uppercase tracking-[0.18em]">Gutschein · {betrieb.name}</span>
          <b className="text-6xl font-normal" style={{ fontFamily: "var(--b-titel)" }}>{betrag === "Wunsch" ? "€ …" : betrag}</b>
          <span className="text-sm opacity-80">{fuer}</span>
        </div>
      </div>
    </div>
  );
}

/** Rückruf-Service */
export function Rueckruf() {
  const [fertig, setFertig] = useState(false);
  if (fertig) return <Danke text="Wir rufen Sie heute noch zurück." zurueck={() => setFertig(false)} />;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setFertig(true);
      }}
      className="mt-5"
    >
      <label className="sr-only" htmlFor="rueckruf-nummer">Ihre Telefonnummer</label>
      <input id="rueckruf-nummer" required inputMode="tel" autoComplete="off" placeholder="Ihre Telefonnummer" className={feld} />
      <button className={`${knopf} mt-3`}>
        <Icon name="rueckruf" />
        Rückruf anfordern
      </button>
    </form>
  );
}
