import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Anfrage, Gutschein, Rueckruf, StimmenSlider, VorherNachherFoto } from "@/components/beispiele/BusinessWidgets";
import { BranchenFunktion } from "@/components/beispiele/Funktionen";
import { Icon, Sterne } from "@/components/beispiele/Icon";
import { OffenStatus } from "@/components/beispiele/OffenStatus";
import { GRUNDSCHRIFT, TITELSCHRIFT, schriftVariablen } from "@/lib/beispiel-schriften";
import { abPreis, betriebAusSuche, extrasFuer, galerieFuer, type Betrieb, type Stil } from "@/lib/beispiele";

export const metadata: Metadata = { title: "Beispiel: Business" };

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
    "--b-titel": TITELSCHRIFT[st.schrift],
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

const sterne = (n: number) => n.toLocaleString("de-AT", { minimumFractionDigits: 1 });

// Business „Salon Plus“: die Seite arbeitet mit – anfragen, vergleichen, wiederkommen.
export default async function BusinessBeispiel({ searchParams }: PageProps<"/beispiele/business">) {
  const betrieb = await betriebAusSuche(searchParams);
  const st = betrieb.stil;
  const extras = extrasFuer(betrieb);
  const galerie = galerieFuer(betrieb).slice(0, 5);
  const titel = { fontFamily: "var(--b-titel)" };
  const gross = st.schrift === "display" ? " uppercase" : "";
  const woerter = betrieb.name.split(" ");
  const letztes = woerter.length > 1 ? woerter.pop() : "";
  const jahre = new Date().getFullYear() - betrieb.seit;
  const kicker = "text-[12.5px] font-semibold uppercase tracking-[0.16em] text-[var(--b-akzent)]";
  const h2 = `mt-3 text-[clamp(2.3rem,4.4vw,3.4rem)] font-normal leading-[1.03] tracking-tight${gross}`;
  const knopf = "inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full px-7 font-semibold transition hover:-translate-y-0.5";
  const voll = `${knopf} bg-[var(--b-akzent)] text-[var(--b-auf)] shadow-[0_12px_28px_-14px_var(--b-akzent)]`;
  const extraKarten = [extras.treue, true].filter(Boolean).length;
  const termine = ["Di 11:30", "Mi 14:00", "Do 9:00", "Sa 10:30"];

  return (
    <div className={`${schriftVariablen} flex-1 bg-[var(--b-bg)] text-[var(--b-ink)]`} style={farben(st)}>
      <p className="bg-[var(--b-tief)] px-4 py-2 text-center text-[13px] text-white/80">
        Neu: {betrieb.aktion} jetzt auch online · <b className="text-white">{betrieb.vertrauen}</b>
      </p>
      <header className="sticky top-0 z-40 border-b border-[var(--b-linie)] bg-[var(--b-bg)]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-6xl items-center gap-8 px-5">
          <p className={`text-2xl${gross}`} style={titel}>
            {woerter.join(" ")} <em className="text-[var(--b-akzent)]">{letztes}</em>
          </p>
          <nav aria-label="Beispiel-Navigation" className="ml-auto hidden gap-7 text-[15px] text-[var(--b-muted)] lg:flex">
            {[
              [NAV[betrieb.funktion.art], "#angebot"],
              ["Leistungen", "#leistungen"],
              ["Team", "#team"],
              ["Galerie", "#galerie"],
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

      {/* Held */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-6 pt-12 md:grid-cols-[1fr_1.05fr] md:pt-16">
        <div>
          <span className="inline-flex rounded-full border border-[var(--b-linie)] bg-[var(--b-flaeche)] px-4 py-2 text-[13px] font-semibold">
            <OffenStatus zeiten={betrieb.oeffnungszeiten} />
          </span>
          <h1 className={`mt-6 text-[clamp(3rem,6.6vw,5.3rem)] font-normal leading-[0.98] tracking-[-0.035em]${gross}`} style={titel}>
            {betrieb.hero[0]}
            <em className="text-[var(--b-akzent)]">{betrieb.hero[1]}</em>
            {betrieb.hero[2]}
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--b-muted)]">{betrieb.einleitung}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#anfrage" className={voll}>{betrieb.aktion}</a>
            <a href={betrieb.telefonLink} className={`${knopf} border border-[var(--b-linie)] bg-[var(--b-flaeche)]`}>
              <Icon name="tel" />
              {betrieb.telefon}
            </a>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[520px] pb-24 md:pb-0">
          <div
            aria-hidden
            className="h-[460px] rounded-t-[999px] rounded-b-xl md:h-[620px]"
            style={{ background: betrieb.bild ? `center / cover url(${betrieb.bild.hero})` : betrieb.heroFarbe }}
          />
          <div className="absolute right-0 top-14 flex items-center gap-3 rounded-2xl bg-[var(--b-flaeche)] px-4 py-3 shadow-[0_20px_40px_-20px_rgba(40,20,30,.35)] md:-right-5">
            <b className="text-3xl font-normal text-[var(--b-akzent)]" style={titel}>{sterne(betrieb.bewertung.sterne)}</b>
            <span className="text-xs text-[var(--b-muted)]">
              <span className="text-[#d79a1f]"><Sterne className="h-3.5 w-3.5" /></span>
              <br />
              {betrieb.bewertung.anzahl} Google-Bewertungen
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 rounded-2xl bg-[var(--b-flaeche)] p-5 shadow-[0_30px_60px_-24px_rgba(40,20,30,.4)] md:bottom-10 md:left-[-56px] md:right-auto md:w-[330px]">
            <p className="flex items-baseline justify-between gap-3 text-[15px] font-semibold">
              {betrieb.naechster.klein}
              <small className="font-normal text-[var(--b-muted)]">{betrieb.aktionKurz === "Termin" ? "diese Woche" : "heute"}</small>
            </p>
            {betrieb.aktionKurz === "Termin" ? (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {termine.map((t, i) => (
                  <a key={t} href="#anfrage" className={`rounded-xl border px-1 py-2 text-center text-sm font-semibold ${i === 1 ? "border-[var(--b-akzent)] bg-[var(--b-akzent)] text-[var(--b-auf)]" : "border-[var(--b-linie)]"}`}>
                    {t.split(" ")[0]}
                    <small className="block text-[11px] font-normal opacity-75">{t.split(" ")[1]}</small>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-2xl text-[var(--b-akzent)]" style={titel}>{betrieb.naechster.gross}</p>
            )}
            <a href="#anfrage" className={`${voll} mt-4 !min-h-11 w-full text-sm`}>{betrieb.aktion}</a>
          </div>
        </div>
      </section>

      {/* Vertrauen */}
      <ul className="mx-auto mt-16 flex max-w-6xl flex-wrap justify-between gap-x-8 gap-y-3 border-y border-[var(--b-linie)] px-5 py-6 text-[15px] text-[var(--b-muted)]">
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

      {/* Die Funktion der Branche */}
      <section id="angebot" className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={kicker}>{NAV[betrieb.funktion.art]}</p>
            <h2 className={h2} style={titel}>{betrieb.funktion.titel}</h2>
          </div>
          <p className="max-w-md text-[var(--b-muted)]">{betrieb.funktion.text}</p>
        </div>
        <BranchenFunktion betrieb={betrieb} ziel="#anfrage" />
      </section>

      {/* Leistungen + Vorher/Nachher */}
      <section id="leistungen" className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-28">
        <div className={`grid gap-8 ${extras.vorherNachher && betrieb.bild?.einblick ? "lg:grid-cols-[1.1fr_0.9fr]" : ""}`}>
          <div className="rounded-[26px] border border-[var(--b-linie)] bg-[var(--b-flaeche)] p-7 sm:p-9">
            <p className={kicker}>Leistungen</p>
            <h2 className={`${h2} !text-4xl`} style={titel}>Was es kostet.</h2>
            <p className="mt-2 text-sm text-[var(--b-muted)]">{betrieb.preisHinweis}</p>
            <ul className={`mt-6 grid gap-x-10 ${extras.vorherNachher && betrieb.bild?.einblick ? "" : "md:grid-cols-2"}`}>
              {betrieb.leistungen.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-4 border-b border-[var(--b-linie)] py-4">
                  <span>
                    <b className="font-semibold">{l.name}</b>
                    <small className="block text-[13px] text-[var(--b-muted)]">{l.text}{l.dauer ? ` · ${l.dauer} Min.` : ""}</small>
                  </span>
                  <span className="whitespace-nowrap text-[22px] text-[var(--b-akzent)]" style={titel}>{abPreis(l.preis)}</span>
                </li>
              ))}
            </ul>
            <a href="#anfrage" className={`${voll} mt-7 w-full`}>{betrieb.aktion}</a>
          </div>
          {extras.vorherNachher && betrieb.bild?.einblick && (
            <div className="flex flex-col">
              <VorherNachherFoto bild={betrieb.bild.einblick} titel={extras.vorherNachher} />
              <p className="mt-3 text-sm text-[var(--b-muted)]">{extras.vorherNachher} – ziehen Sie den Regler zur Seite.</p>
            </div>
          )}
        </div>
      </section>

      {/* Team */}
      <section id="team" className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={kicker}>Team</p>
            <h2 className={h2} style={titel}>Die Menschen dahinter.</h2>
          </div>
          <p className="max-w-sm text-[var(--b-muted)]">Wählen Sie bei der Anfrage, zu wem Sie möchten.</p>
        </div>
        <ul className="grid grid-cols-3 gap-3 sm:gap-6">
          {betrieb.team.map((t) => (
            <li key={t.name} className="group">
              <div
                aria-hidden
                className="relative grid h-40 place-items-center overflow-hidden rounded-2xl text-6xl text-white sm:h-72 sm:text-8xl md:h-96"
                style={{ background: `radial-gradient(circle at 30% 20%, color-mix(in srgb, ${t.farbe} 55%, white), ${t.farbe} 55%, color-mix(in srgb, ${t.farbe} 70%, black))`, ...titel }}
              >
                <span className="transition duration-700 group-hover:scale-110">{t.name[0]}</span>
                <span className="absolute bottom-4 left-4 hidden rounded-full bg-white/92 px-3 py-1 font-sans text-xs font-semibold text-neutral-900 sm:block">Foto folgt</span>
              </div>
              <p className={`mt-4 text-xl sm:mt-5 sm:text-[28px]${gross}`} style={titel}>{t.name}</p>
              <p className="text-sm text-[var(--b-muted)] sm:text-base">{t.rolle}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Galerie + Bewertungen */}
      <section id="galerie" className="mt-28 scroll-mt-24 bg-[var(--b-tief)] py-24 text-white md:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <p className={`${kicker} !text-white/60`}>Galerie</p>
          <h2 className={h2} style={titel}>Einblicke.</h2>
          <ul className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[230px] md:grid-cols-4">
            {galerie.map((g, i) => (
              <li key={g.titel + i} className={`group relative overflow-hidden rounded-xl ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <div className="absolute inset-0 transition duration-700 group-hover:scale-105" style={{ background: g.bild ? `center / cover url(${g.bild})` : g.farbe }} />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1 text-xs backdrop-blur">{g.titel}</span>
              </li>
            ))}
          </ul>
          <div className="mt-24 grid items-center gap-12 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className={`${kicker} !text-white/60`}>Bewertungen</p>
              <p className="mt-4 text-[7rem] leading-[0.9]" style={titel}>{sterne(betrieb.bewertung.sterne)}</p>
              <p className="mt-3 text-[#f3c35b]"><Sterne /></p>
              <p className="mt-2 text-white/60">{betrieb.bewertung.anzahl} Bewertungen auf Google · Beispielwerte</p>
            </div>
            <StimmenSlider betrieb={betrieb} />
          </div>
        </div>
      </section>

      {/* Anfrage + Fragen */}
      <section id="anfrage" className="mx-auto grid max-w-6xl scroll-mt-24 gap-12 px-5 pt-28 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className={kicker}>{betrieb.aktion} & Fragen</p>
          <h2 className={h2} style={titel}>In einer Minute erledigt.</h2>
          <p className="mt-4 text-[var(--b-muted)]">
            {betrieb.strasse}, {betrieb.plz} {betrieb.ort} · <a href={betrieb.telefonLink} className="font-semibold text-[var(--b-ink)]">{betrieb.telefon}</a>
          </p>
          <div className="mt-8 border-t border-[var(--b-linie)]">
            {betrieb.fragen.map((q, i) => (
              <details key={q.f} open={i === 0} className="group border-b border-[var(--b-linie)]">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-semibold">
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
                <dd className="font-semibold">{o.zeit}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-[26px] border border-[var(--b-linie)] bg-[var(--b-flaeche)] p-6 shadow-[0_30px_60px_-40px_rgba(40,20,30,.35)] sm:p-9">
          <Anfrage betrieb={betrieb} />
        </div>
      </section>

      {/* Extras: Treuekarte und Rückruf */}
      <section className={`mx-auto mt-28 grid max-w-6xl gap-6 px-5 ${extraKarten > 1 ? "md:grid-cols-2" : ""}`}>
        {extras.treue && (
          <div className="rounded-[26px] border border-[var(--b-linie)] bg-[var(--b-flaeche)] p-8 sm:p-10">
            <p className={kicker}>Treuekarte</p>
            <h3 className={`mt-3 text-3xl${gross}`} style={titel}>{extras.treue}.</h3>
            <p className="mt-2 text-[var(--b-muted)]">Digital gestempelt bei jedem Besuch – kein Zettel, nichts zu verlieren.</p>
            <ol aria-label="6 von 10 Stempeln" className="mt-7 grid max-w-sm grid-cols-5 gap-3">
              {Array.from({ length: 10 }, (_, i) => (
                <li
                  key={i}
                  className={`grid aspect-square place-items-center rounded-full text-sm ${
                    i < 6 ? "bg-[var(--b-akzent)] text-[var(--b-auf)]" : i === 9 ? "bg-[var(--b-tief)] text-white" : "border-[1.5px] border-dashed border-[var(--b-linie)] text-[var(--b-muted)]"
                  }`}
                >
                  {i < 6 ? <Icon name="haken" className="h-4 w-4" /> : i === 9 ? <Icon name="geschenk" className="h-4 w-4" /> : i + 1}
                </li>
              ))}
            </ol>
          </div>
        )}
        <div className="rounded-[26px] bg-[var(--b-akzent)] p-8 text-[var(--b-auf)] sm:p-10">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.16em] opacity-75">Rückruf</p>
          <h3 className={`mt-3 text-3xl${gross}`} style={titel}>Keine Zeit zum Telefonieren?</h3>
          <p className="mt-2 opacity-85">Nummer hinterlassen – wir rufen Sie heute noch zurück.</p>
          <div className="[--b-akzent:var(--b-tief)] [--b-auf:#fff] [--b-flaeche:#fff] [--b-ink:#111]">
            <Rueckruf />
          </div>
        </div>
      </section>

      {extras.gutschein && (
        <section className="mx-auto mt-6 max-w-6xl px-5">
          <Gutschein betrieb={betrieb} fuer={extras.gutschein} />
        </section>
      )}

      <footer className="mt-28 bg-[var(--b-tief)] pb-8 pt-20 text-[15px] text-white/65">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <p className={`text-[26px] text-white${gross}`} style={titel}>{betrieb.name}</p>
            <p className="mt-3 leading-relaxed">
              {betrieb.strasse}, {betrieb.plz} {betrieb.ort}
              <br />
              {betrieb.telefon} · {betrieb.email}
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-white">Öffnungszeiten</h3>
            {betrieb.oeffnungszeiten.map((o) => (
              <p key={o.tage}>{o.tage}: {o.zeit}</p>
            ))}
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-white">Seiten</h3>
            <p>{NAV[betrieb.funktion.art]}</p>
            <p>Team</p>
            <p>Galerie</p>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-white">Folgen</h3>
            <p>Instagram</p>
            <p>Facebook</p>
            <p>Google</p>
          </div>
        </div>
        <p className="mx-auto mt-14 max-w-6xl border-t border-white/10 px-5 pt-6 text-[13px]">© {betrieb.name} · Impressum · Datenschutz · Cookie-Einstellungen</p>
      </footer>

      {/* WhatsApp */}
      <a
        href="#anfrage"
        aria-label="Per WhatsApp schreiben"
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] shadow-[0_14px_30px_-10px_rgba(20,120,60,.6)] transition hover:scale-105"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7 fill-white">
          <path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.2-1.4A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.6-.1 1.2z" />
        </svg>
      </a>
    </div>
  );
}
