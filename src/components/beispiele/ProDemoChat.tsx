"use client";

import { useEffect, useRef, useState } from "react";
import { antwortFuer } from "@/components/beispiele/ProChat";
import type { Betrieb } from "@/lib/beispiele";

type Nachricht = { von: "ki" | "ich"; text: string };

/** Ein Gespräch, das sich selbst tippt, sobald es ins Bild kommt – zeigt, was die KI-Assistentin kann. */
export function ProDemoChat({ betrieb }: { betrieb: Betrieb }) {
  const box = useRef<HTMLDivElement>(null);
  const [verlauf, setVerlauf] = useState<Nachricht[]>([]);
  const [tippt, setTippt] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fragen = betrieb.chat.slice(0, 2);
    const ablauf: Nachricht[] = [{ von: "ki", text: `Hallo! Ich bin die digitale Assistentin von ${betrieb.name}. Wie kann ich helfen?` }];
    for (const f of fragen) ablauf.push({ von: "ich", text: f }, { von: "ki", text: antwortFuer(betrieb, f) });
    const uhren: ReturnType<typeof setTimeout>[] = [];
    const los = () => {
      let t = 300;
      ablauf.forEach((n, i) => {
        if (n.von === "ki" && i > 0) {
          uhren.push(setTimeout(() => setTippt(true), t));
          t += 1100;
        }
        uhren.push(
          setTimeout(() => {
            setTippt(false);
            setVerlauf((v) => [...v, n]);
          }, t),
        );
        t += n.von === "ich" ? 900 : 1300;
      });
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        los();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      uhren.forEach(clearTimeout);
    };
  }, [betrieb]);

  return (
    <div ref={box} aria-live="polite" className="flex min-h-[340px] flex-col justify-end gap-2.5">
      {verlauf.map((n, i) => (
        <p
          key={i}
          className={`max-w-[85%] animate-[pro-auf_.45s_cubic-bezier(.2,.8,.2,1)] rounded-[20px] px-4 py-3 text-[15px] leading-snug ${
            n.von === "ich" ? "self-end rounded-br-md bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white" : "rounded-bl-md bg-white/[0.08] text-white/90"
          }`}
        >
          {n.text}
        </p>
      ))}
      {tippt && (
        <p className="pro-tippen w-fit rounded-[20px] rounded-bl-md bg-white/[0.08] px-4 py-3 text-white/70" aria-label="Assistentin schreibt">
          <span />
          <span />
          <span />
        </p>
      )}
    </div>
  );
}
