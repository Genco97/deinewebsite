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
    default: "Ursprung – Websites für Betriebe aus Wien",
    template: "%s | Ursprung",
  },
  description:
    "Eine Website für Ihren Betrieb. Erst ansehen, dann zahlen. Gratis-Demo, Fixpreis ab 500 €, persönlich aus Wien.",
  openGraph: {
    type: "website",
    locale: "de_AT",
    siteName: "Ursprung",
    title: "Ursprung – Websites für Betriebe aus Wien",
    description: "Eine Website für Ihren Betrieb. Erst ansehen, dann zahlen. Gratis-Demo, Fixpreis, persönlich aus Wien.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de-AT" className={`${manrope.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
