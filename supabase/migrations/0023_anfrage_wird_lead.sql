-- Website-Anfragen werden sofort zu Leads.
--  * Neue Anfrage → neuer Lead (Besitzer: der erste aktive Gründer) mit Status passend zur Anfrage
--    und – wenn im Formular angehakt – der Einwilligung „Website-Formular“.
--  * Gibt es die Telefonnummer schon bei einem Lead, wird die Anfrage diesem Lead zugeordnet.
--  * Im Verlauf steht, was angefragt wurde.

create or replace function public.anfrage_zu_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_besitzer uuid;
  v_lead     uuid;
  v_status   public.lead_status;
  v_ziffern  text := right(regexp_replace(coalesce(new.telefon, ''), '\D', '', 'g'), 9);
  v_art      text := case new.art when 'demo' then 'Gratis-Demo' when 'beratung' then 'Beratung' else 'Rückruf' end;
  v_text     text;
begin
  select id into v_besitzer from public.profiles where rolle = 'admin' and aktiv order by created_at limit 1;
  if v_besitzer is null then
    return new;
  end if;

  v_status := case new.art when 'demo' then 'demo' when 'beratung' then 'interessiert' else 'rueckruf' end;
  v_text := 'Anfrage über die Website: ' || v_art
    || coalesce(' (Paket ' || case new.paket::text when 'basis' then 'Basic' when 'business' then 'Business' when 'premium' then 'Pro' end || ')', '')
    || coalesce(E'\nWünsche: ' || nullif(new.wuensche, ''), '');

  -- Schon bekannt? Dann an den bestehenden Lead hängen
  if char_length(v_ziffern) >= 7 then
    select l.id into v_lead
    from public.leads l
    where right(regexp_replace(coalesce(l.telefon, ''), '\D', '', 'g'), 9) = v_ziffern
    order by l.created_at
    limit 1;
  end if;

  if v_lead is not null then
    update public.leads
    set status = case when status in ('neu', 'nicht_erreicht', 'kein_interesse', 'falsche_nummer') then v_status else status end,
        naechster_rueckruf = now() + interval '30 minutes',
        einwilligung_wie = case when einwilligung_wie is null and new.einwilligung_kontakt then 'Website-Formular' else einwilligung_wie end
    where id = v_lead and status not in ('verkauft', 'nicht_anrufen');
  else
    insert into public.leads (firma, ansprechpartner, branche, telefon, email, status, naechster_rueckruf, quelle, besitzer_id, einwilligung_wie)
    values (
      coalesce(nullif(new.firma, ''), new.name), new.name, new.branche, new.telefon, new.email,
      v_status, now() + interval '30 minutes', 'anfrage:' || new.art, v_besitzer,
      case when new.einwilligung_kontakt then 'Website-Formular' end
    )
    returning id into v_lead;
  end if;

  insert into public.lead_verlauf (lead_id, autor_id, art, text) values (v_lead, null, 'system', v_text);
  update public.anfragen set lead_id = v_lead where id = new.id;
  return new;
end;
$$;

revoke execute on function public.anfrage_zu_lead() from public, anon, authenticated;

create trigger anfragen_zu_lead
  after insert on public.anfragen
  for each row execute function public.anfrage_zu_lead();
