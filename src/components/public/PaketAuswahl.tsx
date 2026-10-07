"use client";

import { Children, useState } from "react";

/** Am Handy ein Paket nach dem anderen über Reiter, ab lg alle drei nebeneinander */
export function PaketAuswahl({ namen, start, children }: { namen: string[]; start: number; children: React.ReactNode }) {
  const [aktiv, setAktiv] = useState(start);
  const karten = Children.toArray(children);
  return (
    <>
      <div role="tablist" aria-label="Paket wählen" className="mb-5 grid grid-cols-3 gap-1 rounded-full border border-line bg-surface p-1 lg:hidden">
        {namen.map((n, i) => (
          <button
            key={n}
            type="button"
            role="tab"
            aria-selected={i === aktiv}
            onClick={() => setAktiv(i)}
            className={`min-h-10 rounded-full text-sm font-semibold transition-colors ${i === aktiv ? "bg-brand text-white" : "text-ink hover:text-brand"}`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {karten.map((k, i) => (
          <div key={i} className={i === aktiv ? "flex [&>*]:flex-1" : "hidden lg:flex [&>*]:flex-1"}>
            {k}
          </div>
        ))}
      </div>
    </>
  );
}
