import { zahlungFreigeben } from "@/app/crm/leads/actions";
import { KopierFeld } from "@/components/crm/KopierFeld";
import { buttonClass } from "@/components/ui";
import { betragText, faelligBetrag } from "@/lib/zahlung";

export type ZahlungsZeile = { id: string; betrag: number; status: string; created_at: string; bezahlt_am: string | null };

/** Online-Zahlung zu einem Verkauf: Freigabe, Link für den Kunden und was schon bezahlt wurde. */
export function ZahlungBox({
  dealId,
  leadId,
  paket,
  betrag,
  status,
  freigegeben,
  kundenCode,
  site,
  zahlungen,
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
              <p className="text-sm font-semibold text-ok">Für den Kunden freigegeben. Er sieht „Jetzt bezahlen“ auf seiner Projektseite.</p>
              <KopierFeld wert={link} label="Direkter Zahlungslink" id={`zahlungslink-${dealId}`} />
            </>
          ) : (
            <p className="text-sm text-muted">Noch nicht freigegeben. Der Kunde sieht keinen Zahlungsknopf.</p>
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
