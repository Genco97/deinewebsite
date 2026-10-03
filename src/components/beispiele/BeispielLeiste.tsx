"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const leer = () => () => {};

/** Kleine Leiste über der Beispiel-Website. In der Vorschau (iframe) auf der Startseite ausgeblendet. */
export function BeispielLeiste() {
  const imRahmen = useSyncExternalStore(
    leer,
    () => window.self !== window.top,
    () => true,
  );
  if (imRahmen) return null;
  return (
    <div className="relative z-[60] flex items-center justify-between gap-3 bg-[#111827] px-4 py-2 font-sans text-sm text-white">
      <p className="min-w-0 truncate">
        <span className="font-semibold">Beispiel-Website</span>
        <span className="hidden text-white/70 sm:inline"> · erfundener Betrieb, gestaltet von Ursprung</span>
      </p>
      <Link href="/#beispiele" className="shrink-0 rounded-md bg-white/10 px-3 py-1.5 font-semibold hover:bg-white/20">
        ← Zurück zu Ursprung
      </Link>
    </div>
  );
}
