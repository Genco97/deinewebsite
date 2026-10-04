import type { Metadata } from "next";
import { Kopf } from "@/components/crm/Kopf";
import { KopierFeld } from "@/components/crm/KopierFeld";
import { BestaetigenButton } from "@/components/crm/BestaetigenButton";
import { Hinweis, Karte, buttonClass } from "@/components/ui";
import { holeProfil } from "@/lib/crm";
import { createClient } from "@/lib/supabase/server";
import { kalenderLinkNeu } from "./actions";
import { NameFormular, PasswortFormular } from "./ProfilFormulare";

export const metadata: Metadata = { title: "Mein Profil" };

export default async function Profil({ searchParams }: PageProps<"/crm/profil">) {
  const profil = await holeProfil();
  const { passwort } = await searchParams;
  const gruender = profil.rolle === "admin";
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const link = `${site}/registrieren?code=${profil.einladungscode}`;
  const supabase = await createClient();
  const { data: abo } = await supabase.from("kalender_abos").select("token").eq("profil_id", profil.id).maybeSingle();
  const kalender = abo ? `${site}/kalender/${abo.token}.ics` : null;
  const webcal = kalender?.replace(/^https?:\/\//, "webcal://");

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
              : "Wer sich über diesen Link registriert, kommt in dein Team. Die Person bekommt 20 % auf ihre eigenen Verkäufe, du zusätzlich 5 % vom Verkaufsbetrag."}
          </p>
          <KopierFeld wert={link} label="Einladungslink" />
        </Karte>

        <Karte className="p-5 lg:col-span-2">
          <h2 className="mb-1 font-bold text-ink">Kalender-Abo</h2>
          <p className="mb-4 text-sm text-muted">
            Deine Rückrufe und geplanten Besuche erscheinen automatisch im Kalender auf deinem Handy – mit Erinnerung.
            Der Link ist privat: Wer ihn hat, sieht deine Termine. Nicht weitergeben.
          </p>
          {kalender && webcal ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <a href={webcal} className={buttonClass("primary")}>
                  iPhone / Mac: Kalender abonnieren
                </a>
                <a
                  href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass("secondary")}
                >
                  Google Kalender (Android)
                </a>
              </div>
              <KopierFeld wert={kalender} label="Kalender-Link" />
              <form action={kalenderLinkNeu}>
                <BestaetigenButton
                  frage="Neuen Link erzeugen? Der alte Link funktioniert dann nicht mehr – du musst den Kalender neu abonnieren."
                  variante="secondary"
                >
                  Neuen Link erzeugen
                </BestaetigenButton>
              </form>
              <p className="text-xs text-muted">Kalender-Apps holen Änderungen meist stündlich, Google teils seltener.</p>
            </div>
          ) : (
            <form action={kalenderLinkNeu}>
              <button className={buttonClass("primary")}>Kalender-Link erstellen</button>
            </form>
          )}
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
