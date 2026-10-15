import { Bricolage_Grotesque, DM_Sans, Fraunces, Oswald } from "next/font/google";
import type { Stil } from "@/lib/beispiele";

// Schriften der Beispiel-Websites (Basic und Business)
export const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-fraunces" });
export const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-dmsans" });
export const oswald = Oswald({ subsets: ["latin", "latin-ext"], variable: "--font-oswald" });

export const bricolage = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-bricolage" });

export const schriftVariablen = `${fraunces.variable} ${dmSans.variable} ${oswald.variable} ${bricolage.variable}`;
/** Titelschrift des Business-Designs: für alle Branchen gleich, die Farben kommen aus dem Stil der Branche */
export const BUSINESS_TITEL = "var(--font-bricolage), var(--font-dmsans), ui-sans-serif, system-ui, sans-serif";
export const GRUNDSCHRIFT = "var(--font-dmsans), ui-sans-serif, system-ui, sans-serif";

/** Titelschrift je Branche */
export const TITELSCHRIFT: Record<Stil["schrift"], string> = {
  serif: "var(--font-fraunces), Georgia, serif",
  sans: "var(--font-dmsans), ui-sans-serif, system-ui, sans-serif",
  display: "var(--font-oswald), Impact, sans-serif",
};
