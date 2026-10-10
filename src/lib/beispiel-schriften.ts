import { DM_Sans, Fraunces, Oswald } from "next/font/google";
import type { Stil } from "@/lib/beispiele";

// Schriften der Beispiel-Websites (Basic und Business)
export const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-fraunces" });
export const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-dmsans" });
export const oswald = Oswald({ subsets: ["latin", "latin-ext"], variable: "--font-oswald" });

export const schriftVariablen = `${fraunces.variable} ${dmSans.variable} ${oswald.variable}`;
export const GRUNDSCHRIFT = "var(--font-dmsans), ui-sans-serif, system-ui, sans-serif";

/** Titelschrift je Branche */
export const TITELSCHRIFT: Record<Stil["schrift"], string> = {
  serif: "var(--font-fraunces), Georgia, serif",
  sans: "var(--font-dmsans), ui-sans-serif, system-ui, sans-serif",
  display: "var(--font-oswald), Impact, sans-serif",
};
