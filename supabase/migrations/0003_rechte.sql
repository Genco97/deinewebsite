-- 0003 – Trigger-Funktionen nicht per API (rpc) aufrufbar machen

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.profiles_schutz() from public, anon, authenticated;
revoke execute on function public.leads_schutz() from public, anon, authenticated;
revoke execute on function public.leads_verlauf_log() from public, anon, authenticated;
revoke execute on function public.deals_provisionen() from public, anon, authenticated;
revoke execute on function public.deals_vorher() from public, anon, authenticated;
revoke execute on function public.deals_aenderungsrunden_default() from public, anon, authenticated;
