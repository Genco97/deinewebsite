"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** true unter 640 px (Tailwind „sm“). Am Server und beim ersten Rendern false. */
export function useHandyBreite() {
  return useSyncExternalStore(
    (melden) => {
      const mq = window.matchMedia("(max-width: 639px)");
      mq.addEventListener("change", melden);
      return () => mq.removeEventListener("change", melden);
    },
    () => window.matchMedia("(max-width: 639px)").matches,
    () => false,
  );
}

/** Beispielseite im Handy-Rahmen: die Seite wird in 390 px gebaut und verkleinert angezeigt. */
export function HandyRahmen({ src, titel, breite = 260, klickbar = true }: { src: string; titel: string; breite?: number; klickbar?: boolean }) {
  const [geladen, setGeladen] = useState<string | null>(null);
  const innen = breite - 16;
  const massstab = innen / 390;
  const hoehe = Math.round(innen * 2.05);
  return (
    <div className="relative mx-auto shrink-0 rounded-[2.4rem] bg-[#111827] p-2 shadow-2xl ring-1 ring-black/10" style={{ width: breite }}>
      <div className="relative overflow-hidden rounded-[1.9rem] bg-white" style={{ height: hoehe }}>
        <div aria-hidden className="relative z-10 flex h-7 items-center justify-between bg-white px-6 text-[11px] font-semibold text-ink">
          <span>9:41</span>
          <span className="absolute left-1/2 top-1.5 h-[18px] w-20 -translate-x-1/2 rounded-full bg-[#111827]" />
          <span>●●● ▮</span>
        </div>
        <iframe
          key={src}
          src={src}
          title={titel}
          tabIndex={klickbar ? 0 : -1}
          onLoad={() => setGeladen(src)}
          ref={(f) => {
            // Der Rahmen wird am Server mitgerendert: Ist die Seite darin schon vor dem
            // Hydrieren fertig, kommt onLoad nie an – dann hier als geladen markieren.
            if (f && geladen !== src && f.contentWindow?.location.href !== "about:blank" && f.contentDocument?.readyState === "complete") {
              setGeladen(src);
            }
          }}
          className="absolute left-0 top-7 origin-top-left border-0 transition-opacity duration-300"
          style={{
            width: 390,
            height: (hoehe - 28) / massstab,
            transform: `scale(${massstab})`,
            opacity: geladen === src ? 1 : 0,
            pointerEvents: klickbar ? undefined : "none",
          }}
        />
        {geladen !== src ? <Laedt /> : null}
      </div>
    </div>
  );
}

/** Beispielseite im Browser-Fenster, 1280 px breit gedacht */
export function DesktopRahmen({ src, titel, adresse, hoehe = 520 }: { src: string; titel: string; adresse: string; hoehe?: number }) {
  const [breite, setBreite] = useState<number | null>(null);
  const [geladen, setGeladen] = useState<string | null>(null);
  const rahmen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rahmen.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBreite(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const massstab = breite ? breite / 1280 : 1;
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
      <div className="flex items-center gap-2 border-b border-line bg-bg px-4 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-surface px-3 py-1 text-center text-xs text-muted">{adresse}</span>
      </div>
      <div ref={rahmen} className="relative bg-bg" style={{ height: hoehe }}>
        {breite ? (
          <iframe
            key={src}
            src={src}
            title={titel}
            onLoad={() => setGeladen(src)}
            className="absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-300"
            style={{ width: 1280, height: hoehe / massstab, transform: `scale(${massstab})`, opacity: geladen === src ? 1 : 0 }}
          />
        ) : null}
        {geladen !== src ? <Laedt /> : null}
      </div>
    </div>
  );
}

function Laedt() {
  return (
    <div role="status" className="absolute inset-0 grid place-items-center bg-bg">
      <span className="flex items-center gap-2 text-sm font-medium text-muted">
        <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-brand-light border-t-brand" />
        Seite wird gebaut …
      </span>
    </div>
  );
}
