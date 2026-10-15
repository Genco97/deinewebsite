"use client";

import { useEffect } from "react";

/*
 * Sanfte Bewegung für Business: Abschnitte blenden beim Scrollen ein, Zahlen zählen hoch.
 * Ohne JavaScript oder bei „Bewegung reduzieren“ ist alles sofort sichtbar.
 */
export function BusinessBewegung() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wurzel = document.querySelector<HTMLElement>("[data-bseite]");
    if (!wurzel) return;
    wurzel.dataset.bjs = "1";
    const io = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.dataset.an = "1";
          io.unobserve(el);
          if (el.dataset.zaehl) {
            const ziel = Number(el.dataset.zaehl);
            const komma = Number(el.dataset.komma ?? 0);
            const t0 = performance.now();
            const tick = (t: number) => {
              const p = Math.min(1, (t - t0) / 1400);
              const w = ziel * (1 - Math.pow(1 - p, 3));
              el.textContent = w.toLocaleString("de-AT", { minimumFractionDigits: komma, maximumFractionDigits: komma });
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.15 },
    );
    wurzel.querySelectorAll("[data-r],[data-zaehl]").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      delete wurzel.dataset.bjs;
    };
  }, []);
  return null;
}
