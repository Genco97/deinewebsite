import type { Metadata } from "next";
import { BeispielLeiste } from "@/components/beispiele/BeispielLeiste";

export const metadata: Metadata = {
  // Erfundener Betrieb – nicht in Suchmaschinen
  robots: { index: false, follow: false },
};

export default function BeispielLayout({ children }: LayoutProps<"/beispiele">) {
  return (
    <>
      <BeispielLeiste />
      {children}
    </>
  );
}
