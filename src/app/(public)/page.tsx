import Link from "next/link";
import { RueckrufFormular } from "@/components/public/RueckrufFormular";
import { Karte, buttonClass } from "@/components/ui";
import { Angabe } from "@/components/public/Angabe";
import { BeispielUmschalter } from "@/components/public/BeispielUmschalter";
import { PaketAuswahl } from "@/components/public/PaketAuswahl";
import { PaketQuiz } from "@/components/public/PaketQuiz";
import { VorschauGenerator } from "@/components/public/VorschauGenerator";
import { FIRMA, preisHinweis } from "@/lib/firma";
import { PAKETE } from "@/lib/pakete";

// Einfache Strich-Symbole (24er-Raster), passend zur Schrift
const SYMBOL = {
  auge: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  preis: "M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z M7.5 7.5h.01",
  ort: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z M12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z",
  schluessel: "M15 7a4 4 0 1 1-3.9 4.9L4 19v2h3v-2h2v-2h2l1.1-1.1A4 4 0 0 1 15 7Z M16 9.5h.01",
};

const VERTRAUEN = [
  { titel: "Erst zahlen, wenn's passt", text: "Sie sehen Ihre Website als Demo, bevor Sie etwas bezahlen.", symbol: SYMBOL.auge },
  { titel: "Fixpreis", text: "Der Preis steht vorher fest. Keine Stundenabrechnung.", symbol: SYMBOL.preis },
  { titel: "Persönlich aus Wien", text: "Ein fixer Ansprechpartner, der Ihren Betrieb kennt.", symbol: SYMBOL.ort },
  { titel: "Die Website gehört Ihnen", text: "Inhalte und Domain gehören Ihnen – ohne Knebelvertrag.", symbol: SYMBOL.schluessel },
];

function Symbol({ d }: { d: string }) {
  return (
    <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </span>
  );
}

const ABLAUF = [
  { titel: "Anfrage", text: "Sie schicken uns zwei Minuten lang ein paar Infos – oder wir telefonieren kurz.", dauer: "2 Minuten" },
  { titel: "Demo in 48 h", text: "Wir bauen Ihre Website als Demo. Kostenlos und unverbindlich.", dauer: "2 Tage" },
  { titel: "Ihre Wünsche", text: "Sie sagen uns, was anders sein soll. Wir passen alles an.", dauer: "nach Ihrem Tempo" },
  { titel: "Online", text: "Sie geben frei, die Seite geht online. Erst jetzt zahlen Sie.", dauer: "Fixpreis" },
];

const hosting = <Angabe wert={FIRMA.hostingProMonat} platzhalter="Betrag" />;
const hostingPro = <Angabe wert={FIRMA.hostingProMonatPro} platzhalter="Betrag" />;

const FAQ: { frage: string; antwort: React.ReactNode }[] = [
  {
    frage: "Was passiert, wenn mir die Demo nicht gefällt?",
    antwort:
      "Dann zahlen Sie nichts. Die Demo ist für Sie kostenlos und unverbindlich – Sie entscheiden erst, wenn Sie das Ergebnis gesehen haben.",
  },
  {
    frage: "Gibt es versteckte Kosten?",
    antwort: (
      <>
        Nein. Sie zahlen einmal den vereinbarten Fixpreis. Danach haben Sie zwei Möglichkeiten: Sie übernehmen die
        Website ganz und zahlen Domain und Speicherplatz direkt bei Ihrem eigenen Anbieter (meist wenige Euro im
        Monat). Oder Sie wählen unser Sorglos-Paket um {hosting} pro Monat (beim Paket Pro {hostingPro}) – dann kümmern
        wir uns um Domain, Hosting, Updates und kleine Änderungen, monatlich kündbar.
      </>
    ),
  },
  {
    frage: "Wie lange dauert es, bis meine Website online ist?",
    antwort:
      "Beim Paket Basic rund 7 Tage, bei Business rund 10 Tage – gerechnet ab dem Zeitpunkt, an dem wir Ihre Fotos und Infos haben. Bei Pro legen wir den Zeitplan im Erstgespräch fest.",
  },
  {
    frage: "Wem gehört die Website?",
    antwort:
      "Ihnen. Texte, Fotos und Domain gehören Ihrem Betrieb. Nach der Bezahlung dürfen Sie die Website uneingeschränkt nutzen und ändern.",
  },
  {
    frage: "Was passiert, wenn die Website fertig ist?",
    antwort: (
      <>
        Sobald Sie die Website freigegeben und bezahlt haben, übergeben wir sie Ihnen: Domain und Speicherplatz laufen
        auf Ihren Namen, Sie bekommen alle Zugänge und Dateien. Ab dann gehört die Website ganz Ihnen. Spätere
        Änderungen machen wir gerne als neuen Auftrag. Wer sich um nichts kümmern möchte, wählt stattdessen das
        Sorglos-Paket um {hosting} pro Monat.
      </>
    ),
  },
  {
    frage: "Was ist eine Änderungsrunde?",
    antwort:
      "Sie sehen sich die fertige Website an und schicken uns alle Änderungswünsche gesammelt auf einmal. Wir setzen sie um. Wie viele Runden enthalten sind, steht beim jeweiligen Paket.",
  },
  {
    frage: "Brauche ich schon eine eigene Domain?",
    antwort:
      "Nein. Wenn Sie noch keine haben, kümmern wir uns darum – registriert wird sie auf Ihren Namen. Bei der Übergabe zahlen Sie sie direkt bei Ihrem Anbieter, im Sorglos-Paket ist sie enthalten. Eine bestehende Domain übernehmen wir gerne.",
  },
  {
    frage: "Was muss ich selbst tun?",
    antwort:
      "Schicken Sie uns Fotos und die wichtigsten Infos zu Ihrem Betrieb – etwa Leistungen, Öffnungszeiten und Kontaktdaten. Den Rest übernehmen wir.",
  },
  {
    frage: "Wie bezahle ich?",
    antwort:
      "Ganz einfach per Rechnung und Überweisung – erst nachdem Sie die Website freigegeben haben. Beim Paket Pro gibt es nach dem Erstgespräch eine Anzahlung von 30 %.",
  },
];

function Abschnitt({
  id,
  titel,
  einleitung,
  children,
  weiss = false,
  seitlich = false,
}: {
  id: string;
  titel: string;
  einleitung?: string;
  children: React.ReactNode;
  weiss?: boolean;
  /** Ab lg Überschrift links und Inhalt rechts daneben, statt untereinander */
  seitlich?: boolean;
}) {
  return (
    <section id={id} className={`scroll-mt-16 py-16 sm:py-24 ${weiss ? "border-y border-line bg-surface" : ""}`}>
      <div
        className={`mx-auto w-full max-w-6xl px-4 ${seitlich ? "lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-14" : ""}`}
      >
        <div className={`mb-10 max-w-2xl ${seitlich ? "lg:sticky lg:top-24 lg:mb-0" : ""}`}>
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{titel}</h2>
          {einleitung ? <p className="mt-3 text-lg text-muted">{einleitung}</p> : null}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

export default function Startseite() {
  return (
    <>
      {/* Hero mit Live-Vorschau (A2) */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-brand-light to-transparent" />
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:pb-20 sm:pt-16">
          <VorschauGenerator>
            <h1 className="font-serif text-[2.1rem] font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl xl:text-6xl">
              Eine Website für Ihren Betrieb. <span className="text-brand">Erst ansehen, dann zahlen.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:mt-5 sm:text-xl">
              Wir erstellen Ihnen eine kostenlose Demo Ihrer neuen Website. Wenn sie Ihnen gefällt, zahlen Sie einen
              fixen Preis. Wenn nicht, zahlen Sie nichts.
            </p>
          </VorschauGenerator>
        </div>
      </section>

      {/* Vertrauensleiste */}
      <section aria-label="Unsere Versprechen" className="border-y border-line bg-surface">
        <ul className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-4 gap-y-5 px-4 py-6 sm:gap-6 lg:grid-cols-4 lg:py-8">
          {VERTRAUEN.map((v) => (
            <li key={v.titel} className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Symbol d={v.symbol} />
              <div>
                <p className="text-[15px] font-semibold leading-snug text-ink">{v.titel}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-muted sm:text-sm">{v.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* So läuft es ab (D1) */}
      <Abschnitt id="ablauf" titel="So läuft es ab" einleitung="Vier Schritte, ein fixer Ansprechpartner. Und Sie zahlen erst ganz am Schluss.">
        {/* Zeitleiste: am Handy senkrecht, ab md waagrecht */}
        <ol className="grid md:grid-cols-4 md:gap-6">
          {ABLAUF.map((s, i) => {
            const letzter = i === ABLAUF.length - 1;
            return (
              <li key={s.titel} className="relative flex gap-4 pb-7 last:pb-0 md:block md:pb-0">
                {!letzter ? (
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-5 top-10 w-px bg-line md:bottom-auto md:left-12 md:right-[-1.5rem] md:top-5 md:h-px md:w-auto"
                  />
                ) : null}
                <span
                  aria-hidden
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${letzter ? "bg-brand text-white shadow-md shadow-brand/30" : "border border-line bg-surface text-brand"}`}
                >
                  {i + 1}
                </span>
                <div className="pt-1.5 md:mt-4 md:pt-0">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={`text-lg font-bold ${letzter ? "text-brand" : "text-ink"}`}>{s.titel}</span>
                    <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand">{s.dauer}</span>
                  </p>
                  <p className="mt-1 text-muted">{s.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-full bg-ok-light px-4 py-2 font-semibold text-ok">
          <span aria-hidden>✓</span> Sie zahlen erst bei Schritt 4.
          <span className="font-normal text-muted">Beim Paket Pro gibt es nach dem Erstgespräch eine Anzahlung von 30 %.</span>
        </p>
      </Abschnitt>

      {/* Beispiele (C3) */}
      <Abschnitt
        id="beispiele"
        titel="Ihre Branche, Ihr Design"
        einleitung="Wählen Sie Ihre Branche und ein Design. Sie sehen sofort, wie die Seite am Computer und am Handy aussieht."
        weiss
      >
        <BeispielUmschalter />
      </Abschnitt>

      {/* Pakete */}
      <Abschnitt
        id="pakete"
        titel="Pakete mit Fixpreis"
        einleitung="Ohne Abo-Falle und ohne Werbebudget. Sie wissen vorher, was es kostet."
      >
        <PaketAuswahl namen={PAKETE.map((p) => p.name)} start={PAKETE.findIndex((p) => p.id === "business")}>
          {PAKETE.map((p) => {
            const hervorgehoben = p.id === "business";
            return (
              <Karte
                key={p.id}
                className={`relative flex flex-col p-5 sm:p-8 ${hervorgehoben ? "border-2 border-brand" : ""}`}
              >
                {p.hinweis ? (
                  <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                    {p.hinweis}
                  </span>
                ) : null}
                <h3 className="text-lg font-bold text-ink">{p.name}</h3>
                <p className="mt-3 flex items-baseline gap-1.5">
                  {p.ab ? <span className="text-muted">ab</span> : null}
                  <span className="font-serif text-4xl font-semibold text-ink">{p.preisText}</span>
                </p>
                <p className="mt-1 text-sm text-muted">
                  einmalig, {preisHinweis() ?? <Angabe wert={null} platzhalter="inkl./zzgl. USt." />}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5 sm:mt-6 sm:space-y-3">
                  {p.leistungen.map((l) => (
                    <li key={l} className="flex gap-3 text-[15px] text-ink">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      {l}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 rounded-lg bg-brand-light px-3 py-2 text-sm font-medium text-ink">{p.zahlung}</p>
                <Link
                  href={`/demo?paket=${p.id}`}
                  className={buttonClass(hervorgehoben ? "primary" : "secondary", "mt-4 w-full")}
                >
                  {p.button}
                </Link>
              </Karte>
            );
          })}
        </PaketAuswahl>
        <p className="mt-6 text-sm text-muted">
          Nach der Fertigstellung gehört die Website Ihnen: Wir übergeben sie samt Domain auf Ihren Namen – kein Abo
          nötig. Optional: Sorglos-Paket um {hosting} pro Monat (Pro {hostingPro}) mit Hosting, Domain, Updates und
          kleinen Änderungen, monatlich kündbar. Keine Werbe- oder Google-Ads-Pakete.
        </p>
      </Abschnitt>

      {/* Paket-Quiz (B2) */}
      <Abschnitt id="quiz" titel="Welches Paket passt zu Ihnen?" einleitung="Drei kurze Fragen, dann wissen Sie es." weiss seitlich>
        <PaketQuiz />
      </Abschnitt>

      {/* Über uns */}
      <Abschnitt id="ueber-uns" titel="Über uns">
        <div className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-10">
          {FIRMA.teamfoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={FIRMA.teamfoto}
              alt={`Das Team von ${FIRMA.name}`}
              className="aspect-[4/3] w-full rounded-2xl object-cover md:aspect-square"
            />
          ) : (
            <figure className="relative overflow-hidden rounded-2xl bg-brand p-6 text-white sm:p-8">
              <span aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
              <span aria-hidden className="absolute -bottom-16 -left-8 h-44 w-44 rounded-full bg-white/5" />
              <blockquote className="relative font-serif text-2xl font-semibold leading-snug sm:text-3xl">
                „Eine gute Website soll man sich ansehen können, bevor man zahlt.“
              </blockquote>
              <figcaption className="relative mt-4 text-sm text-white/75">
                {FIRMA.gruender ? `${FIRMA.gruender}, ` : ""}Gründerteam {FIRMA.name} · Wien
              </figcaption>
            </figure>
          )}
          <div className="space-y-4 text-base leading-relaxed text-muted sm:text-lg">
            <p>
              Hinter {FIRMA.name} steht ein kleines Gründerteam aus Wien
              {FIRMA.gruender ? (
                <>
                  : <strong className="font-semibold text-ink">{FIRMA.gruender}</strong>.
                </>
              ) : (
                "."
              )}
            </p>
            <p>
              Viele Betriebe sind online kaum zu finden – nicht, weil sie schlecht arbeiten, sondern weil eine gute
              Website teuer und kompliziert wirkt. Genau das wollen wir ändern: Wir bauen Websites, die schnell
              online sind, einen fixen Preis haben und die Sie sich ansehen können, bevor Sie zahlen.
            </p>
            <p>
              Wir arbeiten persönlich aus Wien. Sie haben einen fixen Ansprechpartner, der Sie anruft, zuhört und
              Ihre Website so baut, dass Kundinnen und Kunden Sie finden.
            </p>
          </div>
        </div>
      </Abschnitt>

      {/* FAQ */}
      <Abschnitt id="fragen" titel="Häufige Fragen" weiss>
        <div className="max-w-3xl divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.frage} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {f.frage}
                <span aria-hidden className="text-xl text-brand transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 leading-relaxed text-muted">{f.antwort}</p>
            </details>
          ))}
        </div>
      </Abschnitt>

      {/* Rückruf */}
      <Abschnitt
        id="rueckruf"
        titel="Lieber kurz telefonieren?"
        einleitung="Hinterlassen Sie Ihre Nummer. Wir rufen Sie zurück – unverbindlich und ohne Verkaufsdruck."
      >
        <Karte className="max-w-2xl p-5 sm:p-8">
          <RueckrufFormular />
        </Karte>
      </Abschnitt>
    </>
  );
}
