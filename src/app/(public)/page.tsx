import Link from "next/link";
import { RueckrufFormular } from "@/components/public/RueckrufFormular";
import { Karte, buttonClass } from "@/components/ui";
import { Angabe } from "@/components/public/Angabe";
import { BeispielUmschalter } from "@/components/public/BeispielUmschalter";
import { FIRMA, preisHinweis } from "@/lib/firma";
import { PAKETE } from "@/lib/pakete";

const VERTRAUEN = [
  { titel: "Erst zahlen, wenn's passt", text: "Sie sehen Ihre Website als Demo, bevor Sie etwas bezahlen." },
  { titel: "Fixpreis", text: "Der Preis steht vorher fest. Keine Stundenabrechnung." },
  { titel: "Persönlich aus Wien", text: "Ein fixer Ansprechpartner, der Ihren Betrieb kennt." },
  { titel: "Die Website gehört Ihnen", text: "Inhalte und Domain gehören Ihnen – ohne Knebelvertrag." },
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
}: {
  id: string;
  titel: string;
  einleitung?: string;
  children: React.ReactNode;
  weiss?: boolean;
}) {
  return (
    <section id={id} className={`scroll-mt-16 py-16 sm:py-24 ${weiss ? "border-y border-line bg-surface" : ""}`}>
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{titel}</h2>
          {einleitung ? <p className="mt-3 text-lg text-muted">{einleitung}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export default function Startseite() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-14 sm:pb-20 sm:pt-24">
        <div className="max-w-3xl">
          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl">
            Eine Website für Ihren Betrieb. Erst ansehen, dann zahlen.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            Wir erstellen Ihnen eine kostenlose Demo Ihrer neuen Website. Wenn sie Ihnen gefällt, zahlen Sie einen
            fixen Preis. Wenn nicht, zahlen Sie nichts.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo?paket=business" className={buttonClass("primary", "sm:px-7")}>
              Gratis-Demo anfordern
            </Link>
            <Link href="#pakete" className={buttonClass("secondary", "sm:px-7")}>
              Pakete ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* Vertrauensleiste */}
      <section aria-label="Unsere Versprechen" className="border-y border-line bg-surface">
        <ul className="mx-auto grid w-full max-w-6xl gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {VERTRAUEN.map((v) => (
            <li key={v.titel} className="bg-surface px-4 py-6">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                {v.titel}
              </p>
              <p className="mt-1.5 pl-4 text-sm text-muted">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Pakete */}
      <Abschnitt
        id="pakete"
        titel="Pakete mit Fixpreis"
        einleitung="Ohne Abo-Falle und ohne Werbebudget. Sie wissen vorher, was es kostet."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {PAKETE.map((p) => {
            const hervorgehoben = p.id === "business";
            return (
              <Karte
                key={p.id}
                className={`relative flex flex-col p-6 sm:p-8 ${hervorgehoben ? "border-2 border-brand" : ""}`}
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
                <ul className="mt-6 flex-1 space-y-3">
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
        </div>
        <p className="mt-6 text-sm text-muted">
          Nach der Fertigstellung gehört die Website Ihnen: Wir übergeben sie samt Domain auf Ihren Namen – kein Abo
          nötig. Optional: Sorglos-Paket um {hosting} pro Monat (Pro {hostingPro}) mit Hosting, Domain, Updates und
          kleinen Änderungen, monatlich kündbar. Keine Werbe- oder Google-Ads-Pakete.
        </p>
      </Abschnitt>

      {/* Beispiele */}
      <Abschnitt
        id="beispiele"
        titel="Beispiele"
        einleitung="Ein Friseursalon, vier Designs. Wählen Sie ein Design und sehen Sie, was in jedem Paket steckt."
        weiss
      >
        <BeispielUmschalter />
      </Abschnitt>

      {/* Über uns */}
      <Abschnitt id="ueber-uns" titel="Über uns">
        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          <div className="flex aspect-square max-w-xs items-center justify-center rounded-xl border border-line bg-surface text-sm text-muted">
            <Angabe wert={null} platzhalter="Teamfoto" />
          </div>
          <div className="space-y-4 text-lg leading-relaxed text-muted">
            <p>
              Hinter {FIRMA.name} steht ein kleines Gründerteam aus Wien:{" "}
              <Angabe wert={null} platzhalter="Vornamen der Gründer" />.
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
