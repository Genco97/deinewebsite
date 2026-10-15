"use client";

import { useEffect, useRef } from "react";

/*
 * Signatur-Animation der Pro-Seite: eine Schere schneidet sich beim Scrollen durch die Seite.
 * Die Seite bleibt stehen (sticky), das Scrollen steuert Bewegung, Schnitte und Text.
 * Ohne JavaScript oder bei „Bewegung reduzieren“ steht die Schere ruhig in der Mitte.
 */
export function ProSignatur({ zeilen }: { zeilen: [string, string, string] }) {
  const sek = useRef<HTMLElement>(null);
  const schere = useRef<HTMLDivElement>(null);
  const klingeA = useRef<SVGGElement>(null);
  const klingeB = useRef<SVGGElement>(null);
  const spur = useRef<HTMLDivElement>(null);
  const texte = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    const el = sek.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let aus = false;
    let kill = () => {};
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (aus) return;
      gsap.registerPlugin(ScrollTrigger);
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (s) => {
          const p = s.progress;
          const breite = el.clientWidth;
          // Fährt von links nach rechts über die Seite, schneidet 7-mal
          const x = (-0.42 + p * 0.84) * breite;
          const winkel = 3 + 13 * Math.abs(Math.sin(p * Math.PI * 7));
          if (schere.current) schere.current.style.transform = `translate(${x}px,-50%) rotate(${Math.sin(p * Math.PI * 2) * 7}deg)`;
          klingeA.current?.setAttribute("transform", `rotate(${winkel} 200 200)`);
          klingeB.current?.setAttribute("transform", `rotate(${-winkel} 200 200)`);
          if (spur.current) spur.current.style.clipPath = `inset(0 ${100 - (p * 84 + 8)}% 0 0)`;
          texte.current.forEach((t, i) => {
            if (!t) return;
            const an = p > i / 3 + 0.02 && p < (i + 1) / 3 + 0.06;
            t.style.opacity = an ? "1" : "0";
            t.style.transform = `translateY(${an ? 0 : 24}px)`;
          });
        },
      });
      kill = () => st.kill();
    })();
    return () => {
      aus = true;
      kill();
    };
  }, []);

  return (
    <section ref={sek} aria-label="Schnitt für Schnitt" className="relative mt-32 h-[320vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div aria-hidden className="absolute inset-x-[8%] top-1/2 h-0 border-t-[3px] border-dashed border-white/20" />
        <div ref={spur} aria-hidden className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 [clip-path:inset(0_100%_0_0)]">
          <div className="mx-[8%] h-full rounded bg-gradient-to-r from-fuchsia-500 to-cyan-400 shadow-[0_0_40px_var(--pro-a)]" />
        </div>
        <div className="absolute inset-x-0 top-[12%] z-10 mx-auto h-48 max-w-5xl px-5 text-center">
          {zeilen.map((z, i) => (
            <p
              key={z}
              ref={(n) => {
                texte.current[i] = n;
              }}
              className="absolute inset-x-5 top-0 text-[clamp(2.4rem,7vw,6.5rem)] font-bold leading-[0.95] tracking-[-0.05em] transition-[opacity,transform] duration-500"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              {z}
            </p>
          ))}
        </div>
        <div ref={schere} aria-hidden style={{ transform: "translate(0,-50%)" }} className="absolute left-1/2 top-1/2 z-20 -ml-[min(23vw,210px)] w-[min(46vw,420px)] drop-shadow-[0_20px_40px_rgba(0,0,0,.5)]">
          <svg viewBox="0 0 400 400" className="h-auto w-full">
            <defs>
              <linearGradient id="stahl" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f3f4f6" />
                <stop offset=".55" stopColor="#9ca3af" />
                <stop offset="1" stopColor="#e5e7eb" />
              </linearGradient>
              <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="var(--pro-a)" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <g ref={klingeA} transform="rotate(8 200 200)">
              <path d="M200 203 L372 197 L372 203 L202 214 Z" fill="url(#stahl)" />
              <path d="M200 206 L116 258" stroke="url(#stahl)" strokeWidth="14" strokeLinecap="round" />
              <circle cx="84" cy="284" r="38" fill="none" stroke="url(#ring)" strokeWidth="14" />
            </g>
            <g ref={klingeB} transform="rotate(-8 200 200)">
              <path d="M200 197 L372 203 L372 197 L202 186 Z" fill="url(#stahl)" />
              <path d="M200 194 L116 142" stroke="url(#stahl)" strokeWidth="14" strokeLinecap="round" />
              <circle cx="84" cy="116" r="38" fill="none" stroke="url(#ring)" strokeWidth="14" />
            </g>
            <circle cx="200" cy="200" r="9" fill="#374151" stroke="#f3f4f6" strokeWidth="3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
