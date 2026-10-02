import type { Metadata } from "next";
import { Rechtstext } from "@/components/public/Rechtstext";

export const metadata: Metadata = { title: "AGB" };

export default function Agb() {
  return (
    <Rechtstext titel="Allgemeine Geschäftsbedingungen">
      <p>[Platzhalter – die AGB werden noch ergänzt und rechtlich geprüft.]</p>
      <h2>Demo und Bezahlung</h2>
      <p>
        [Platzhalter: Die Demo ist kostenlos und unverbindlich. Erst nach Freigabe wird der vereinbarte Fixpreis
        fällig. Beim Paket Premium wird nach dem Erstgespräch eine Anzahlung von 30 % fällig.]
      </p>
      <h2>Änderungsrunden</h2>
      <p>[Platzhalter: Umfang der enthaltenen Korrekturen und Änderungsrunden je Paket.]</p>
      <h2>Hosting</h2>
      <p>[Platzhalter: Hosting und Wartung um [Betrag] pro Monat, Kündigungsfrist.]</p>
    </Rechtstext>
  );
}
