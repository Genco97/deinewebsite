import { zahlungFreigeben } from "@/app/crm/leads/actions";
import { KopierFeld } from "@/components/crm/KopierFeld";
import { QrCode } from "@/components/crm/QrCode";
import { buttonClass } from "@/components/ui";
import { betragText, faelligBetrag } from "@/lib/zahlung";

export type RechnungsZeile = { nummer: string; betrag: number; datum: string };
export type ZahlungsZeile = { id: string; betrag: number; status: string; created_at: string; bezahlt_am: string | null };

/** Online-Zahlung zu einem Verkauf: Freigabe, Link für den Kunden und was schon bezahlt wurde. */
export async function ZahlungBox({
  dealId,
  leadId,
  paket,
  betrag,
  status,
  freigegeben,
  kundenCode,
  site,
  zahlungen,
  rechnungen = [],
  adresseFehlt = false,
  admin,
  stripeBereit,
}: {
  dealId: string;
  leadId: string;
  paket: string;
  betrag: number;
  status: string;
  freigegeben: boolean;
  kundenCode: string;
  site: string;
  zahlungen: ZahlungsZeile[];
  rechnungen?: RechnungsZeile[];
  adresseFehlt?: boolean;
  admin: boolean;
  stripeBereit: boolean;
}) {
  const bezahlt = zahlungen.filter((z) => z.status === "bezahlt").reduce((s, z) => s + Number(z.betrag), 0);
  const faellig = faelligBetrag(paket, Number(betrag), bezahlt);
  const link = `${site}/p/${kundenCode}/zahlen`;
  const fertig = status === "voll_bezahlt" || (betrag > 0 && bezahlt >= betrag);

  return (
    <div className="space-y-2 rounded-lg border border-line p-3">
      <p className="text-xs font-semibold text-ink">Online-Zahlung</p>
      {fertig ? (
        <p className="text-sm font-semibold text-ok">✓ Voll bezahlt{bezahlt > 0 ? ` (online ${betragText(bezahlt)})` : ""}</p>
      ) : (
        <>
          <p className="text-sm text-muted">
            Bezahlt: {betragText(bezahlt)} von {betragText(Number(betrag))}
            {faellig > 0 ? ` · als Nächstes fällig: ${betragText(faellig)}${paket === "premium" && bezahlt <= 0 ? " (30 % Anzahlung)" : ""}` : ""}
          </p>
          {!stripeBereit ? <p className="text-sm text-amber-900">Online-Zahlung ist noch nicht eingerichtet (Stripe-Schlüssel bei Vercel fehlen).</p> : null}
          {freigegeben ? (
            <>
              <p className="text-sm font-semibold text-ok">Für den Kunden freigegeben. Er kann jetzt bezahlen.</p>
              <div className="flex flex-wrap items-start gap-4">
                <QrCode wert={link} groesse={176} beschriftung="QR-Code zur Bezahlseite" />
                <div className="min-w-0 flex-1 space-y-2 text-sm text-muted">
                  <p>
                    <b className="text-ink">Im Geschäft:</b> Der Kunde hält die Handy-Kamera auf den QR-Code und zahlt mit Karte, Apple Pay oder Google Pay.
                  </p>
                  <p>
                    <b className="text-ink">Oder per Link:</b> kopieren und per WhatsApp schicken.
                  </p>
                  <KopierFeld wert={link} label="Direkter Zahlungslink" id={`zahlungslink-${dealId}`} />
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">
              {admin ? "Noch nicht freigegeben. Der Kunde sieht keinen Zahlungsknopf." : "Wartet auf einen Gründer: Er prüft den Betrag und gibt die Zahlung frei. Danach erscheint hier der QR-Code."}
            </p>
          )}
          {admin && status !== "gemeldet" ? (
            <form action={zahlungFreigeben}>
              <input type="hidden" name="deal" value={dealId} />
              <input type="hidden" name="lead" value={leadId} />
              <input type="hidden" name="an" value={freigegeben ? "0" : "1"} />
              <button className={buttonClass(freigegeben ? "secondary" : "primary", "px-3 text-sm")}>
                {freigegeben ? "Zahlung wieder sperren" : "Zahlung freigeben"}
              </button>
            </form>
          ) : null}
          {admin && status === "gemeldet" ? (
            <p className="text-sm text-muted">Zuerst den Verkauf unter Admin → Deals bestätigen (Betrag und Status setzen).</p>
          ) : null}
        </>
      )}
      {rechnungen.length > 0 ? (
        <ul className="space-y-1 text-sm">
          {rechnungen.map((r) => (
            <li key={r.nummer}>
              <a href={`/rechnung/${kundenCode}/${r.nummer}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline">
                Rechnung {r.nummer} ansehen →
              </a>{" "}
              <span className="text-muted">({betragText(Number(r.betrag))})</span>
            </li>
          ))}
        </ul>
      ) : null}
      {adresseFehlt && !fertig ? (
        <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-900">Bitte noch die Adresse des Kunden im Lead eintragen: Sie steht auf der Rechnung.</p>
      ) : null}
      {zahlungen.filter((z) => z.status === "bezahlt").length > 0 ? (
        <ul className="divide-y divide-line text-sm text-muted">
          {zahlungen
            .filter((z) => z.status === "bezahlt")
            .map((z) => (
              <li key={z.id} className="flex justify-between py-1">
                <span>{z.bezahlt_am ? new Date(z.bezahlt_am).toLocaleDateString("de-AT", { timeZone: "Europe/Vienna" }) : "–"}</span>
                <span className="font-semibold text-ink">{betragText(Number(z.betrag))}</span>
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}
