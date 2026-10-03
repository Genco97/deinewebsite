-- =====================================================================
-- 0007 – Automatische Verteilung wieder entfernen
-- Anfragen werden von den Gründern selbst zugeteilt (Admin → Anfragen).
-- =====================================================================

drop trigger if exists anfrage_verteilen on public.anfragen;
drop function if exists public.anfrage_verteilen();

-- Profilschutz wieder auf den Stand von 0004
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

alter table public.profiles
  drop column if exists bekommt_anfragen,
  drop column if exists letzte_anfrage_am;
