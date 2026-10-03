import type { Metadata } from "next";
import { Angabe } from "@/components/public/Angabe";
import { Rechtstext } from "@/components/public/Rechtstext";
import { FIRMA, firmenname } from "@/lib/firma";

export const metadata: Metadata = { title: "Datenschutz" };

export default function Datenschutz() {
  return (
    <Rechtstext titel="Datenschutzerklärung">
      <p>
        Der Schutz Ihrer Daten ist uns wichtig. Wir verarbeiten personenbezogene Daten ausschließlich auf Grundlage der
        Datenschutz-Grundverordnung (DSGVO) und des österreichischen Datenschutzgesetzes (DSG). Hier erfahren Sie,
        welche Daten wir verarbeiten, wofür und welche Rechte Sie haben.
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>
        {firmenname()}
        {FIRMA.rechtsform ? null : (
          <>
            {" "}
            <Angabe wert={null} platzhalter="Rechtsform" />
          </>
        )}
        <br />
        <Angabe wert={FIRMA.strasse} platzhalter="Straße und Hausnummer" />,{" "}
        <Angabe wert={FIRMA.plz} platzhalter="PLZ" /> {FIRMA.ort}
        <br />
        E-Mail: <Angabe wert={FIRMA.email} platzhalter="E-Mail-Adresse" />
        <br />
        Telefon: <Angabe wert={FIRMA.telefon} platzhalter="Telefonnummer" />
      </p>

      <h2>2. Besuch dieser Website</h2>
      <p>
        Beim Aufruf der Website verarbeitet unser Hosting-Anbieter technisch notwendige Daten: IP-Adresse, Datum und
        Uhrzeit, aufgerufene Seite, Browser und Betriebssystem. Diese Daten sind nötig, um die Website sicher und
        zuverlässig auszuliefern (berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO). Sie werden nicht mit anderen
        Daten zusammengeführt und nach kurzer Zeit automatisch gelöscht.
      </p>
      <p>
        <strong className="text-ink">Keine Tracking-Cookies, keine Werbung:</strong> Wir setzen keine Analyse- oder
        Marketing-Werkzeuge ein (z. B. kein Google Analytics, keine Facebook-Pixel). Die Schriftarten werden von
        unserem eigenen Server geladen – es wird dabei keine Verbindung zu Google aufgebaut.
      </p>

      <h2>3. Anfragen über unsere Formulare</h2>
      <p>
        Wenn Sie eine Gratis-Demo, eine Beratung oder einen Rückruf anfragen, verarbeiten wir die Angaben aus dem
        Formular: Name, Name des Betriebs, E-Mail-Adresse, Telefonnummer, Branche und Ihre Wünsche.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong className="text-ink">Zweck:</strong> Bearbeitung Ihrer Anfrage, Erstellung der Demo und Kontaktaufnahme
          mit Ihnen.
        </li>
        <li>
          <strong className="text-ink">Rechtsgrundlage:</strong> Durchführung vorvertraglicher Maßnahmen auf Ihre Anfrage
          (Art. 6 Abs. 1 lit. b DSGVO).
        </li>
        <li>
          <strong className="text-ink">Speicherdauer:</strong> Kommt kein Auftrag zustande, löschen wir Ihre Daten
          spätestens 12 Monate nach der letzten Kontaktaufnahme. Kommt ein Auftrag zustande, bewahren wir
          vertragsrelevante Unterlagen so lange auf, wie es gesetzlich vorgeschrieben ist (in der Regel 7 Jahre, § 132
          BAO).
        </li>
      </ul>
      <p>
        <strong className="text-ink">Anruf und E-Mail:</strong> Wenn Sie im Formular ausdrücklich zustimmen bzw. einen
        Rückruf anfordern, dürfen wir Sie telefonisch und per E-Mail kontaktieren (Einwilligung, Art. 6 Abs. 1 lit. a
        DSGVO und § 174 TKG 2021). Wir speichern, wann und wie Sie eingewilligt haben. Sie können die Einwilligung
        jederzeit widerrufen – ein kurzes „Bitte nicht mehr anrufen“ per Telefon oder E-Mail genügt. Ohne Einwilligung
        beantworten wir Ihre Anfrage per E-Mail.
      </p>
      <p>Ein Spam-Schutz im Formular arbeitet ohne Cookies und ohne Dienste Dritter.</p>

      <h2>4. Kunden und Aufträge</h2>
      <p>
        Für die Erstellung und Betreuung Ihrer Website verarbeiten wir Kontaktdaten, Vertrags- und Rechnungsdaten sowie
        die Inhalte, die Sie uns für Ihre Website übermitteln (Texte, Fotos, Öffnungszeiten usw.). Rechtsgrundlage ist
        die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO) sowie gesetzliche Aufbewahrungspflichten (Art. 6 Abs. 1
        lit. c DSGVO).
      </p>

      <h2>5. Geschäftskontakte</h2>
      <p>
        Wir verarbeiten Kontaktdaten von Betrieben (z. B. Firmenname, Adresse, Branche), die öffentlich zugänglich sind,
        etwa aus Branchenverzeichnissen oder von Firmenwebsites, um sie persönlich zu besuchen oder per Brief über
        unser Angebot zu informieren. Rechtsgrundlage ist unser berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <p>
        Werbeanrufe und Werbe-E-Mails gibt es von uns nur mit Ihrer vorherigen Einwilligung (§ 174 TKG 2021). Sie
        können der Verarbeitung Ihrer Daten jederzeit widersprechen – wir löschen sie dann bzw. vermerken, dass wir Sie
        nicht mehr kontaktieren.
      </p>

      <h2>6. Mitarbeiter- und Partner-Bereich</h2>
      <p>
        Für Mitarbeiter und Partner gibt es einen geschützten Login-Bereich. Dort verarbeiten wir Name, E-Mail-Adresse,
        ein verschlüsseltes Passwort sowie Daten zur Zusammenarbeit (z. B. Provisionen). Für den Login wird ein
        technisch notwendiges Cookie gesetzt, das Sie angemeldet hält. Rechtsgrundlage ist die Zusammenarbeit
        (Art. 6 Abs. 1 lit. b DSGVO).
      </p>

      <h2>7. Dienstleister (Auftragsverarbeiter)</h2>
      <p>Wir setzen folgende Dienstleister ein, mit denen Verträge zur Auftragsverarbeitung bestehen:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="text-ink">Vercel Inc.</strong> (USA) – Hosting
          dieser Website. Vercel ist unter dem EU-US Data Privacy Framework zertifiziert; zusätzlich gelten die
          EU-Standardvertragsklauseln.
        </li>
        <li>
          <strong className="text-ink">Supabase Inc.</strong> (USA) – Datenbank und
          Login. Die Daten werden in einem Rechenzentrum in Frankfurt am Main (EU) gespeichert. Für einen möglichen
          Zugriff aus Drittländern gelten die EU-Standardvertragsklauseln.
        </li>
      </ul>

      <h2>8. Ihre Rechte</h2>
      <p>Sie haben jederzeit das Recht auf:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
        <li>Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
      </ul>
      <p>
        Schreiben Sie uns dazu einfach an <Angabe wert={FIRMA.email} platzhalter="E-Mail-Adresse" />.
      </p>
      <p>
        Wenn Sie meinen, dass wir Ihre Daten nicht rechtmäßig verarbeiten, können Sie sich bei der
        Österreichischen Datenschutzbehörde beschweren: Barichgasse 40–42, 1030 Wien,{" "}
        <a href="https://www.dsb.gv.at" className="text-brand underline" rel="noopener noreferrer" target="_blank">
          www.dsb.gv.at
        </a>
        .
      </p>

      <h2>9. Änderungen</h2>
      <p>
        Wir passen diese Datenschutzerklärung an, wenn sich unsere Website oder die Rechtslage ändert. Es gilt die
        jeweils hier veröffentlichte Fassung.
      </p>
      <p className="text-sm">Stand: Oktober 2026</p>
    </Rechtstext>
  );
}
