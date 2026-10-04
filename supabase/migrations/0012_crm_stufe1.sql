-- =====================================================================
-- 0012 – CRM Stufe 1 + Karte
--  * leads.status_seit: seit wann der Lead im aktuellen Status liegt
--  * leads.lat / lng / geo_status: Position für die Kartenansicht.
--    Ändert sich die Adresse, wird die Position verworfen.
--  * lead_duplikate(): sucht doppelte Betriebe über ALLE Leads, gibt
--    fremde Leads aber nur als „bei Kollege X“ zurück (keine Daten).
--  * kalender_abos + kalender_eintraege(): privater Kalender-Link pro
--    Person (Rückrufe und Besuche als iCal-Abo).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Status seit
-- ---------------------------------------------------------------------
alter table public.leads add column status_seit timestamptz not null default now();

update public.leads l
set status_seit = coalesce(
  (select max(v.created_at) from public.lead_verlauf v where v.lead_id = l.id and v.art = 'status'),
  l.created_at
);

-- ---------------------------------------------------------------------
-- Position für die Karte
-- ---------------------------------------------------------------------
alter table public.leads
  add column lat double precision check (lat is null or lat between -90 and 90),
  add column lng double precision check (lng is null or lng between -180 and 180),
  add column geo_status text check (geo_status is null or geo_status in ('ok', 'nicht_gefunden'));

create index leads_geo_offen_idx on public.leads (created_at) where geo_status is null and adresse is not null;

create or replace function public.leads_aenderung()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    new.status_seit := now();
  end if;
  if new.adresse is distinct from old.adresse or new.bezirk is distinct from old.bezirk then
    -- Neue Adresse → Position neu bestimmen (außer sie wird gleich mitgeliefert)
    if new.lat is not distinct from old.lat and new.lng is not distinct from old.lng then
      new.lat := null;
      new.lng := null;
      new.geo_status := null;
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.leads_aenderung() from public, anon, authenticated;

create trigger leads_aenderung
  before update on public.leads
  for each row execute function public.leads_aenderung();

-- ---------------------------------------------------------------------
-- Duplikate
-- ---------------------------------------------------------------------
-- Telefonnummer vergleichbar machen: nur Ziffern, +43/0043 → 0
create or replace function public.tel_norm(t text)
returns text
language sql
immutable
as $$
  select nullif(
    case
      when d like '0043%' then '0' || substr(d, 5)
      when d like '43%' and length(d) >= 10 then '0' || substr(d, 3)
      else d
    end, '')
  from (select regexp_replace(coalesce(t, ''), '\D', '', 'g') as d) x;
$$;

-- Firmenname vergleichbar machen: klein, ohne Satzzeichen und Rechtsform
create or replace function public.firma_norm(f text)
returns text
language sql
immutable
as $$
  select nullif(trim(regexp_replace(
    regexp_replace(lower(coalesce(f, '')), '\m(e\.?\s?u\.?|og|kg|gmbh|gesmbh|co)\M', '', 'g'),
    '[^a-z0-9äöüß]+', ' ', 'g')), '');
$$;

create index leads_tel_norm_idx on public.leads (public.tel_norm(telefon));
create index leads_firma_norm_idx on public.leads (public.firma_norm(firma));

create or replace function public.lead_duplikate(p_telefon text, p_firma text)
returns table (id uuid, firma text, adresse text, bei_mir boolean, besitzer text)
language sql
stable
security definer
set search_path = public
as $$
  select
    case when l.besitzer_id = auth.uid() or public.is_admin() then l.id end,
    l.firma,
    case when l.besitzer_id = auth.uid() or public.is_admin() then l.adresse end,
    l.besitzer_id = auth.uid(),
    coalesce(nullif(trim(p.name), ''), 'jemand im Team')
  from public.leads l
  left join public.profiles p on p.id = l.besitzer_id
  where public.ist_aktiv()
    and (
      (public.tel_norm(p_telefon) is not null and length(public.tel_norm(p_telefon)) >= 6
        and public.tel_norm(l.telefon) = public.tel_norm(p_telefon))
      or (public.firma_norm(p_firma) is not null and public.firma_norm(l.firma) = public.firma_norm(p_firma))
    )
  limit 5;
$$;

revoke execute on function public.lead_duplikate(text, text) from public, anon;
grant execute on function public.lead_duplikate(text, text) to authenticated;

-- ---------------------------------------------------------------------
-- Kalender-Abo
-- ---------------------------------------------------------------------
create table public.kalender_abos (
  profil_id   uuid primary key references public.profiles (id) on delete cascade,
  token       text not null unique check (char_length(token) >= 40),
  created_at  timestamptz not null default now()
);

alter table public.kalender_abos enable row level security;

-- Jede Person sieht nur den eigenen Link. Schreiben nur über kalender_link_neu().
create policy "kalender_abos_select_eigen" on public.kalender_abos
  for select to authenticated
  using (profil_id = auth.uid());

create or replace function public.kalender_link_neu()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
begin
  if auth.uid() is null or not public.ist_aktiv() then
    raise exception 'Nicht erlaubt' using errcode = '42501';
  end if;
  insert into public.kalender_abos (profil_id, token) values (auth.uid(), v_token)
  on conflict (profil_id) do update set token = excluded.token, created_at = now();
  return v_token;
end;
$$;

revoke execute on function public.kalender_link_neu() from public, anon;
grant execute on function public.kalender_link_neu() to authenticated;

-- Wird vom Kalender-Programm ohne Login abgerufen – der Token ist das Passwort.
create or replace function public.kalender_eintraege(p_token text)
returns table (
  art         text,
  lead_id     uuid,
  firma       text,
  adresse     text,
  bezirk      text,
  telefon     text,
  zeitpunkt   timestamptz,
  tag         date,
  anruf_ok    boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with person as (
    select a.profil_id
    from public.kalender_abos a
    join public.profiles p on p.id = a.profil_id and p.aktiv
    where char_length(coalesce(p_token, '')) >= 40 and a.token = p_token
  )
  select 'rueckruf', l.id, l.firma, l.adresse, l.bezirk,
         case when l.einwilligung_wie is not null then l.telefon end,
         l.naechster_rueckruf, null::date, l.einwilligung_wie is not null
  from public.leads l join person on l.besitzer_id = person.profil_id
  where l.naechster_rueckruf is not null
    and l.naechster_rueckruf > now() - interval '30 days'
    and l.status not in ('verkauft', 'kein_interesse', 'nicht_anrufen')
  union all
  select 'besuch', l.id, l.firma, l.adresse, l.bezirk, null, null, l.besuch_geplant, l.einwilligung_wie is not null
  from public.leads l join person on l.besitzer_id = person.profil_id
  where l.besuch_geplant is not null
    and l.besuch_geplant > current_date - 30
    and l.status not in ('verkauft', 'kein_interesse', 'nicht_anrufen')
  limit 1000;
$$;

revoke execute on function public.kalender_eintraege(text) from public;
grant execute on function public.kalender_eintraege(text) to anon, authenticated;

-- Hilfsfunktionen nur mit eingebauten Funktionen
alter function public.tel_norm(text) set search_path = pg_catalog;
alter function public.firma_norm(text) set search_path = pg_catalog;
