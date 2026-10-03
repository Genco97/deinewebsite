import type { Metadata } from "next";
import Link from "next/link";
import { PasswortVergessenFormular } from "./PasswortVergessenFormular";

export const metadata: Metadata = { title: "Passwort vergessen", robots: { index: false } };

export default function PasswortVergessen() {
  return (
    <>
      <h1 className="font-serif text-2xl font-semibold text-ink">Passwort vergessen</h1>
      <p className="mt-1 text-sm text-muted">
        Gib deine E-Mail ein. Du bekommst einen Link, mit dem du ein neues Passwort setzen kannst.
      </p>
      <div className="mt-6">
        <PasswortVergessenFormular />
      </div>
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="inline-flex min-h-11 items-center text-brand hover:underline">
          Zurück zum Login
        </Link>
      </p>
    </>
  );
}
