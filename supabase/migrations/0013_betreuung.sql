-- =====================================================================
-- 0013 – Nach der Fertigstellung: Übergabe oder Sorglos-Paket
--  * deals.betreuung: offen (noch nicht geklärt) | uebergabe | sorglos
--  * deals.sorglos_monat: monatlicher Betrag des Sorglos-Pakets
--  * deals.betreuung_seit: ab wann die Wahl gilt
--  * Jede Änderung landet im Verlauf des Leads
-- =====================================================================

alter table public.deals
  add column betreuung text not null default 'offen'
    check (betreuung in ('offen', 'uebergabe', 'sorglos')),
  add column sorglos_monat numeric(8, 2)
    check (sorglos_monat is null or (sorglos_monat >= 0 and sorglos_monat <= 10000)),
  add column betreuung_seit date,
  add constraint deals_sorglos_betrag check (betreuung <> 'sorglos' or sorglos_monat is not null);

create or replace function public.deals_betreuung_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.lead_id is not null and (new.betreuung is distinct from old.betreuung
      or new.sorglos_monat is distinct from old.sorglos_monat) then
    insert into public.lead_verlauf (lead_id, autor_id, art, text)
    values (new.lead_id, auth.uid(), 'system',
            case new.betreuung
              when 'sorglos' then 'Nach der Fertigstellung: Sorglos-Paket, ' || replace(to_char(new.sorglos_monat, 'FM999990.00'), '.', ',') || ' € pro Monat'
              when 'uebergabe' then 'Nach der Fertigstellung: Übergabe an den Kunden'
              else 'Nach der Fertigstellung: noch offen'
            end);
  end if;
  return new;
end;
$$;

revoke execute on function public.deals_betreuung_log() from public, anon, authenticated;

create trigger deals_betreuung_log
  after update of betreuung, sorglos_monat on public.deals
  for each row execute function public.deals_betreuung_log();
