import type { Metadata } from "next";
import { Kopf } from "@/components/crm/Kopf";
import { LeadFinder } from "@/components/crm/LeadFinder";
import { aktivePersonen, nurLeadFinder } from "@/lib/crm";

export const metadata: Metadata = { title: "Lead Finder" };

// Der Server-Ersatzweg zur Suche kann bis zu 45 s brauchen
export const maxDuration = 60;

export default async function LeadFinderSeite() {
  const profil = await nurLeadFinder();
  const personen = await aktivePersonen();
  return (
    <>
      <Kopf
        titel="Lead Finder"
        text="Betriebe in Österreich, Deutschland und der Schweiz, bei denen in OpenStreetMap keine Website eingetragen ist."
      />
      <LeadFinder personen={personen} ichId={profil.id} />
    </>
  );
}
