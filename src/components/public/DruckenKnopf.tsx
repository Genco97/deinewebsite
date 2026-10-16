"use client";

export function DruckenKnopf() {
  return (
    <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center rounded-lg bg-brand px-5 text-[15px] font-semibold text-white print:hidden">
      Drucken oder als PDF speichern
    </button>
  );
}
