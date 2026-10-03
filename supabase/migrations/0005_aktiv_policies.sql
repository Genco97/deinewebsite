-- =====================================================================
-- 0005 – Deaktivierte Partner verlieren den Zugriff auf ihre Leads
-- (Zusätzliche Absicherung – die App meldet deaktivierte Konten bereits ab.)
-- =====================================================================

drop policy "leads_select" on public.leads;
create policy "leads_select" on public.leads
  for select to authenticated
  using ((besitzer_id = auth.uid() and public.ist_aktiv()) or public.is_admin());

drop policy "leads_insert" on public.leads;
create policy "leads_insert" on public.leads
  for insert to authenticated
  with check ((besitzer_id = auth.uid() and public.ist_aktiv()) or public.is_admin());

drop policy "leads_update" on public.leads;
create policy "leads_update" on public.leads
  for update to authenticated
  using ((besitzer_id = auth.uid() and public.ist_aktiv()) or public.is_admin())
  with check ((besitzer_id = auth.uid() and public.ist_aktiv()) or public.is_admin());
