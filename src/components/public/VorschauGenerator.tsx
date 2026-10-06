"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui";
import {
  BRANCHEN,
  BRANCHE_INFO,
  bereinigterName,
  type BrancheId,
} from "@/lib/beispiele";
import { HandyRahmen } from "./Geraete";

export function vorschauLink(thema: string, branche: BrancheId, name: string) {
  const p = new URLSearchParams({ branche });
  if (name) p.set("name", name);
  return `/beispiele/${thema}?${p}`;
}

export function demoLink(
  paket: string,
  branche: BrancheId,
  name: string,
  design?: string,
) {
  const p = new URLSearchParams({
    paket,
    branche: BRANCHE_INFO[branche].label,
  });
  if (name) p.set("firma", name);
  if (design) p.set("design", design);
  return `/demo?${p}`;
}

/** A2: Name und Branche eingeben, die eigene Seite erscheint sofort am Handy */
export function VorschauGenerator({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [eingabe, setEingabe] = useState("");
  const [name, setName] = useState("");
  const [branche, setBranche] = useState<BrancheId>("friseur");

  // Erst nach einer kurzen Tipp-Pause neu laden, nicht bei jedem Buchstaben
  useEffect(() => {
    const t = setTimeout(() => setName(bereinigterName(eingabe)), 600);
    return () => clearTimeout(t);
  }, [eingabe]);

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
      <div>
        {children}
        <div className="mt-8 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Ihre Seite in 10 Sekunden
          </p>
          <label
            htmlFor="vorschau-name"
            className="mt-4 block font-semibold text-ink"
          >
            Wie heißt Ihr Betrieb?
          </label>
          <input
            id="vorschau-name"
            value={eingabe}
            onChange={(e) => setEingabe(e.target.value)}
            placeholder="z. B. Salon Aylin"
            maxLength={40}
            autoComplete="organization"
            className="mt-2 block min-h-12 w-full rounded-xl border border-line bg-bg px-4 text-lg text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <fieldset className="mt-5">
            <legend className="font-semibold text-ink">Was machen Sie?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {BRANCHEN.map((b) => {
                const aktiv = b === branche;
                return (
                  <button
                    key={b}
                    type="button"
                    aria-pressed={aktiv}
                    onClick={() => setBranche(b)}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-[transform,background-color,color] duration-150 hover:scale-[1.04] active:scale-95 motion-reduce:transform-none ${
                      aktiv
                        ? "border-brand bg-brand text-white"
                        : "border-line bg-surface text-ink hover:border-brand hover:text-brand"
                    }`}
                  >
                    <span aria-hidden>{BRANCHE_INFO[b].symbol}</span>
                    {BRANCHE_INFO[b].label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <p className="mt-5 text-sm text-muted" aria-live="polite">
            {name ? (
              <>
                So könnte <strong className="text-ink">{name}</strong> am Handy
                aussehen. Ihre echte Demo bauen wir mit Ihren Fotos und Texten.
              </>
            ) : (
              "Tippen Sie Ihren Namen ein – rechts sehen Sie sofort, wie Ihre Seite am Handy aussehen kann."
            )}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href={demoLink("business", branche, name, "Business")}
              className={buttonClass("primary", "sm:px-7")}
            >
              Diese Seite gratis als Demo
            </Link>
            <Link
              href={vorschauLink("business", branche, name)}
              target="_blank"
              className={buttonClass("secondary", "sm:px-7")}
            >
              Groß ansehen
            </Link>
          </div>
        </div>
      </div>
      <HandyRahmen
        src={vorschauLink("business", branche, name)}
        titel={`Vorschau: Website für ${name || "Ihren Betrieb"}`}
        breite={300}
      />
    </div>
  );
}
