-- =====================================================================
-- 0011 – E-Mail-Vorlagen
--  * Alle aktiven Personen lesen, nur Gründer bearbeiten.
--  * Platzhalter werden in der App ersetzt:
--    {anrede} {firma} {ansprechpartner} {mein_name} {meine_email} {demo_link} {website}
-- =====================================================================

create table public.vorlagen (
  id           uuid primary key default gen_random_uuid(),
  titel        text not null check (char_length(titel) between 1 and 100),
  betreff      text not null check (char_length(betreff) between 1 and 200),
  text         text not null check (char_length(text) between 1 and 4000),
  reihenfolge  int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.vorlagen enable row level security;

create policy "vorlagen_select" on public.vorlagen
  for select to authenticated using (public.ist_aktiv());
create policy "vorlagen_insert_admin" on public.vorlagen
  for insert to authenticated with check (public.is_admin());
create policy "vorlagen_update_admin" on public.vorlagen
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "vorlagen_delete_admin" on public.vorlagen
  for delete to authenticated using (public.is_admin());

revoke all on public.vorlagen from anon;

insert into public.vorlagen (titel, betreff, text, reihenfolge) values
('Nach dem Besuch', 'Ihre Website – kurz zusammengefasst',
'{anrede},

danke für das nette Gespräch heute bei {firma}. Wie besprochen bauen wir Ihnen gerne eine kostenlose Demo Ihrer neuen Website – Sie sehen sie sich in Ruhe an und zahlen nur, wenn sie Ihnen gefällt.

Hier können Sie die Demo direkt anfordern (dauert 1 Minute):
{demo_link}

Bei Fragen erreichen Sie mich jederzeit.

Freundliche Grüße
{mein_name}
Ursprung', 10),
('Demo ist fertig', 'Ihre Demo-Website für {firma} ist fertig',
'{anrede},

die Demo Ihrer neuen Website ist fertig. Sie können sie sich hier ansehen:
{website}

Gefällt sie Ihnen, geben Sie uns kurz Bescheid – dann stellen wir sie online. Erst dann zahlen Sie. Änderungswünsche nehmen wir gerne auf.

Freundliche Grüße
{mein_name}
Ursprung', 20),
('Inhalte anfordern', 'Was wir noch für Ihre Website brauchen',
'{anrede},

danke für Ihren Auftrag! Damit wir die Website für {firma} fertigstellen können, brauchen wir noch:

– Ihr Logo (falls vorhanden)
– 5 bis 10 Fotos von Ihrem Betrieb, Ihrem Team oder Ihren Arbeiten
– Ihre Öffnungszeiten und Kontaktdaten
– ein paar Sätze, was Sie besonders macht

Schicken Sie uns alles einfach als Antwort auf diese E-Mail. Sobald wir alles haben, ist Ihre Website in wenigen Tagen fertig.

Freundliche Grüße
{mein_name}
Ursprung', 30),
('Website ist online', 'Ihre Website ist online',
'{anrede},

es ist so weit: Die Website von {firma} ist online!
{website}

Teilen Sie den Link gerne mit Ihren Kunden, z. B. in Ihrem Google-Profil, auf Instagram oder in Ihrer E-Mail-Signatur. Wenn Sie zufrieden sind, freuen wir uns sehr über eine kurze Google-Bewertung.

Freundliche Grüße
{mein_name}
Ursprung', 40);
