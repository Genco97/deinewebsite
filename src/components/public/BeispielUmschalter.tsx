"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui";
import { THEMEN, THEMA_INFO, type Thema } from "@/lib/beispiele";
import { PAKET_NAMEN } from "@/lib/pakete";

/** Breite, in der die Beispielseite „gedacht“ ist – am Handy die Handy-Ansicht. */
const breiteFuer = (w: number) => (w < 640 ? 390 : 1280);

export function BeispielUmschalter() {
  const [thema, setThema] = useState<Thema>("ursprung");
  const [geladen, setGeladen] = useState<Thema[]>(["ursprung"]);
  const [breite, setBreite] = useState<number | null>(null);
  const rahmen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rahmen.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBreite(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function waehlen(t: Thema) {
    setThema(t);
    setGeladen((g) => (g.includes(t) ? g : [...g, t]));
  }

  function pfeil(e: React.KeyboardEvent, i: number) {
    const n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!n) return;
    e.preventDefault();
    const t = THEMEN[(i + n + THEMEN.length) % THEMEN.length];
    waehlen(t);
    document.getElementById(`thema-${t}`)?.focus();
  }

  const handy = breite !== null && breite < 640;
  const logisch = breite ? breiteFuer(breite) : 1280;
  const massstab = breite ? breite / logisch : 1;
  const hoehe = handy ? 540 : Math.min(620, Math.round((breite ?? 1000) * 0.6));
  const info = THEMA_INFO[thema];

  return (
    <div>
      <div role="tablist" aria-label="Design auswählen" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {THEMEN.map((t, i) => {
          const aktiv = t === thema;
          return (
            <button
              key={t}
              id={`thema-${t}`}
              role="tab"
              aria-selected={aktiv}
              aria-controls="thema-vorschau"
              tabIndex={aktiv ? 0 : -1}
              onClick={() => waehlen(t)}
              onKeyDown={(e) => pfeil(e, i)}
              className={`min-h-11 rounded-xl border px-4 py-3 text-left transition-colors ${
                aktiv ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:border-brand"
              }`}
            >
              <span className="block font-semibold">{THEMA_INFO[t].label}</span>
              <span className={`block text-sm ${aktiv ? "text-white/80" : "text-muted"}`}>{THEMA_INFO[t].kurz}</span>
            </button>
          );
        })}
      </div>

      <div id="thema-vorschau" role="tabpanel" aria-labelledby={`thema-${thema}`} className="mt-6">
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <div className="flex items-center gap-2 border-b border-line bg-bg px-4 py-2.5">
            <span aria-hidden className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </span>
            <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-surface px-3 py-1 text-center text-xs text-muted">
              Beispiel: Salon Mila · {info.label}
            </span>
          </div>
          <div ref={rahmen} className="relative bg-bg" style={{ height: hoehe }}>
            {breite
              ? geladen.map((t) => (
                  <iframe
                    key={t}
                    src={`/beispiele/${t}`}
                    title={`Beispiel-Website im Design ${THEMA_INFO[t].label}`}
                    tabIndex={t === thema && !handy ? 0 : -1}
                    aria-hidden={t !== thema}
                    className="absolute left-0 top-0 origin-top-left border-0"
                    style={{
                      width: logisch,
                      height: hoehe / massstab,
                      transform: `scale(${massstab})`,
                      visibility: t === thema ? "visible" : "hidden",
                      pointerEvents: handy ? "none" : undefined,
                    }}
                  />
                ))
              : null}
            {handy ? (
              <Link
                href={`/beispiele/${thema}`}
                className="absolute inset-x-0 bottom-0 flex h-28 items-end justify-center bg-gradient-to-t from-black/50 to-transparent pb-4"
              >
                <span className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow">Antippen und ganz ansehen</span>
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-muted">
            <strong className="text-ink">{info.paket ? `Paket ${PAKET_NAMEN[info.paket]}` : "Unser Stil"}:</strong> {info.text}
          </p>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link href={`/beispiele/${thema}`} className={buttonClass("secondary")}>
              Ganz ansehen
            </Link>
            <Link href={`/demo?paket=${info.paket ?? "business"}`} className={buttonClass("primary")}>
              {info.paket ? `${PAKET_NAMEN[info.paket]} anfragen` : "Gratis-Demo anfordern"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
