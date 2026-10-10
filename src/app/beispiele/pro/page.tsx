import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { BranchenFunktion } from "@/components/beispiele/Funktionen";
import { Icon } from "@/components/beispiele/Icon";
import { OffenStatus } from "@/components/beispiele/OffenStatus";
import { ProBuchung } from "@/components/beispiele/ProBuchung";
import { ProChat } from "@/components/beispiele/ProChat";
import { ProDemoChat } from "@/components/beispiele/ProDemoChat";
import { ProKino } from "@/components/beispiele/ProKino";
import { ProWasserBild } from "@/components/beispiele/ProWasserBild";
import { abPreis, betriebAusSuche, extrasFuer, galerieFuer } from "@/lib/beispiele";
import "./pro.css";

export const metadata: Metadata = { title: "Beispiel: Pro" };

const grotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-grotesk" });

const sterne = (n: number) => n.toLocaleString("de-AT", { minimumFractionDigits: 1 });

// Pro „Kino“: das volle Programm – Vorspann, WebGL-Foto, Scroll-Effekte, Online-Buchung, KI-Assistentin.
export default async function ProBeispiel({ searchParams }: PageProps<"/beispiele/pro">) {
  const betrieb = await betriebAusSuche(searchParams);
  const [a, b, c] = betrieb.stil.pro;
  const farben = {
    "--pro-a": a,
    "--pro-b": b,
    "--pro-c": c,
    "--f-flaeche": "rgba(255,255,255,.05)",
    "--f-ink": "#f4f4f8",
    "--f-muted": "rgba(244,244,248,.62)",
    "--f-linie": "rgba(255,255,255,.12)",
    "--f-akzent": a,
    "--f-auf": "#ffffff",
  } as CSSProperties;
  const extras = extrasFuer(betrieb);
  const galerie = galerieFuer(betrieb);
  const fotos = [betrieb.bild?.einblick, betrieb.bild?.hero].filter((x): x is string => !!x);
  const foto = (i: number) => (fotos.length ? `center / cover url(${fotos[i % fotos.length]})` : betrieb.galerie[i % betrieb.galerie.length].farbe);
  const titel = "font-bold leading-[0.88] tracking-[-0.055em]";
  const h2 = `${titel} text-[clamp(3.2rem,8vw,8.5rem)]`;
  const kick = "text-[12.5px] font-semibold uppercase tracking-[0.24em] text-[color-mix(in_srgb,var(--pro-a)_50%,white)]";
  const knopf = "pro-knopf inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-8 font-bold";
  const voll = `${knopf} bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white shadow-[0_20px_60px_-20px_var(--pro-a)]`;
  const leer = `${knopf} border border-white/25`;
  const ablauf = [
    { t: `${betrieb.aktion} – online`, x: betrieb.buchung.text },
    { t: "Bestätigung & Erinnerung", x: "Sie bekommen sofort eine Bestätigung per E-Mail und am Vortag eine Erinnerung. Umbuchen geht mit einem Klick." },
    { t: "Willkommen", x: betrieb.slogan },
  ];
  const beliebt = betrieb.leistungen.slice(0, 3);
  const offen = betrieb.oeffnungszeiten.filter((o) => o.zeit !== "geschlossen");

  return (
    <div className={`${grotesk.variable} pro-seite relative flex-1`} style={farben}>
      <ProKino />

      {/* Vorspann */}
      <div data-vorspann aria-hidden className="pro-vorspann">
        <i />
        <i />
        <b data-vorspann-zahl className="relative text-[22vw] font-bold leading-none tracking-[-0.06em]">0</b>
        <small className="absolute bottom-10 left-10 text-xs tracking-[0.3em]">
          {betrieb.name.toUpperCase()} — WIEN-{betrieb.bezirk.toUpperCase()}
        </small>
      </div>
      <noscript>
        <style>{".pro-vorspann{display:none}"}</style>
      </noscript>

      <header data-pro-kopf className="absolute inset-x-0 top-auto z-50 mix-blend-difference md:fixed md:top-0">
        <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-10 sm:py-6">
          <p className="text-xl font-bold tracking-[0.04em] sm:text-2xl">{betrieb.marke}®</p>
          <nav aria-label="Beispiel-Navigation" className="hidden gap-9 text-[13px] uppercase tracking-[0.18em] md:flex">
            <a href="#salon">Salon</a>
            <a href="#leistungen">Leistungen</a>
            <a href="#ablauf">Ablauf</a>
            <a href="#buchen">{betrieb.aktionKurz}</a>
          </nav>
          <a href="#buchen" data-magnet className={`${leer} !min-h-11 !px-5 text-sm`}>
            {betrieb.aktion}
          </a>
        </div>
      </header>

      {/* Held: WebGL-Foto mit riesigem Titel */}
      <section data-held className="relative h-[calc(100svh-2.5rem)] min-h-[600px] overflow-hidden">
        {betrieb.bild ? <ProWasserBild bild={betrieb.bild.hero} /> : <div aria-hidden className="absolute inset-0" style={{ background: betrieb.heroFarbe }} />}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,transparent,rgba(7,7,12,.78)_80%),linear-gradient(180deg,rgba(7,7,12,.4),transparent_30%,rgba(7,7,12,.88))]" />
        <h1 className={`${titel} pointer-events-none absolute bottom-36 left-5 right-5 text-[clamp(3.6rem,11.5vw,12rem)] sm:bottom-32 sm:left-10`}>
          <span className="block overflow-hidden"><span data-titel-wort className="inline-block">{betrieb.proHero[0]}</span></span>
          <span className="block overflow-hidden pb-[0.06em]"><span data-titel-wort className="pro-verlauf-text inline-block">{betrieb.proHero[1]}</span></span>
          <span className="block overflow-hidden"><span data-titel-wort className="inline-block">{betrieb.proHero[2]}</span></span>
        </h1>
        <p data-held-info className="absolute right-10 top-32 hidden max-w-[300px] text-right text-white/65 lg:block">{betrieb.einleitung}</p>
        <div data-held-info className="absolute inset-x-5 bottom-10 flex flex-wrap items-center gap-x-8 gap-y-4 sm:inset-x-10">
          <a href="#buchen" data-magnet className={`${voll} !min-h-13`}>
            {betrieb.aktion}
            <span className="hidden sm:inline"> in 20 Sekunden</span>
          </a>
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">
            ★ {sterne(betrieb.bewertung.sterne)} · {betrieb.bewertung.anzahl} Bewertungen
          </p>
          <p className="hidden text-xs uppercase tracking-[0.24em] text-white/60 md:block">Scrollen ↓</p>
        </div>
      </section>

      {/* Laufband */}
      <div aria-hidden className="overflow-hidden whitespace-nowrap border-y border-white/10 py-10 sm:py-14">
        <div data-band className="inline-flex text-[clamp(3rem,8vw,8.5rem)] font-bold leading-none tracking-[-0.04em]">
          {[0, 1].map((k) =>
            betrieb.leistungen.map((l, i) => (
              <span key={`${k}-${l.id}`} className="flex items-center">
                <span className={`px-[0.3em] ${i % 2 ? "pro-hohl" : ""}`}>{l.name}</span>
                <span className="text-[var(--pro-a)]">✦</span>
              </span>
            )),
          )}
        </div>
      </div>

      {/* Manifest */}
      <section id="salon" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-36 sm:px-10 sm:py-52">
        <p data-manifest className="text-[clamp(2rem,4.6vw,4.4rem)] font-semibold leading-[1.08] tracking-[-0.035em]">
          {betrieb.slogan}{" "}
          <span aria-hidden className="inline-block h-[0.8em] w-[1.9em] rounded-full align-[-0.06em]" style={{ background: foto(0) }} /> {betrieb.einleitung}
        </p>
      </section>

      {/* Galerie, die seitwärts fährt */}
      <section data-quer aria-label="Galerie" className="relative overflow-x-auto md:h-screen md:overflow-hidden" style={{ scrollbarWidth: "none" }}>
        <div data-quer-spur className="flex h-full items-center gap-[3vw] px-5 py-10 md:px-10 md:py-0">
          <div className="w-[78vw] shrink-0 md:w-[34vw]">
            <p className={kick}>Galerie</p>
            <h2 className={`${titel} mt-5 text-[clamp(3rem,6.5vw,7rem)]`}>Einfach mal reinschauen.</h2>
            <p className="mt-6 hidden max-w-xs text-white/60 md:block">Die Seite bleibt stehen – die Bilder fahren vorbei und kippen mit Ihrem Tempo.</p>
            <p className="mt-6 text-white/60 md:hidden">Zur Seite wischen →</p>
          </div>
          {galerie.map((g, i) => (
            <figure
              key={g.titel + i}
              data-quer-karte
              className={`relative shrink-0 overflow-hidden rounded-[26px] ${i % 2 ? "h-[52vh] w-[70vw] md:h-[58vh] md:w-[32vw]" : "h-[60vh] w-[82vw] md:h-[72vh] md:w-[44vw]"}`}
            >
              <div data-quer-bild className="absolute -inset-x-[15%] -inset-y-[8%]" style={{ background: g.bild ? `center / cover url(${g.bild})` : g.farbe }} />
              <figcaption className="absolute inset-x-6 bottom-5 flex items-end justify-between">
                <b className="text-4xl tracking-[-0.03em] drop-shadow-[0_2px_12px_rgba(0,0,0,.5)]">{g.titel}</b>
                <small className="text-white/70">{String(i + 1).padStart(2, "0")}</small>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Die Funktion der Branche */}
      <section id="angebot" className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-32 sm:px-10 sm:pt-44">
        <p className={kick}>Gleich ausprobieren</p>
        <h2 data-h2 className={`${titel} mt-5 text-[clamp(2.8rem,6vw,6rem)]`}>{betrieb.funktion.titel}</h2>
        <p className="mb-10 mt-5 max-w-2xl text-lg text-white/60">{betrieb.funktion.text}</p>
        <div data-rein>
          <BranchenFunktion betrieb={betrieb} ziel="#buchen" />
        </div>
      </section>

      {/* Leistungen: drei Karten in 3D und alle Zeilen mit Foto unter der Maus */}
      <section id="leistungen" className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-32 sm:px-10 sm:pt-48">
        <p className={kick}>Leistungen & Preise</p>
        <h2 data-h2 className={`${h2} mt-5`}>Was wir können.</h2>
        <ul className="mt-14 grid gap-5 [perspective:1200px] md:grid-cols-3">
          {beliebt.map((l, i) => (
            <li
              key={l.id}
              data-tilt
              data-rein
              className={`pro-licht relative flex min-h-[380px] flex-col overflow-hidden rounded-[28px] border p-8 [transform-style:preserve-3d] ${
                i === 1 ? "border-transparent bg-[linear-gradient(160deg,var(--pro-b),color-mix(in_srgb,var(--pro-b)_45%,black))]" : "border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,.09),rgba(255,255,255,.02))]"
              }`}
            >
              <span className={`text-sm uppercase tracking-[0.2em] ${i === 1 ? "text-white" : "text-[color-mix(in_srgb,var(--pro-a)_50%,white)]"}`}>
                {l.name}
                {i === 1 ? " · beliebt" : ""}
              </span>
              <span className="mt-6 text-7xl font-bold tracking-[-0.06em] [transform:translateZ(50px)]">{l.preis ? `${l.preis} €` : "gratis"}</span>
              <span className="mt-1 text-white/65">{l.preis ? "ab" : ""}{l.dauer ? ` · ${l.dauer} Min.` : ""}</span>
              <p className="mt-6 text-white/80">✦ {l.text}</p>
              <a href="#buchen" className={`${i === 1 ? "bg-white text-black" : "border border-white/25"} mt-auto inline-flex min-h-12 items-center justify-center rounded-full font-bold`}>
                {betrieb.aktionKurz === "Termin" ? "Buchen" : betrieb.aktionKurz}
              </a>
            </li>
          ))}
        </ul>
        <ul className="mt-20">
          {betrieb.leistungen.map((l, i) => (
            <li
              key={l.id}
              data-zeile
              data-bild={foto(i)}
              className="pro-zeile relative isolate grid grid-cols-[40px_1fr_auto] items-center gap-4 border-t border-white/12 px-1 py-7 last:border-b sm:grid-cols-[80px_1fr_auto_64px] sm:gap-8 sm:py-9"
            >
              <span className="text-sm text-white/50">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <b className="block text-[clamp(1.6rem,3.2vw,3.2rem)] font-semibold leading-tight tracking-[-0.03em]">{l.name}</b>
                <small className="text-white/60">{l.text}</small>
              </span>
              <span className="text-xl font-semibold sm:text-3xl">{abPreis(l.preis)}</span>
              <span aria-hidden className="hidden h-14 w-14 place-items-center rounded-full border border-white/20 sm:grid">
                <Icon name="pfeil" className="h-5 w-5 -rotate-45" />
              </span>
            </li>
          ))}
        </ul>
        <div data-folgebild aria-hidden className="pointer-events-none fixed left-0 top-0 z-40 -ml-[150px] -mt-[190px] h-[380px] w-[300px] scale-[.6] overflow-hidden rounded-[22px] opacity-0">
          <div className="h-full w-full" />
        </div>
      </section>

      {/* Riesenschrift-Maske: Flug in den Namen */}
      {fotos.length > 0 && (
        <section data-deck-sek aria-label={betrieb.vertrauen} className="relative mt-40 h-screen overflow-hidden">
          <div aria-hidden className="absolute inset-0" style={{ background: foto(0) }} />
          <div data-deck aria-hidden className="pro-deck absolute inset-0 grid origin-[44%_55%] place-items-center bg-[#07070c] font-bold leading-none tracking-[-0.06em] text-white" style={{ fontSize: `${Math.min(30, 120 / betrieb.marke.length)}vw` }}>
            {betrieb.marke}
          </div>
          <div data-deck-text className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07070c]/90 to-transparent px-5 pb-[12vh] pt-[30vh] text-center">
            <p className={kick}>{betrieb.vertrauen}</p>
            <p className="mt-4 text-[clamp(2.2rem,5vw,5rem)] font-bold tracking-[-0.04em]">{betrieb.slogan}</p>
          </div>
        </section>
      )}

      {/* Ablauf: Karten stapeln sich */}
      <section id="ablauf" className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-32 sm:px-10 sm:pt-48">
        <p className={kick}>Ablauf</p>
        <h2 data-h2 className={`${h2} mb-16 mt-5`}>So läuft es ab.</h2>
        {ablauf.map((s, i) => (
          <div
            key={s.t}
            data-stapel-karte
            className={`sticky mb-[5vh] grid min-h-[480px] origin-top grid-rows-[minmax(0,1fr)] overflow-hidden rounded-[32px] md:h-[70vh] md:grid-cols-2 ${
              i === 2 ? "bg-[linear-gradient(135deg,var(--pro-b),var(--pro-c))]" : i ? "bg-[color-mix(in_srgb,var(--pro-b)_16%,#0c0a10)]" : "bg-[color-mix(in_srgb,var(--pro-b)_9%,#0c0a10)]"
            }`}
            style={{ top: `${100 + i * 30}px` }}
          >
            <div className="flex flex-col justify-between p-8 sm:p-14">
              <span className={`text-[120px] font-bold leading-[0.8] tracking-[-0.06em] sm:text-[150px] ${i === 2 ? "" : "pro-verlauf-text"}`}>0{i + 1}</span>
              <div>
                <h3 className="text-4xl font-semibold leading-none tracking-[-0.04em] sm:text-5xl">{s.t}</h3>
                <p className="mt-4 max-w-md text-lg text-white/75">{s.x}</p>
              </div>
            </div>
            <div aria-hidden className="hidden md:block" style={{ background: foto(i) }} />
          </div>
        ))}
      </section>

      {/* Vorher/Nachher wischt beim Scrollen */}
      {extras.vorherNachher && betrieb.bild?.einblick && (
        <section data-wisch-sek aria-label="Vorher und nachher" className="relative mt-32 h-screen overflow-hidden">
          <div aria-hidden className="absolute inset-0 brightness-[.55] contrast-[.9] grayscale" style={{ background: `center / cover url(${betrieb.bild.einblick})` }} />
          <div data-wisch-neu aria-hidden className="absolute inset-0 [clip-path:inset(0_50%_0_0)]" style={{ background: `center / cover url(${betrieb.bild.einblick})` }} />
          <div data-wisch-linie aria-hidden className="absolute inset-y-0 left-1/2 w-[3px] bg-gradient-to-b from-fuchsia-500 to-cyan-400 shadow-[0_0_30px_var(--pro-a)]" />
          <span className="absolute left-5 top-24 rounded-full bg-black/50 px-4 py-2 text-xs uppercase tracking-[0.24em] backdrop-blur sm:left-10">Vorher</span>
          <span className="absolute right-5 top-24 rounded-full bg-black/50 px-4 py-2 text-xs uppercase tracking-[0.24em] backdrop-blur sm:right-10">Nachher</span>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07070c] to-transparent px-5 pb-12 pt-40 sm:px-10">
            <p className={`${titel} text-[clamp(2.6rem,6vw,6.5rem)]`}>
              Scrollen Sie –<br />
              <span className="pro-verlauf-text">sehen Sie den Unterschied.</span>
            </p>
            <p className="mt-3 text-sm text-white/55">{extras.vorherNachher} · Beispielbild</p>
          </div>
        </section>
      )}

      {/* Zahlen */}
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pt-32 sm:grid-cols-3 sm:px-10 sm:pt-44">
        {betrieb.zahlen.map((z) => (
          <div key={z.text} className="border-t border-white/12 pt-7">
            <p className="text-[clamp(4rem,8vw,8rem)] font-bold leading-[0.9] tracking-[-0.06em]">
              <span data-z={z.zahl} data-komma={z.komma ?? 0}>
                {z.zahl.toLocaleString("de-AT", { minimumFractionDigits: z.komma ?? 0 })}
              </span>
              {z.zahl > 1000 ? "+" : ""}
            </p>
            <p className="mt-3 text-white/60">{z.text}</p>
          </div>
        ))}
      </section>

      {/* Buchung + KI-Assistentin */}
      <section id="buchen" className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-32 sm:px-10 sm:pt-48">
        <h2 data-h2 className={h2}>
          {betrieb.buchung.titel}
          <br />
          <span className="text-[var(--pro-a)]">Ohne Anruf.</span>
        </h2>
        <div className="mt-14 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div data-rein className="rounded-[30px] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,.08),rgba(255,255,255,.02))] p-6 sm:p-9">
            <ProBuchung betrieb={betrieb} />
          </div>
          <div data-rein className="rounded-[30px] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,.08),rgba(255,255,255,.02))] p-6 sm:p-9">
            <p className="font-semibold">✦ KI-Assistentin · rund um die Uhr</p>
            <p className="mt-1 text-sm text-white/50">Beantwortet Fragen sofort – auch um Mitternacht.</p>
            <ProDemoChat betrieb={betrieb} />
          </div>
        </div>
      </section>

      {/* Stimmen */}
      <section className="mx-auto max-w-7xl px-5 pt-32 sm:px-10 sm:pt-48">
        <h2 data-h2 className={h2}>
          <span className="text-[var(--pro-a)]">★ {sterne(betrieb.bewertung.sterne)}</span> von {betrieb.bewertung.anzahl}.
        </h2>
        <p className="mt-4 text-sm text-white/45">Beispielwerte</p>
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {betrieb.bewertungen.map((r) => (
            <li key={r.name} data-rein data-tilt className="pro-licht relative rounded-[26px] border border-white/12 bg-white/[0.04] p-8">
              <p className="text-[var(--pro-a)]">★★★★★</p>
              <p className="mt-4 text-xl leading-snug">„{r.text}“</p>
              <p className="mt-6 text-sm text-white/55">{r.name}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Schluss */}
      <footer className="relative mt-40 overflow-hidden px-5 pb-8 pt-40 sm:px-10">
        <div aria-hidden className="absolute left-1/2 top-[30%] h-[1100px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--pro-a)_42%,transparent),transparent_60%)] blur-[40px]" />
        <p className={`${kick} relative text-center`}>
          {betrieb.strasse} · {betrieb.plz} {betrieb.ort}
        </p>
        <h2 data-h2 className={`${titel} relative mt-5 text-center text-[clamp(3rem,7vw,7.5rem)]`}>{betrieb.abschied}</h2>
        <div className="relative mt-11 flex flex-wrap justify-center gap-3">
          <a href="#buchen" data-magnet className={voll}>{betrieb.aktion}</a>
          <a href={betrieb.telefonLink} data-magnet className={leer}>
            <Icon name="tel" />
            {betrieb.telefon}
          </a>
        </div>
        <div className="relative mx-auto mt-24 grid max-w-6xl gap-8 border-t border-white/12 pt-8 text-white/60 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-white">Heute</p>
            <OffenStatus zeiten={betrieb.oeffnungszeiten} className="mt-2" />
          </div>
          <div>
            <p className="font-semibold text-white">Öffnungszeiten</p>
            {offen.map((o) => (
              <p key={o.tage} className="mt-1">{o.tage} {o.zeit}</p>
            ))}
          </div>
          <div>
            <p className="font-semibold text-white">Kontakt</p>
            <p className="mt-1">{betrieb.telefon}</p>
            <p>{betrieb.email}</p>
          </div>
        </div>
        <p data-riesig aria-hidden className="relative mt-24 flex justify-center overflow-hidden text-[clamp(5rem,27vw,30rem)] font-bold leading-[0.75] tracking-[-0.07em]" style={{ fontSize: `${Math.min(27, 95 / betrieb.marke.length)}vw` }}>
          {Array.from(betrieb.marke).map((z, i) => (
            <span key={i} className="inline-block">{z}</span>
          ))}
        </p>
        <p className="relative mt-8 flex flex-wrap justify-between gap-2 text-[13px] text-white/45">
          <span>© {betrieb.name}</span>
          <span>Impressum · Datenschutz</span>
        </p>
      </footer>

      <ProChat betrieb={betrieb} />
    </div>
  );
}
