import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Anfrage, Gutschein, Rueckruf, StimmenSlider } from "@/components/beispiele/BusinessWidgets";
import { BusinessBewegung } from "@/components/beispiele/BusinessBewegung";
import { BranchenFunktion } from "@/components/beispiele/Funktionen";
import { KartenGrafik } from "@/components/beispiele/KartenGrafik";
import { Icon, Sterne } from "@/components/beispiele/Icon";
import { OffenStatus } from "@/components/beispiele/OffenStatus";
import { BUSINESS_TITEL, GRUNDSCHRIFT, schriftVariablen } from "@/lib/beispiel-schriften";
import { abPreis, betriebAusSuche, betriebSymbol, extrasFuer, galerieFuer, galerieHintergrund, routeLink, type Betrieb, type Stil } from "@/lib/beispiele";

export async function generateMetadata({ searchParams }: PageProps<"/beispiele/business">): Promise<Metadata> {
  const b = await betriebAusSuche(searchParams);
  return { title: `${b.name} · Beispiel Business`, icons: { icon: betriebSymbol(b) } };
}

// Alle Farben kommen aus dem Stil der Branche (CSS-Variablen --b-…, für die Branchen-Funktion --f-…)
function farben(st: Stil) {
  return {
    "--b-bg": st.bg,
    "--b-flaeche": st.flaeche,
    "--b-tief": st.tief,
    "--b-ink": st.ink,
    "--b-muted": st.muted,
    "--b-linie": st.linie,
    "--b-akzent": st.akzent,
    "--b-auf": st.aufAkzent,
    "--b-titel": BUSINESS_TITEL,
    "--f-flaeche": st.flaeche,
    "--f-ink": st.ink,
    "--f-muted": st.muted,
    "--f-linie": st.linie,
    "--f-akzent": st.akzent,
    "--f-auf": st.aufAkzent,
    fontFamily: GRUNDSCHRIFT,
  } as CSSProperties;
}

const NAV: Record<Betrieb["funktion"]["art"], string> = { preistabelle: "Preise", wartezeit: "Wartezeit", speisekarte: "Speisekarte", projekte: "Projekte", termin: "Termin" };

const MARQUEE = `@keyframes b-marq{to{transform:translateX(-50%)}}@keyframes b-sw{50%{transform:translateY(-8px)}}[data-bjs] [data-r]{opacity:0;transform:translateY(34px);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)}[data-bjs] [data-r][data-an]{opacity:1;transform:none}@keyframes b-zoom{from{transform:scale(1.08)}to{transform:scale(1)}}`;

const sterne = (n: number) => n.toLocaleString("de-AT", { minimumFractionDigits: 1 });

// Business „Salon Plus“: die Seite arbeitet mit – anfragen, vergleichen, wiederkommen.
export default async function BusinessBeispiel({ searchParams }: PageProps<"/beispiele/business">) {
  const betrieb = await betriebAusSuche(searchParams);
  const st = betrieb.stil;
  const extras = extrasFuer(betrieb);
  const galerie = galerieFuer(betrieb).slice(0, 5);
  const titel = { fontFamily: "var(--b-titel)" };
  const jahre = new Date().getFullYear() - betrieb.seit;
  const kicker = "text-[12.5px] font-bold uppercase tracking-[0.18em] text-[var(--b-akzent)]";
  const h2 = "mt-3 text-[clamp(2.2rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em]";
  const knopf = "inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full px-7 font-bold transition hover:-translate-y-0.5";
  const voll = `${knopf} bg-[var(--b-akzent)] text-[var(--b-auf)] shadow-[0_14px_28px_-14px_var(--b-akzent)]`;
  const termine = ["Di 11:30", "Mi 14:00", "Do 9:00", "Sa 10:30"];
  const woerter = betrieb.name.split(" ");
  const letztes = woerter.length > 1 ? woerter.pop() : "";
  // Die Funktion der Branche zeigt die Preise schon selbst – dann keine zweite Liste
  const preiseSchon = betrieb.funktion.art === "preistabelle" || betrieb.funktion.art === "speisekarte";
  const laufband = [...betrieb.leistungen.map((l) => l.name), ...betrieb.leistungen.map((l) => l.name)];
  const handle = `@${betrieb.name.toLowerCase().replace(/[^a-z0-9äöü]+/g, "")}`;

  return (
    <div data-bseite className={`${schriftVariablen} flex-1 overflow-x-clip bg-[var(--b-bg)] pb-24 text-[var(--b-ink)] md:pb-0`} style={farben(st)}>
      <style>{MARQUEE}</style>
      <BusinessBewegung />
      <header className="sticky top-0 z-40 border-b border-[var(--b-linie)] bg-[var(--b-bg)]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-6xl items-center gap-8 px-5">
          <p className="text-[22px] font-extrabold tracking-[-0.03em]" style={titel}>
            {woerter.join(" ")} <span className="text-[var(--b-akzent)]">{letztes}</span>
          </p>
          <nav aria-label="Beispiel-Navigation" className="ml-auto hidden gap-8 text-[15px] font-medium text-[var(--b-muted)] lg:flex">
            {[
              [NAV[betrieb.funktion.art], "#angebot"],
              ["Einblicke", "#galerie"],
              ["Team", "#team"],
              ["Kontakt", "#anfrage"],
            ].map(([n, h]) => (
              <a key={n} href={h} className="hover:text-[var(--b-ink)]">{n}</a>
            ))}
          </nav>
          <a href="#anfrage" className={`${voll} ml-auto !min-h-11 !px-5 text-sm lg:ml-0`}>
            <Icon name="kal" className="h-[18px] w-[18px]" />
            <span className="hidden sm:inline">{betrieb.aktion}</span>
            <span className="sm:hidden">{betrieb.aktionKurz}</span>
          </a>
        </div>
      </header>

      {/* Aktion */}
      <p className="bg-[var(--b-akzent)] px-5 py-2.5 text-center text-sm font-semibold text-[var(--b-auf)]">
        ✦ Neu bei uns? <b>10 % auf Ihren ersten Besuch</b> – einfach bei der Anfrage „WILLKOMMEN“ angeben.
      </p>

      {/* Held: Foto über die ganze Breite, Buchungskarte aus Glas */}
      <section className="relative isolate overflow-hidden bg-[var(--b-tief)] text-white">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ background: betrieb.bild ? `center / cover url(${betrieb.bild.hero})` : betrieb.heroFarbe, animation: "b-zoom 2.4s cubic-bezier(.2,.7,.2,1) both" }}
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.35)_60%,rgba(0,0,0,.15))] md:bg-[linear-gradient(90deg,rgba(0,0,0,.72),rgba(0,0,0,.2)_70%)]" />
        <div className="mx-auto grid min-h-[640px] max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div>
            <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[13.5px] font-medium backdrop-blur">
              <OffenStatus zeiten={betrieb.oeffnungszeiten} />
            </span>
            <h1 className="mt-6 text-[clamp(2.9rem,8vw,5.6rem)] font-extrabold leading-[0.96] tracking-[-0.04em]" style={titel}>
              {betrieb.hero[0]}
              <em className="not-italic text-[color-mix(in_srgb,var(--b-akzent)_55%,white)]">{betrieb.hero[1]}</em>
              {betrieb.hero[2]}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">{betrieb.einleitung}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#anfrage" className={voll}>{betrieb.aktion}</a>
              <a href={betrieb.telefonLink} className={`${knopf} border border-white/35 bg-white/10 backdrop-blur`}>
                <Icon name="tel" />
                {betrieb.telefon}
              </a>
            </div>
            <p className="mt-7 flex items-center gap-3 text-sm text-white/80">
              <span className="text-[#f3c35b]"><Sterne className="h-4 w-4" /></span>
              <b>{sterne(betrieb.bewertung.sterne)}</b> · {betrieb.bewertung.anzahl} Google-Bewertungen
            </p>
          </div>
          <div className="rounded-[26px] border border-white/20 bg-white/12 p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,.7)] backdrop-blur-xl md:ml-auto md:w-[360px]" style={{ animation: "b-sw 6s ease-in-out infinite" }}>
            <p className="flex items-baseline justify-between gap-3 text-[15px] font-bold">
              {betrieb.naechster.klein}
              <small className="font-normal text-white/70">{betrieb.aktionKurz === "Termin" ? "diese Woche" : "heute"}</small>
            </p>
            {betrieb.aktionKurz === "Termin" ? (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {termine.map((t, i) => (
                  <a key={t} href="#anfrage" data-termin={t} className={`rounded-xl border px-1 py-2.5 text-center text-sm font-bold ${i === 1 ? "border-[var(--b-akzent)] bg-[var(--b-akzent)] text-[var(--b-auf)]" : "border-white/25 bg-white/5"}`}>
                    {t.split(" ")[0]}
                    <small className="block text-[11px] font-normal opacity-80">{t.split(" ")[1]}</small>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-3xl font-extrabold" style={titel}>{betrieb.naechster.gross}</p>
            )}
            <a href="#anfrage" className={`${voll} mt-5 !min-h-12 w-full text-sm`}>{betrieb.aktion}</a>
            <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-white/75">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              {betrieb.aktionKurz === "Termin" ? "Heute noch 3 Termine frei" : "Antwort in Minuten"} · kostenlos · unverbindlich
            </p>
          </div>
        </div>
      </section>

      {/* Laufband */}
      <div aria-hidden className="overflow-hidden whitespace-nowrap bg-[var(--b-tief)] py-4 text-[15px] font-bold uppercase tracking-[0.14em] text-white/90" style={titel}>
        <div className="inline-block" style={{ animation: "b-marq 32s linear infinite" }}>
          {laufband.map((n, i) => (
            <span key={n + i} className="mx-7">
              {n}
              <span className="ml-14 text-[var(--b-akzent)]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Vertrauen */}
      <ul className="mx-auto flex max-w-6xl flex-wrap justify-between gap-x-8 gap-y-3 px-5 py-6 text-[15px] text-[var(--b-muted)]">
        {[
          ["stern", `${sterne(betrieb.bewertung.sterne)} auf Google`],
          ["haken", `${jahre} Jahre in ${betrieb.bezirk}`],
          ["haken", betrieb.vertrauen],
          ["haken", "Kartenzahlung"],
          ["haken", "Online anfragen, rund um die Uhr"],
        ].map(([i, t]) => (
          <li key={t} className="flex items-center gap-2.5">
            <Icon name={i as "stern" | "haken"} className="h-[18px] w-[18px] text-[var(--b-akzent)]" />
            {t}
          </li>
        ))}
      </ul>

      {/* Zahlen */}
      <section aria-label="Zahlen" className="mx-auto grid max-w-6xl grid-cols-3 gap-4 px-5 pt-6 md:pt-10">
        {betrieb.zahlen.map((z) => (
          <div key={z.text} data-r className="rounded-[22px] border border-[var(--b-linie)] bg-[var(--b-flaeche)] p-4 text-center md:p-7">
            <p className="text-[clamp(1.8rem,5vw,3.6rem)] font-extrabold leading-none tracking-[-0.04em] text-[var(--b-akzent)]" style={titel}>
              <span data-zaehl={z.zahl} data-komma={z.komma ?? 0}>{z.zahl.toLocaleString("de-AT", { minimumFractionDigits: z.komma ?? 0 })}</span>
              {z.zahl > 1000 ? "+" : ""}
            </p>
            <p className="mt-2 text-xs text-[var(--b-muted)] md:text-sm">{z.text}</p>
          </div>
        ))}
      </section>

      {/* Die Funktion der Branche */}
      <section data-r id="angebot" className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-20 md:pt-24">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={kicker}>{NAV[betrieb.funktion.art]}</p>
            <h2 className={h2} style={titel}>{betrieb.funktion.titel}</h2>
          </div>
          <p className="max-w-md text-[var(--b-muted)]">{betrieb.funktion.text}</p>
        </div>
        <BranchenFunktion betrieb={betrieb} ziel="#anfrage" />
      </section>

      {/* Leistungen – nur wenn die Funktion die Preise nicht schon zeigt */}
      {!preiseSchon && (
        <section id="leistungen" className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-20 md:pt-24">
          <div className="rounded-[26px] border border-[var(--b-linie)] bg-[var(--b-flaeche)] p-7 sm:p-9">
            <p className={kicker}>Leistungen</p>
            <h2 className={`${h2} !text-4xl`} style={titel}>Was es kostet.</h2>
            <p className="mt-2 text-sm text-[var(--b-muted)]">{betrieb.preisHinweis}</p>
            <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
              {betrieb.leistungen.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-4 border-b border-[var(--b-linie)] py-4">
                  <span>
                    <b className="font-bold">{l.name}</b>
                    <small className="block text-[13px] text-[var(--b-muted)]">{l.text}{l.dauer ? ` · ${l.dauer} Min.` : ""}</small>
                  </span>
                  <span className="whitespace-nowrap text-[22px] font-extrabold text-[var(--b-akzent)]" style={titel}>{abPreis(l.preis)}</span>
                </li>
              ))}
            </ul>
            <a href="#anfrage" className={`${voll} mt-7 w-full`}>{betrieb.aktion}</a>
          </div>
        </section>
      )}

      {/* Einblicke + Stimmen */}
      <section data-r id="galerie" className="mt-20 scroll-mt-24 bg-[var(--b-tief)] py-20 text-white md:mt-24 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <p className={`${kicker} !text-white/60`}>Einblicke</p>
          <h2 className={h2} style={titel}>Das sind wir.</h2>
          <ul className="mt-9 grid auto-rows-[150px] grid-cols-2 gap-3 md:auto-rows-[190px] md:grid-cols-4">
            {galerie.map((g, i) => (
              <li key={g.titel + i} className={`group relative overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <div className="absolute inset-0 transition duration-700 group-hover:scale-105" style={{ background: galerieHintergrund(g) }} />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1 text-xs backdrop-blur">{g.titel}</span>
              </li>
            ))}
          </ul>
          <div className="mt-20 grid items-center gap-10 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className={`${kicker} !text-white/60`}>Bewertungen</p>
              <p className="mt-3 text-[6.5rem] font-extrabold leading-[0.9] tracking-[-0.04em]" style={titel}>{sterne(betrieb.bewertung.sterne)}</p>
              <p className="mt-3 text-[#f3c35b]"><Sterne /></p>
              <p className="mt-2 text-white/60">{betrieb.bewertung.anzahl} Bewertungen auf Google · Beispielwerte</p>
            </div>
            <StimmenSlider betrieb={betrieb} />
          </div>
        </div>
      </section>

      {/* Team */}
      <section data-r id="team" className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-20 md:pt-24">
        <p className={kicker}>Team</p>
        <h2 className={h2} style={titel}>Die Menschen dahinter.</h2>
        <ul className="mt-9 grid gap-3 sm:grid-cols-3">
          {betrieb.team.map((t) => (
            <li key={t.name} className="flex items-center gap-4 rounded-[22px] border border-[var(--b-linie)] bg-[var(--b-flaeche)] p-5">
              <span
                aria-hidden
                className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-3xl font-extrabold text-white"
                style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${t.farbe} 70%, white), ${t.farbe})`, ...titel }}
              >
                {t.name[0]}
              </span>
              <span className="min-w-0">
                <b className="block text-lg font-extrabold leading-tight tracking-[-0.02em]" style={titel}>{t.name}</b>
                <span className="block text-sm text-[var(--b-muted)]">{t.rolle}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-[var(--b-muted)]">Wählen Sie bei der Anfrage, zu wem Sie möchten.</p>
      </section>

      {/* Treuekarte, Gutschein, Rückruf */}
      <section className="mx-auto mt-20 grid max-w-6xl gap-6 px-5 md:mt-24 md:grid-cols-2">
        {extras.treue && (
          <div className="rounded-[26px] border border-[var(--b-linie)] bg-[var(--b-flaeche)] p-8 sm:p-10">
            <p className={kicker}>Treuekarte</p>
            <h3 className="mt-3 text-3xl font-extrabold tracking-[-0.03em]" style={titel}>{extras.treue}.</h3>
            <p className="mt-2 text-[var(--b-muted)]">Digital gestempelt bei jedem Besuch – kein Zettel, nichts zu verlieren.</p>
            <ol aria-label="6 von 10 Stempeln" className="mt-7 grid max-w-sm grid-cols-5 gap-3">
              {Array.from({ length: 10 }, (_, i) => (
                <li
                  key={i}
                  className={`grid aspect-square place-items-center rounded-full text-sm font-bold ${
                    i < 6 ? "bg-[var(--b-akzent)] text-[var(--b-auf)]" : i === 9 ? "bg-[var(--b-tief)] text-white" : "border-[1.5px] border-dashed border-[var(--b-linie)] text-[var(--b-muted)]"
                  }`}
                >
                  {i < 6 ? <Icon name="haken" className="h-4 w-4" /> : i === 9 ? <Icon name="geschenk" className="h-4 w-4" /> : i + 1}
                </li>
              ))}
            </ol>
          </div>
        )}
        <div className={`rounded-[26px] bg-[var(--b-akzent)] p-8 text-[var(--b-auf)] sm:p-10 ${extras.treue ? "" : "md:col-span-2"}`}>
          <p className="text-[12.5px] font-bold uppercase tracking-[0.18em] opacity-75">Rückruf</p>
          <h3 className="mt-3 text-3xl font-extrabold tracking-[-0.03em]" style={titel}>Keine Zeit zum Telefonieren?</h3>
          <p className="mt-2 opacity-85">Nummer hinterlassen – wir rufen Sie heute noch zurück.</p>
          <div className="[--b-akzent:var(--b-tief)] [--b-auf:#fff] [--b-flaeche:#fff] [--b-ink:#111]">
            <Rueckruf />
          </div>
        </div>
        {extras.gutschein && (
          <div className="md:col-span-2">
            <Gutschein betrieb={betrieb} fuer={extras.gutschein} />
          </div>
        )}
      </section>

      {/* Anfrage + Fragen */}
      <section id="anfrage" className="mx-auto grid max-w-6xl scroll-mt-24 gap-12 px-5 pt-20 md:pt-24 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className={kicker}>{betrieb.aktion} & Fragen</p>
          <h2 className={h2} style={titel}>In einer Minute erledigt.</h2>
          <p className="mt-4 text-[var(--b-muted)]">
            {betrieb.strasse}, {betrieb.plz} {betrieb.ort} · <a href={betrieb.telefonLink} className="font-bold text-[var(--b-ink)]">{betrieb.telefon}</a>
          </p>
          <div className="mt-8 border-t border-[var(--b-linie)]">
            {betrieb.fragen.map((q, i) => (
              <details key={q.f} open={i === 0} className="group border-b border-[var(--b-linie)]">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-bold">
                  {q.f}
                  <span aria-hidden className="h-3 w-3 rotate-45 border-b-[1.6px] border-r-[1.6px] border-[var(--b-akzent)] transition group-open:-rotate-[135deg]" />
                </summary>
                <p className="max-w-lg pb-5 text-[var(--b-muted)]">{q.a}</p>
              </details>
            ))}
          </div>
          <dl className="mt-8 space-y-1.5">
            {betrieb.oeffnungszeiten.map((o) => (
              <div key={o.tage} className="flex justify-between gap-4 text-[15px]">
                <dt className="text-[var(--b-muted)]">{o.tage}</dt>
                <dd className="font-bold">{o.zeit}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-[26px] border border-[var(--b-linie)] bg-[var(--b-flaeche)] p-6 shadow-[0_30px_60px_-40px_rgba(0,0,0,.35)] sm:p-9">
          <Anfrage betrieb={betrieb} />
        </div>
      </section>

      {/* Instagram + Anfahrt */}
      <section data-r className="mx-auto grid max-w-6xl gap-6 px-5 pt-20 md:grid-cols-[1.3fr_1fr] md:pt-24">
        <div className="rounded-[26px] border border-[var(--b-linie)] bg-[var(--b-flaeche)] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="font-bold">
              <span className="text-[var(--b-akzent)]">Instagram</span> · {handle}
            </p>
            <span className="rounded-full border border-[var(--b-linie)] px-4 py-1.5 text-sm font-semibold">Folgen</span>
          </div>
          <ul className="mt-5 grid grid-cols-3 gap-2">
            {[...galerie, ...galerie].slice(0, 6).map((g, i) => (
              <li key={i} className="aspect-square overflow-hidden rounded-xl" style={{ background: galerieHintergrund({ ...g, lage: g.lage ?? ["center / cover", "20% 30% / 200%", "80% 60% / 220%"][i % 3] }) }} />
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--b-muted)]">Die neuesten Beiträge erscheinen hier automatisch.</p>
        </div>
        <div className="flex flex-col rounded-[26px] border border-[var(--b-linie)] bg-[var(--b-flaeche)] p-6 sm:p-8">
          <p className={kicker}>Anfahrt</p>
          <p className="mt-2 text-xl font-extrabold" style={titel}>{betrieb.strasse}, {betrieb.plz} {betrieb.ort}</p>
          <KartenGrafik link={routeLink(betrieb)} adresse="Route in Google Maps" akzent={st.akzent} className="mt-5 min-h-52 flex-1 text-[var(--b-ink)]" />
        </div>
      </section>

      <footer className="mt-20 bg-[var(--b-tief)] pb-8 pt-16 text-[15px] text-white/65 md:mt-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <p className="text-[26px] font-extrabold tracking-[-0.03em] text-white" style={titel}>{betrieb.name}</p>
            <p className="mt-3 leading-relaxed">
              {betrieb.strasse}, {betrieb.plz} {betrieb.ort}
              <br />
              {betrieb.telefon} · {betrieb.email}
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-bold text-white">Öffnungszeiten</h3>
            {betrieb.oeffnungszeiten.map((o) => (
              <p key={o.tage}>{o.tage}: {o.zeit}</p>
            ))}
          </div>
          <div>
            <h3 className="mb-3 font-bold text-white">Seiten</h3>
            <p>{NAV[betrieb.funktion.art]}</p>
            <p>Einblicke</p>
            <p>Team</p>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-6xl border-t border-white/10 px-5 pt-6 text-[13px]">© {betrieb.name} · Impressum · Datenschutz · Cookie-Einstellungen</p>
      </footer>

      {/* Feste Leiste am Handy: Anrufen und die wichtigste Aktion */}
      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-[auto_1fr] gap-3 border-t border-[var(--b-linie)] bg-[var(--b-bg)]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
        <a href={betrieb.telefonLink} aria-label="Anrufen" className={`${knopf} border border-[var(--b-linie)] bg-[var(--b-flaeche)] !px-5`}>
          <Icon name="tel" />
        </a>
        <a href="#anfrage" className={voll}>{betrieb.aktion}</a>
      </div>
    </div>
  );
}
