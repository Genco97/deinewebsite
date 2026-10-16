import { Karte, buttonClass } from "@/components/ui";
import { betragText, faelligBetrag } from "@/lib/zahlung";

export type RechnungLink = { nummer: string; betrag: number };
export type ZahlungsStand = { freigegeben: boolean; betrag: number; bezahlt: number; status: string };

/** „Rechnung und Zahlung“ auf der Kundenseite. Der offene Betrag kommt aus der Datenbank, nie aus der Adresse. */
export function ZahlungsKarte({
  code,
  paket,
  paketName,
  betreuer,
  zahlung: z,
  hinweis,
  rechnungen = [],
}: {
  code: string;
  paket: string;
  paketName: string;
  betreuer: string | null;
  zahlung: ZahlungsStand | null | undefined;
  hinweis: string;
  rechnungen?: RechnungLink[];
}) {
  if (!z) return null;
  const bezahlt = Number(z.bezahlt);
  const betrag = Number(z.betrag);
  const faellig = faelligBetrag(paket, betrag, bezahlt);
  const rechnungsListe =
    rechnungen.length > 0 ? (
      <ul className="mt-3 space-y-1 text-sm">
        {rechnungen.map((r) => (
          <li key={r.nummer}>
            <a href={`/rechnung/${code}/${r.nummer}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline">
              Rechnung {r.nummer} ansehen ({betragText(Number(r.betrag))})
            </a>
          </li>
        ))}
      </ul>
    ) : null;

  if (betrag > 0 && bezahlt >= betrag) {
    return (
      <Karte className="mt-6 border-ok/40 bg-ok-light p-5 sm:p-7">
        <p className="font-bold text-ok">✓ Danke, Ihre Zahlung ist eingegangen.</p>
        <p className="mt-1 text-sm text-ink">Bezahlt: {betragText(bezahlt)}</p>
        {rechnungsListe}
      </Karte>
    );
  }
  if (hinweis === "danke") {
    return (
      <Karte className="mt-6 border-ok/40 bg-ok-light p-5 sm:p-7">
        <p className="font-bold text-ok">Danke! Wir bestätigen Ihre Zahlung in wenigen Minuten.</p>
        <p className="mt-1 text-sm text-ink">Laden Sie diese Seite später noch einmal, dann steht hier „Zahlung eingegangen“ und Ihre Rechnung.</p>
      </Karte>
    );
  }
  if (!z.freigegeben || faellig <= 0) return null;
  const anzahlung = paket === "premium" && bezahlt <= 0 && faellig < betrag;
  return (
    <Karte className="mt-6 p-5 sm:p-7">
      <h2 className="font-serif text-2xl font-semibold text-ink">Rechnung und Zahlung</h2>
      {hinweis === "abgebrochen" ? <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Die Zahlung wurde abgebrochen. Es wurde nichts abgebucht.</p> : null}
      {hinweis === "nicht-moeglich" ? (
        <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Die Online-Zahlung klappt gerade nicht. Bitte melden Sie sich bei {betreuer ?? "Ihrer Ansprechperson"}.</p>
      ) : null}
      <dl className="mt-4 divide-y divide-line text-[15px]">
        <div className="flex justify-between py-2">
          <dt>Paket {paketName}</dt>
          <dd>{betragText(betrag)}</dd>
        </div>
        {bezahlt > 0 ? (
          <div className="flex justify-between py-2">
            <dt>Bereits bezahlt</dt>
            <dd>− {betragText(bezahlt)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between py-2 font-bold text-ink">
          <dt>{anzahlung ? "Jetzt fällig (30 % Anzahlung)" : "Jetzt fällig"}</dt>
          <dd>{betragText(faellig)}</dd>
        </div>
      </dl>
      <a href={`/p/${code}/zahlen`} className={buttonClass("primary", "mt-5 w-full")}>
        Jetzt sicher bezahlen
      </a>
      <p className="mt-3 text-center text-xs text-muted">Bezahlt wird auf der Seite unseres Zahlungsdienstleisters Stripe. Wir sehen Ihre Kartendaten nie.</p>
      {rechnungsListe}
      <p className="mt-3 text-sm text-muted">Sie möchten lieber überweisen? Schreiben Sie {betreuer ?? "uns"}, dann bekommen Sie eine Rechnung.</p>
    </Karte>
  );
}
