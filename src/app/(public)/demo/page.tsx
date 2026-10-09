import type { Metadata } from "next";
import Link from "next/link";
import { DemoFormular } from "@/components/public/DemoFormular";
import { Karte } from "@/components/ui";
import { Angabe } from "@/components/public/Angabe";
import { preisHinweis } from "@/lib/firma";
import { PAKETE, istPaket } from "@/lib/pakete";

export const metadata: Metadata = {
  title: "Gratis-Demo anfordern",
};

export default async function DemoSeite({ searchParams }: PageProps<"/demo">) {
  const sp = await searchParams;
  const roh = Array.isArray(sp.paket) ? sp.paket[0] : sp.paket;
  const paketId = istPaket(roh) ? roh : "business";
  const paket = PAKETE.find((p) => p.id === paketId)!;
  const premium = paket.id === "premium";
  // Aus der Vorschau auf der Startseite vorbefüllt
  const text = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).slice(0, 60) : "");
  const vorgabe = {
    firma: text("firma"),
    branche: text("branche"),
    wuensche: text("design") ? `Design wie im Beispiel „${text("design")}“.` : "",
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:gap-10 sm:py-16 lg:grid-cols-[1fr_1.3fr] lg:items-start">
      <div className="lg:sticky lg:top-24">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          {premium ? "Beratung" : "Gratis-Demo"}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {premium ? "Beratung für Ihr Pro-Projekt" : "Ihre kostenlose Demo-Website"}
        </h1>
        <p className="mt-3 text-base text-muted sm:mt-4 sm:text-lg">
          {premium
            ? "Erzählen Sie uns kurz von Ihrem Vorhaben. Wir melden uns für ein persönliches Erstgespräch."
            : "Wir bauen eine Demo Ihrer neuen Website. Sie sehen sie sich in Ruhe an und entscheiden dann."}
        </p>

        {/* Paket wechseln: Umschalter statt Links unter der Karte */}
        <nav aria-label="Paket wählen" className="mt-6 grid grid-cols-3 gap-1 rounded-full border border-line bg-surface p-1 sm:mt-8">
          {PAKETE.map((p) => (
            <Link
              key={p.id}
              href={`/demo?paket=${p.id}`}
              aria-current={p.id === paket.id ? "page" : undefined}
              className={`flex min-h-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                p.id === paket.id ? "bg-brand text-white" : "text-ink hover:text-brand"
              }`}
            >
              {p.name}
            </Link>
          ))}
        </nav>

        <Karte className="mt-3 p-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-bold text-ink">Paket {paket.name}</p>
            <p className="text-right">
              {paket.ab ? <span className="text-sm text-muted">ab </span> : null}
              <span className="font-serif text-2xl font-semibold text-ink">{paket.preisText}</span>
            </p>
          </div>
          <p className="mt-1 text-right text-xs text-muted">
            {preisHinweis() ?? <Angabe wert={null} platzhalter="inkl./zzgl. USt." />}
          </p>
          {/* Am Handy eingeklappt, damit das Formular gleich sichtbar ist */}
          <details className="group mt-3 lg:hidden">
            <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between text-sm font-semibold text-brand [&::-webkit-details-marker]:hidden">
              Was ist enthalten?
              <span aria-hidden className="transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <Leistungen paket={paket} />
          </details>
          <div className="hidden lg:block">
            <Leistungen paket={paket} />
          </div>
        </Karte>
      </div>

      <Karte className="p-5 sm:p-8">
        <DemoFormular key={paket.id} paket={paket.id} button={premium ? "Beratung anfragen" : "Gratis-Demo anfordern"} vorgabe={vorgabe} />
      </Karte>
    </div>
  );
}

function Leistungen({ paket }: { paket: (typeof PAKETE)[number] }) {
  return (
    <>
      <ul className="mt-3 space-y-2 text-sm text-ink lg:mt-4">
        {paket.leistungen.map((l) => (
          <li key={l} className="flex gap-2.5">
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            {l}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">{paket.zahlung}</p>
    </>
  );
}
