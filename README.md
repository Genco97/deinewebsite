# Sichtbar

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
| `NEXT_PUBLIC_SITE_URL` | z. B. `https://sichtbar.at` – für Einladungs- und Bestätigungslinks |

Auf Vercel dieselben Variablen unter *Settings → Environment Variables* setzen.

## Datenbank

Migrationen in `supabase/migrations/`:

- `0001_crm.sql` – Profile (Admin/Partner, Upline, Einladungscode), Leads, Verlauf, Deals, Provisionen, RLS, Trigger
- `0002_anfragen.sql` – Lead-Status `demo`, Tabelle `anfragen`, Änderungsrunden bei Deals
- `0003_rechte.sql` – Trigger-Funktionen nicht per API aufrufbar

Wichtige Regeln (in der Datenbank erzwungen, nicht nur in der Oberfläche):

- Konto anlegen nur mit gültigem `invite_code` (Trigger auf `auth.users`). **Ausnahme:** das allererste Konto wird Admin.
- Partner sehen nur eigene Leads; Admins sehen alles.
- `nicht_anrufen` kann nur ein Admin zurücksetzen.
- Partner können Verkäufe nur als `gemeldet` anlegen; Deals ändern nur Admins.
- Provisionen (20 / 5 / 2 % über drei Ebenen) entstehen ausschließlich per Trigger, wenn ein Admin einen Deal auf `voll_bezahlt` setzt.
- Anfragen: anonym nur `insert`, lesen/ändern nur Admin.

## Ersteinrichtung

1. In Supabase unter *Authentication → URL Configuration* die Site-URL und `https://<domain>/auth/callback` als Redirect-URL eintragen.
2. Ersten Admin anlegen: *Authentication → Users → Add user* (E-Mail + Passwort, „Auto confirm“). Da noch kein Profil existiert, wird dieses Konto Admin.
3. Als Admin einloggen → *Partner & Provision* → Einladungslink an Partner weitergeben.

## Platzhalter

Alle fehlenden Inhalte stehen in eckigen Klammern, z. B. `[Firmenname]`, `[Adresse]`, `[UID]`, `[inkl./zzgl. USt.]`, `[Betrag]` (Hosting), Beispiele, Über uns sowie Impressum, Datenschutz und AGB.
