-- =====================================================================
-- 0016 – Team-Woche und Team-Feed
--  * Alle sehen, was das Team diese Woche geschafft hat – aber nur Zahlen
--    und Vornamen, keine Lead-Daten anderer (RLS der Leads bleibt unberührt).
--  * Ein „Kontakt“ zählt wie im Tagesziel: je Lead und Tag einmal,
--    ohne Zuteilungen (system) und ohne automatische CSV-Import-Notizen.
-- =====================================================================

create or replace function public.vorname(p public.profiles)
returns text
language sql
immutable
set search_path = public
as $$
  select coalesce(nullif(split_part(trim(p.name), ' ', 1), ''), split_part(p.email, '@', 1));
$$;

create or replace function public.team_woche(p_von timestamptz, p_bis timestamptz)
returns table (
  profil_id uuid,
  name text,
  ich boolean,
  kontakte int,
  ziel_tage int,
  besuche int,
  verkaeufe int,
  tagesziel int
)
language sql
stable
security definer
set search_path = public
as $$
  with k as (
    select v.autor_id, (v.created_at at time zone 'Europe/Vienna')::date as tag, count(distinct v.lead_id) as n
      from public.lead_verlauf v
     where v.art in ('notiz', 'status', 'rueckruf', 'besuch', 'verkauf')
       and v.text not like 'Aus dem CSV-Import%'
       and v.created_at >= p_von and v.created_at < p_bis
     group by 1, 2
  )
  select p.id,
         public.vorname(p),
         p.id = auth.uid(),
         coalesce((select sum(k.n) from k where k.autor_id = p.id), 0)::int,
         (select count(*) from k where k.autor_id = p.id and k.n >= p.tagesziel)::int,
         (select count(*) from public.lead_verlauf v
           where v.autor_id = p.id and v.art = 'besuch' and v.created_at >= p_von and v.created_at < p_bis)::int,
         (select count(*) from public.deals d
           where d.partner_id = p.id and d.status <> 'storniert' and d.created_at >= p_von and d.created_at < p_bis)::int,
         p.tagesziel::int
    from public.profiles p
   where p.aktiv
     and public.ist_aktiv()
     and p_bis - p_von <= interval '35 days'
   order by 2;
$$;

-- Ereignisse der letzten Tage: Verkäufe, Demos, erreichte Tagesziele, neue Leute.
-- Den Firmennamen sehen nur der/die Verkäufer:in selbst und Admins.
create or replace function public.team_feed(p_tage int default 7)
returns table (art text, zeit timestamptz, profil_id uuid, name text, ich boolean, text text)
language sql
stable
security definer
set search_path = public
as $$
  with seit as (select now() - make_interval(days => least(greatest(p_tage, 1), 31)) as t),
  kontakte as (
    select v.autor_id, (v.created_at at time zone 'Europe/Vienna')::date as tag, v.lead_id, min(v.created_at) as zeit
      from public.lead_verlauf v, seit
     where v.art in ('notiz', 'status', 'rueckruf', 'besuch', 'verkauf')
       and v.text not like 'Aus dem CSV-Import%'
       and v.created_at >= seit.t
     group by 1, 2, 3
  ),
  gezaehlt as (
    select k.*, row_number() over (partition by k.autor_id, k.tag order by k.zeit) as nr from kontakte k
  ),
  e as (
    select 'verkauf'::text as art, d.created_at as zeit, d.partner_id as pid,
           d.paket::text || case when public.is_admin() or d.partner_id = auth.uid()
                                 then '|' || coalesce((select l.firma from public.leads l where l.id = d.lead_id), '')
                                 else '' end as text
      from public.deals d, seit
     where d.status <> 'storniert' and d.created_at >= seit.t
    union all
    select 'demo', v.created_at, v.autor_id, ''
      from public.lead_verlauf v, seit
     where v.art = 'status' and v.text like '%→ demo' and v.created_at >= seit.t
    union all
    select 'ziel', g.zeit, g.autor_id, p.tagesziel::text
      from gezaehlt g join public.profiles p on p.id = g.autor_id
     where g.nr = p.tagesziel
    union all
    select 'neu', p.created_at, p.id, ''
      from public.profiles p, seit
     where p.created_at >= now() - interval '14 days'
  )
  select e.art, e.zeit, p.id, public.vorname(p), p.id = auth.uid(), e.text
    from e join public.profiles p on p.id = e.pid
   where p.aktiv and public.ist_aktiv()
   order by e.zeit desc
   limit 30;
$$;

revoke execute on function public.team_woche(timestamptz, timestamptz) from public, anon;
revoke execute on function public.team_feed(int) from public, anon;
grant execute on function public.team_woche(timestamptz, timestamptz) to authenticated;
grant execute on function public.team_feed(int) to authenticated;
