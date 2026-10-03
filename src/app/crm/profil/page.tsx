import type { Metadata } from "next";
import { Kopf } from "@/components/crm/Kopf";
import { KopierFeld } from "@/components/crm/KopierFeld";
import { Hinweis, Karte } from "@/components/ui";
import { holeProfil } from "@/lib/crm";
import { NameFormular, PasswortFormular } from "./ProfilFormulare";

export const metadata: Metadata = { title: "Mein Profil" };

export default async function Profil({ searchParams }: PageProps<"/crm/profil">) {
  const profil = await holeProfil();
  const { passwort } = await searchParams;
  const gruender = profil.rolle === "admin";
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const link = `${site}/registrieren?code=${profil.einladungscode}`;

  return (
    <>
      <Kopf titel="Mein Profil" text={profil.email} />

      {passwort === "neu" ? (
        <div className="mb-6">
          <Hinweis>Du bist eingeloggt. Setz jetzt unten dein neues Passwort.</Hinweis>
        </div>
      ) : null}
      {!profil.name.trim() ? (
        <div className="mb-6">
          <Hinweis>Bitte trag deinen Namen ein, damit dein Team weiß, wer du bist.</Hinweis>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Karte className="p-5">
          <h2 className="mb-4 font-bold text-ink">Name</h2>
          <NameFormular name={profil.name} />
        </Karte>

        <Karte className="p-5">
          <h2 className="mb-1 font-bold text-ink">Rolle</h2>
          <p className="text-muted">
            {gruender
              ? "Gründer – du hast volle Admin-Rechte. Der Gewinn wird gleich unter allen Gründern aufgeteilt."
              : "Partner – du bekommst Provision auf deine Verkäufe und die deines Teams."}
          </p>
          <h2 className="mb-1 mt-5 font-bold text-ink">Dein Einladungslink</h2>
          <p className="mb-3 text-sm text-muted">
            {gruender
              ? "Wer sich über diesen Link registriert, wird Partner in deinem Team. Mitgründer machst du danach unter Admin → Team zum Gründer."
              : "Wer sich über diesen Link registriert, kommt in dein Team."}
          </p>
          <KopierFeld wert={link} label="Einladungslink" />
        </Karte>

        <Karte className="p-5 lg:col-span-2">
          <h2 className="mb-4 font-bold text-ink">Passwort ändern</h2>
          <div className="max-w-md">
            <PasswortFormular />
          </div>
        </Karte>
      </div>
    </>
  );
}
