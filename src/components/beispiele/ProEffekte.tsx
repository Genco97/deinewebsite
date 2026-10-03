"use client";

import { useEffect } from "react";

/** Einblenden beim Scrollen, Licht unter der Maus und hochzählende Zahlen. */
export function ProEffekte() {
  useEffect(() => {
    const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seite = document.querySelector<HTMLElement>(".pro-seite");

    const zaehlen = (el: HTMLElement) => {
      const ziel = Number(el.dataset.zahl);
      const komma = Number(el.dataset.komma ?? 0);
      const zeigen = (n: number) => (el.textContent = n.toLocaleString("de-AT", { minimumFractionDigits: komma, maximumFractionDigits: komma }));
      if (ruhig) return zeigen(ziel);
      const start = performance.now();
      const schritt = (t: number) => {
        const p = Math.min(1, (t - start) / 1600);
        zeigen(ziel * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(schritt);
      };
      requestAnimationFrame(schritt);
    };

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.add("pro-sichtbar");
          el.querySelectorAll<HTMLElement>("[data-zahl]").forEach(zaehlen);
          beobachter.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => beobachter.observe(el));

    const bewegen = (e: PointerEvent) => {
      seite?.style.setProperty("--pro-x", `${e.clientX}px`);
      seite?.style.setProperty("--pro-y", `${e.clientY}px`);
    };
    if (!ruhig) window.addEventListener("pointermove", bewegen, { passive: true });

    return () => {
      beobachter.disconnect();
      window.removeEventListener("pointermove", bewegen);
    };
  }, []);

  return <div aria-hidden className="pro-licht" />;
}
