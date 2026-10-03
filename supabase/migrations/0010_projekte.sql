-- =====================================================================
-- 0010 – Projekt-Tracking nach dem Verkauf
--  * deals.projekt_phase: inhalte → umsetzung → freigabe → online
--  * deals.projekt_faellig: nächster Termin / Deadline
--  * deals.website_url: Adresse der fertigen Website (oder der Demo)
--  * Phasenwechsel landen im Verlauf des Leads
-- =====================================================================

alter table public.deals
  add column projekt_phase text not null default 'inhalte'
    check (projekt_phase in ('inhalte', 'umsetzung', 'freigabe', 'online')),
  add column projekt_faellig date,
  add column website_url text
    check (website_url is null or (char_length(website_url) <= 300 and website_url ~* '^https?://'));

create or replace function public.deals_projekt_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name constant jsonb := '{"inhalte":"Inhalte sammeln","umsetzung":"In Arbeit","freigabe":"Zur Freigabe beim Kunden","online":"Online"}';
begin
  if new.lead_id is not null and new.projekt_phase is distinct from old.projekt_phase then
    insert into public.lead_verlauf (lead_id, autor_id, art, text)
    values (new.lead_id, auth.uid(), 'system',
            'Projekt: ' || (v_name ->> old.projekt_phase) || ' → ' || (v_name ->> new.projekt_phase));
  end if;
  return new;
end;
$$;

revoke execute on function public.deals_projekt_log() from public, anon, authenticated;

create trigger deals_projekt_log
  after update of projekt_phase on public.deals
  for each row execute function public.deals_projekt_log();
