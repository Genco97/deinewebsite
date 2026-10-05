"use client";

import { buttonClass } from "@/components/ui";

export function DruckenButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass("primary")}>
      Drucken
    </button>
  );
}
