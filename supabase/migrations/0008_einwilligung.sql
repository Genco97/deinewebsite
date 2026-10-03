-- =====================================================================
-- 0008 – Einwilligung für Anrufe und E-Mails (§ 174 TKG 2021)
--  * Werbeanrufe und Werbe-E-Mails sind in Österreich nur mit vorheriger
--    Einwilligung erlaubt – auch bei Firmen.
--  * anfragen.einwilligung_kontakt: Häkchen im Website-Formular.
--  * leads.einwilligung_wie / einwilligung_am: wie und wann der Betrieb
--    eingewilligt hat. Leer = nicht anrufen, nur Besuch oder Brief.
--  * Der Zeitpunkt wird von der Datenbank gesetzt (nicht vom Browser),
--    jede Änderung landet im Verlauf.
-- =====================================================================

alter table public.anfragen
  add column einwilligung_kontakt boolean not null default false;

alter table public.leads
  add column einwilligung_wie text check (einwilligung_wie is null or char_length(einwilligung_wie) between 1 and 200),
  add column einwilligung_am  timestamptz;

create or replace function public.leads_einwilligung()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- „Nicht anrufen“ heißt: Widerspruch – die Einwilligung gilt nicht mehr
  if new.status = 'nicht_anrufen' then
    new.einwilligung_wie := null;
  end if;

  if tg_op = 'INSERT' then
    if new.einwilligung_wie is null then
      new.einwilligung_am := null;
    -- Gründer dürfen beim Übernehmen einer Anfrage den Zeitpunkt der Anfrage übernehmen
    elsif new.einwilligung_am is null or not public.is_admin() or new.einwilligung_am > now() then
      new.einwilligung_am := now();
    end if;
  elsif new.einwilligung_wie is distinct from old.einwilligung_wie then
    new.einwilligung_am := case when new.einwilligung_wie is null then null else now() end;
  else
    new.einwilligung_am := old.einwilligung_am;
  end if;

  return new;
end;
$$;

revoke execute on function public.leads_einwilligung() from public, anon, authenticated;

create trigger leads_einwilligung
  before insert or update on public.leads
  for each row execute function public.leads_einwilligung();

-- Verlauf: zusätzlich Einwilligung protokollieren
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
  if new.einwilligung_wie is distinct from old.einwilligung_wie then
    insert into public.lead_verlauf (lead_id, autor_id, art, text)
    values (new.id, auth.uid(), 'system',
            case when new.einwilligung_wie is null
                 then 'Einwilligung zu Anruf und E-Mail entfernt – nicht mehr anrufen'
                 else 'Einwilligung zu Anruf und E-Mail eingetragen: ' || new.einwilligung_wie end);
  end if;
  return new;
end;
$$;
