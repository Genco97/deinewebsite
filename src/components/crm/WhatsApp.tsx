"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { whatsappGesendet, whatsappZustimmung } from "@/app/crm/leads/actions";
import { buttonClass } from "@/components/ui";
import { passendeVorlage, waLink, waNummer, waTextFuellen, type WaAnlass, type WaVorlage } from "@/lib/whatsapp";

export type WaLead = {
  id: string;
  firma: string;
  ansprechpartner: string | null;
  telefon: string | null;
  /** Einwilligung zu Anruf/Nachricht eingetragen? Ohne sie bleibt alles gesperrt (§ 174 TKG) */
  erlaubt: boolean;
  /** Status „Demo“ ohne Einwilligung: vor dem ersten Senden einmal die mündliche Zustimmung bestätigen */
  frage?: boolean;
  website?: string;
};
export type WaDaten = { vorlagen: WaVorlage[]; site: string; meinName: string };

export function WaIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.2 15.03l-.3-.18-3.1.82.83-3.03-.2-.31A8.1 8.1 0 0 1 12.04 3.8Zm-3.2 3.9c-.2 0-.5.07-.75.35-.26.28-1 .98-1 2.4s1.03 2.8 1.17 3c.15.2 2.03 3.2 5 4.36 2.47.97 2.97.78 3.5.73.54-.05 1.74-.7 1.98-1.4.25-.68.25-1.27.17-1.4-.07-.12-.27-.2-.57-.35-.3-.15-1.74-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.4-1.5-.9-.8-1.5-1.8-1.67-2.1-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.65-1.6-.9-2.18-.24-.57-.5-.5-.67-.5Z" />
    </svg>
  );
}

/**
 * Inhalt: Vorlage wählen, Text anpassen, WhatsApp mit fertigem Text öffnen.
 * Danach fragt das CRM, ob die Nachricht wirklich gesendet wurde, und trägt es dann im Verlauf ein.
 */
export function WhatsAppInhalt({
  lead,
  daten,
  anlass = "gespraech",
  onFertig,
  ueberspringen,
}: {
  lead: WaLead;
  daten: WaDaten;
  anlass?: WaAnlass;
  onFertig?: () => void;
  ueberspringen?: { text: string; onClick: () => void };
}) {
  const fuell = (v: WaVorlage) => waTextFuellen(v.text, lead, { site: daten.site, meinName: daten.meinName, website: lead.website });
  const start = passendeVorlage(daten.vorlagen, anlass);
  const [gewaehlt, setGewaehlt] = useState(start?.id ?? "");
  const [text, setText] = useState(start ? fuell(start) : "");
  const [phase, setPhase] = useState<"wahl" | "fragen" | "fertig">("wahl");
  const [fehler, setFehler] = useState<string | null>(null);
  const [zugestimmt, setZugestimmt] = useState(false);
  const [laeuft, starten] = useTransition();

  const nummer = waNummer(lead.telefon);
  const link = waLink(lead.telefon, text);
  const titel = daten.vorlagen.find((v) => v.id === gewaehlt)?.titel ?? "";

  if (!lead.erlaubt && lead.frage && !zugestimmt) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="font-bold text-amber-900">Hat {lead.ansprechpartner || lead.firma} zugestimmt?</p>
          <p className="mt-1 text-sm text-amber-900">
            Hat dir der Lead gesagt, dass du ihm die Demo per WhatsApp schicken darfst? Nur dann darfst du schreiben (§ 174 TKG). Ich halte es im Verlauf mit deinem
            Namen und dem Datum fest.
          </p>
        </div>
        {fehler ? <p className="text-sm font-semibold text-danger">{fehler}</p> : null}
        <button
          type="button"
          disabled={laeuft}
          onClick={() =>
            starten(async () => {
              const r = await whatsappZustimmung(lead.id);
              if (!r.ok) return setFehler(r.meldung ?? "Das hat nicht geklappt.");
              setFehler(null);
              setZugestimmt(true);
            })
          }
          className={buttonClass("primary", "w-full")}
        >
          {laeuft ? "Trägt ein …" : "Ja, hat zugestimmt"}
        </button>
        <button type="button" onClick={onFertig} className={buttonClass("secondary", "w-full")}>
          Nein, noch nicht
        </button>
      </div>
    );
  }

  if (!lead.erlaubt && !zugestimmt) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="font-bold text-amber-900">WhatsApp ist gesperrt</p>
          <p className="mt-1 text-sm text-amber-900">
            Werbenachrichten per WhatsApp sind in Österreich nur mit Einwilligung erlaubt (§ 174 TKG). Trag zuerst ein, wie die Einwilligung
            erteilt wurde, zum Beispiel „Kunde hat selbst angerufen“.
          </p>
        </div>
        <Link href={`/crm/leads/${lead.id}`} className={buttonClass("secondary", "w-full")}>
          Zum Lead und Einwilligung eintragen
        </Link>
      </div>
    );
  }

  if (!nummer) {
    return <p className="rounded-xl bg-bg p-4 text-sm text-muted">Für diesen Lead gibt es keine brauchbare Telefonnummer. Trag zuerst eine ein.</p>;
  }

  if (daten.vorlagen.length === 0) {
    return <p className="rounded-xl bg-bg p-4 text-sm text-muted">Es gibt noch keine WhatsApp-Vorlagen. Ein Gründer legt sie unter Admin → Vorlagen an.</p>;
  }

  if (phase === "fertig") {
    return (
      <div className="space-y-3">
        <p role="status" className="rounded-xl bg-ok-light p-4 font-semibold text-ok">
          ✓ Im Verlauf eingetragen: WhatsApp gesendet.
        </p>
        <button type="button" onClick={onFertig} className={buttonClass("primary", "w-full")}>
          Weiter
        </button>
      </div>
    );
  }

  if (phase === "fragen") {
    return (
      <div className="space-y-3">
        <p className="font-bold text-ink">Hast du die Nachricht in WhatsApp gesendet?</p>
        <p className="text-sm text-muted">Dann trage ich es im Verlauf ein. Das CRM kann nicht sehen, ob du auf „Senden“ getippt hast.</p>
        {fehler ? <p className="text-sm font-semibold text-danger">{fehler}</p> : null}
        <button
          type="button"
          disabled={laeuft}
          onClick={() =>
            starten(async () => {
              const r = await whatsappGesendet(lead.id, titel);
              if (!r.ok) return setFehler(r.meldung ?? "Das hat nicht geklappt.");
              setPhase("fertig");
            })
          }
          className={buttonClass("primary", "w-full")}
        >
          {laeuft ? "Trägt ein …" : "Ja, gesendet"}
        </button>
        <button type="button" onClick={() => setPhase("wahl")} className={buttonClass("secondary", "w-full")}>
          Nein, zurück
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        An {lead.ansprechpartner ? `${lead.ansprechpartner}, ` : ""}
        {lead.firma} · {lead.telefon}
      </p>
      <fieldset className="space-y-2">
        <legend className="sr-only">Vorlage wählen</legend>
        {daten.vorlagen.map((v) => {
          const aktiv = v.id === gewaehlt;
          return (
            <label
              key={v.id}
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 ${aktiv ? "border-brand bg-brand-light" : "border-line bg-surface"}`}
            >
              <input
                type="radio"
                name={`wa-vorlage-${lead.id}`}
                checked={aktiv}
                onChange={() => {
                  setGewaehlt(v.id);
                  setText(fuell(v));
                }}
                className="h-4 w-4 accent-brand"
              />
              <span className="font-semibold text-ink">{v.titel}</span>
              {start?.id === v.id ? <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-brand">vorgeschlagen</span> : null}
            </label>
          );
        })}
      </fieldset>
      <label className="block text-sm font-semibold text-ink">
        Text (kannst du noch ändern)
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          maxLength={1500}
          className="mt-1 block w-full rounded-xl border border-line bg-[#e7ffdb] px-3 py-2 text-[15px] font-normal text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </label>
      {text.includes("[Link einfügen]") ? (
        <p className="text-sm font-semibold text-amber-900">Im Text fehlt noch der Link zur Demo-Website. Bitte vor dem Senden einfügen.</p>
      ) : null}
      <a
        href={link ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setPhase("fragen")}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-base font-bold text-white hover:bg-[#1fb85a]"
      >
        <WaIcon /> In WhatsApp öffnen
      </a>
      <p className="text-center text-xs text-muted">Der Text ist fertig eingetragen. Du tippst in WhatsApp nur noch auf „Senden“.</p>
      {ueberspringen ? (
        <button type="button" onClick={ueberspringen.onClick} className={buttonClass("secondary", "w-full")}>
          {ueberspringen.text}
        </button>
      ) : null}
    </div>
  );
}

/** Knopf mit Fenster. `symbol` = nur das grüne Zeichen (Liste), sonst Knopf mit Text. */
export function WhatsAppKnopf({
  lead,
  daten,
  symbol = false,
  anlass,
  zuletzt,
}: {
  lead: WaLead;
  daten: WaDaten;
  symbol?: boolean;
  anlass?: WaAnlass;
  zuletzt?: string | null;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [offen, setOffen] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (offen && !d.open) d.showModal();
    if (!offen && d.open) d.close();
  }, [offen]);

  const schliessen = () => {
    setOffen(false);
    setVersion((v) => v + 1); // beim nächsten Öffnen wieder frisch
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOffen(true)}
        title={lead.erlaubt || lead.frage ? "WhatsApp schreiben" : "WhatsApp gesperrt: keine Einwilligung eingetragen"}
        aria-label={`WhatsApp an ${lead.firma}`}
        className={
          symbol
            ? `flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${lead.erlaubt || lead.frage ? "bg-[#25D366] text-white hover:bg-[#1fb85a]" : "border border-line bg-bg text-muted"}`
            : buttonClass("secondary", "gap-2 px-3 text-sm")
        }
      >
        <WaIcon className={symbol ? "h-5 w-5" : "h-4 w-4 text-[#25D366]"} />
        {symbol ? null : "WhatsApp schreiben"}
      </button>
      {symbol && zuletzt ? <span className="sr-only">Zuletzt WhatsApp: {zuletzt}</span> : null}
      <dialog
        ref={dialog}
        onClose={() => setOffen(false)}
        onClick={(e) => {
          if (e.target === dialog.current) schliessen();
        }}
        className="m-auto w-[min(94vw,32rem)] rounded-2xl border border-line bg-surface p-0 shadow-xl backdrop:bg-black/40"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="font-bold text-ink">WhatsApp an {lead.firma}</h2>
          <button type="button" onClick={schliessen} aria-label="Schließen" className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-muted hover:bg-bg">
            ×
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-4">
          {offen ? <WhatsAppInhalt key={version} lead={lead} daten={daten} anlass={anlass} onFertig={schliessen} /> : null}
        </div>
      </dialog>
    </>
  );
}
