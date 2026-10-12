-- =====================================================================
-- 0019 – WhatsApp-Vorlagen
--  * vorlagen bekommt einen Kanal: 'email' (bisher) oder 'whatsapp'.
--  * Drei Starttexte für WhatsApp. Platzhalter wie bei den E-Mails.
--  * Betreff ist bei WhatsApp unbenutzt (Platzhalter „-“).
-- =====================================================================

alter table public.vorlagen
  add column kanal text not null default 'email' check (kanal in ('email', 'whatsapp'));

insert into public.vorlagen (titel, betreff, text, reihenfolge, kanal) values
('Nach dem Gespräch', '-',
'{anrede}, danke für das nette Gespräch! Wie besprochen können Sie hier Ihre kostenlose Demo-Website anfordern (dauert 1 Minute): {demo_link}

Bei Fragen schreiben Sie mir gern direkt hier.
LG {mein_name}, Ursprung

Wenn Sie keine Nachrichten mehr möchten, antworten Sie einfach mit STOPP.', 10, 'whatsapp'),
('Nicht erreicht', '-',
'{anrede}, ich habe gerade versucht, Sie zu erreichen. Es geht um eine kostenlose Demo für Ihre neue Website. Wann passt ein kurzer Rückruf? Gern auch einfach hier antworten.
LG {mein_name}, Ursprung

Wenn Sie keine Nachrichten mehr möchten, antworten Sie einfach mit STOPP.', 20, 'whatsapp'),
('Demo ist fertig', '-',
'{anrede}, die Demo Ihrer neuen Website ist fertig: {website}

Schauen Sie sich alles in Ruhe an. Gefällt sie Ihnen, geben Sie kurz Bescheid, erst dann zahlen Sie. Änderungswünsche gern direkt hier.
LG {mein_name}, Ursprung', 30, 'whatsapp');
