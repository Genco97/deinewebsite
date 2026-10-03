import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { ProBuchung } from "@/components/beispiele/ProBuchung";
import { ProChat } from "@/components/beispiele/ProChat";
import { ProEffekte } from "@/components/beispiele/ProEffekte";
import { SALON, euroGanz } from "@/lib/beispiele";
import "./pro.css";

export const metadata: Metadata = { title: "Beispiel: Pro" };

const grotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-grotesk" });

const verzoegert = (ms: number) => ({ "--pro-delay": `${ms}ms` }) as CSSProperties;

const ZAHLEN = [
  { zahl: 12, text: "Jahre in Neubau" },
  { zahl: 4.9, komma: 1, text: "Sterne auf Google" },
  { zahl: 8400, text: "zufriedene Köpfe" },
];

const SYMBOL: Record<string, string> = { damen: "✂", herren: "◆", farbe: "◐", straehnen: "✺", kinder: "☺", styling: "❀" };

export default function ProBeispiel() {
  return (
    <div className={`${grotesk.variable} pro-seite relative flex-1`}>
      <ProEffekte />

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#07070c]/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <p className="text-xl font-bold tracking-tight">
            MILA<span className="pro-verlauf-text">.</span>
          </p>
          <nav aria-label="Beispiel-Navigation" className="hidden gap-8 text-sm text-white/70 md:flex">
            <a href="#leistungen" className="hover:text-white">Leistungen</a>
            <a href="#buchen" className="hover:text-white">Termin</a>
            <a href="#stimmen" className="hover:text-white">Stimmen</a>
            <a href="#kontakt" className="hover:text-white">Kontakt</a>
          </nav>
          <a href="#buchen" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:scale-105">
            Jetzt buchen
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative grid min-h-[calc(100svh-4.5rem)] place-items-center overflow-hidden px-5 py-16">
        <div aria-hidden className="absolute inset-0">
          <div className="pro-blob left-[10%] top-[15%] h-[40vmax] w-[40vmax] bg-fuchsia-600" />
          <div className="pro-blob pro-blob-2 right-[5%] top-[30%] h-[35vmax] w-[35vmax] bg-violet-700" />
          <div className="pro-blob pro-blob-3 bottom-[-10%] left-[30%] h-[30vmax] w-[30vmax] bg-cyan-500" />
          <div className="absolute inset-0 bg-[radial-gradient(transparent_0,#07070c_75%)]" />
          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:64px_64px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <p data-reveal className="mx-auto w-fit rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
            ✦ Jetzt mit KI-Beratung & Online-Buchung
          </p>
          <h1 data-reveal style={verzoegert(120)} className="mt-8 text-[clamp(3rem,10vw,8.5rem)] font-bold leading-[0.9] tracking-tighter">
            Haare, die
            <br />
            <span className="pro-verlauf-text">Geschichten</span> erzählen.
          </h1>
          <p data-reveal style={verzoegert(240)} className="mx-auto mt-8 max-w-xl text-lg text-white/70 sm:text-xl">
            {SALON.einleitung}
          </p>
          <div data-reveal style={verzoegert(360)} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#buchen"
              className="inline-flex min-h-14 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-8 text-lg font-bold shadow-[0_0_60px_rgba(167,139,250,0.5)] transition hover:scale-105"
            >
              Termin in 20 Sekunden
            </a>
            <a href="#leistungen" className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 px-8 text-lg font-semibold transition hover:bg-white/10">
              Leistungen entdecken
            </a>
          </div>
        </div>
        <p aria-hidden className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-white/40">↓</p>
      </section>

      {/* Laufband */}
      <div aria-hidden className="relative z-10 -rotate-2 border-y border-white/10 bg-white py-4 text-black">
        <div className="pro-band">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {SALON.leistungen.map((l) => (
                <span key={l.id} className="flex items-center gap-6 px-6 text-2xl font-bold uppercase tracking-tight sm:text-4xl">
                  {l.name} <span className="text-violet-600">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Zahlen */}
      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 py-24 text-center sm:grid-cols-3">
        {ZAHLEN.map((z, i) => (
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

      {/* Leistungen */}
      <section id="leistungen" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
        <h2 data-reveal className="text-5xl font-bold tracking-tighter sm:text-7xl">
          Was wir <span className="pro-verlauf-text">können</span>.
        </h2>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SALON.leistungen.map((l, i) => (
            <li key={l.id} data-reveal style={verzoegert((i % 3) * 120)} className="pro-karte p-7">
              <p aria-hidden className="text-4xl text-violet-300">{SYMBOL[l.id]}</p>
              <p className="mt-6 text-2xl font-bold">{l.name}</p>
              <p className="mt-1 text-white/60">{l.text}</p>
              <p className="mt-6 flex items-baseline justify-between">
                <span className="text-sm text-white/50">{l.dauer} Min.</span>
                <span className="text-2xl font-bold">ab {euroGanz(l.preis)}</span>
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
              Termin.
              <br />
              <span className="pro-verlauf-text">Ohne Anruf.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg text-white/70">
              Leistung wählen, Tag wählen, Uhrzeit wählen – fertig. Rund um die Uhr, auch wenn der Salon geschlossen ist.
            </p>
            <ul className="mt-8 space-y-3 text-white/80">
              <li>✓ Bestätigung sofort per E-Mail</li>
              <li>✓ Erinnerung am Vortag</li>
              <li>✓ Umbuchen mit einem Klick</li>
            </ul>
          </div>
          <div data-reveal style={verzoegert(150)} className="pro-karte p-6 sm:p-8">
            <ProBuchung />
          </div>
        </div>
      </section>

      {/* Stimmen */}
      <section id="stimmen" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
        <h2 data-reveal className="text-5xl font-bold tracking-tighter sm:text-7xl">
          <span className="pro-verlauf-text">★ 4,9</span> von 200+
        </h2>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {SALON.bewertungen.map((b, i) => (
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
              <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl">Wir sehen uns im Siebten.</h2>
              <p className="mt-4 text-lg text-white/70">
                {SALON.strasse}, {SALON.plz} {SALON.ort}
              </p>
              <a href={SALON.telefonLink} className="mt-6 inline-block text-3xl font-bold hover:text-violet-300">
                {SALON.telefon}
              </a>
            </div>
            <dl className="space-y-2">
              {SALON.oeffnungszeiten.map((o) => (
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
        © {SALON.name} · Impressum · Datenschutz
      </footer>

      <ProChat />
    </div>
  );
}
