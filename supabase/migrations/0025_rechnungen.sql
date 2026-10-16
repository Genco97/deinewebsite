-- Rechnungen: Zu jeder eingegangenen Online-Zahlung entsteht automatisch eine Rechnung mit fortlaufender Nummer.
-- Angelegt wird sie vom Stripe-Webhook (Server). Anzeigen kann sie jeder mit dem Kundenlink bzw. das Team im CRM.

create sequence public.rechnung_nr_seq start 1;

create or replace function public.naechste_rechnungsnummer()
returns text
language sql
security definer
set search_path = public
as $$
  select 'R-' || to_char(now() at time zone 'Europe/Vienna', 'YYYY') || '-' || lpad(nextval('public.rechnung_nr_seq')::text, 4, '0');
$$;

revoke execute on function public.naechste_rechnungsnummer() from public, anon, authenticated;

create table public.rechnungen (
  id         uuid primary key default gen_random_uuid(),
  nummer     text not null unique,
  zahlung_id uuid not null unique references public.zahlungen (id) on delete cascade,
  deal_id    uuid not null references public.deals (id) on delete cascade,
  datum      date not null,
  betrag     numeric(10, 2) not null check (betrag > 0),
  created_at timestamptz not null default now()
);

create index rechnungen_deal_idx on public.rechnungen (deal_id);

alter table public.rechnungen enable row level security;

create policy "rechnungen_select" on public.rechnungen
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.deals d where d.id = deal_id and d.partner_id = auth.uid())
  );

revoke all on public.rechnungen from anon, authenticated;
grant select on public.rechnungen to authenticated;
