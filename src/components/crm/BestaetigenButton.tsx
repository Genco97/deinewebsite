"use client";

import { buttonClass } from "@/components/ui";

/** Submit-Button mit Rückfrage – für Schritte, die sich nicht rückgängig machen lassen */
export function BestaetigenButton({
  frage,
  children,
  variante = "primary",
  className = "",
}: {
  frage: string;
  children: React.ReactNode;
  variante?: "primary" | "secondary" | "danger";
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(frage)) e.preventDefault();
      }}
      className={buttonClass(variante, className)}
    >
      {children}
    </button>
  );
}
