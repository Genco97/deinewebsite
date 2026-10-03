import type { Metadata } from "next";
import { Rechtstext } from "@/components/public/Rechtstext";

export const metadata: Metadata = { title: "Impressum" };

export default function Impressum() {
  return (
    <Rechtstext titel="Impressum">
      <p>Informationen gemäß § 5 ECG und Offenlegung gemäß § 25 MedienG.</p>
      <h2>Medieninhaber und Betreiber</h2>
      <p>
        [Firmenname]
        <br />
        [Adresse]
        <br />
        [PLZ Ort], Österreich
      </p>
      <h2>Kontakt</h2>
      <p>
        Telefon: [Telefon]
        <br />
        E-Mail: [E-Mail]
      </p>
      <h2>Unternehmensangaben</h2>
      <p>
        UID-Nummer: [UID]
        <br />
        Firmenbuchnummer: [FN] · Firmenbuchgericht: [Gericht]
        <br />
        Gewerbe: [Gewerbe] · Behörde: [Gewerbebehörde]
        <br />
        Mitglied der Wirtschaftskammer Wien
      </p>
      <p>[Platzhalter – bitte rechtlich prüfen lassen.]</p>
    </Rechtstext>
  );
}
