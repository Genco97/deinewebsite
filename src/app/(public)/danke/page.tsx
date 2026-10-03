import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui";

export const metadata: Metadata = {
  title: "Danke für Ihre Anfrage",
  robots: { index: false },
};

const TEXTE: Record<string, { titel: string; text: string }> = {
  demo: {
    titel: "Danke! Wir bauen Ihre Demo.",
    text: "Wir melden uns in den nächsten Tagen bei Ihnen, um kurz die Details zu besprechen. Bis dahin müssen Sie nichts tun – und nichts zahlen.",
  },
  beratung: {
    titel: "Danke für Ihre Anfrage.",
    text: "Wir melden uns bei Ihnen, um einen Termin für das Erstgespräch zu vereinbaren.",
  },
  rueckruf: {
    titel: "Danke! Wir rufen Sie zurück.",
    text: "Wir melden uns so bald wie möglich telefonisch bei Ihnen.",
  },
};

export default async function DankeSeite({ searchParams }: PageProps<"/danke">) {
  const { art } = await searchParams;
  const t = TEXTE[typeof art === "string" ? art : "demo"] ?? TEXTE.demo;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-20 sm:py-28">
      <span aria-hidden className="block h-10 w-10 rounded-lg bg-brand" />
      <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{t.titel}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{t.text}</p>
      <Link href="/" className={buttonClass("secondary", "mt-8")}>
        Zurück zur Startseite
      </Link>
    </div>
  );
}
