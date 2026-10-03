import type { Metadata } from "next";
import Link from "next/link";
import { Angabe } from "@/components/public/Angabe";
import { Rechtstext } from "@/components/public/Rechtstext";
import { FIRMA, firmenname } from "@/lib/firma";

export const metadata: Metadata = { title: "Impressum" };

export default function Impressum() {
  return (
    <Rechtstext titel="Impressum">
      <p>
        Informationen gemäß § 5 E-Commerce-Gesetz (ECG), § 14 Unternehmensgesetzbuch (UGB), § 63 Gewerbeordnung
        (GewO) und Offenlegung gemäß § 25 Mediengesetz (MedienG).
      </p>

      <h2>Medieninhaber, Herausgeber und Diensteanbieter</h2>
      <p>
        {FIRMA.name} <Angabe wert={FIRMA.rechtsform} platzhalter="Rechtsform, z. B. e.U., OG oder GmbH" />
        <br />
        <Angabe wert={FIRMA.vertretung} platzhalter="Inhaber:in bzw. Gesellschafter:innen / Geschäftsführung" />
        <br />
        <Angabe wert={FIRMA.strasse} platzhalter="Straße und Hausnummer" />
        <br />
        <Angabe wert={FIRMA.plz} platzhalter="PLZ" /> {FIRMA.ort}, {FIRMA.land}
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <Angabe wert={FIRMA.telefon} platzhalter="Telefonnummer" />
        <br />
        E-Mail: <Angabe wert={FIRMA.email} platzhalter="E-Mail-Adresse" />
      </p>

      <h2>Unternehmensdaten</h2>
      <p>
        Unternehmensgegenstand: Erstellung und Betreuung von Websites für Unternehmen
        <br />
        UID-Nummer: <Angabe wert={FIRMA.uid} platzhalter="ATU…" />
        <br />
        Firmenbuchnummer: <Angabe wert={FIRMA.firmenbuchnummer} platzhalter="FN …, falls eingetragen" />
        <br />
        Firmenbuchgericht: <Angabe wert={FIRMA.firmenbuchgericht} platzhalter="z. B. Handelsgericht Wien" />
        <br />
        Firmensitz: {FIRMA.ort}
      </p>

      <h2>Gewerberechtliche Angaben</h2>
      <p>
        Gewerbe: <Angabe wert={FIRMA.gewerbe} platzhalter="Wortlaut laut Gewerbeschein" />
        <br />
        Gewerbebehörde: <Angabe wert={FIRMA.gewerbebehoerde} platzhalter="z. B. Magistratisches Bezirksamt für den … Bezirk" />
        <br />
        Mitglied der {FIRMA.kammer}
        <br />
        Anwendbare Rechtsvorschriften: Gewerbeordnung (GewO), abrufbar unter{" "}
        <a href="https://www.ris.bka.gv.at" className="text-brand underline" rel="noopener noreferrer" target="_blank">
          www.ris.bka.gv.at
        </a>
      </p>

      <h2>Grundlegende Richtung (§ 25 Abs. 4 MedienG)</h2>
      <p>
        Information über die Leistungen von {firmenname()} – die Erstellung und Betreuung von Websites für Betriebe –
        sowie Möglichkeit zur Kontaktaufnahme.
      </p>

      <h2>Haftung für Inhalte und Links</h2>
      <p>
        Wir erstellen die Inhalte dieser Website mit Sorgfalt, übernehmen aber keine Gewähr für Vollständigkeit und
        Aktualität. Für Inhalte externer Websites, auf die wir verlinken, sind ausschließlich deren Betreiber
        verantwortlich. Werden uns Rechtsverletzungen bekannt, entfernen wir die betreffenden Links umgehend.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Texte, Bilder und das Logo dieser Website sind urheberrechtlich geschützt. Eine Verwendung ist nur mit unserer
        Zustimmung erlaubt.
      </p>

      <p className="text-sm">
        Siehe auch: <Link href="/datenschutz" className="text-brand underline">Datenschutzerklärung</Link> ·{" "}
        <Link href="/agb" className="text-brand underline">AGB</Link>
      </p>
    </Rechtstext>
  );
}
