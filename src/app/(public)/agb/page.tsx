import type { Metadata } from "next";
import { Angabe } from "@/components/public/Angabe";
import { Rechtstext } from "@/components/public/Rechtstext";
import { FIRMA, firmenname, preisHinweis } from "@/lib/firma";

export const metadata: Metadata = { title: "AGB" };

export default function Agb() {
  return (
    <Rechtstext titel="Allgemeine Geschäftsbedingungen">
      <p>
        Für alle Aufträge an {firmenname()} („wir“) gelten diese Allgemeinen Geschäftsbedingungen. Abweichende
        Bedingungen des Kunden gelten nur, wenn wir ihnen schriftlich zustimmen.
      </p>

      <h2>1. Leistungen</h2>
      <p>
        Wir erstellen Websites für Betriebe in den Paketen Basic, Business und Pro. Der genaue Leistungsumfang ergibt
        sich aus der Paketbeschreibung auf unserer Website bzw. aus dem individuellen Angebot (Pro). Zusätzliche
        Leistungen vereinbaren wir gesondert.
      </p>

      <h2>2. Gratis-Demo und Vertragsabschluss</h2>
      <p>
        Bei den Paketen Basic und Business erstellen wir zunächst eine kostenlose und unverbindliche Demo. Gefällt dem
        Kunden die Demo nicht, entstehen ihm keine Kosten. Der Vertrag kommt erst zustande, wenn der Kunde die Demo
        freigibt und den Auftrag erteilt (schriftlich, per E-Mail oder mündlich mit schriftlicher Bestätigung durch
        uns).
      </p>
      <p>
        Beim Paket Pro erstellen wir nach einem Erstgespräch ein Angebot. Mit Annahme des Angebots kommt der Vertrag
        zustande.
      </p>

      <h2>3. Preise und Zahlung</h2>
      <p>
        Es gelten die vereinbarten Fixpreise{" "}
        {preisHinweis() ? `(${preisHinweis()})` : <Angabe wert={null} platzhalter="inkl./zzgl. USt. oder Kleinunternehmer" />}.
        Rechnungen sind innerhalb von 14 Tagen ohne Abzug zu bezahlen.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong className="text-ink">Basic und Business:</strong> Der Preis wird mit der Freigabe der Website zur
          Veröffentlichung fällig.
        </li>
        <li>
          <strong className="text-ink">Pro:</strong> 30 % Anzahlung nach Annahme des Angebots, der Rest mit der
          Freigabe zur Veröffentlichung.
        </li>
      </ul>
      <p>Eine Online-Zahlung über die Website gibt es nicht; wir stellen eine Rechnung aus.</p>

      <h2>4. Mitwirkung des Kunden</h2>
      <p>
        Der Kunde stellt uns die nötigen Inhalte (Texte, Fotos, Logos, Öffnungszeiten, Kontaktdaten usw.) rechtzeitig
        zur Verfügung. Die genannten Fertigstellungszeiten (7 bzw. 10 Tage) beginnen, sobald alle Inhalte vorliegen.
      </p>
      <p>
        Der Kunde bestätigt, dass er an den übermittelten Inhalten die nötigen Rechte besitzt (insbesondere Urheber-
        und Bildrechte) und dass die Inhalte keine Rechte Dritter verletzen. Er hält uns von Ansprüchen Dritter frei,
        die auf von ihm gelieferten Inhalten beruhen.
      </p>

      <h2>5. Korrekturen und Änderungsrunden</h2>
      <p>
        Im Paketpreis sind enthalten: Basic – 1 Korrektur von Texten und Fotos; Business – 1 Änderungsrunde; Pro –
        2 Änderungsrunden. Eine Änderungsrunde umfasst alle Änderungswünsche, die der Kunde gesammelt auf einmal
        übermittelt. Weitere Änderungen führen wir nach vorheriger Absprache gegen gesondertes Entgelt durch.
      </p>

      <h2>6. Freigabe</h2>
      <p>
        Nach Fertigstellung übergeben wir die Website zur Prüfung. Mit der Freigabe durch den Kunden gilt die Website
        als abgenommen. Meldet der Kunde innerhalb von 14 Tagen nach Übergabe keine wesentlichen Mängel, gilt die
        Website ebenfalls als abgenommen.
      </p>

      <h2>7. Rechte an der Website und Domain</h2>
      <p>
        Nach vollständiger Bezahlung erhält der Kunde das zeitlich und örtlich unbeschränkte Recht, die Website zu
        nutzen und zu ändern. Die Rechte an den vom Kunden gelieferten Inhalten verbleiben beim Kunden. Eine Domain
        wird auf den Namen des Kunden registriert. Wir dürfen die Website als Referenz nennen, sofern der Kunde nicht
        widerspricht.
      </p>

      <h2>8. Hosting und Wartung</h2>
      <p>
        Auf Wunsch übernehmen wir Hosting und Wartung der Website um{" "}
        <Angabe wert={FIRMA.hostingProMonat} platzhalter="Betrag" /> pro Monat. Dieser Vertrag läuft auf unbestimmte
        Zeit und kann von beiden Seiten mit einer Frist von einem Monat zum Monatsende gekündigt werden. Bei
        Kündigung übergeben wir dem Kunden auf Wunsch alle Dateien der Website.
      </p>

      <h2>9. Gewährleistung und Haftung</h2>
      <p>
        Es gelten die gesetzlichen Gewährleistungsbestimmungen. Wir haften – außer bei Personenschäden – nur für
        Vorsatz und grobe Fahrlässigkeit. Eine bestimmte Platzierung in Suchmaschinen (z. B. bei Google) können wir
        nicht garantieren, da diese von Dritten bestimmt wird. Gegenüber Verbrauchern gelten diese Einschränkungen nur,
        soweit das Konsumentenschutzgesetz dies zulässt.
      </p>

      <h2>10. Verbraucher</h2>
      <p>
        Unser Angebot richtet sich in erster Linie an Unternehmer. Ist der Kunde Verbraucher und wird der Vertrag
        ausschließlich über Fernkommunikationsmittel (z. B. Telefon, E-Mail) geschlossen, steht ihm ein gesetzliches
        Rücktrittsrecht von 14 Tagen nach dem Fern- und Auswärtsgeschäfte-Gesetz (FAGG) zu.
      </p>

      <h2>11. Schlussbestimmungen</h2>
      <p>
        Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand für Unternehmer ist{" "}
        {FIRMA.ort}. Sollte eine Bestimmung unwirksam sein, bleiben die übrigen Bestimmungen wirksam.
      </p>

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Entwurf – bitte vor der Veröffentlichung von einer Rechtsberatung (z. B. Gründerservice der WKO) prüfen lassen.
      </p>
      <p className="text-sm">Stand: Oktober 2026</p>
    </Rechtstext>
  );
}
