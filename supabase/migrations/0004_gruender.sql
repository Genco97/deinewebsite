-- =====================================================================
-- 0004 – Gründer-Modell
--  * Admins sind die Gründer. Sie bekommen keine persönlichen Provisionen.
--  * Fällt eine Provisions-Ebene auf einen Gründer, entsteht keine Provision –
--    der Betrag bleibt im Gründer-Topf.
--  * Gründer-Topf je Deal = Betrag − Partner-Provisionen, gleich verteilt
--    auf alle aktiven Gründer (Berechnung in der App).
--  * Wird jemand zum Gründer gemacht, verliert er seine Upline.
-- =====================================================================

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

-- Profilschutz: Gründer haben keine Upline; der letzte aktive Gründer bleibt Gründer
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

-- Hilfsfunktion für 0005: ist das eigene Konto aktiv?
create or replace function public.ist_aktiv()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select aktiv from public.profiles where id = auth.uid()), false);
$$;

revoke execute on function public.ist_aktiv() from public, anon;
grant execute on function public.ist_aktiv() to authenticated;
