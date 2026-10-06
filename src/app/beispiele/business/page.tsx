import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { DemoFormular } from "@/components/beispiele/DemoFormular";
import { abPreis, betriebAusSuche } from "@/lib/beispiele";

export const metadata: Metadata = { title: "Beispiel: Business" };

const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-fraunces" });

const AKZENT = "#9a3412";
const serif = { fontFamily: "var(--font-fraunces), Georgia, serif" };
const feld =
  "mt-1 block min-h-11 w-full rounded-lg border border-[#e7d9c9] bg-white px-3 py-2 text-base font-normal focus:border-[#9a3412] focus:outline-none focus:ring-2 focus:ring-[#9a3412]/20";

export default async function BusinessBeispiel({ searchParams }: PageProps<"/beispiele/business">) {
  const betrieb = await betriebAusSuche(searchParams);
  const woerter = betrieb.name.split(" ");
  const letztes = woerter.length > 1 ? woerter.pop() : "";
  const kopf = woerter.join(" ");
  return (
    <div className={`${fraunces.variable} flex-1 bg-[#fbf7f2] text-[#2b2118]`}>
      <header className="sticky top-0 z-40 border-b border-[#efe3d5] bg-[#fbf7f2]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <p className="text-2xl font-semibold" style={serif}>
            {kopf} <em className="font-normal" style={{ color: AKZENT }}>{letztes}</em>
          </p>
          <nav aria-label="Beispiel-Navigation" className="hidden gap-7 text-sm font-medium md:flex">
            {["Leistungen", "Team", "Galerie", "Bewertungen", "Kontakt"].map((n) => (
              <a key={n} href={`#${n.toLowerCase()}`} className="hover:text-[#9a3412]">{n}</a>
            ))}
          </nav>
          <a href="#kontakt" className="rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: AKZENT }}>
            {betrieb.aktion}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.1fr_1fr] md:py-24">
        <div>
          <p className="inline-block rounded-full bg-[#f3e4d4] px-3 py-1 text-sm font-semibold" style={{ color: AKZENT }}>
            ★ 4,9 · über 200 Bewertungen
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] sm:text-6xl" style={serif}>
            {betrieb.hero[0]}<em className="font-normal" style={{ color: AKZENT }}>{betrieb.hero[1]}</em>{betrieb.hero[2]}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#6b5a4b]">{betrieb.einleitung}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#kontakt" className="inline-flex min-h-12 items-center justify-center rounded-full px-7 font-semibold text-white" style={{ background: AKZENT }}>
              {betrieb.aktion}
            </a>
            <a href={betrieb.telefonLink} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d9c4ae] px-7 font-semibold">
              {betrieb.telefon}
            </a>
          </div>
        </div>
        <div aria-hidden className="relative mx-auto aspect-[4/5] w-full max-w-sm">
          <div className="absolute inset-0 rounded-[48%_52%_44%_56%/55%_45%_55%_45%]" style={{ background: betrieb.heroFarbe }} />
          <div className="absolute -left-6 bottom-10 rounded-2xl bg-white px-4 py-3 shadow-lg">
            <p className="text-xs text-[#6b5a4b]">{betrieb.naechster.klein}</p>
            <p className="font-semibold">{betrieb.naechster.gross}</p>
          </div>
          <div className="absolute -right-3 top-8 rounded-2xl bg-white px-4 py-3 shadow-lg">
            <p className="font-semibold" style={{ color: AKZENT }}>Seit {betrieb.seit}</p>
            <p className="text-xs text-[#6b5a4b]">in Wien-{betrieb.bezirk}</p>
          </div>
        </div>
      </section>

      {/* Leistungen */}
      <section id="leistungen" className="scroll-mt-20 bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-4xl font-semibold" style={serif}>Leistungen</h2>
          <p className="mt-2 text-[#6b5a4b]">{betrieb.preisHinweis}</p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {betrieb.leistungen.map((l) => (
              <li key={l.id} className="group rounded-2xl border border-[#efe3d5] bg-[#fbf7f2] p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <p className="text-xl font-semibold" style={serif}>{l.name}</p>
                <p className="mt-1 text-sm text-[#6b5a4b]">{l.text}</p>
                <div className="mt-5 flex items-end justify-between">
                  <p className="text-sm text-[#6b5a4b]">{l.dauer ? `ca. ${l.dauer} Min.` : ""}</p>
                  <p className="text-2xl font-semibold" style={{ color: AKZENT }}>{abPreis(l.preis)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 md:py-24">
        <h2 className="text-4xl font-semibold" style={serif}>Unser Team</h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {betrieb.team.map((t) => (
            <li key={t.name} className="text-center">
              <div aria-hidden className="mx-auto grid h-36 w-36 place-items-center rounded-full text-5xl font-semibold text-white" style={{ background: t.farbe, ...serif }}>
                {t.name[0]}
              </div>
              <p className="mt-4 text-xl font-semibold" style={serif}>{t.name}</p>
              <p className="text-sm text-[#6b5a4b]">{t.rolle}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Galerie */}
      <section id="galerie" className="scroll-mt-20 bg-[#2b2118] py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-4xl font-semibold" style={serif}>Galerie</h2>
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
        <h2 className="text-4xl font-semibold" style={serif}>Das sagen unsere Kundinnen und Kunden</h2>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {betrieb.bewertungen.map((b) => (
            <li key={b.name} className="rounded-2xl bg-white p-6 shadow-sm">
              <p aria-label="5 von 5 Sternen" style={{ color: AKZENT }}>★★★★★</p>
              <p className="mt-3 leading-relaxed">„{b.text}“</p>
              <p className="mt-4 text-sm font-semibold text-[#6b5a4b]">{b.name}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ + Kontakt */}
      <section id="kontakt" className="scroll-mt-20 bg-white py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-semibold" style={serif}>Häufige Fragen</h2>
            <div className="mt-8 divide-y divide-[#efe3d5] border-y border-[#efe3d5]">
              {betrieb.fragen.map((q) => (
                <details key={q.f} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {q.f}
                    <span aria-hidden className="text-xl transition group-open:rotate-45" style={{ color: AKZENT }}>+</span>
                  </summary>
                  <p className="mt-2 text-[#6b5a4b]">{q.a}</p>
                </details>
              ))}
            </div>
            <h3 className="mt-10 text-2xl font-semibold" style={serif}>Öffnungszeiten</h3>
            <dl className="mt-4 space-y-1.5">
              {betrieb.oeffnungszeiten.map((o) => (
                <div key={o.tage} className="flex justify-between">
                  <dt className="text-[#6b5a4b]">{o.tage}</dt>
                  <dd className="font-semibold">{o.zeit}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-3xl bg-[#fbf7f2] p-6 sm:p-8">
            <h2 className="text-3xl font-semibold" style={serif}>{betrieb.aktion}</h2>
            <p className="mb-6 mt-2 text-[#6b5a4b]">
              {betrieb.strasse}, {betrieb.plz} {betrieb.ort} · {betrieb.telefon}
            </p>
            <DemoFormular knopf="Anfrage senden" feld={feld} akzent={AKZENT} wunsch={betrieb.wunsch} />
          </div>
        </div>
      </section>

      <footer className="bg-[#2b2118] py-8 text-center text-sm text-white/70">
        © {betrieb.name} · Impressum · Datenschutz
      </footer>
    </div>
  );
}
