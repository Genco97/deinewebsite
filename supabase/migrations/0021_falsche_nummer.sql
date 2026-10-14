-- Neuer Lead-Status „Falsche Nummer“ (Nummer stimmt nicht, kein weiterer Anruf)
alter type public.lead_status add value if not exists 'falsche_nummer' after 'kein_interesse';
