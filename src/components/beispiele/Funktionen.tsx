"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { euroGanz, type Betrieb, type Funktion } from "@/lib/beispiele";

/*
 * Die Hauptfunktion einer Branche (Preise nach Länge, Live-Wartezeit, Speisekarte …).
 * Farben kommen von außen über CSS-Variablen, damit sie in jedes Design passt:
 * --f-flaeche, --f-ink, --f-muted, --f-linie, --f-akzent, --f-auf
 */

const v = (n: string) => `var(--f-${n})`;
const karte: CSSProperties = { background: v("flaeche"), borderColor: v("linie"), color: v("ink") };
const leise: CSSProperties = { color: v("muted") };
const akzentText: CSSProperties = { color: v("akzent") };
const voll: CSSProperties = { background: v("akzent"), color: v("auf") };
const euro = (n: number) => n.toLocaleString("de-AT", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " €";

const knopf = "inline-flex min-h-12 items-center justify-center rounded-full px-6 font-semibold transition hover:brightness-110 active:scale-[.98]";
const chip = "min-h-11 rounded-full border px-4 text-sm font-semibold transition";

function Chip({ an, onClick, children }: { an: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={an} onClick={onClick} className={chip} style={an ? { ...voll, borderColor: v("akzent") } : { borderColor: v("linie"), color: v("ink") }}>
      {children}
    </button>
  );
}

function Fertig({ titel, text, zurueck }: { titel: string; text: string; zurueck: () => void }) {
  return (
    <div role="status" className="py-6 text-center">
      <p className="mx-auto grid h-14 w-14 place-items-center rounded-full text-2xl" style={voll}>✓</p>
      <p className="mt-4 text-xl font-semibold">{titel}</p>
      <p className="mt-1" style={leise}>{text}</p>
      <p className="mt-3 text-xs" style={leise}>Beispiel – es wurde nichts gesendet.</p>
      <button type="button" onClick={zurueck} className="mt-4 text-sm font-semibold underline" style={akzentText}>
        Noch einmal ausprobieren
      </button>
    </div>
  );
}

const TAGE = ["Heute", "Morgen", "Fr", "Sa", "Mo"];

/* ---------------------------------------------------------------- Preise */
function Preistabelle({ f, ziel, aktion }: { f: Extract<Funktion, { art: "preistabelle" }>; ziel: string; aktion: string }) {
  const [spalte, setSpalte] = useState(1);
  return (
    <div className="rounded-3xl border p-5 sm:p-8" style={karte}>
      <div role="group" aria-label="Auswahl" className="flex flex-wrap gap-2">
        {f.spalten.map((s, i) => (
          <Chip key={s} an={i === spalte} onClick={() => setSpalte(i)}>
            {s}
          </Chip>
        ))}
      </div>
      <ul className="mt-6 divide-y" style={{ borderColor: v("linie") }}>
        {f.zeilen.map((z) => {
          const p = z.preise[spalte];
          return (
            <li key={z.name} className="flex items-baseline justify-between gap-4 py-3.5" style={{ borderColor: v("linie") }}>
              <span>{z.name}</span>
              <span className="whitespace-nowrap text-xl font-semibold tabular-nums" style={p == null ? leise : akzentText}>
                {p == null ? "–" : euroGanz(p)}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {f.hinweis && <p className="text-sm" style={leise}>{f.hinweis}</p>}
        <a href={ziel} className={knopf} style={voll}>
          {aktion}
        </a>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Wartezeit */
function Wartezeit({ f, ziel }: { f: Extract<Funktion, { art: "wartezeit" }>; ziel: string }) {
  const [name, setName] = useState("");
  const [bis, setBis] = useState<string | null>(null);
  if (bis) return <div className="rounded-3xl border p-6" style={karte}><Fertig titel={`Bis gleich, ${name}!`} text={`Wir halten Ihnen den Platz bis ${bis} Uhr.`} zurueck={() => setBis(null)} /></div>;
  return (
    <div className="grid gap-4 rounded-3xl border p-5 sm:grid-cols-[1fr_1.2fr] sm:p-8" style={karte}>
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold" style={akzentText}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: v("akzent") }} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: v("akzent") }} />
          </span>
          Live
        </p>
        <p className="mt-3 text-sm" style={leise}>Wartezeit gerade</p>
        <p className="text-6xl font-bold tabular-nums">
          ~{f.minuten}
          <span className="text-2xl font-semibold"> Min.</span>
        </p>
        <p className="mt-2" style={leise}>
          {f.vorIhnen} vor Ihnen · {f.stuehle} Stühle besetzt
        </p>
        <div aria-hidden className="mt-4 flex gap-2">
          {Array.from({ length: f.stuehle + 1 }, (_, i) => (
            <span key={i} className="h-2 flex-1 rounded-full" style={{ background: i < f.stuehle ? v("akzent") : v("linie") }} />
          ))}
        </div>
      </div>
      <form
        className="rounded-2xl p-5"
        style={{ background: `color-mix(in srgb, ${v("akzent")} 10%, transparent)` }}
        onSubmit={(e) => {
          e.preventDefault();
          const d = new Date(Date.now() + (f.minuten + 15) * 60000);
          setBis(d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }));
        }}
      >
        <p className="font-semibold">Ich komme vorbei</p>
        <p className="mt-1 text-sm" style={leise}>Wir setzen Sie auf die Liste – kommen Sie einfach rein.</p>
        <label className="mt-4 block text-sm font-semibold">
          Ihr Vorname
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            className="mt-1 block min-h-11 w-full rounded-xl border bg-transparent px-3 text-base focus:outline-none focus:ring-2"
            style={{ borderColor: v("linie"), color: v("ink") }}
          />
        </label>
        <button className={`${knopf} mt-4 w-full`} style={voll}>
          Platz sichern
        </button>
        <a href={ziel} className="mt-3 block text-center text-sm font-semibold underline" style={akzentText}>
          Lieber fixen Termin buchen
        </a>
      </form>
    </div>
  );
}

/* --------------------------------------------- Speisekarte & Bestellung */
function Speisekarte({ f }: { f: Extract<Funktion, { art: "speisekarte" }> }) {
  const [kat, setKat] = useState(0);
  const [korb, setKorb] = useState<Record<string, number>>({});
  const [weg, setWeg] = useState<"abholen" | "liefern">("abholen");
  const [personen, setPersonen] = useState(2);
  const [tag, setTag] = useState(0);
  const [zeit, setZeit] = useState<string | null>(null);
  const [fertig, setFertig] = useState(false);
  const alle = f.kategorien.flatMap((k) => k.gerichte);
  const stueck = Object.values(korb).reduce((s, n) => s + n, 0);
  const summe = alle.reduce((s, g) => s + (korb[g.name] ?? 0) * g.preis, 0);
  const bestellen = f.modus === "bestellen";
  const plus = (n: string, d: number) => setKorb((k) => ({ ...k, [n]: Math.max(0, (k[n] ?? 0) + d) }));

  const zurueck = () => {
    setFertig(false);
    setKorb({});
    setZeit(null);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-3xl border p-5 sm:p-8" style={karte}>
        <div role="tablist" aria-label="Kategorien" className="flex flex-wrap gap-2">
          {f.kategorien.map((k, i) => (
            <Chip key={k.name} an={i === kat} onClick={() => setKat(i)}>
              {k.name}
            </Chip>
          ))}
        </div>
        <ul className="mt-5 divide-y" role="tabpanel">
          {f.kategorien[kat].gerichte.map((g) => {
            const n = korb[g.name] ?? 0;
            return (
              <li key={g.name} className="flex items-center gap-4 py-3.5" style={{ borderColor: v("linie") }}>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{g.name}</p>
                  {g.text && <p className="text-sm" style={leise}>{g.text}</p>}
                </div>
                <p className="font-semibold tabular-nums" style={akzentText}>{euro(g.preis)}</p>
                {bestellen && (
                  <div className="flex items-center gap-2">
                    {n > 0 && (
                      <>
                        <button type="button" aria-label={`${g.name} weniger`} onClick={() => plus(g.name, -1)} className="grid h-9 w-9 place-items-center rounded-full border" style={{ borderColor: v("linie") }}>
                          −
                        </button>
                        <span className="w-4 text-center font-semibold tabular-nums">{n}</span>
                      </>
                    )}
                    <button type="button" aria-label={`${g.name} hinzufügen`} onClick={() => plus(g.name, 1)} className="grid h-9 w-9 place-items-center rounded-full text-lg font-bold" style={voll}>
                      +
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-3xl border p-5 sm:p-8 lg:sticky lg:top-24 lg:self-start" style={karte}>
        {fertig ? (
          bestellen ? (
            <Fertig titel="Bestellung ist da!" text={weg === "abholen" ? `${stueck} Artikel · in ca. 10 Min. abholbereit` : `${stueck} Artikel · Lieferung in ca. 35 Min.`} zurueck={zurueck} />
          ) : (
            <Fertig titel="Tisch ist reserviert!" text={`${personen} Personen · ${TAGE[tag]} um ${zeit} Uhr`} zurueck={zurueck} />
          )
        ) : bestellen ? (
          <>
            <p className="text-lg font-semibold">Ihre Bestellung</p>
            <div role="group" aria-label="Abholen oder liefern" className="mt-4 grid grid-cols-2 gap-2">
              <Chip an={weg === "abholen"} onClick={() => setWeg("abholen")}>Abholen</Chip>
              <Chip an={weg === "liefern"} onClick={() => setWeg("liefern")}>Liefern</Chip>
            </div>
            {stueck === 0 ? (
              <p className="mt-5 text-sm" style={leise}>Tippen Sie auf +, um etwas in den Warenkorb zu legen.</p>
            ) : (
              <ul className="mt-5 space-y-1.5 text-sm">
                {alle.filter((g) => korb[g.name]).map((g) => (
                  <li key={g.name} className="flex justify-between gap-3">
                    <span>{korb[g.name]} × {g.name}</span>
                    <span className="tabular-nums">{euro(korb[g.name] * g.preis)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-5 flex justify-between border-t pt-4 text-lg font-semibold" style={{ borderColor: v("linie") }}>
              <span>Summe</span>
              <span className="tabular-nums">{euro(summe + (weg === "liefern" && stueck ? 2.5 : 0))}</span>
            </p>
            {weg === "liefern" && <p className="text-xs" style={leise}>inkl. 2,50 € Lieferung</p>}
            <button type="button" disabled={stueck === 0} onClick={() => setFertig(true)} className={`${knopf} mt-5 w-full disabled:opacity-40`} style={voll}>
              {weg === "abholen" ? "Zum Abholen bestellen" : "Liefern lassen"}
            </button>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold">Tisch reservieren</p>
            <p className="mt-4 text-sm font-semibold" style={leise}>Personen</p>
            <div className="mt-2 flex items-center gap-4">
              <button type="button" aria-label="eine Person weniger" disabled={personen <= 1} onClick={() => setPersonen(personen - 1)} className="grid h-11 w-11 place-items-center rounded-full border text-xl disabled:opacity-40" style={{ borderColor: v("linie") }}>
                −
              </button>
              <span className="w-8 text-center text-3xl font-semibold tabular-nums" aria-live="polite">{personen}</span>
              <button type="button" aria-label="eine Person mehr" disabled={personen >= 12} onClick={() => setPersonen(personen + 1)} className="grid h-11 w-11 place-items-center rounded-full text-xl" style={voll}>
                +
              </button>
            </div>
            <p className="mt-5 text-sm font-semibold" style={leise}>Tag</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TAGE.map((t, i) => (
                <Chip key={t} an={i === tag} onClick={() => setTag(i)}>{t}</Chip>
              ))}
            </div>
            <p className="mt-5 text-sm font-semibold" style={leise}>Uhrzeit</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["8:30", "9:30", "10:30", "12:00", "14:00", "15:30"].map((z) => (
                <Chip key={z} an={z === zeit} onClick={() => setZeit(z)}>{z}</Chip>
              ))}
            </div>
            <button type="button" disabled={!zeit} onClick={() => setFertig(true)} className={`${knopf} mt-6 w-full disabled:opacity-40`} style={voll}>
              Tisch reservieren
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------- Projekte (vorher/nachher) */
function VorherNachher({ vorher, nachher, titel }: { vorher: string; nachher: string; titel: string }) {
  const [wert, setWert] = useState(50);
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
      <div className="absolute inset-0" style={{ background: nachher }} />
      <div className="absolute inset-0" style={{ background: vorher, clipPath: `inset(0 ${100 - wert}% 0 0)` }} />
      <div aria-hidden className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${wert}%` }} />
      <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">Vorher</span>
      <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">Nachher</span>
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

function Projekte({ f }: { f: Extract<Funktion, { art: "projekte" }> }) {
  const [datei, setDatei] = useState<string | null>(null);
  const [fertig, setFertig] = useState(false);
  return (
    <div>
      <ul className="grid gap-4 md:grid-cols-3">
        {f.projekte.map((p) => (
          <li key={p.titel} className="rounded-3xl border p-3" style={karte}>
            <VorherNachher vorher={p.vorher} nachher={p.nachher} titel={p.titel} />
            <div className="p-2 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider" style={akzentText}>{p.ort}</p>
              <p className="mt-1 text-lg font-semibold">{p.titel}</p>
              <p className="mt-1 text-sm" style={leise}>{p.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid gap-6 rounded-3xl border p-5 sm:p-8 md:grid-cols-2" style={karte}>
        <div>
          <p className="text-lg font-semibold">Wir kommen zu Ihnen</p>
          <p className="mt-1 text-sm" style={leise}>Unser Einsatzgebiet:</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {f.gebiet.map((g) => (
              <li key={g} className="rounded-full border px-3 py-1.5 text-sm" style={{ borderColor: v("linie") }}>
                📍 {g}
              </li>
            ))}
          </ul>
        </div>
        {fertig ? (
          <Fertig titel="Danke für Ihre Anfrage!" text="Wir melden uns innerhalb von 2 Werktagen mit einem Angebot." zurueck={() => { setFertig(false); setDatei(null); }} />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setFertig(true);
            }}
            className="space-y-3"
          >
            <p className="text-lg font-semibold">Anfrage mit Foto</p>
            <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center text-sm" style={{ borderColor: v("linie") }}>
              <span aria-hidden className="text-2xl">📷</span>
              <span className="mt-1 font-semibold" style={akzentText}>{datei ?? "Foto auswählen"}</span>
              <span style={leise}>{datei ? "Foto ausgewählt" : "z. B. die alte Küche oder die Ecke für den Schrank"}</span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => setDatei(e.target.files?.[0]?.name ?? null)} />
            </label>
            <textarea
              required
              rows={2}
              placeholder="Was dürfen wir für Sie bauen?"
              className="block w-full rounded-xl border bg-transparent px-3 py-2 text-base focus:outline-none focus:ring-2"
              style={{ borderColor: v("linie"), color: v("ink") }}
            />
            <button className={`${knopf} w-full`} style={voll}>
              Anfrage senden
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Termin */
function Termin({ f, betrieb }: { f: Extract<Funktion, { art: "termin" }>; betrieb: Betrieb }) {
  const [leistung, setLeistung] = useState(betrieb.leistungen[0].id);
  const [tag, setTag] = useState(1);
  const [zeit, setZeit] = useState<string | null>(null);
  const [fertig, setFertig] = useState(false);
  const l = betrieb.leistungen.find((x) => x.id === leistung)!;
  // Ein paar Zeiten sind schon „vergeben“ – immer gleich je Tag
  const zeiten = ["8:00", "9:30", "11:00", "13:30", "15:00", "16:30", "18:00"].map((z, i) => ({ z, frei: (i + tag) % 3 !== 0 }));
  if (fertig && zeit) {
    return (
      <div className="rounded-3xl border p-6" style={karte}>
        <Fertig titel={betrieb.buchung.erledigt} text={`${l.name} · ${TAGE[tag]} um ${zeit} Uhr`} zurueck={() => { setFertig(false); setZeit(null); }} />
      </div>
    );
  }
  return (
    <div className="grid gap-6 rounded-3xl border p-5 sm:p-8 md:grid-cols-2" style={karte}>
      <div>
        <p className="text-sm font-semibold" style={leise}>1 · {betrieb.buchung.schritt}</p>
        <ul className="mt-3 space-y-2">
          {betrieb.leistungen.map((x) => (
            <li key={x.id}>
              <button
                type="button"
                aria-pressed={x.id === leistung}
                onClick={() => setLeistung(x.id)}
                className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border px-4 text-left transition"
                style={x.id === leistung ? { borderColor: v("akzent"), background: `color-mix(in srgb, ${v("akzent")} 12%, transparent)` } : { borderColor: v("linie") }}
              >
                <span className="font-semibold">{x.name}</span>
                <span className="text-sm tabular-nums" style={leise}>
                  {x.dauer ? `${x.dauer} Min. · ` : ""}
                  {x.preis ? `ab ${euroGanz(x.preis)}` : "gratis"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-sm font-semibold" style={leise}>2 · Tag</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TAGE.map((t, i) => (
            <Chip key={t} an={i === tag} onClick={() => { setTag(i); setZeit(null); }}>{t}</Chip>
          ))}
        </div>
        <p className="mt-6 text-sm font-semibold" style={leise}>3 · Uhrzeit</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {zeiten.map(({ z, frei }) => (
            <button
              key={z}
              type="button"
              disabled={!frei}
              aria-pressed={z === zeit}
              onClick={() => setZeit(z)}
              className="min-h-11 rounded-xl border text-sm font-semibold transition disabled:line-through disabled:opacity-35"
              style={z === zeit ? { ...voll, borderColor: v("akzent") } : { borderColor: v("linie") }}
            >
              {z}
            </button>
          ))}
        </div>
        <button type="button" disabled={!zeit} onClick={() => setFertig(true)} className={`${knopf} mt-6 w-full disabled:opacity-40`} style={voll}>
          {betrieb.aktion}
        </button>
        {f.hinweis && <p className="mt-3 text-center text-sm" style={leise}>{f.hinweis}</p>}
      </div>
    </div>
  );
}

/** Funktion der Branche (Titel setzt die Seite). `ziel` ist der Anker für „Termin buchen“ o. Ä. */
export function BranchenFunktion({ betrieb, ziel }: { betrieb: Betrieb; ziel: string }) {
  const f = betrieb.funktion;
  return (
    <div>
      {f.art === "preistabelle" && <Preistabelle f={f} ziel={ziel} aktion={betrieb.aktion} />}
      {f.art === "wartezeit" && <Wartezeit f={f} ziel={ziel} />}
      {f.art === "speisekarte" && <Speisekarte f={f} />}
      {f.art === "projekte" && <Projekte f={f} />}
      {f.art === "termin" && <Termin f={f} betrieb={betrieb} />}
    </div>
  );
}
