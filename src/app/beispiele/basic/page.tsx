import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Icon, Sterne } from "@/components/beispiele/Icon";
import { OffenStatus } from "@/components/beispiele/OffenStatus";
import { GRUNDSCHRIFT, TITELSCHRIFT, schriftVariablen } from "@/lib/beispiel-schriften";
import { abPreis, betriebAusSuche, ueberUns } from "@/lib/beispiele";

export const metadata: Metadata = { title: "Beispiel: Basic" };

const sterne = (n: number) => n.toLocaleString("de-AT", { minimumFractionDigits: 1 });

// Basic „Editorial“: eine ruhige, hochwertige Seite – ohne Bewegung, alles Wichtige auf einen Blick.
export default async function BasicBeispiel({ searchParams }: PageProps<"/beispiele/basic">) {
  const betrieb = await betriebAusSuche(searchParams);
  const st = betrieb.stil;
  const farben = {
    "--a-bg": st.bg,
    "--a-flaeche": st.flaeche,
    "--a-tief": st.tief,
    "--a-ink": st.ink,
    "--a-muted": st.muted,
    "--a-linie": st.linie,
    "--a-akzent": st.akzent,
    "--a-auf": st.aufAkzent,
    "--a-titel": TITELSCHRIFT[st.schrift],
    fontFamily: GRUNDSCHRIFT,
  } as CSSProperties;
  const titel = { fontFamily: "var(--a-titel)" };
  const gross = st.schrift === "display" ? " uppercase" : "";
  const woerter = betrieb.name.split(" ");
  const letztes = woerter.length > 1 ? woerter.pop() : "";
  const vorname = betrieb.inhaberin.split(" ")[0];
  const zitat = betrieb.bewertungen[0];
  const knopf = "inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full px-7 font-semibold transition hover:-translate-y-0.5";
  const kicker = "text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--a-akzent)]";
  const h2 = `text-[clamp(2.4rem,4.6vw,3.6rem)] font-normal leading-[1.02] tracking-tight${gross}`;

  return (
    <div className={`${schriftVariablen} flex-1 bg-[var(--a-bg)] pb-20 text-[var(--a-ink)] md:pb-0`} style={farben}>
      <header className="mx-auto flex h-20 max-w-6xl items-center gap-10 px-5">
        <p className={`text-2xl${gross}`} style={titel}>
          {woerter.join(" ")} <em className="text-[var(--a-akzent)]">{letztes}</em>
        </p>
        <nav aria-label="Beispiel-Navigation" className="ml-auto hidden gap-8 text-[15px] text-[var(--a-muted)] md:flex">
          <a href="#leistungen" className="hover:text-[var(--a-ink)]">Leistungen</a>
          <a href="#ueber" className="hover:text-[var(--a-ink)]">Über uns</a>
          <a href="#besuch" className="hover:text-[var(--a-ink)]">Besuch</a>
        </nav>
        <a href={betrieb.telefonLink} className="ml-auto hidden items-center gap-2 border-l border-[var(--a-linie)] pl-7 font-semibold sm:flex md:ml-0">
          <Icon name="tel" className="h-[18px] w-[18px]" />
          {betrieb.telefon}
        </a>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        {/* Held: Text links, zwei Fotos rechts */}
        <section className="grid items-end gap-12 pt-6 md:grid-cols-2 md:gap-16 md:pt-10">
          <div>
            <p className={kicker}>
              {betrieb.art} in Wien-{betrieb.bezirk} · seit {betrieb.seit}
            </p>
            <h1 className={`mt-6 text-[clamp(3rem,7vw,5.5rem)] font-normal leading-[0.98] tracking-[-0.035em]${gross}`} style={titel}>
              {betrieb.hero[0]}
              <em className="text-[var(--a-akzent)]">{betrieb.hero[1]}</em>
              {betrieb.hero[2]}
            </h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-[var(--a-muted)]">{betrieb.einleitung}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href={betrieb.telefonLink} className={`${knopf} bg-[var(--a-akzent)] text-[var(--a-auf)]`}>
                <Icon name="tel" />
                {betrieb.aktion}
              </a>
              <a href="#leistungen" className={`${knopf} border border-[var(--a-ink)]/80`}>
                Preise ansehen
              </a>
            </div>
          </div>
          <div aria-hidden className="relative h-[420px] md:h-[600px]">
            <div
              className="absolute inset-y-0 right-0 w-[86%] rounded bg-cover bg-center md:w-[82%]"
              style={{ background: betrieb.bild ? `center / cover url(${betrieb.bild.hero})` : betrieb.heroFarbe }}
            />
            <div
              className="absolute bottom-10 left-0 h-44 w-[44%] rounded border-[10px] border-[var(--a-bg)] md:h-60"
              style={{ background: betrieb.bild?.einblick ? `center / cover url(${betrieb.bild.einblick})` : betrieb.galerie[0].farbe }}
            />
          </div>
        </section>

        {/* Das Wichtigste in einer Leiste */}
        <ul className="mt-16 grid grid-cols-1 border-y border-[var(--a-linie)] sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
          {[
            { icon: "uhr" as const, klein: "Heute", inhalt: <OffenStatus zeiten={betrieb.oeffnungszeiten} className="font-semibold" /> },
            { icon: "pin" as const, klein: "Adresse", inhalt: <b className="font-semibold">{betrieb.strasse}, {betrieb.plz} {betrieb.ort}</b> },
            { icon: "stern" as const, klein: "Google", inhalt: <b className="font-semibold">{sterne(betrieb.bewertung.sterne)} · {betrieb.bewertung.anzahl} Bewertungen</b> },
            { icon: "tel" as const, klein: "Telefon", inhalt: <a href={betrieb.telefonLink} className="font-semibold">{betrieb.telefon}</a> },
          ].map((x, i) => (
            <li key={x.klein} className={`flex gap-3.5 py-6 ${i ? "border-t border-[var(--a-linie)] sm:border-t-0 lg:border-l lg:pl-7" : ""} ${i === 1 ? "sm:border-l sm:pl-7" : ""} ${i === 2 ? "sm:border-t lg:border-t-0" : ""} ${i === 3 ? "sm:border-l sm:border-t sm:pl-7 lg:border-t-0" : ""}`}>
              <Icon name={x.icon} className="mt-0.5 h-5 w-5 text-[var(--a-akzent)]" />
              <span>
                <small className="block text-[13px] text-[var(--a-muted)]">{x.klein}</small>
                {x.inhalt}
              </span>
            </li>
          ))}
        </ul>

        {/* Leistungen als ruhige Preisliste */}
        <section id="leistungen" className="scroll-mt-6 pt-28 md:pt-36">
          <div className="grid items-end gap-6 md:grid-cols-2 md:gap-16">
            <h2 className={h2} style={titel}>
              Leistungen
              <br />& Preise
            </h2>
            <p className="max-w-md text-[17px] text-[var(--a-muted)]">{betrieb.preisHinweis}</p>
          </div>
          <ul className="mt-12 grid gap-x-16 md:grid-cols-2">
            {betrieb.leistungen.map((l) => (
              <li key={l.id} className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 border-b border-[var(--a-linie)] py-5">
                <b className={`text-[22px] font-normal tracking-tight${gross}`} style={titel}>{l.name}</b>
                <i aria-hidden className="-translate-y-1.5 border-b border-dotted border-[var(--a-muted)]/40" />
                <span className="whitespace-nowrap text-[21px] text-[var(--a-akzent)]" style={titel}>{abPreis(l.preis)}</span>
                <small className="col-span-3 mt-1 text-sm text-[var(--a-muted)]">
                  {l.text}
                  {l.dauer ? ` · ca. ${l.dauer} Min.` : ""}
                </small>
              </li>
            ))}
          </ul>
        </section>

        {/* Über uns */}
        <section id="ueber" className="grid scroll-mt-6 items-center gap-12 pt-28 md:grid-cols-[1.1fr_0.9fr] md:gap-20 md:pt-36">
          <div
            aria-hidden
            className="h-[360px] rounded md:h-[540px]"
            style={{ background: betrieb.bild ? `center / cover url(${betrieb.bild.einblick ?? betrieb.bild.hero})` : betrieb.heroFarbe }}
          />
          <div>
            <p className={kicker}>Über uns</p>
            <h2 className={`${h2} mt-5`} style={titel}>{betrieb.slogan}</h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--a-ink)]/85">{ueberUns(betrieb)}</p>
            <p className="mt-7 text-3xl italic text-[var(--a-akzent)]" style={{ fontFamily: TITELSCHRIFT.serif }}>{vorname}</p>
          </div>
        </section>

        {/* Eine Stimme, groß */}
        <section className="mx-auto max-w-4xl pt-28 text-center md:pt-36">
          <p className="text-[var(--a-akzent)]"><Sterne /></p>
          <blockquote className={`mt-7 text-[clamp(1.8rem,3.6vw,2.75rem)] leading-[1.18] tracking-tight${gross}`} style={titel}>
            „{zitat.text}“
          </blockquote>
          <p className="mt-6 text-[var(--a-muted)]">
            {zitat.name} · eine von {betrieb.bewertung.anzahl} Bewertungen auf Google
          </p>
        </section>
      </main>

      {/* Besuch: Öffnungszeiten, Adresse, Telefon */}
      <footer id="besuch" className="mt-28 scroll-mt-6 bg-[var(--a-tief)] pb-10 pt-24 text-white md:mt-36 md:pt-28">
        <div className="mx-auto max-w-6xl px-5">
          <p className={`${kicker} !text-white/60`}>Besuch</p>
          <h2 className={`${h2} mt-4`} style={titel}>{betrieb.abschied}</h2>
          <div className="mt-14 grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-white/60">Öffnungszeiten</h3>
              <dl>
                {betrieb.oeffnungszeiten.map((o) => (
                  <div key={o.tage} className="flex justify-between gap-4 border-b border-white/10 py-2.5">
                    <dt className="text-white/75">{o.tage}</dt>
                    <dd>{o.zeit}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-white/60">Adresse</h3>
              <p className="text-xl">
                {betrieb.strasse}
                <br />
                {betrieb.plz} {betrieb.ort}
              </p>
              <a href="#besuch" className={`${knopf} mt-6 border border-white/35 !min-h-12`}>
                <Icon name="pin" />
                Route planen
              </a>
              <p className="mt-3 text-xs text-white/50">Auf der echten Seite: Google-Karte mit Route.</p>
            </div>
            <div>
              <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-white/60">{betrieb.aktion}</h3>
              <a href={betrieb.telefonLink} className="block text-4xl tracking-tight" style={titel}>{betrieb.telefon}</a>
              <a href={`mailto:${betrieb.email}`} className="mt-2 block text-white/65">{betrieb.email}</a>
              <a href={betrieb.telefonLink} className={`${knopf} mt-6 bg-[var(--a-akzent)] text-[var(--a-auf)] !min-h-12`}>
                Jetzt anrufen
              </a>
            </div>
          </div>
          <div className="mt-20 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-sm text-white/55">
            <span>© {betrieb.name}</span>
            <span>Impressum · Datenschutz</span>
          </div>
        </div>
      </footer>

      {/* Am Handy immer sichtbar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-[var(--a-linie)] bg-[var(--a-bg)]/95 p-3 backdrop-blur md:hidden">
        <a href={betrieb.telefonLink} className={`${knopf} !min-h-12 flex-1 bg-[var(--a-akzent)] text-[var(--a-auf)]`}>
          <Icon name="tel" />
          Anrufen
        </a>
        <a href="#besuch" className={`${knopf} !min-h-12 flex-1 border border-[var(--a-linie)] bg-[var(--a-flaeche)]`}>
          <Icon name="pin" />
          Route
        </a>
      </div>
    </div>
  );
}
