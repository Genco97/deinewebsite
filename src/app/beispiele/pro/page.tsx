import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { ProBuchung } from "@/components/beispiele/ProBuchung";
import { ProChat } from "@/components/beispiele/ProChat";
import { ProEffekte } from "@/components/beispiele/ProEffekte";
import { BranchenFunktion } from "@/components/beispiele/Funktionen";
import { abPreis, betriebAusSuche } from "@/lib/beispiele";
import "./pro.css";

export const metadata: Metadata = { title: "Beispiel: Pro" };

const grotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-grotesk" });

const verzoegert = (ms: number) => ({ "--pro-delay": `${ms}ms` }) as CSSProperties;

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
  const offen = betrieb.oeffnungszeiten.find((o) => o.zeit !== "geschlossen") ?? betrieb.oeffnungszeiten[0];
  const sterne = betrieb.bewertung.sterne.toLocaleString("de-AT", { minimumFractionDigits: 1 });
  return (
    <div className={`${grotesk.variable} pro-seite relative flex-1`} style={farben}>
      <ProEffekte />

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#07070c]/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <p className="text-xl font-bold tracking-tight">
            {betrieb.marke}<span className="pro-verlauf-text">.</span>
          </p>
          <nav aria-label="Beispiel-Navigation" className="hidden gap-8 text-sm text-white/70 md:flex">
            <a href="#leistungen" className="hover:text-white">Leistungen</a>
            <a href="#buchen" className="hover:text-white">{betrieb.aktionKurz}</a>
            <a href="#stimmen" className="hover:text-white">Stimmen</a>
            <a href="#kontakt" className="hover:text-white">Kontakt</a>
          </nav>
          <a href="#buchen" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:scale-105">
            {betrieb.aktionKurz}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 py-12 md:py-24">
        <div aria-hidden className="absolute inset-0">
          <div className="pro-blob left-[10%] top-[15%] h-[40vmax] w-[40vmax] bg-fuchsia-600" />
          <div className="pro-blob pro-blob-2 right-[5%] top-[30%] h-[35vmax] w-[35vmax] bg-violet-700" />
          <div className="pro-blob pro-blob-3 bottom-[-10%] left-[30%] h-[30vmax] w-[30vmax] bg-cyan-500" />
          <div className="absolute inset-0 bg-[radial-gradient(transparent_0,#07070c_75%)]" />
          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:64px_64px]" />
        </div>
        <div className={`relative z-10 mx-auto grid max-w-6xl items-center gap-10 ${betrieb.bild ? "md:grid-cols-[1.15fr_0.85fr] md:gap-12" : "max-w-5xl text-center"}`}>
          <div className={betrieb.bild ? "order-2 md:order-1" : undefined}>
            <p data-reveal className={`w-fit rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur ${betrieb.bild ? "" : "mx-auto"}`}>
              ✦ Jetzt mit KI-Beratung & Online-Buchung
            </p>
            <h1
              data-reveal
              style={verzoegert(120)}
              className={`mt-8 font-bold leading-[0.9] tracking-tighter ${betrieb.bild ? "text-[clamp(2.75rem,6.5vw,6rem)]" : "text-[clamp(3rem,10vw,8.5rem)]"}`}
            >
              {betrieb.proHero[0]}
              <br />
              <span className="pro-verlauf-text">{betrieb.proHero[1]}</span> {betrieb.proHero[2]}
            </h1>
            <p data-reveal style={verzoegert(240)} className={`mt-8 max-w-xl text-lg text-white/70 sm:text-xl ${betrieb.bild ? "" : "mx-auto"}`}>
              {betrieb.einleitung}
            </p>
            <div data-reveal style={verzoegert(360)} className={`mt-10 flex flex-col gap-3 sm:flex-row ${betrieb.bild ? "" : "justify-center"}`}>
              <a
                href="#buchen"
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-8 text-lg font-bold shadow-[0_0_60px_color-mix(in_srgb,var(--pro-b)_50%,transparent)] transition hover:scale-105"
              >
                {betrieb.aktion} in 20 Sekunden
              </a>
              <a href="#leistungen" className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 px-8 text-lg font-semibold transition hover:bg-white/10">
                Leistungen entdecken
              </a>
            </div>
          </div>
          {betrieb.bild && (
            <div data-reveal style={verzoegert(200)} className="relative order-1 md:order-2">
              <div className="pro-rahmen">
                <div className="aspect-[16/10] overflow-hidden rounded-[calc(2rem-2px)] md:aspect-[4/5]">
                  <div className="pro-foto h-full w-full" style={{ background: `center / cover url(${betrieb.bild.hero})` }} />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 rounded-2xl border border-white/10 bg-[#07070c]/80 px-4 py-3 backdrop-blur-xl md:-bottom-5 md:-left-5">
                <p className="text-sm font-bold">★ {sterne} · {betrieb.bewertung.anzahl} Bewertungen</p>
                <p className="text-xs text-white/60">{betrieb.vertrauen}</p>
              </div>
              <div className="absolute right-3 top-3 rounded-2xl border border-white/10 bg-[#07070c]/80 px-4 py-3 backdrop-blur-xl md:-right-4 md:top-6">
                <p className="text-xs text-white/60">{betrieb.naechster.klein}</p>
                <p className="text-sm font-bold">{betrieb.naechster.gross}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Laufband */}
      <div aria-hidden className="relative z-10 -rotate-2 border-y border-white/10 bg-white py-4 text-black">
        <div className="pro-band">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {betrieb.leistungen.map((l) => (
                <span key={l.id} className="flex items-center gap-6 px-6 text-2xl font-bold uppercase tracking-tight sm:text-4xl">
                  {l.name} <span className="text-violet-600">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Das Wichtigste der Branche zuerst */}
      <section id="angebot" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 pt-24">
        <div data-reveal>
          <h2 className="text-5xl font-bold tracking-tighter sm:text-6xl">
            {betrieb.funktion.titel}
            <span className="pro-verlauf-text">.</span>
          </h2>
          <p className="mb-8 mt-3 max-w-2xl text-lg text-white/60">{betrieb.funktion.text}</p>
          <BranchenFunktion betrieb={betrieb} ziel="#buchen" />
        </div>
      </section>

      {/* Zahlen */}
      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 py-24 text-center sm:grid-cols-3">
        {betrieb.zahlen.map((z, i) => (
          <div key={z.text} data-reveal style={verzoegert(i * 150)}>
            <p className="pro-verlauf-text text-6xl font-bold tracking-tighter sm:text-7xl">
              <span data-zahl={z.zahl} data-komma={z.komma ?? 0}>
                {z.zahl.toLocaleString("de-AT", { minimumFractionDigits: z.komma ?? 0 })}
              </span>
              {z.zahl > 1000 ? "+" : ""}
            </p>
            <p className="mt-2 text-white/60">{z.text}</p>
          </div>
        ))}
      </section>

      {/* Einblick: breites Foto-Fenster */}
      {betrieb.bild?.einblick && (
        <section className="relative z-10 mx-auto max-w-6xl px-5 py-16">
          <h2 data-reveal className="text-center text-5xl font-bold tracking-tighter sm:text-7xl">
            Einfach mal <span className="pro-verlauf-text">reinschauen</span>.
          </h2>
          <div data-reveal style={verzoegert(150)} className="relative mx-auto mt-12 [perspective:1400px]">
            <div className="pro-rahmen [transform:rotateX(8deg)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(2rem-2px)] sm:aspect-[21/9]">
                <div className="pro-foto h-full w-full" style={{ background: `center / cover url(${betrieb.bild.einblick})` }} />
                <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-12 text-xs sm:gap-3 sm:p-6 sm:pt-24 sm:text-sm">
                  <span className="rounded-full border border-white/15 bg-black/50 px-3 py-1.5 backdrop-blur sm:px-4 sm:py-2">📍 {betrieb.strasse}, {betrieb.plz} {betrieb.ort}</span>
                  <span className="hidden rounded-full border border-white/15 bg-black/50 px-4 py-2 backdrop-blur sm:inline">🕒 {offen.tage} {offen.zeit}</span>
                  <span className="hidden rounded-full border border-white/15 bg-black/50 px-4 py-2 backdrop-blur sm:inline">✦ {betrieb.vertrauen}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Leistungen */}
      <section id="leistungen" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
        <h2 data-reveal className="text-5xl font-bold tracking-tighter sm:text-7xl">
          Was wir <span className="pro-verlauf-text">können</span>.
        </h2>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {betrieb.leistungen.map((l, i) => (
            <li key={l.id} data-reveal style={verzoegert((i % 3) * 120)} className="pro-karte p-7">
              <p aria-hidden className="text-4xl text-violet-300">{l.symbol}</p>
              <p className="mt-6 text-2xl font-bold">{l.name}</p>
              <p className="mt-1 text-white/60">{l.text}</p>
              <p className="mt-6 flex items-baseline justify-between">
                <span className="text-sm text-white/50">{l.dauer ? `${l.dauer} Min.` : ""}</span>
                <span className="text-2xl font-bold">{abPreis(l.preis)}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Buchung */}
      <section id="buchen" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div data-reveal>
            <h2 className="text-5xl font-bold tracking-tighter sm:text-6xl">
              {betrieb.buchung.titel}
              <br />
              <span className="pro-verlauf-text">Ohne Anruf.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg text-white/70">
              {betrieb.buchung.text}
            </p>
            <ul className="mt-8 space-y-3 text-white/80">
              <li>✓ Bestätigung sofort per E-Mail</li>
              <li>✓ Erinnerung am Vortag</li>
              <li>✓ Umbuchen mit einem Klick</li>
            </ul>
          </div>
          <div data-reveal style={verzoegert(150)} className="pro-karte p-6 sm:p-8">
            <ProBuchung betrieb={betrieb} />
          </div>
        </div>
      </section>

      {/* Stimmen */}
      <section id="stimmen" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
        <h2 data-reveal className="text-5xl font-bold tracking-tighter sm:text-7xl">
          <span className="pro-verlauf-text">★ {sterne}</span> von {betrieb.bewertung.anzahl}
        </h2>
        <p className="mt-3 text-sm text-white/50">Beispielwerte</p>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {betrieb.bewertungen.map((b, i) => (
            <li key={b.name} data-reveal style={verzoegert(i * 150)} className="pro-karte p-7">
              <p className="text-lg leading-relaxed">„{b.text}“</p>
              <p className="mt-6 text-sm font-semibold text-violet-300">{b.name}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Kontakt */}
      <section id="kontakt" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
        <div data-reveal className="pro-karte overflow-hidden p-8 sm:p-12">
          <div aria-hidden className="pro-blob -right-20 -top-20 h-72 w-72 bg-fuchsia-600 opacity-40" />
          <div className="relative grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl">{betrieb.abschied}</h2>
              <p className="mt-4 text-lg text-white/70">
                {betrieb.strasse}, {betrieb.plz} {betrieb.ort}
              </p>
              <a href={betrieb.telefonLink} className="mt-6 inline-block text-3xl font-bold hover:text-violet-300">
                {betrieb.telefon}
              </a>
            </div>
            <dl className="space-y-2">
              {betrieb.oeffnungszeiten.map((o) => (
                <div key={o.tage} className="flex justify-between gap-4 border-b border-white/10 pb-2">
                  <dt className="text-white/60">{o.tage}</dt>
                  <dd className="font-semibold">{o.zeit}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-sm text-white/40">
        © {betrieb.name} · Impressum · Datenschutz
      </footer>

      <ProChat betrieb={betrieb} />
    </div>
  );
}
