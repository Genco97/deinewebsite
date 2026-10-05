import type { Metadata } from "next";
import Link from "next/link";
import { KarteFormular } from "@/components/public/KarteFormular";
import { Karte, buttonClass, inputClass } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Rückruf vereinbaren",
  robots: { index: false },
};

export default async function KarteSeite({ params }: PageProps<"/k/[code]">) {
  const { code: roh } = await params;
  const code = decodeURIComponent(roh).replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8);

  const supabase = await createClient();
  const { data: firma } = code.length === 8 ? await supabase.rpc("karte_info", { p_code: code }) : { data: null };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">Ihre Rückmeldung</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {firma ? `Eine Website für ${firma}?` : "Eine Website für Ihren Betrieb?"}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        Wir rufen Sie kurz an und zeigen Ihnen in fünf Minuten, wie Ihre Website aussehen könnte. Unverbindlich, ohne
        Kosten für das Gespräch.
      </p>

      {firma ? (
        <Karte className="mt-8 p-5 sm:p-6">
          <KarteFormular code={code} />
        </Karte>
      ) : (
        <Karte className="mt-8 space-y-4 p-5 sm:p-6">
          <p className="text-ink">
            Diesen Karten-Code finden wir leider nicht. Bitte prüfen Sie den Code auf Ihrer Karte – oder fordern Sie
            einfach einen Rückruf an.
          </p>
          <form action="/k" method="get" className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="code" className="sr-only">
              Karten-Code
            </label>
            <input
              id="code"
              name="code"
              defaultValue={code}
              placeholder="Code von der Karte"
              autoCapitalize="characters"
              className={`${inputClass} uppercase tracking-widest sm:max-w-xs`}
            />
            <button className={buttonClass("primary")}>
              Weiter
            </button>
          </form>
          <Link href="/#rueckruf" className="inline-block text-brand underline">
            Rückruf ohne Code anfordern
          </Link>
        </Karte>
      )}
    </div>
  );
}
