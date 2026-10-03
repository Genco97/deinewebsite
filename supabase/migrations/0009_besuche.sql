-- =====================================================================
-- 0009 – Besuchsplanung
--  * leads.besuch_geplant: Tag, an dem der Betrieb besucht werden soll
--  * leads.letzter_besuch: wann zuletzt jemand vor Ort war
--  * Verlauf kennt die Art „besuch“ (Ergebnis eines Besuchs)
-- =====================================================================

alter table public.leads
  add column besuch_geplant date,
  add column letzter_besuch timestamptz;

create index leads_besuch_geplant_idx on public.leads (besuch_geplant) where besuch_geplant is not null;

alter table public.lead_verlauf drop constraint lead_verlauf_art_check;
alter table public.lead_verlauf
  add constraint lead_verlauf_art_check
  check (art in ('notiz', 'status', 'rueckruf', 'verkauf', 'system', 'besuch'));
