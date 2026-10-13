-- =====================================================================
-- 0020 – Zähler für die Google-Website-Prüfung des Lead Finders
--  * Jede Prüfrunde wird mit Anzahl der Abfragen festgehalten, damit die App
--    das Monatslimit (Gratis-Kontingent) kennt und warnen/sperren kann.
--  * Nur Gründer dürfen lesen und eintragen.
-- =====================================================================

create table public.google_pruefungen (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null references public.profiles(id) on delete cascade,
  anzahl      int not null check (anzahl between 1 and 1000),
  created_at  timestamptz not null default now()
);

create index google_pruefungen_zeit on public.google_pruefungen (created_at);

alter table public.google_pruefungen enable row level security;

create policy "google_pruefungen_select_admin" on public.google_pruefungen
  for select to authenticated using (public.is_admin());
create policy "google_pruefungen_insert_admin" on public.google_pruefungen
  for insert to authenticated with check (public.is_admin() and person_id = auth.uid());

revoke all on public.google_pruefungen from anon;
