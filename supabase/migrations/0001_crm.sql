-- =====================================================================
-- Sichtbar CRM – Grundschema
-- Profile (Admin/Partner mit Upline), Leads, Verlauf, Deals, Provisionen
-- Alle Tabellen mit Row Level Security.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Typen
-- ---------------------------------------------------------------------
create type public.rolle as enum ('admin', 'partner');

create type public.lead_status as enum (
  'neu',
  'nicht_erreicht',
  'rueckruf',
  'interessiert',
  'angebot',
  'verkauft',
  'kein_interesse',
  'nicht_anrufen'
);

create type public.paket as enum ('basis', 'business', 'premium');

create type public.deal_status as enum (
  'gemeldet',      -- vom Partner gemeldet, noch nicht geprüft
  'offen',         -- bestätigt, Zahlung ausständig
  'angezahlt',     -- Anzahlung eingegangen (z. B. Premium 30 %)
  'voll_bezahlt',  -- löst Provisionen aus
  'storniert'
);

-- ---------------------------------------------------------------------
-- Profile
-- ---------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  name            text not null default '',
  email           text not null default '',
  rolle           public.rolle not null default 'partner',
  upline_id       uuid references public.profiles (id) on delete set null,
  einladungscode  text not null unique
                  default lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  aktiv           boolean not null default true,
  created_at      timestamptz not null default now()
);

create index profiles_upline_idx on public.profiles (upline_id);

-- Hilfsfunktionen (security definer, damit sie in RLS-Policies keine Rekursion auslösen)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and rolle = 'admin' and aktiv
  );
$$;

-- Liefert die eigene ID plus Downline bis zur 2. Ebene (für Team-Ansicht)
create or replace function public.team_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select p1.id from public.profiles p1 where p1.upline_id = auth.uid()
  union
  select p2.id from public.profiles p2
    join public.profiles p1 on p2.upline_id = p1.id
   where p1.upline_id = auth.uid();
$$;

-- Prüft einen Einladungscode, ohne Profile offenzulegen (für /registrieren)
create or replace function public.einladungscode_gueltig(code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where einladungscode = lower(trim(code)) and aktiv
  );
$$;

-- Neues Konto: nur mit gültigem Einladungscode.
-- Ausnahme: das allererste Konto wird Admin (Bootstrap).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code   text := lower(trim(coalesce(new.raw_user_meta_data ->> 'invite_code', '')));
  v_upline uuid;
begin
  if not exists (select 1 from public.profiles) then
    insert into public.profiles (id, name, email, rolle)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), coalesce(new.email, ''), 'admin');
    return new;
  end if;

  select id into v_upline
    from public.profiles
   where einladungscode = v_code and aktiv;

  if v_code = '' or v_upline is null then
    raise exception 'Ungültiger Einladungscode' using errcode = 'P0001';
  end if;

  insert into public.profiles (id, name, email, rolle, upline_id)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), coalesce(new.email, ''), 'partner', v_upline);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or id in (select public.team_ids())
  );

create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Partner dürfen nur ihren Namen ändern; Rolle, Upline usw. nur Admins (über Trigger geschützt)
create or replace function public.profiles_schutz()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.rolle := old.rolle;
    new.upline_id := old.upline_id;
    new.einladungscode := old.einladungscode;
    new.aktiv := old.aktiv;
    new.email := old.email;
  end if;
  return new;
end;
$$;

create trigger profiles_schutz
  before update on public.profiles
  for each row execute function public.profiles_schutz();

-- ---------------------------------------------------------------------
-- Leads
-- ---------------------------------------------------------------------
create table public.leads (
  id                  uuid primary key default gen_random_uuid(),
  firma               text not null,
  ansprechpartner     text,
  branche             text,
  telefon             text,
  email               text,
  adresse             text,
  bezirk              text,
  status              public.lead_status not null default 'neu',
  naechster_rueckruf  timestamptz,
  quelle              text not null default 'manuell',
  besitzer_id         uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index leads_besitzer_idx on public.leads (besitzer_id);
create index leads_status_idx on public.leads (status);
create index leads_rueckruf_idx on public.leads (naechster_rueckruf);

alter table public.leads enable row level security;

create policy "leads_select" on public.leads
  for select to authenticated
  using (besitzer_id = auth.uid() or public.is_admin());

create policy "leads_insert" on public.leads
  for insert to authenticated
  with check (besitzer_id = auth.uid() or public.is_admin());

create policy "leads_update" on public.leads
  for update to authenticated
  using (besitzer_id = auth.uid() or public.is_admin())
  with check (besitzer_id = auth.uid() or public.is_admin());

create policy "leads_delete_admin" on public.leads
  for delete to authenticated
  using (public.is_admin());

-- Schutzregeln für Leads:
--  * „nicht_anrufen“ kann nur ein Admin wieder aufheben
--  * Partner können den Besitzer nicht ändern
create or replace function public.leads_schutz()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if old.status = 'nicht_anrufen' and new.status <> 'nicht_anrufen' then
      raise exception 'Nur ein Admin kann „Nicht anrufen“ zurücksetzen' using errcode = 'P0001';
    end if;
    new.besitzer_id := old.besitzer_id;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger leads_schutz
  before update on public.leads
  for each row execute function public.leads_schutz();

-- ---------------------------------------------------------------------
-- Verlauf / Notizen
-- ---------------------------------------------------------------------
create table public.lead_verlauf (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  autor_id    uuid references public.profiles (id) on delete set null default auth.uid(),
  art         text not null default 'notiz' check (art in ('notiz', 'status', 'rueckruf', 'verkauf', 'system')),
  text        text not null,
  created_at  timestamptz not null default now()
);

create index lead_verlauf_lead_idx on public.lead_verlauf (lead_id, created_at desc);

alter table public.lead_verlauf enable row level security;

create policy "verlauf_select" on public.lead_verlauf
  for select to authenticated
  using (exists (select 1 from public.leads l where l.id = lead_id));  -- RLS der Leads greift

create policy "verlauf_insert" on public.lead_verlauf
  for insert to authenticated
  with check (
    autor_id = auth.uid()
    and exists (select 1 from public.leads l where l.id = lead_id)
  );

-- Statuswechsel und Rückruf automatisch protokollieren
create or replace function public.leads_verlauf_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.lead_verlauf (lead_id, autor_id, art, text)
    values (new.id, auth.uid(), 'status', 'Status: ' || old.status || ' → ' || new.status);
  end if;
  if new.naechster_rueckruf is distinct from old.naechster_rueckruf and new.naechster_rueckruf is not null then
    insert into public.lead_verlauf (lead_id, autor_id, art, text)
    values (new.id, auth.uid(), 'rueckruf',
            'Rückruf geplant: ' || to_char(new.naechster_rueckruf at time zone 'Europe/Vienna', 'DD.MM.YYYY HH24:MI'));
  end if;
  return new;
end;
$$;

create trigger leads_verlauf_log
  after update on public.leads
  for each row execute function public.leads_verlauf_log();

-- ---------------------------------------------------------------------
-- Deals
-- ---------------------------------------------------------------------
create table public.deals (
  id               uuid primary key default gen_random_uuid(),
  lead_id          uuid references public.leads (id) on delete set null,
  partner_id       uuid references public.profiles (id) on delete set null default auth.uid(),
  paket            public.paket not null,
  betrag           numeric(10, 2) not null check (betrag >= 0),
  status           public.deal_status not null default 'gemeldet',
  notiz            text,
  voll_bezahlt_am  timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index deals_partner_idx on public.deals (partner_id);
create index deals_lead_idx on public.deals (lead_id);

alter table public.deals enable row level security;

create policy "deals_select" on public.deals
  for select to authenticated
  using (partner_id = auth.uid() or public.is_admin());

-- Partner dürfen nur einen Verkauf für eigene Leads melden (Status „gemeldet“)
create policy "deals_insert" on public.deals
  for insert to authenticated
  with check (
    public.is_admin()
    or (
      partner_id = auth.uid()
      and status = 'gemeldet'
      and exists (select 1 from public.leads l where l.id = lead_id and l.besitzer_id = auth.uid())
    )
  );

create policy "deals_update_admin" on public.deals
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "deals_delete_admin" on public.deals
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- Provisionen – entstehen ausschließlich über den Trigger unten
-- ---------------------------------------------------------------------
create table public.provisionen (
  id              uuid primary key default gen_random_uuid(),
  deal_id         uuid not null references public.deals (id) on delete cascade,
  empfaenger_id   uuid not null references public.profiles (id) on delete cascade,
  verkaeufer_id   uuid references public.profiles (id) on delete set null,
  ebene           smallint not null check (ebene between 1 and 3),
  prozent         numeric(5, 2) not null,
  betrag          numeric(10, 2) not null,
  paket           public.paket not null,
  ausbezahlt      boolean not null default false,
  ausbezahlt_am   timestamptz,
  created_at      timestamptz not null default now(),
  unique (deal_id, ebene)
);

create index provisionen_empfaenger_idx on public.provisionen (empfaenger_id);

alter table public.provisionen enable row level security;

create policy "provisionen_select" on public.provisionen
  for select to authenticated
  using (empfaenger_id = auth.uid() or public.is_admin());

-- Nur „ausbezahlt“ markieren, nur Admin. Kein Insert-Policy → niemand kann direkt einfügen.
create policy "provisionen_update_admin" on public.provisionen
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke insert, delete on public.provisionen from anon, authenticated;
revoke update on public.provisionen from anon, authenticated;
grant update (ausbezahlt, ausbezahlt_am) on public.provisionen to authenticated;

-- Trigger: Deal wird von einem Admin auf „voll_bezahlt“ gesetzt
-- → Provisionen 20 % (Verkäufer), 5 % (Upline), 2 % (Upline der Upline)
create or replace function public.deals_provisionen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_saetze    numeric[] := array[20, 5, 2];
  v_empf      uuid := new.partner_id;
  v_ebene     int := 1;
begin
  if new.status <> 'voll_bezahlt' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'voll_bezahlt' then
    return new;
  end if;
  if not public.is_admin() then
    raise exception 'Nur ein Admin kann einen Deal auf „voll bezahlt“ setzen' using errcode = 'P0001';
  end if;

  while v_empf is not null and v_ebene <= 3 loop
    insert into public.provisionen (deal_id, empfaenger_id, verkaeufer_id, ebene, prozent, betrag, paket)
    values (new.id, v_empf, new.partner_id, v_ebene, v_saetze[v_ebene],
            round(new.betrag * v_saetze[v_ebene] / 100, 2), new.paket)
    on conflict (deal_id, ebene) do nothing;

    select upline_id into v_empf from public.profiles where id = v_empf;
    v_ebene := v_ebene + 1;
  end loop;

  return new;
end;
$$;

create trigger deals_provisionen
  after insert or update of status on public.deals
  for each row execute function public.deals_provisionen();

-- Zeitstempel pflegen und Statuswechsel absichern
create or replace function public.deals_vorher()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.status = 'voll_bezahlt' and (tg_op = 'INSERT' or old.status <> 'voll_bezahlt') then
    new.voll_bezahlt_am := coalesce(new.voll_bezahlt_am, now());
  end if;
  return new;
end;
$$;

create trigger deals_vorher
  before insert or update on public.deals
  for each row execute function public.deals_vorher();

-- Hilfsfunktionen nicht für anonyme Nutzer
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.team_ids() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.team_ids() to authenticated;
grant execute on function public.einladungscode_gueltig(text) to anon, authenticated;
