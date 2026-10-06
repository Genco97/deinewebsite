-- =====================================================================
-- 0017 – Privater Kunden-Link (I3)
--  * Jeder Verkauf bekommt einen geheimen Code. Mit /p/<code> sieht der
--    Kunde, wie weit seine Website ist, und gibt Rückmeldung zur Demo.
--  * Rückmeldungen landen in kunden_feedback und im Verlauf des Leads –
--    also bei der Person, die den Kunden betreut.
--  * Ohne Login: nur über zwei security-definer-Funktionen, die genau
--    das Nötige liefern bzw. annehmen. Keine Tabelle ist für anon lesbar.
-- =====================================================================

alter table public.deals
  add column kunden_code text not null unique default replace(gen_random_uuid()::text, '-', '');

create table public.kunden_feedback (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references public.deals (id) on delete cascade,
  art         text not null check (art in ('passt', 'aendern')),
  text        text check (char_length(text) <= 2000),
  name        text check (char_length(name) <= 100),
  erledigt    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index kunden_feedback_deal_idx on public.kunden_feedback (deal_id, created_at desc);
create index kunden_feedback_offen_idx on public.kunden_feedback (created_at desc) where not erledigt;

alter table public.kunden_feedback enable row level security;

-- Sehen und abhaken: Gründer und wer den Verkauf gemacht hat
create policy "kunden_feedback_select" on public.kunden_feedback
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.deals d where d.id = deal_id and d.partner_id = auth.uid() and public.ist_aktiv())
  );

create policy "kunden_feedback_update" on public.kunden_feedback
  for update to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.deals d where d.id = deal_id and d.partner_id = auth.uid() and public.ist_aktiv())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.deals d where d.id = deal_id and d.partner_id = auth.uid() and public.ist_aktiv())
  );

-- Nur „erledigt“ darf sich ändern
create or replace function public.kunden_feedback_schutz()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.deal_id := old.deal_id;
  new.art := old.art;
  new.text := old.text;
  new.name := old.name;
  new.created_at := old.created_at;
  return new;
end;
$$;

revoke execute on function public.kunden_feedback_schutz() from public, anon, authenticated;

create trigger kunden_feedback_schutz
  before update on public.kunden_feedback
  for each row execute function public.kunden_feedback_schutz();

create or replace function public.kunden_code_ok(p_code text)
returns boolean
language sql
immutable
set search_path = pg_catalog
as $$
  select coalesce(p_code ~ '^[0-9a-f]{32}$', false);
$$;

-- ---------------------------------------------------------------------
-- Öffentlich: Stand des Projekts zum Code
-- ---------------------------------------------------------------------
create or replace function public.kunden_projekt(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with d as (
    select d.*
      from public.deals d
     where public.kunden_code_ok(p_code)
       and d.kunden_code = p_code
       and d.status <> 'storniert'
  ),
  phasen(phase, label) as (
    values ('umsetzung', 'In Arbeit'), ('freigabe', 'Zur Freigabe beim Kunden'), ('online', 'Online')
  )
  select jsonb_build_object(
           'firma', coalesce(l.firma, 'Ihr Betrieb'),
           'paket', d.paket,
           'phase', d.projekt_phase,
           'faellig', d.projekt_faellig,
           'website_url', d.website_url,
           'seit', d.created_at,
           'betreuer', (select public.vorname(p) from public.profiles p where p.id = d.partner_id),
           'erreicht', coalesce((
             select jsonb_object_agg(ph.phase, (
               select max(v.created_at) from public.lead_verlauf v
                where v.lead_id = d.lead_id and v.art = 'system' and v.text like 'Projekt: % → ' || ph.label
             ))
             from phasen ph
           ), '{}'::jsonb),
           'rueckmeldungen', coalesce((
             select jsonb_agg(jsonb_build_object('art', f.art, 'text', f.text, 'am', f.created_at) order by f.created_at desc)
               from (select * from public.kunden_feedback f where f.deal_id = d.id order by f.created_at desc limit 5) f
           ), '[]'::jsonb)
         )
    from d
    left join public.leads l on l.id = d.lead_id;
$$;

revoke execute on function public.kunden_projekt(text) from public;
grant execute on function public.kunden_projekt(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Öffentlich: Kunde gibt Rückmeldung („Ja, so nehmen“ / „Ändern“)
-- ---------------------------------------------------------------------
create or replace function public.kunden_feedback_senden(p_code text, p_art text, p_text text, p_name text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_text text := nullif(left(trim(coalesce(p_text, '')), 2000), '');
  v_name text := nullif(left(trim(coalesce(p_name, '')), 100), '');
  v_deal public.deals%rowtype;
begin
  if not public.kunden_code_ok(p_code) or p_art not in ('passt', 'aendern') then
    return false;
  end if;
  if p_art = 'aendern' and v_text is null then
    return false;
  end if;

  select * into v_deal from public.deals where kunden_code = p_code and status <> 'storniert';
  if not found then
    return false;
  end if;

  -- Gegen Spam und doppeltes Absenden: höchstens 10 Rückmeldungen pro Stunde
  if (select count(*) from public.kunden_feedback f
       where f.deal_id = v_deal.id and f.created_at > now() - interval '1 hour') >= 10 then
    return false;
  end if;

  insert into public.kunden_feedback (deal_id, art, text, name)
  values (v_deal.id, p_art, v_text, v_name);

  if v_deal.lead_id is not null then
    insert into public.lead_verlauf (lead_id, autor_id, art, text)
    values (v_deal.lead_id, null, 'system',
            'Kunden-Rückmeldung: '
            || case when p_art = 'passt' then 'Ja, so nehmen ✓' else 'Bitte ändern' end
            || coalesce(' – ' || v_text, '')
            || coalesce(' (' || v_name || ')', ''));
  end if;

  -- Damit es niemand übersieht: Projekt ist heute dran
  if v_deal.projekt_phase <> 'online' then
    update public.deals
       set projekt_faellig = least(coalesce(projekt_faellig, (now() at time zone 'Europe/Vienna')::date),
                                   (now() at time zone 'Europe/Vienna')::date)
     where id = v_deal.id;
  end if;

  return true;
end;
$$;

revoke execute on function public.kunden_feedback_senden(text, text, text, text) from public;
grant execute on function public.kunden_feedback_senden(text, text, text, text) to anon, authenticated;
