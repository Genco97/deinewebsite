"use client";

import { useSyncExternalStore } from "react";
import { offenStatus, type Betrieb } from "@/lib/beispiele";

// Jede Minute neu berechnen
const abo = (neu: () => void) => {
  const t = setInterval(neu, 60_000);
  return () => clearInterval(t);
};
const minute = () => Math.floor(Date.now() / 60_000);

/** „Jetzt geöffnet · bis 18:30“ mit grünem Punkt – erst im Browser, damit die Uhrzeit stimmt */
export function OffenStatus({ zeiten, className = "" }: { zeiten: Betrieb["oeffnungszeiten"]; className?: string }) {
  const m = useSyncExternalStore(abo, minute, () => 0);
  if (!m) return <span className={className}>&nbsp;</span>;
  const s = offenStatus(zeiten, new Date(m * 60_000));
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden className={`relative flex h-2 w-2 ${s.offen ? "" : "opacity-60"}`}>
        {s.offen && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${s.offen ? "bg-emerald-500" : "bg-current"}`} />
      </span>
      {s.text}
    </span>
  );
}
