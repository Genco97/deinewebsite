import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { DM_Sans, Fraunces, Oswald } from "next/font/google";
import { DemoFormular } from "@/components/beispiele/DemoFormular";
import { BranchenFunktion } from "@/components/beispiele/Funktionen";
import { abPreis, betriebAusSuche, type Betrieb, type Stil } from "@/lib/beispiele";

export const metadata: Metadata = { title: "Beispiel: Business" };

const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-fraunces" });
const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-dmsans" });
const oswald = Oswald({ subsets: ["latin", "latin-ext"], variable: "--font-oswald" });

const SCHRIFT: Record<Stil["schrift"], string> = {
  serif: "var(--font-fraunces), Georgia, serif",
  sans: "var(--font-dmsans), ui-sans-serif, system-ui, sans-serif",
  display: "var(--font-oswald), Impact, sans-serif",
};

// Alle Farben kommen aus dem Stil der Branche (CSS-Variablen --b-…)
const AKZENT = "var(--b-akzent)";
const serif = { fontFamily: "var(--b-titel)" };
const feld =
  "mt-1 block min-h-11 w-full rounded-lg border border-[var(--b-linie)] bg-[var(--b-flaeche)] px-3 py-2 text-base font-normal text-[var(--b-ink)] focus:border-[var(--b-akzent)] focus:outline-none focus:ring-2 focus:ring-[var(--b-akzent)]/20";

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
    "--b-titel": SCHRIFT[st.schrift],
    "--f-flaeche": st.flaeche,
    "--f-ink": st.ink,
    "--f-muted": st.muted,
    "--f-linie": st.linie,
    "--f-akzent": st.akzent,
    "--f-auf": st.aufAkzent,
  } as CSSProperties;
}

const NAV: Record<Betrieb["funktion"]["art"], string> = { preistabelle: "Preise", wartezeit: "Wartezeit", speisekarte: "Speisekarte", projekte: "Projekte", termin: "Termin" };

const sterne = (n: number) => n.toLocaleString("de-AT", { minimumFractionDigits: 1 });

export default async function BusinessBeispiel({ searchParams }: PageProps<"/beispiele/business">) {
  const betrieb = await betriebAusSuche(searchParams);
  const woerter = betrieb.name.split(" ");
  const letztes = woerter.length > 1 ? woerter.pop() : "";
  const kopf = woerter.join(" ");
  const st = betrieb.stil;
  const titelGross = st.schrift === "display" ? " uppercase tracking-tight" : "";
  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable} ${oswald.variable} flex-1 bg-[var(--b-bg)] text-[var(--b-ink)]`}
      style={{ ...farben(st), fontFamily: "var(--font-dmsans), ui-sans-serif, system-ui, sans-serif" }}
    >
      <header className="sticky top-0 z-40 border-b border-[var(--b-linie)] bg-[var(--b-bg)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <p className={`text-2xl font-semibold${titelGross}`} style={serif}>
            {kopf} <em className="font-normal" style={{ color: AKZENT }}>{letztes}</em>
          </p>
          <nav aria-label="Beispiel-Navigation" className="hidden gap-7 text-sm font-medium md:flex">
            {[NAV[betrieb.funktion.art], "Leistungen", "Team", "Bewertungen", "Kontakt"].map((n, i) => (
              <a key={n} href={i === 0 ? "#angebot" : `#${n.toLowerCase()}`} className="hover:text-[var(--b-akzent)]">{n}</a>
            ))}
          </nav>
          <a href="#kontakt" className="rounded-full px-5 py-2.5 text-sm font-semibold text-[var(--b-auf)]" style={{ background: AKZENT }}>
            {betrieb.aktion}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.1fr_1fr] md:py-24">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full px-3 py-1 font-semibold" style={{ color: AKZENT, background: "color-mix(in srgb, var(--b-akzent) 12%, transparent)" }}>
              ★ {sterne(betrieb.bewertung.sterne)} · {betrieb.bewertung.anzahl} Bewertungen
            </span>
            <span className="rounded-full border border-[var(--b-linie)] px-3 py-1 text-[var(--b-muted)]">{betrieb.vertrauen}</span>
          </p>
          <p className="mt-1.5 text-xs text-[var(--b-muted)]">Beispielwerte</p>
          <h1 className={`mt-4 text-5xl font-semibold leading-[1.05] sm:text-6xl${titelGross}`} style={serif}>
            {betrieb.hero[0]}<em className="font-normal" style={{ color: AKZENT }}>{betrieb.hero[1]}</em>{betrieb.hero[2]}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--b-muted)]">{betrieb.einleitung}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#kontakt" className="inline-flex min-h-12 items-center justify-center rounded-full px-7 font-semibold text-[var(--b-auf)]" style={{ background: AKZENT }}>
              {betrieb.aktion}
            </a>
            <a href={betrieb.telefonLink} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--b-linie)] px-7 font-semibold">
              {betrieb.telefon}
            </a>
          </div>
        </div>
        <div aria-hidden className="relative mx-auto aspect-[4/5] w-full max-w-sm">
          <div
            className="absolute inset-0 rounded-[48%_52%_44%_56%/55%_45%_55%_45%] bg-cover bg-center"
            style={{ background: betrieb.bild ? `center / cover url(${betrieb.bild.hero})` : betrieb.heroFarbe }}
          />
          <div className="absolute -left-6 bottom-10 rounded-2xl bg-[var(--b-flaeche)] px-4 py-3 shadow-lg">
            <p className="text-xs text-[var(--b-muted)]">{betrieb.naechster.klein}</p>
            <p className="font-semibold">{betrieb.naechster.gross}</p>
          </div>
          <div className="absolute -right-3 top-8 rounded-2xl bg-[var(--b-flaeche)] px-4 py-3 shadow-lg">
            <p className="font-semibold" style={{ color: AKZENT }}>Seit {betrieb.seit}</p>
            <p className="text-xs text-[var(--b-muted)]">in Wien-{betrieb.bezirk}</p>
          </div>
        </div>
      </section>

      {/* Das Wichtigste der Branche zuerst */}
      <section id="angebot" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-16 md:pb-24">
        <h2 className={`text-4xl font-semibold${titelGross}`} style={serif}>{betrieb.funktion.titel}</h2>
        <p className="mb-8 mt-3 max-w-2xl text-lg text-[var(--b-muted)]">{betrieb.funktion.text}</p>
        <BranchenFunktion betrieb={betrieb} ziel="#kontakt" />
      </section>

      {/* Leistungen */}
      <section id="leistungen" className="scroll-mt-20 bg-[var(--b-flaeche)] py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className={`text-4xl font-semibold${titelGross}`} style={serif}>Leistungen</h2>
          <p className="mt-2 text-[var(--b-muted)]">{betrieb.preisHinweis}</p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {betrieb.leistungen.map((l) => (
              <li key={l.id} className="group rounded-2xl border border-[var(--b-linie)] bg-[var(--b-bg)] p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <p className={`text-xl font-semibold${titelGross}`} style={serif}>{l.name}</p>
                <p className="mt-1 text-sm text-[var(--b-muted)]">{l.text}</p>
                <div className="mt-5 flex items-end justify-between">
                  <p className="text-sm text-[var(--b-muted)]">{l.dauer ? `ca. ${l.dauer} Min.` : ""}</p>
                  <p className="text-2xl font-semibold" style={{ color: AKZENT }}>{abPreis(l.preis)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 md:py-24">
        <h2 className={`text-4xl font-semibold${titelGross}`} style={serif}>Unser Team</h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {betrieb.team.map((t) => (
            <li key={t.name} className="text-center">
              <div aria-hidden className="mx-auto grid h-36 w-36 place-items-center rounded-full text-5xl font-semibold text-white" style={{ background: t.farbe, ...serif }}>
                {t.name[0]}
              </div>
              <p className={`mt-4 text-xl font-semibold${titelGross}`} style={serif}>{t.name}</p>
              <p className="text-sm text-[var(--b-muted)]">{t.rolle}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Galerie */}
      <section id="galerie" className="scroll-mt-20 bg-[var(--b-tief)] py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className={`text-4xl font-semibold${titelGross}`} style={serif}>Galerie</h2>
          <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
            {betrieb.galerie.map((g) => (
              <li key={g.titel} className="relative overflow-hidden rounded-xl">
                <div className="aspect-[4/3] transition duration-500 hover:scale-105" style={{ background: g.farbe }} />
                <p className="absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-sm backdrop-blur">{g.titel}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bewertungen */}
      <section id="bewertungen" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 md:py-24">
        <h2 className={`text-4xl font-semibold${titelGross}`} style={serif}>Das sagen unsere Kundinnen und Kunden</h2>
        <p className="mt-2 text-[var(--b-muted)]">
          <span className="font-semibold" style={{ color: AKZENT }}>★ {sterne(betrieb.bewertung.sterne)}</span> aus {betrieb.bewertung.anzahl} Bewertungen · Beispielwerte
        </p>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {betrieb.bewertungen.map((b) => (
            <li key={b.name} className="rounded-2xl bg-[var(--b-flaeche)] p-6 shadow-sm">
              <p aria-label="5 von 5 Sternen" style={{ color: AKZENT }}>★★★★★</p>
              <p className="mt-3 leading-relaxed">„{b.text}“</p>
              <p className="mt-4 text-sm font-semibold text-[var(--b-muted)]">{b.name}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ + Kontakt */}
      <section id="kontakt" className="scroll-mt-20 bg-[var(--b-flaeche)] py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2">
          <div>
            <h2 className={`text-4xl font-semibold${titelGross}`} style={serif}>Häufige Fragen</h2>
            <div className="mt-8 divide-y divide-[var(--b-linie)] border-y border-[var(--b-linie)]">
              {betrieb.fragen.map((q) => (
                <details key={q.f} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {q.f}
                    <span aria-hidden className="text-xl transition group-open:rotate-45" style={{ color: AKZENT }}>+</span>
                  </summary>
                  <p className="mt-2 text-[var(--b-muted)]">{q.a}</p>
                </details>
              ))}
            </div>
            <h3 className={`mt-10 text-2xl font-semibold${titelGross}`} style={serif}>Öffnungszeiten</h3>
            <dl className="mt-4 space-y-1.5">
              {betrieb.oeffnungszeiten.map((o) => (
                <div key={o.tage} className="flex justify-between">
                  <dt className="text-[var(--b-muted)]">{o.tage}</dt>
                  <dd className="font-semibold">{o.zeit}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-3xl bg-[var(--b-bg)] p-6 sm:p-8">
            <h2 className={`text-3xl font-semibold${titelGross}`} style={serif}>{betrieb.aktion}</h2>
            <p className="mb-6 mt-2 text-[var(--b-muted)]">
              {betrieb.strasse}, {betrieb.plz} {betrieb.ort} · {betrieb.telefon}
            </p>
            <DemoFormular knopf="Anfrage senden" feld={feld} akzent={AKZENT} wunsch={betrieb.wunsch} />
          </div>
        </div>
      </section>

      <footer className="bg-[var(--b-tief)] py-8 text-center text-sm text-white/70">
        © {betrieb.name} · Impressum · Datenschutz
      </footer>
    </div>
  );
}
