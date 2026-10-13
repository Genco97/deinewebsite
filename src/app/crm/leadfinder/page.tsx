import type { Metadata } from "next";
import { Kopf } from "@/components/crm/Kopf";
import { LeadFinder } from "@/components/crm/LeadFinder";
import { aktivePersonen, nurLeadFinder } from "@/lib/crm";
import { pruefStand } from "@/lib/google-stand";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Lead Finder" };

// Der Server-Ersatzweg zur Suche kann bis zu 45 s brauchen
export const maxDuration = 60;

export default async function LeadFinderSeite() {
  const profil = await nurLeadFinder();
  const personen = await aktivePersonen();
  const stand = await pruefStand(await createClient());
  return (
    <>
      <Kopf
        titel="Lead Finder"
        text="Betriebe in Österreich, Deutschland und der Schweiz, bei denen in OpenStreetMap keine Website eingetragen ist."
      />
      <LeadFinder personen={personen} ichId={profil.id} stand={stand} />
    </>
  );
}
