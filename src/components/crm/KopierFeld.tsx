"use client";

import { useState } from "react";
import { buttonClass, inputClass } from "@/components/ui";

export function KopierFeld({ wert, label, id = "kopierfeld", schmal = false }: { wert: string; label: string; id?: string; schmal?: boolean }) {
  const [kopiert, setKopiert] = useState(false);

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(wert);
    } catch {
      const el = document.getElementById(id) as HTMLInputElement | null;
      el?.select();
      document.execCommand("copy");
    }
    setKopiert(true);
    setTimeout(() => setKopiert(false), 2000);
  }

  return (
    <div className={`flex flex-col gap-2 ${schmal ? "" : "sm:flex-row"}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        readOnly
        value={wert}
        onFocus={(e) => e.currentTarget.select()}
        className={`${inputClass} font-mono text-sm`}
      />
      <button type="button" onClick={kopieren} className={buttonClass("primary", "shrink-0")} aria-live="polite">
        {kopiert ? "Kopiert" : "Kopieren"}
      </button>
    </div>
  );
}
