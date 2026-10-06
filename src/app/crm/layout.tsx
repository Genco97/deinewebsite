import type { Metadata } from "next";
import { Seitenleiste } from "@/components/crm/Seitenleiste";
import { anzeigename, holeProfil } from "@/lib/crm";
import { ABGESCHLOSSEN } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { heuteWien, wienGrenzen } from "@/lib/zeit";

/** Zahl am Menüpunkt „Heute“: fällige Rückrufe, Besuche und (für Gründer) Projekte */
async function faelligZaehlen(id: string, admin: boolean) {
  const supabase = await createClient();
  const heute = heuteWien();
  const offen = `(${ABGESCHLOSSEN.join(",")})`;
  const zaehlen = { count: "exact", head: true } as const;
  const [rueckrufe, besuche, projekte] = await Promise.all([
    supabase
      .from("leads")
      .select("id", zaehlen)
      .eq("besitzer_id", id)
      .lt("naechster_rueckruf", wienGrenzen().tagEnde)
      .not("status", "in", offen),
    supabase.from("leads").select("id", zaehlen).eq("besitzer_id", id).lte("besuch_geplant", heute).not("status", "in", offen),
    admin
      ? supabase
          .from("deals")
          .select("id", zaehlen)
          .neq("status", "storniert")
          .neq("projekt_phase", "online")
          .lte("projekt_faellig", heute)
      : Promise.resolve({ count: 0 }),
  ]);
  return (rueckrufe.count ?? 0) + (besuche.count ?? 0) + (projekte.count ?? 0);
}

export const metadata: Metadata = {
  title: { default: "Ursprung", template: "%s | Ursprung" },
  robots: { index: false },
};

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const profil = await holeProfil();
  const faellig = await faelligZaehlen(profil.id, profil.rolle === "admin");
  return (
    <div className="flex min-h-full flex-1 flex-col md:pl-64 print:pl-0">
      <Seitenleiste name={anzeigename(profil)} admin={profil.rolle === "admin"} faellig={faellig} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8 print:max-w-none print:p-0">{children}</main>
    </div>
  );
}
