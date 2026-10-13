/**
 * Zahlungslogik (rein, ohne Datenbank und ohne Stripe – deshalb einfach zu testen).
 * Alle Beträge in Euro; Stripe rechnet in Cent.
 */
export const ANZAHLUNG_PRO = 0.3;

export function inCent(euro: number) {
  return Math.round(euro * 100);
}

export function runden(euro: number) {
  return Math.round(euro * 100) / 100;
}

/**
 * Wie viel ist jetzt zu zahlen?
 * Pro („premium“): zuerst 30 % Anzahlung, danach der Rest. Basic/Business: der ganze Rest.
 * 0, wenn nichts mehr offen ist.
 */
export function faelligBetrag(paket: string, betrag: number, bezahlt: number) {
  const rest = runden(betrag - bezahlt);
  if (rest <= 0) return 0;
  if (paket === "premium" && bezahlt <= 0) return Math.min(rest, runden(betrag * ANZAHLUNG_PRO));
  return rest;
}

/** Dealstatus nach einer eingegangenen Zahlung */
export function statusNachZahlung(betrag: number, bezahltGesamt: number): "angezahlt" | "voll_bezahlt" {
  return runden(bezahltGesamt) >= runden(betrag) ? "voll_bezahlt" : "angezahlt";
}

export function betragText(euro: number) {
  return new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(euro);
}
