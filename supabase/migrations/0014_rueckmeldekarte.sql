-- =====================================================================
-- 0014 – Rückmeldekarte (Postkarte mit QR-Code)
--  * Jeder Lead kann einen eigenen Karten-Code bekommen. Der Code steht
--    als QR-Code auf der Postkarte und führt auf /k/<code>.
--  * Dort bestätigt der Betrieb selbst: „Ja, rufen Sie mich an.“
--    Damit liegt die Einwilligung nach § 174 TKG 2021 vor – Datum, Name
--    und Quelle werden beim Lead gespeichert, der Rückruf wird sofort fällig.
--  * Der Code verrät nur den Firmennamen (zur Begrüßung), sonst nichts.
-- =====================================================================

alter table public.leads
  add column karten_code text unique check (karten_code is null or karten_code ~ '^[A-HJ-NP-Z2-9]{8}$'),
  add column karte_am    timestamptz;

-- ---------------------------------------------------------------------
-- Codes vergeben (CRM, eingeloggt). Nur eigene Leads bzw. alle für Gründer.
-- Leads mit „Nicht anrufen“, Verkauf oder kein Interesse bekommen keine Karte.
-- ---------------------------------------------------------------------
create or replace function public.karten_vorbereiten(p_ids uuid[])
returns table (id uuid, firma text, ansprechpartner text, adresse text, bezirk text, karten_code text, einwilligung boolean)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_lead record;
  v_code text;
  v_zeichen constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if auth.uid() is null or not public.ist_aktiv() then
    raise exception 'Nicht erlaubt' using errcode = '42501';
  end if;
  if coalesce(array_length(p_ids, 1), 0) > 500 then
    raise exception 'Höchstens 500 Karten auf einmal' using errcode = 'P0001';
  end if;

  for v_lead in
    select l.id, l.karten_code
    from public.leads l
    where l.id = any (p_ids)
      and (l.besitzer_id = auth.uid() or public.is_admin())
      and l.status not in ('nicht_anrufen', 'verkauft', 'kein_interesse')
  loop
    if v_lead.karten_code is null then
      loop
        select string_agg(substr(v_zeichen, 1 + (get_byte(b, i) % 32), 1), '')
        into v_code
        from (select uuid_send(gen_random_uuid()) b) x, unnest(array[0, 1, 2, 3, 4, 5, 9, 10]) i;  -- Byte 6 und 8 tragen Version/Variante
        exit when not exists (select 1 from public.leads where leads.karten_code = v_code);
      end loop;
      update public.leads set karten_code = v_code, karte_am = now() where leads.id = v_lead.id;
      insert into public.lead_verlauf (lead_id, autor_id, art, text)
      values (v_lead.id, auth.uid(), 'system', 'Rückmeldekarte erstellt (Code ' || v_code || ')');
    else
      update public.leads set karte_am = now() where leads.id = v_lead.id;
    end if;
  end loop;

  return query
    select l.id, l.firma, l.ansprechpartner, l.adresse, l.bezirk, l.karten_code, l.einwilligung_wie is not null
    from public.leads l
    where l.id = any (p_ids)
      and (l.besitzer_id = auth.uid() or public.is_admin())
      and l.karten_code is not null
      and l.status not in ('nicht_anrufen', 'verkauft', 'kein_interesse')
    order by l.firma;
end;
$$;

revoke execute on function public.karten_vorbereiten(uuid[]) from public, anon;
grant execute on function public.karten_vorbereiten(uuid[]) to authenticated;

-- Code vereinheitlichen: Großbuchstaben, ohne Leer- und Bindestriche
create or replace function public.karten_code_norm(p_code text)
returns text
language sql
immutable
set search_path = pg_catalog
as $$
  select nullif(upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g')), '');
$$;

-- ---------------------------------------------------------------------
-- Öffentlich: Firmenname zum Code (für die Begrüßung auf der Seite)
-- ---------------------------------------------------------------------
create or replace function public.karte_info(p_code text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select l.firma
  from public.leads l
  where l.karten_code = public.karten_code_norm(p_code)
    and char_length(coalesce(public.karten_code_norm(p_code), '')) = 8
    and l.status <> 'nicht_anrufen'
  limit 1;
$$;

revoke execute on function public.karte_info(text) from public;
grant execute on function public.karte_info(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Öffentlich: Betrieb bestätigt „Ja, rufen Sie mich an“
-- ---------------------------------------------------------------------
create or replace function public.karte_einwilligen(p_code text, p_name text, p_telefon text, p_zeit text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code    text := public.karten_code_norm(p_code);
  v_name    text := left(trim(coalesce(p_name, '')), 100);
  v_telefon text := nullif(left(trim(coalesce(p_telefon, '')), 50), '');
  v_zeit    text := nullif(left(trim(coalesce(p_zeit, '')), 100), '');
  v_lead    public.leads%rowtype;
begin
  if v_code is null or char_length(v_code) <> 8 or v_name = '' then
    return false;
  end if;

  select * into v_lead from public.leads where karten_code = v_code;
  if not found then
    return false;
  end if;

  -- Gegen doppeltes Absenden: höchstens eine Rückmeldung pro 10 Minuten
  if exists (
    select 1 from public.lead_verlauf v
    where v.lead_id = v_lead.id and v.text like 'Rückmeldekarte: %' and v.created_at > now() - interval '10 minutes'
  ) then
    return true;
  end if;

  insert into public.lead_verlauf (lead_id, autor_id, art, text)
  values (v_lead.id, null, 'system',
          'Rückmeldekarte: ' || v_name || ' möchte angerufen werden.'
          || coalesce(' Telefon: ' || v_telefon || '.', '')
          || coalesce(' Beste Zeit: ' || v_zeit || '.', ''));

  -- Hat der Betrieb früher „Nicht anrufen“ gesagt, entscheidet ein Gründer (nur Verlauf)
  if v_lead.status = 'nicht_anrufen' then
    return true;
  end if;

  update public.leads
  set einwilligung_wie   = left('Rückmeldekarte (Website): ' || v_name, 200),
      ansprechpartner    = coalesce(ansprechpartner, v_name),
      telefon            = coalesce(telefon, v_telefon),
      naechster_rueckruf = case
                             when naechster_rueckruf is null or naechster_rueckruf > now() then now()
                             else naechster_rueckruf
                           end
  where id = v_lead.id;

  return true;
end;
$$;

revoke execute on function public.karte_einwilligen(text, text, text, text) from public;
grant execute on function public.karte_einwilligen(text, text, text, text) to anon, authenticated;
