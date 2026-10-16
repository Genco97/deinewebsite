import { DruckenKnopf } from "@/components/public/DruckenKnopf";
import { FIRMA, firmenname } from "@/lib/firma";
import { PAKET_NAMEN, istPaket } from "@/lib/pakete";
import { betragText } from "@/lib/zahlung";

const TAG = new Intl.DateTimeFormat("de-AT", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Vienna" });
const runden = (n: number) => Math.round(n * 100) / 100;

export type RechnungDaten = {
  nummer: string;
  /** JJJJ-MM-TT */
  datum: string;
  betrag: number;
  gesamt: number;
  paket: string;
  /** Hat es davor schon eine bezahlte Zahlung gegeben? */
  vorherBezahlt: boolean;
  lead: { firma: string; ansprechpartner: string | null; adresse: string | null; bezirk: string | null } | null;
};

/** Die Rechnung selbst – zum Ansehen am Bildschirm und zum Drucken bzw. Speichern als PDF. */
export function RechnungAnsicht({ nummer, datum: datumRoh, betrag, gesamt, paket, vorherBezahlt, lead }: RechnungDaten) {
  const teil = betrag < gesamt;
  const paketName = istPaket(paket) ? PAKET_NAMEN[paket] : paket;
  const anzahlung = teil && paket === "premium" && !vorherBezahlt;
  const leistung = anzahlung
    ? `Anzahlung (30 %) für die Erstellung Ihrer Website, Paket ${paketName}`
    : teil
      ? `Restzahlung für die Erstellung Ihrer Website, Paket ${paketName}`
      : `Erstellung Ihrer Website, Paket ${paketName}`;
  const ohneUst = FIRMA.kleinunternehmer === true;
  const netto = ohneUst ? betrag : runden(betrag / 1.2);
  const ust = ohneUst ? 0 : runden(betrag - netto);
  const datum = TAG.format(new Date(`${datumRoh}T12:00:00Z`));
  const absender = [FIRMA.strasse, [FIRMA.plz, FIRMA.ort].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-[#f3f4f6] px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-[820px] justify-end print:hidden">
        <DruckenKnopf />
      </div>
      <article className="mx-auto max-w-[820px] bg-white p-8 text-[15px] leading-relaxed text-[#1f2937] shadow-sm sm:p-12 print:max-w-none print:p-0 print:shadow-none">
        <header className="flex flex-col justify-between gap-6 sm:flex-row">
          <div>
            <p className="font-serif text-3xl font-bold uppercase tracking-[0.04em] text-[#0B1B3F]">{FIRMA.name}</p>
            <p className="mt-1 text-sm text-[#6b7280]">{firmenname()}</p>
          </div>
          <div className="text-sm sm:text-right">
            <p>{FIRMA.vertretung}</p>
            <p>{absender}</p>
            <p>{FIRMA.land}</p>
            {FIRMA.telefon ? <p>Tel. {FIRMA.telefon}</p> : null}
            {FIRMA.email ? <p>{FIRMA.email}</p> : null}
            {FIRMA.uid ? <p>UID: {FIRMA.uid}</p> : null}
          </div>
        </header>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Rechnung an</p>
            <p className="mt-1 font-semibold">{lead?.firma ?? "–"}</p>
            {lead?.ansprechpartner ? <p>{lead.ansprechpartner}</p> : null}
            {lead?.adresse ? <p>{lead.adresse}</p> : null}
            {lead?.bezirk ? <p>{lead.bezirk}</p> : null}
          </div>
          <dl className="text-sm sm:text-right">
            <div>
              <dt className="inline text-[#6b7280]">Rechnungsnummer: </dt>
              <dd className="inline font-semibold">{nummer}</dd>
            </div>
            <div>
              <dt className="inline text-[#6b7280]">Rechnungsdatum: </dt>
              <dd className="inline">{datum}</dd>
            </div>
            <div>
              <dt className="inline text-[#6b7280]">Leistungsdatum: </dt>
              <dd className="inline">{datum}</dd>
            </div>
          </dl>
        </div>

        <h1 className="mt-10 font-serif text-2xl font-semibold">Rechnung</h1>
        <table className="mt-4 w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-[#1f2937] text-sm">
              <th className="py-2 font-semibold">Leistung</th>
              <th className="py-2 text-right font-semibold">Betrag</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#e5e7eb] align-top">
              <td className="py-3 pr-4">
                {leistung}
                {teil ? <span className="block text-sm text-[#6b7280]">Gesamtpreis des Pakets: {betragText(gesamt)}</span> : null}
              </td>
              <td className="py-3 text-right">{betragText(netto)}</td>
            </tr>
          </tbody>
          <tfoot className="text-sm">
            {ohneUst ? null : (
              <>
                <tr>
                  <td className="pt-3 text-right text-[#6b7280]">Summe netto</td>
                  <td className="pt-3 text-right">{betragText(netto)}</td>
                </tr>
                <tr>
                  <td className="text-right text-[#6b7280]">Umsatzsteuer 20 %</td>
                  <td className="text-right">{betragText(ust)}</td>
                </tr>
              </>
            )}
            <tr className="text-base font-bold">
              <td className="pt-3 text-right">Gesamtbetrag</td>
              <td className="pt-3 text-right">{betragText(betrag)}</td>
            </tr>
          </tfoot>
        </table>

        {ohneUst ? <p className="mt-6 text-sm">Umsatzsteuerfrei aufgrund der Kleinunternehmerregelung (§ 6 Abs. 1 Z 27 UStG).</p> : null}
        <p className="mt-6 rounded-lg bg-[#ecfdf3] p-3 text-sm text-[#166534] print:border print:border-[#bbf7d0]">
          ✓ Der Betrag wurde am {datum} per Karte über Stripe bezahlt. Es ist nichts mehr zu überweisen.
        </p>
        <p className="mt-10 text-xs text-[#6b7280]">
          {firmenname()} · {absender} · {FIRMA.land}
          {FIRMA.uid ? ` · UID ${FIRMA.uid}` : ""} · Mitglied der {FIRMA.kammer}
        </p>
      </article>
    </div>
  );
}
