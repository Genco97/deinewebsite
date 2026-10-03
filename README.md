# Ursprung

Öffentliche Seite für Kunden (Gratis-Demo, Rückruf, Pakete) und CRM für Mitarbeiter und Partner.

**Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Supabase (`@supabase/ssr`).
`/crm` ist über `src/proxy.ts` geschützt (in Next.js 16 heißt Middleware „Proxy“).

## Lokal starten

```bash
cp .env.example .env.local   # Werte eintragen
npm install
npm run dev
```

| Variable | Zweck |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon-Key (öffentlich) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Nur serverseitig** (`src/lib/supabase/admin.ts`, `server-only`). Wird aktuell nicht benötigt – alle Admin-Aktionen laufen über RLS. |
| `NEXT_PUBLIC_SITE_URL` | z. B. `https://ursprung.at` – für Einladungs- und Bestätigungslinks |

Auf Vercel dieselben Variablen unter *Settings → Environment Variables* setzen.

## Datenbank

Migrationen in `supabase/migrations/`:

- `0001_crm.sql` – Profile (Admin/Partner, Upline, Einladungscode), Leads, Verlauf, Deals, Provisionen, RLS, Trigger
- `0002_anfragen.sql` – Lead-Status `demo`, Tabelle `anfragen`, Änderungsrunden bei Deals
- `0003_rechte.sql` – Trigger-Funktionen nicht per API aufrufbar
- `0004_gruender.sql` – Gründer-Modell (siehe unten)
- `0005_aktiv_policies.sql` – deaktivierte Partner sehen ihre Leads nicht mehr
- `0006_anfragen_verteilung.sql` – automatische Verteilung (verworfen)
- `0007_verteilung_entfernen.sql` – entfernt die automatische Verteilung wieder
- `0008_einwilligung.sql` – Einwilligung zu Anruf und E-Mail bei Anfragen und Leads

Wichtige Regeln (in der Datenbank erzwungen, nicht nur in der Oberfläche):

- Konto anlegen nur mit gültigem `invite_code` (Trigger auf `auth.users`). **Ausnahme:** das allererste Konto wird Admin.
- Partner sehen nur eigene Leads; Admins sehen alles.
- `nicht_anrufen` kann nur ein Admin zurücksetzen.
- Partner können Verkäufe nur als `gemeldet` anlegen; Deals ändern nur Admins.
- Provisionen (20 / 5 / 2 % über drei Ebenen) entstehen ausschließlich per Trigger, wenn ein Admin einen Deal auf `voll_bezahlt` setzt.
- Anfragen: anonym nur `insert`, lesen/ändern nur Admin.

## Gründer und Partner

- **Gründer** = Rolle `admin`. Volle Rechte, keine persönlichen Provisionen, keine Upline.
- **Partner** bekommen 20 % auf eigene Verkäufe, 5 % auf Verkäufe ihrer direkt Eingeladenen, 2 % eine Ebene tiefer.
- Fällt eine Ebene auf einen Gründer, entsteht keine Provision – der Betrag bleibt im **Gründer-Topf**.
- Gründer-Topf = Umsatz voll bezahlter Deals − Partner-Provisionen, gleich verteilt auf alle aktiven Gründer (Admin → Gewinn).
- Mitgründer: über einen Einladungslink registrieren lassen, dann unter Admin → Team „Zum Gründer machen“.

## Anfragen zuteilen

Neue Website-Anfragen landen unter Admin → Anfragen. Ein Gründer teilt jede Anfrage einer Person zu; daraus entsteht ein Lead mit Rückruf in 30 Minuten, der bei der Person unter „Heute“ als neue Website-Anfrage erscheint.

### Einwilligung (Anrufe und E-Mails)

Werbeanrufe und Werbe-E-Mails sind in Österreich nur mit vorheriger Einwilligung erlaubt – auch bei Firmen (§ 174 TKG 2021). Darum gilt im CRM:

- Das Demo-Formular hat ein freiwilliges Häkchen „Sie dürfen mich … kontaktieren“; wer einen Rückruf anfordert, willigt in diesen Anruf ein. Beim Zuteilen wird die Einwilligung samt Zeitpunkt in den Lead übernommen.
- Leads ohne Einwilligung (z. B. aus dem CSV-Import) sind markiert: nicht anrufen, nur Besuch oder Brief. Der „Anrufen“-Knopf erscheint erst mit Einwilligung.
- Stimmt ein Betrieb zu (z. B. beim Besuch), trägt man es beim Lead unter „Einwilligung“ ein. Zeitpunkt und Person speichert die Datenbank, jede Änderung steht im Verlauf. „Nicht anrufen“ löscht die Einwilligung.

## Ersteinrichtung

1. In Supabase unter *Authentication → URL Configuration* die Site-URL und `https://<domain>/auth/callback` als Redirect-URL eintragen.
2. Ersten Admin anlegen: *Authentication → Users → Add user* (E-Mail + Passwort, „Auto confirm“). Da noch kein Profil existiert, wird dieses Konto Admin.
3. Als Admin einloggen → *Partner & Provision* → Einladungslink an Partner weitergeben.

## Firmendaten und Platzhalter

Alle Firmendaten (Rechtsform, Adresse, UID, Gewerbe, USt.-Regelung, Hosting-Preis …) stehen zentral in `src/lib/firma.ts`. Solange ein Wert `null` ist, zeigt die Seite einen gelb markierten Platzhalter. Ausnahmen, die direkt im Code stehen: Beispiele (Startseite), Teamfoto und Vornamen (Über uns).

Impressum, Datenschutz und AGB sind ausformuliert, sollten aber vor dem Start rechtlich geprüft werden (z. B. Gründerservice der WKO).
