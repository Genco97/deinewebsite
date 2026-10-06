import type { Metadata } from "next";
import { abPreis, betriebAusSuche } from "@/lib/beispiele";

export const metadata: Metadata = { title: "Beispiel: Basic" };

// Bewusst schlicht: eine Seite, eine Spalte, das Wichtigste.
export default async function BasicBeispiel({ searchParams }: PageProps<"/beispiele/basic">) {
  const betrieb = await betriebAusSuche(searchParams);
  return (
    <div className="flex-1 bg-white text-neutral-900" style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <main className="mx-auto max-w-2xl px-5 py-12">
        <h1 className="text-4xl font-bold">{betrieb.name}</h1>
        <p className="mt-2 text-lg text-neutral-600">{betrieb.art} in {betrieb.plz} {betrieb.ort}</p>
        <p className="mt-6 leading-relaxed">{betrieb.einleitung}</p>
        <a href={betrieb.telefonLink} className="mt-6 inline-block rounded bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800">
          Jetzt anrufen: {betrieb.telefon}
        </a>

        <h2 className="mt-12 border-b border-neutral-200 pb-2 text-2xl font-bold">Preise</h2>
        <table className="mt-4 w-full">
          <tbody>
            {betrieb.leistungen.map((l) => (
              <tr key={l.id} className="border-b border-neutral-100">
                <td className="py-2.5">{l.name}</td>
                <td className="py-2.5 text-right">{abPreis(l.preis)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mt-12 border-b border-neutral-200 pb-2 text-2xl font-bold">Öffnungszeiten</h2>
        <table className="mt-4 w-full">
          <tbody>
            {betrieb.oeffnungszeiten.map((o) => (
              <tr key={o.tage}>
                <td className="py-1.5">{o.tage}</td>
                <td className="py-1.5 text-right">{o.zeit}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mt-12 border-b border-neutral-200 pb-2 text-2xl font-bold">Kontakt</h2>
        <p className="mt-4 leading-relaxed">
          {betrieb.strasse}
          <br />
          {betrieb.plz} {betrieb.ort}
          <br />
          Telefon: <a href={betrieb.telefonLink} className="text-teal-700 underline">{betrieb.telefon}</a>
        </p>
        <div aria-hidden className="mt-4 grid h-48 place-items-center rounded bg-neutral-100 text-sm text-neutral-500">
          Karte
        </div>
      </main>
      <footer className="border-t border-neutral-200 py-5 text-center text-sm text-neutral-500">
        © {betrieb.name} · Impressum · Datenschutz
      </footer>
    </div>
  );
}
