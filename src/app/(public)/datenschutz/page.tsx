import type { Metadata } from "next";
import { Rechtstext } from "@/components/public/Rechtstext";

export const metadata: Metadata = { title: "Datenschutz" };

export default function Datenschutz() {
  return (
    <Rechtstext titel="Datenschutzerklärung">
      <p>[Platzhalter – die Datenschutzerklärung wird noch ergänzt und rechtlich geprüft.]</p>
      <h2>Verantwortlicher</h2>
      <p>[Firmenname], [Adresse], [E-Mail]</p>
      <h2>Anfragen über unsere Formulare</h2>
      <p>
        Wenn Sie eine Demo, einen Rückruf oder eine Beratung anfragen, speichern wir Ihre Angaben (z. B. Name,
        Betrieb, E-Mail, Telefon, Wünsche), um Ihre Anfrage zu bearbeiten. Rechtsgrundlage: Art. 6 Abs. 1 lit. b
        DSGVO. [Speicherdauer, Auftragsverarbeiter (z. B. Hosting, Datenbank), Ihre Rechte – Platzhalter.]
      </p>
      <h2>Ihre Rechte</h2>
      <p>
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und
        Widerspruch. Beschwerden können Sie bei der Österreichischen Datenschutzbehörde einbringen.
      </p>
    </Rechtstext>
  );
}
