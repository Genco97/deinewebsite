-- =====================================================================
-- 0006 – Automatische Verteilung neuer Anfragen
--  * Gründer schalten pro Person „bekommt Anfragen“ ein (Admin → Team).
--  * Jede neue Anfrage von der Website wird sofort reihum verteilt:
--    die Person, die am längsten keine Anfrage bekommen hat, ist dran.
--  * Daraus entsteht ein Lead mit Rückruf in 30 Minuten; die Anfrage
--    wird mit dem Lead verknüpft.
--  * Ist niemand eingeteilt, bleibt die Anfrage offen im Admin-Bereich.
-- =====================================================================

alter table public.profiles
  add column bekommt_anfragen  boolean not null default false,
  add column letzte_anfrage_am timestamptz;

-- Profilschutz: die neuen Felder darf nur ein Gründer ändern
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
    new.bekommt_anfragen := old.bekommt_anfragen;
    -- Nur die Verteilungs-Funktion selbst darf den Zeitstempel setzen
    if coalesce(current_setting('sichtbar.verteilung', true), '') <> '1' then
      new.letzte_anfrage_am := old.letzte_anfrage_am;
    end if;
    return new;
  end if;

  if new.rolle = 'admin' then
    new.upline_id := null;
  end if;

  if old.rolle = 'admin' and old.aktiv and (new.rolle <> 'admin' or not new.aktiv) then
    if not exists (
      select 1 from public.profiles
      where rolle = 'admin' and aktiv and id <> old.id
    ) then
      raise exception 'Es muss mindestens ein aktiver Gründer bleiben' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.profiles_schutz() from public, anon, authenticated;

-- Verteilung
create or replace function public.anfrage_verteilen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empf   uuid;
  v_lead   uuid;
  v_status public.lead_status;
  v_art    text;
begin
  if new.lead_id is not null then
    return new;
  end if;

  -- Wer ist dran? Am längsten ohne Anfrage zuerst; Sperre verhindert Doppelvergabe.
  select id into v_empf
    from public.profiles
   where bekommt_anfragen and aktiv
   order by letzte_anfrage_am nulls first, created_at
   limit 1
   for update skip locked;

  if v_empf is null then
    return new;
  end if;

  v_status := case new.art when 'demo' then 'demo' when 'beratung' then 'interessiert' else 'rueckruf' end;
  v_art := case new.art when 'demo' then 'Gratis-Demo' when 'beratung' then 'Beratung' else 'Rückruf' end;

  insert into public.leads (firma, ansprechpartner, branche, telefon, email, status, naechster_rueckruf, quelle, besitzer_id)
  values (coalesce(nullif(new.firma, ''), new.name), new.name, new.branche, new.telefon, new.email,
          v_status, now() + interval '30 minutes', 'anfrage:' || new.art, v_empf)
  returning id into v_lead;

  insert into public.lead_verlauf (lead_id, autor_id, art, text)
  values (v_lead, null, 'system',
          'Automatisch zugeteilt – Anfrage über die Website: ' || v_art
          || coalesce(' (Paket ' || new.paket || ')', '')
          || coalesce(E'\nWünsche: ' || nullif(new.wuensche, ''), ''));

  update public.anfragen set lead_id = v_lead where id = new.id;

  perform set_config('sichtbar.verteilung', '1', true);
  update public.profiles set letzte_anfrage_am = now() where id = v_empf;
  perform set_config('sichtbar.verteilung', '', true);

  return new;
end;
$$;

revoke execute on function public.anfrage_verteilen() from public, anon, authenticated;

create trigger anfrage_verteilen
  after insert on public.anfragen
  for each row execute function public.anfrage_verteilen();
