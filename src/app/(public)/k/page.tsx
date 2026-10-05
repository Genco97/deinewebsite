import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Karte, buttonClass, inputClass } from "@/components/ui";

export const metadata: Metadata = {
  title: "Karten-Code eingeben",
  robots: { index: false },
};

/** Für alle, die den QR-Code nicht scannen, sondern die Adresse von der Karte abtippen. */
export default async function KarteCodeSeite({ searchParams }: PageProps<"/k">) {
  const sp = await searchParams;
  const roh = typeof sp.code === "string" ? sp.code : "";
  const code = roh.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8);
  if (code) redirect(`/k/${code}`);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Karten-Code eingeben</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">Den Code finden Sie auf Ihrer Postkarte neben dem QR-Code.</p>
      <Karte className="mt-8 space-y-4 p-5 sm:p-6">
        <form method="get" className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="code" className="sr-only">
            Karten-Code
          </label>
          <input
            id="code"
            name="code"
            placeholder="z. B. AB2C-D3EF"
            autoCapitalize="characters"
            required
            className={`${inputClass} uppercase tracking-widest sm:max-w-xs`}
          />
          <button className={buttonClass("primary")}>Weiter</button>
        </form>
        <Link href="/#rueckruf" className="inline-block text-brand underline">
          Rückruf ohne Code anfordern
        </Link>
      </Karte>
    </div>
  );
}
