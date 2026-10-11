-- =====================================================================
-- 0018 – Kontaktdaten fürs Team auf der Website
--  * Jede Person im Team (Gründer und Partner) kann im Profil Telefon und
--    E-Mail hinterlegen und selbst entscheiden, ob sie auf der Website stehen.
--  * Ohne Login nur über eine security-definer-Funktion, die ausschließlich
--    Name, Telefon und E-Mail von aktiven Personen mit „öffentlich = ja“
--    liefert. Keine Tabelle wird für anon lesbar.
--  * Ist keine E-Mail hinterlegt, zeigt die Website die Firmen-E-Mail.
-- =====================================================================

alter table public.profiles
  add column kontakt_telefon text check (kontakt_telefon is null or char_length(kontakt_telefon) <= 40),
  add column kontakt_email text check (kontakt_email is null or char_length(kontakt_email) <= 200),
  add column kontakt_oeffentlich boolean not null default false;

create or replace function public.oeffentliche_kontakte()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'name', p.name,
           'rolle', p.rolle,
           'telefon', p.kontakt_telefon,
           'email', p.kontakt_email
         ) order by (p.rolle = 'admin') desc, p.name), '[]'::jsonb)
    from public.profiles p
   where p.aktiv
     and p.kontakt_oeffentlich
     and btrim(p.name) <> ''
     and (nullif(btrim(p.kontakt_telefon), '') is not null or nullif(btrim(p.kontakt_email), '') is not null);
$$;

revoke execute on function public.oeffentliche_kontakte() from public;
grant execute on function public.oeffentliche_kontakte() to anon, authenticated;
