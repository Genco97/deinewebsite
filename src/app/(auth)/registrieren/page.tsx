import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonClass } from "@/components/ui";
import { RegistrierenFormular } from "./RegistrierenFormular";

export const metadata: Metadata = { title: "Registrieren", robots: { index: false } };

export default async function RegistrierenSeite({ searchParams }: PageProps<"/registrieren">) {
  const { code: roh } = await searchParams;
  const code = (typeof roh === "string" ? roh : "").trim().toLowerCase().slice(0, 50);

  let gueltig = false;
  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("einladungscode_gueltig", { code });
    gueltig = data === true;
  }

  if (!gueltig) {
    return (
      <>
        <h1 className="font-serif text-2xl font-semibold text-ink">Registrierung nur mit Einladung</h1>
        <p className="mt-3 text-muted">
          {code
            ? "Dieser Einladungslink ist ungültig. Bitte frag die Person, die dich eingeladen hat, nach einem neuen Link."
            : "Um ein Konto anzulegen, brauchst du einen Einladungslink von deinem Team."}
        </p>
        <Link href="/login" className={buttonClass("secondary", "mt-6 w-full")}>
          Zum Login
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="font-serif text-2xl font-semibold text-ink">Willkommen im Team</h1>
      <p className="mt-1 text-sm text-muted">Leg dein Konto an. Danach kannst du direkt loslegen.</p>
      <div className="mt-6">
        <RegistrierenFormular code={code} />
      </div>
    </>
  );
}
