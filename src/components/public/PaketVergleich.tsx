import Link from "next/link";
import { Angabe } from "@/components/public/Angabe";
import { buttonClass } from "@/components/ui";
import { preisHinweis } from "@/lib/firma";
import { PAKETE, type PaketId } from "@/lib/pakete";

/** Nur Angaben, die bei jedem Paket in der Leistungsliste stehen (siehe lib/pakete.ts) */
const ZEILEN: { titel: string; werte: Record<PaketId, string> }[] = [
  { titel: "Umfang", werte: { basis: "1 Seite, optimiert fürs Handy", business: "Bis zu 5 Unterseiten", premium: "Nach dem Erstgespräch" } },
  { titel: "Design", werte: { basis: "Vorlage", business: "Vorlage", premium: "Eigenes Design" } },
  {
    titel: "Dabei",
    werte: {
      basis: "Kontakt, Öffnungszeiten und Karte",
      business: "Anfrage-Formular und Galerie",
      premium: "Online-Buchung oder Shop, persönliches Erstgespräch",
    },
  },
  {
    titel: "Gefunden werden",
    werte: { basis: "Eintrag bei Google (Unternehmensprofil)", business: "Lokales SEO für Ihre Gegend", premium: "Erweitertes SEO" },
  },
  { titel: "Online in", werte: { basis: "7 Tagen", business: "10 Tagen", premium: "Nach Absprache" } },
  { titel: "Änderungen", werte: { basis: "1 Korrektur von Texten und Fotos", business: "1 Änderungsrunde", premium: "2 Änderungsrunden" } },
];

/** Ab lg: alle drei Pakete in einer Tabelle, Business hervorgehoben */
export function PaketVergleich() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">Die drei Pakete im Vergleich</caption>
        <colgroup>
          <col className="w-[16%]" />
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr className="align-top">
            <td className="p-5" />
            {PAKETE.map((p) => {
              const top = p.id === "business";
              return (
                <th key={p.id} scope="col" className={`p-5 font-normal ${top ? "bg-brand-light" : ""}`}>
                  <p className="flex items-center gap-2 text-lg font-bold text-ink">
                    {p.name}
                    {p.hinweis ? <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">{p.hinweis}</span> : null}
                  </p>
                  <p className="mt-2 flex items-baseline gap-1.5">
                    {p.ab ? <span className="text-muted">ab</span> : null}
                    <span className="font-serif text-4xl font-semibold text-ink">{p.preisText}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    einmalig, {preisHinweis() ?? <Angabe wert={null} platzhalter="inkl./zzgl. USt." />}
                  </p>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {ZEILEN.map((z) => (
            <tr key={z.titel} className="border-t border-line align-top">
              <th scope="row" className="p-5 text-sm font-semibold text-muted">
                {z.titel}
              </th>
              {PAKETE.map((p) => (
                <td key={p.id} className={`p-5 text-[15px] text-ink ${p.id === "business" ? "bg-brand-light/50" : ""}`}>
                  {z.werte[p.id]}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-line align-top">
            <th scope="row" className="p-5 text-sm font-semibold text-muted">
              Bezahlung
            </th>
            {PAKETE.map((p) => (
              <td key={p.id} className={`p-5 text-[15px] font-medium text-ink ${p.id === "business" ? "bg-brand-light/50" : ""}`}>
                {p.zahlung}
              </td>
            ))}
          </tr>
          <tr className="border-t border-line">
            <td className="p-5" />
            {PAKETE.map((p) => (
              <td key={p.id} className={`p-5 ${p.id === "business" ? "bg-brand-light/50" : ""}`}>
                <Link href={`/demo?paket=${p.id}`} className={buttonClass(p.id === "business" ? "primary" : "secondary", "w-full")}>
                  {p.button}
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
