import type { Metadata } from "next";
import Link from "next/link";
import { LoginFormular } from "./LoginFormular";

export const metadata: Metadata = { title: "Mitarbeiter-Login", robots: { index: false } };

export default async function LoginSeite({ searchParams }: PageProps<"/login">) {
  const { weiter, fehler } = await searchParams;
  return (
    <>
      <h1 className="font-serif text-2xl font-semibold text-ink">Mitarbeiter-Login</h1>
      <p className="mt-1 text-sm text-muted">Melde dich mit deiner E-Mail und deinem Passwort an.</p>
      {fehler === "inaktiv" ? (
        <p className="mt-4 rounded-lg bg-danger-light px-4 py-3 text-sm text-danger">
          Dein Konto ist deaktiviert. Bitte wende dich an einen Gründer.
        </p>
      ) : null}
      {fehler === "link" ? (
        <p className="mt-4 rounded-lg bg-danger-light px-4 py-3 text-sm text-danger">
          Der Bestätigungslink ist ungültig oder abgelaufen.
        </p>
      ) : null}
      <div className="mt-6">
        <LoginFormular weiter={typeof weiter === "string" ? weiter : "/crm"} />
      </div>
      <p className="mt-4 text-center text-sm">
        <Link href="/passwort-vergessen" className="inline-flex min-h-11 items-center text-brand hover:underline">
          Passwort vergessen?
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted">
        Noch kein Konto? Du brauchst einen Einladungslink von deinem Team.
      </p>
      <p className="mt-2 text-center text-sm">
        <Link href="/" className="inline-flex min-h-11 items-center text-brand hover:underline">
          Zur Startseite
        </Link>
      </p>
    </>
  );
}
