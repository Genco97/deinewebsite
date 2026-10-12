import type { Metadata } from "next";
import { Kopf } from "@/components/crm/Kopf";
import { LeadFinder } from "@/components/crm/LeadFinder";
import { aktivePersonen, nurAdmin } from "@/lib/crm";

export const metadata: Metadata = { title: "Lead Finder" };

export default async function LeadFinderSeite() {
  const profil = await nurAdmin();
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
