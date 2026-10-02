import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Sichtbar – Websites für Betriebe aus Wien",
    template: "%s | Sichtbar",
  },
  description:
    "Eine Website für Ihren Betrieb. Erst ansehen, dann zahlen. Fixpreis, persönlich aus Wien.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de-AT" className={`${manrope.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
