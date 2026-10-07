"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClass } from "@/components/ui";
import { BRANCHEN, BRANCHE_INFO, THEMEN, THEMA_INFO, betriebFuer, type BrancheId, type Thema } from "@/lib/beispiele";
import { PAKET_NAMEN } from "@/lib/pakete";
import { DesktopRahmen, HandyRahmen, useHandyBreite } from "./Geraete";
import { demoLink, vorschauLink } from "./VorschauGenerator";

/** C3: Branche und Design frei kombinieren – Computer und Handy nebeneinander */
export function BeispielUmschalter() {
  const [thema, setThema] = useState<Thema>("business");
  const [branche, setBranche] = useState<BrancheId>("friseur");

  function pfeil(e: React.KeyboardEvent, i: number) {
    const n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!n) return;
    e.preventDefault();
    const t = THEMEN[(i + n + THEMEN.length) % THEMEN.length];
    setThema(t);
    document.getElementById(`thema-${t}`)?.focus();
  }

  const handy = useHandyBreite();
  const info = THEMA_INFO[thema];
  const betrieb = betriebFuer(branche);
  const src = vorschauLink(thema, branche, "");

  return (
    <div>
      <div className="grid gap-5">
        <fieldset className="min-w-0">
          <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand">1 · Ihre Branche</legend>
          {/* Am Handy eine Zeile zum Wischen, ab Tablet umbrechend */}
          <div className="relative -mx-4 sm:mx-0">
            <div className="flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
              {BRANCHEN.map((b) => {
                const aktiv = b === branche;
                return (
                  <button
                    key={b}
                    type="button"
                    aria-pressed={aktiv}
                    onClick={() => setBranche(b)}
                    className={`inline-flex min-h-11 shrink-0 snap-start scroll-ml-4 items-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-[transform,background-color,color] duration-150 hover:scale-[1.04] active:scale-95 motion-reduce:transform-none ${
                      aktiv ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:border-brand hover:text-brand"
                    }`}
                  >
                    <span aria-hidden>{BRANCHE_INFO[b].symbol}</span>
                    {BRANCHE_INFO[b].label}
                  </button>
                );
              })}
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-surface sm:hidden" />
          </div>
        </fieldset>

        <div>
          <p id="design-titel" className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand">
            2 · Ihr Design
          </p>
          <div role="tablist" aria-labelledby="design-titel" className="grid grid-cols-4 gap-1.5 sm:gap-2">
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
                  onClick={() => setThema(t)}
                  onKeyDown={(e) => pfeil(e, i)}
                  className={`min-h-11 rounded-xl border px-1 py-2 text-center text-sm transition sm:px-4 sm:py-2.5 sm:text-left sm:text-base-[transform,background-color,border-color] duration-150 hover:scale-[1.03] active:scale-95 motion-reduce:transform-none ${
                    aktiv ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:border-brand"
                  }`}
                >
                  <span className="block font-semibold">{THEMA_INFO[t].label}</span>
                  <span className={`hidden text-sm sm:block ${aktiv ? "text-white/80" : "text-muted"}`}>{THEMA_INFO[t].kurz}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div id="thema-vorschau" role="tabpanel" aria-labelledby={`thema-${thema}`} className="mt-6 sm:mt-8">
        <div className="flex items-end gap-6">
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="mb-2 text-sm font-medium text-muted">Am Computer</p>
            <DesktopRahmen
              src={src}
              titel={`${betrieb.name} im Design ${info.label} am Computer`}
              adresse={`${betrieb.name.toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-")}.at`}
              hoehe={540}
            />
          </div>
          <div className="mx-auto lg:mx-0">
            <p className="mb-2 text-center text-sm font-medium text-muted lg:text-left">Am Handy</p>
            <HandyRahmen src={src} titel={`${betrieb.name} im Design ${info.label} am Handy`} breite={handy ? 240 : 280} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm text-muted sm:text-base">
            <strong className="text-ink">
              {BRANCHE_INFO[branche].label} · {info.paket ? `Paket ${PAKET_NAMEN[info.paket]}` : "Unser Stil"}:
            </strong>{" "}
            {info.text}
          </p>
          <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
            <Link href={src} className={buttonClass("secondary")}>
              Ganz ansehen
            </Link>
            <Link href={demoLink(info.paket ?? "business", branche, "", info.label)} className={buttonClass("primary")}>
              {info.paket === "premium" ? (
                "Pro anfragen"
              ) : (
                <>
                  <span className="sm:hidden">Gratis-Demo</span>
                  <span className="hidden sm:inline">So eine Demo gratis</span>
                </>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
