-- =====================================================================
-- 0015 – Tagesziel fürs Dashboard
--  * Jede Person legt selbst fest, wie viele Kontakte sie am Tag schaffen will.
--  * Ein „Kontakt“ ist ein Lead, bei dem man heute etwas eingetragen hat
--    (Notiz, Status, Rückruf, Besuch, Verkauf).
-- =====================================================================

alter table public.profiles
  add column tagesziel smallint not null default 50 check (tagesziel between 1 and 500);

-- Schnell „was habe ich heute gemacht?“ abfragen
create index if not exists lead_verlauf_autor_zeit_idx on public.lead_verlauf (autor_id, created_at desc);
