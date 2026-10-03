import type { Metadata } from "next";
import { SALON, euroGanz } from "@/lib/beispiele";

export const metadata: Metadata = { title: "Beispiel: Basic" };

// Bewusst schlicht: eine Seite, eine Spalte, das Wichtigste.
export default function BasicBeispiel() {
  return (
    <div className="flex-1 bg-white text-neutral-900" style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <main className="mx-auto max-w-2xl px-5 py-12">
        <h1 className="text-4xl font-bold">{SALON.name}</h1>
        <p className="mt-2 text-lg text-neutral-600">Friseur in {SALON.plz} {SALON.ort}</p>
        <p className="mt-6 leading-relaxed">{SALON.einleitung}</p>
        <a href={SALON.telefonLink} className="mt-6 inline-block rounded bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800">
          Jetzt anrufen: {SALON.telefon}
        </a>

        <h2 className="mt-12 border-b border-neutral-200 pb-2 text-2xl font-bold">Preise</h2>
        <table className="mt-4 w-full">
          <tbody>
            {SALON.leistungen.map((l) => (
              <tr key={l.id} className="border-b border-neutral-100">
                <td className="py-2.5">{l.name}</td>
                <td className="py-2.5 text-right">ab {euroGanz(l.preis)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mt-12 border-b border-neutral-200 pb-2 text-2xl font-bold">Öffnungszeiten</h2>
        <table className="mt-4 w-full">
          <tbody>
            {SALON.oeffnungszeiten.map((o) => (
              <tr key={o.tage}>
                <td className="py-1.5">{o.tage}</td>
                <td className="py-1.5 text-right">{o.zeit}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mt-12 border-b border-neutral-200 pb-2 text-2xl font-bold">Kontakt</h2>
        <p className="mt-4 leading-relaxed">
          {SALON.strasse}
          <br />
          {SALON.plz} {SALON.ort}
          <br />
          Telefon: <a href={SALON.telefonLink} className="text-teal-700 underline">{SALON.telefon}</a>
        </p>
        <div aria-hidden className="mt-4 grid h-48 place-items-center rounded bg-neutral-100 text-sm text-neutral-500">
          Karte
        </div>
      </main>
      <footer className="border-t border-neutral-200 py-5 text-center text-sm text-neutral-500">
        © {SALON.name} · Impressum · Datenschutz
      </footer>
    </div>
  );
}
