-- =====================================================================
-- 0002 – Lead-Status „demo“, Anfragen von der öffentlichen Seite,
--        Änderungsrunden bei Deals
-- =====================================================================

-- Lead-Status „demo“ (Demo wird gerade erstellt / wurde gezeigt)
alter type public.lead_status add value if not exists 'demo' after 'interessiert';

-- ---------------------------------------------------------------------
-- Anfragen (Demo, Rückruf, Beratung) von der öffentlichen Seite
-- ---------------------------------------------------------------------
create table public.anfragen (
  id          uuid primary key default gen_random_uuid(),
  art         text not null check (art in ('demo', 'rueckruf', 'beratung')),
  paket       public.paket,
  firma       text,
  name        text not null check (char_length(name) between 1 and 200),
  email       text check (email is null or char_length(email) <= 200),
  telefon     text check (telefon is null or char_length(telefon) <= 50),
  branche     text check (branche is null or char_length(branche) <= 200),
  wuensche    text check (wuensche is null or char_length(wuensche) <= 4000),
  lead_id     uuid references public.leads (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index anfragen_created_idx on public.anfragen (created_at desc);

alter table public.anfragen enable row level security;

-- Anonym (und eingeloggt) nur einfügen – ohne Verknüpfung zu einem Lead
create policy "anfragen_insert_public" on public.anfragen
  for insert to anon, authenticated
  with check (lead_id is null);

create policy "anfragen_select_admin" on public.anfragen
  for select to authenticated
  using (public.is_admin());

create policy "anfragen_update_admin" on public.anfragen
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "anfragen_delete_admin" on public.anfragen
  for delete to authenticated
  using (public.is_admin());

revoke all on public.anfragen from anon;
grant insert on public.anfragen to anon;

-- ---------------------------------------------------------------------
-- Deals: Änderungsrunden
-- ---------------------------------------------------------------------
alter table public.deals
  add column aenderungsrunden_inkl    smallint not null default 1 check (aenderungsrunden_inkl >= 0),
  add column aenderungsrunden_genutzt smallint not null default 0 check (aenderungsrunden_genutzt >= 0);

-- Premium enthält 2 Änderungsrunden, Basis/Business 1
create or replace function public.deals_aenderungsrunden_default()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.paket = 'premium' and new.aenderungsrunden_inkl = 1 then
    new.aenderungsrunden_inkl := 2;
  end if;
  return new;
end;
$$;

create trigger deals_aenderungsrunden_default
  before insert on public.deals
  for each row execute function public.deals_aenderungsrunden_default();

alter function public.deals_vorher() set search_path = public;
