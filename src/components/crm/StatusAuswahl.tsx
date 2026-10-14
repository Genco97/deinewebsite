"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { statusAendern } from "@/app/crm/leads/actions";
import { LEAD_STATUS, STATUS_LABEL, STATUS_PIN, type LeadStatus } from "@/lib/status";
import { heuteWien, tagVerschieben, wienZuIso } from "@/lib/zeit";

const AUSWAHL = LEAD_STATUS.filter((s) => s !== "nicht_anrufen");

/** Status mit einem Tipp ändern – wird sofort gespeichert. Nur bei „Rückruf“ kommt optional die Frage nach dem Termin. */
export function StatusAuswahl({ id, status, admin = false }: { id: string; status: LeadStatus; admin?: boolean }) {
  const router = useRouter();
  const [wert, setWert] = useState<LeadStatus>(status);
  const [frage, setFrage] = useState(false);
  const [eigen, setEigen] = useState("");
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, starten] = useTransition();

  const gesperrt = status === "verkauft" || (status === "nicht_anrufen" && !admin);

  function speichern(neu: LeadStatus, termin?: string | null) {
    setFehler(null);
    starten(async () => {
      const r = await statusAendern(id, neu, termin ?? null);
      if (!r.ok) {
        setWert(status);
        setFehler(r.meldung ?? "Das hat nicht geklappt.");
        return;
      }
      setFrage(false);
      router.refresh();
    });
  }

  function gewaehlt(neu: string) {
    if (neu === "verkauft") {
      router.push(`/crm/leads/${id}?verkauf=1#verkauf`);
      return;
    }
    const s = neu as LeadStatus;
    setWert(s);
    if (s === "rueckruf") {
      setFrage(true);
      return;
    }
    speichern(s);
  }

  const heute = heuteWien();
  const zeit = (tag: string, uhr: string) => wienZuIso(`${tag}T${uhr}`);
  const jetztStunde = Number(new Intl.DateTimeFormat("de-AT", { hour: "numeric", hour12: false, timeZone: "Europe/Vienna" }).format(new Date()));
  const schnell = [
    ...(jetztStunde < 16 ? [{ text: "Heute 16:00", iso: zeit(heute, "16:00") }] : []),
    { text: "Morgen 10:00", iso: zeit(tagVerschieben(heute, 1), "10:00") },
    { text: "Morgen 16:00", iso: zeit(tagVerschieben(heute, 1), "16:00") },
  ];

  return (
    <div className="min-w-0">
      <label className="relative block">
        <span className="sr-only">Status</span>
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
          style={{ background: STATUS_PIN[wert] }}
        />
        <select
          value={wert}
          disabled={gesperrt || laeuft}
          onChange={(e) => gewaehlt(e.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-line bg-surface pl-7 pr-8 text-sm font-semibold text-ink disabled:opacity-70"
        >
          {(status === "verkauft" ? ["verkauft" as LeadStatus] : AUSWAHL).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
              {s === "verkauft" && status !== "verkauft" ? " (Verkauf melden …)" : ""}
            </option>
          ))}
          <option value="nicht_anrufen">{STATUS_LABEL.nicht_anrufen}</option>
        </select>
        <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-current text-muted" strokeWidth={2}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </label>

      {frage ? (
        <div className="mt-2 rounded-lg border border-line bg-bg p-2.5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Rückruf – wann? (optional)</p>
          <div className="flex flex-wrap gap-1.5">
            {schnell.map((s) => (
              <button
                key={s.text}
                type="button"
                disabled={laeuft}
                onClick={() => speichern("rueckruf", s.iso)}
                className="min-h-9 rounded-lg border border-line bg-surface px-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
              >
                {s.text}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-1.5">
            <input
              type="datetime-local"
              value={eigen}
              onChange={(e) => setEigen(e.target.value)}
              aria-label="Anderer Termin"
              className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface px-2 text-sm"
            />
            <button
              type="button"
              disabled={laeuft || !eigen}
              onClick={() => speichern("rueckruf", wienZuIso(eigen))}
              className="min-h-9 rounded-lg bg-brand px-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              OK
            </button>
          </div>
          <button type="button" disabled={laeuft} onClick={() => speichern("rueckruf", null)} className="mt-2 text-sm font-semibold text-muted hover:text-ink">
            Ohne Termin speichern
          </button>
        </div>
      ) : null}
      {laeuft ? <p className="mt-1 text-xs text-muted">Speichert …</p> : null}
      {fehler ? <p className="mt-1 text-xs font-semibold text-danger">{fehler}</p> : null}
    </div>
  );
}
