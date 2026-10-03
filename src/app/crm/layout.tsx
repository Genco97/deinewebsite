import type { Metadata } from "next";
import { Seitenleiste } from "@/components/crm/Seitenleiste";
import { anzeigename, holeProfil } from "@/lib/crm";

export const metadata: Metadata = {
  title: { default: "CRM", template: "%s | Ursprung CRM" },
  robots: { index: false },
};

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const profil = await holeProfil();
  return (
    <div className="flex min-h-full flex-1 flex-col md:pl-60">
      <Seitenleiste name={anzeigename(profil)} admin={profil.rolle === "admin"} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
