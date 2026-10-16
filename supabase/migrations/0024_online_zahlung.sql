-- =====================================================================
-- 0020 – Online-Zahlung über Stripe
--  * deals.zahlung_freigegeben: erst wenn ein Gründer „Zahlung freigeben“ klickt,
--    sieht der Kunde den Knopf „Jetzt bezahlen“ (Zahlung wird bei Freigabe fällig).
--  * zahlungen: jede Bezahlseite und ihr Ergebnis. Schreiben nur über den Server
--    (Service-Role), nie direkt aus dem Browser.
--  * Der Provisions-Trigger akzeptiert zusätzlich den Server (Webhook), der nach
--    erfolgreicher Zahlung den Deal auf „voll bezahlt“ setzt.
--  * kunden_projekt liefert zusätzlich den Zahlungsstand an die Kundenseite.
-- =====================================================================

alter table public.deals
  add column zahlung_freigegeben boolean not null default false;

create table public.zahlungen (
  id                uuid primary key default gen_random_uuid(),
  deal_id           uuid not null references public.deals (id) on delete cascade,
  betrag            numeric(10, 2) not null check (betrag > 0),
  stripe_session_id text not null unique,
  status            text not null default 'offen' check (status in ('offen', 'bezahlt', 'abgelaufen')),
  created_at        timestamptz not null default now(),
  bezahlt_am        timestamptz
);

create index zahlungen_deal_idx on public.zahlungen (deal_id, created_at desc);

alter table public.zahlungen enable row level security;

create policy "zahlungen_select" on public.zahlungen
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.deals d where d.id = deal_id and d.partner_id = auth.uid())
  );

revoke all on public.zahlungen from anon, authenticated;
grant select on public.zahlungen to authenticated;

-- Provisionen: wie bisher, aber auch der Server (Service-Role) darf „voll bezahlt“ setzen
create or replace function public.deals_provisionen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_saetze  numeric[] := array[20, 5, 2];
  v_empf    uuid := new.partner_id;
  v_rolle   public.rolle;
  v_ebene   int := 1;
  v_server  boolean := coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '') = 'service_role';
begin
  if new.status <> 'voll_bezahlt' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'voll_bezahlt' then
    return new;
  end if;
  if not (public.is_admin() or v_server) then
    raise exception 'Nur ein Admin kann einen Deal auf „voll bezahlt“ setzen' using errcode = 'P0001';
  end if;

  while v_empf is not null and v_ebene <= 3 loop
    select rolle into v_rolle from public.profiles where id = v_empf;

    -- Gründer bekommen keine Provision – der Anteil bleibt im Topf
    if v_rolle is distinct from 'admin' then
      insert into public.provisionen (deal_id, empfaenger_id, verkaeufer_id, ebene, prozent, betrag, paket)
      values (new.id, v_empf, new.partner_id, v_ebene, v_saetze[v_ebene],
              round(new.betrag * v_saetze[v_ebene] / 100, 2), new.paket)
      on conflict (deal_id, ebene) do nothing;
    end if;

    select upline_id into v_empf from public.profiles where id = v_empf;
    v_ebene := v_ebene + 1;
  end loop;

  return new;
end;
$$;

revoke execute on function public.deals_provisionen() from public, anon, authenticated;

-- Kundenseite: zusätzlich der Zahlungsstand
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
           ), '[]'::jsonb),
           'zahlung', jsonb_build_object(
             'freigegeben', d.zahlung_freigegeben,
             'betrag', d.betrag,
             'bezahlt', coalesce((select sum(z.betrag) from public.zahlungen z where z.deal_id = d.id and z.status = 'bezahlt'), 0),
             'status', d.status
           )
         )
    from d
    left join public.leads l on l.id = d.lead_id;
$$;

revoke execute on function public.kunden_projekt(text) from public;
grant execute on function public.kunden_projekt(text) to anon, authenticated;
