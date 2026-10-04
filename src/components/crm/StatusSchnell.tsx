"use client";

import { useState } from "react";
import { statusSetzen } from "@/app/crm/leads/actions";
import { NaechsterSchritt } from "@/components/crm/NaechsterSchritt";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { Select, buttonClass } from "@/components/ui";
import { OHNE_SCHRITT, type SchrittVorgabe } from "@/lib/schritt";
import { LEAD_STATUS, STATUS_LABEL, type LeadStatus } from "@/lib/status";

/** Status direkt in der Liste ändern – mit Pflicht-Schritt wie auf der Detailseite. */
export function StatusSchnell({
  id,
  firma,
  status,
  anrufOk,
  vorgabe,
  zurueck,
}: {
  id: string;
  firma: string;
  status: LeadStatus;
  anrufOk: boolean;
  vorgabe: SchrittVorgabe;
  zurueck: string;
}) {
  const [offen, setOffen] = useState(false);
  const [neu, setNeu] = useState<LeadStatus>(status);

  if (status === "nicht_anrufen" || status === "verkauft") return <StatusBadge status={status} />;

  if (!offen) {
    return (
      <button
        type="button"
        onClick={() => setOffen(true)}
        className="inline-flex min-h-11 items-center gap-1 rounded-lg px-1 hover:bg-line/50"
        aria-label={`Status von ${firma} ändern (jetzt: ${STATUS_LABEL[status]})`}
      >
        <StatusBadge status={status} />
        <span aria-hidden className="text-xs text-muted">▾</span>
      </button>
    );
  }

  const ohne = OHNE_SCHRITT.includes(neu);
  return (
    <form action={statusSetzen} className="w-full min-w-64 space-y-3 rounded-lg border border-line bg-surface p-3 shadow-sm">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="zurueck" value={zurueck} />
      <label className="block text-sm font-semibold text-ink">
        Status
        <Select id={`status-${id}`} name="status" value={neu} onChange={(e) => setNeu(e.target.value as LeadStatus)} className="mt-1">
          {LEAD_STATUS.filter((s) => s !== "verkauft").map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </label>
      {ohne ? null : <NaechsterSchritt vorgabe={vorgabe} anrufOk={anrufOk} idPrefix={`schnell-${id}`} />}
      <div className="flex gap-2">
        <button formNoValidate={ohne} className={buttonClass("primary", "flex-1 px-3")}>
          Speichern
        </button>
        <button type="button" onClick={() => setOffen(false)} className={buttonClass("secondary", "px-3")}>
          Abbrechen
        </button>
      </div>
    </form>
  );
}
