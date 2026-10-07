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
import { HandyRahmen, useHandyBreite } from "./Geraete";

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
  const handy = useHandyBreite();

  // Erst nach einer kurzen Tipp-Pause neu laden, nicht bei jedem Buchstaben
  useEffect(() => {
    const t = setTimeout(() => setName(bereinigterName(eingabe)), 600);
    return () => clearTimeout(t);
  }, [eingabe]);

  return (
    <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        {children}
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:mt-8 sm:p-6">
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
          <fieldset className="mt-5 min-w-0">
            <legend className="font-semibold text-ink">Was machen Sie?</legend>
            {/* Am Handy eine Zeile zum Wischen, ab Tablet umbrechend */}
            <div className="relative -mx-5 mt-2 sm:mx-0">
              <div className="flex snap-x gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
                {BRANCHEN.map((b) => {
                  const aktiv = b === branche;
                  return (
                    <button
                      key={b}
                      type="button"
                      aria-pressed={aktiv}
                      onClick={() => setBranche(b)}
                      className={`inline-flex min-h-11 shrink-0 snap-start scroll-ml-5 items-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-[transform,background-color,color] duration-150 hover:scale-[1.04] active:scale-95 motion-reduce:transform-none ${
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
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-surface sm:hidden"
              />
            </div>
          </fieldset>
          <p className="mt-5 text-sm text-muted" aria-live="polite">
            {name ? (
              <>
                So könnte <strong className="text-ink">{name}</strong> am Handy
                aussehen. Ihre echte Demo bauen wir mit Ihren Fotos und Texten.
              </>
            ) : (
              "Tippen Sie Ihren Namen ein – die Vorschau zeigt sofort, wie Ihre Seite am Handy aussehen kann."
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
      <div>
        <p className="mb-3 text-center text-sm font-medium text-muted lg:hidden">
          Live-Vorschau
        </p>
        <HandyRahmen
          src={vorschauLink("business", branche, name)}
          titel={`Vorschau: Website für ${name || "Ihren Betrieb"}`}
          breite={handy ? 230 : 300}
        />
      </div>
    </div>
  );
}
