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

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          {premium ? "Beratung" : "Gratis-Demo"}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {premium ? "Beratung für Ihr Premium-Projekt" : "Ihre kostenlose Demo-Website"}
        </h1>
        <p className="mt-4 text-lg text-muted">
          {premium
            ? "Erzählen Sie uns kurz von Ihrem Vorhaben. Wir melden uns für ein persönliches Erstgespräch."
            : "Wir bauen eine Demo Ihrer neuen Website. Sie sehen sie sich in Ruhe an und entscheiden dann."}
        </p>

        <Karte className="mt-8 p-5">
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
          <ul className="mt-4 space-y-2 text-sm text-ink">
            {paket.leistungen.map((l) => (
              <li key={l} className="flex gap-2.5">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {l}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">{paket.zahlung}</p>
        </Karte>

        <nav aria-label="Paket wechseln" className="mt-4 flex flex-wrap gap-2 text-sm">
          {PAKETE.filter((p) => p.id !== paket.id).map((p) => (
            <Link
              key={p.id}
              href={`/demo?paket=${p.id}`}
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-brand hover:bg-brand-light"
            >
              Stattdessen {p.name}
            </Link>
          ))}
        </nav>
      </div>

      <Karte className="p-5 sm:p-8">
        <DemoFormular key={paket.id} paket={paket.id} button={premium ? "Beratung anfragen" : "Gratis-Demo anfordern"} />
      </Karte>
    </div>
  );
}
