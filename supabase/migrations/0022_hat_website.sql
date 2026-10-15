-- Neuer Lead-Status „Hat schon eine Website“ mit optionaler Adresse der Website
alter type public.lead_status add value if not exists 'hat_website' after 'kein_interesse';
alter table public.leads add column if not exists website text check (website is null or char_length(website) <= 300);
