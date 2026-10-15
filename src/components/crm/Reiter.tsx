import Link from "next/link";

/** Reiter oben auf einer Seite – fasst zusammengehörige Seiten unter einem Menüpunkt zusammen. */
export function Reiter({ eintraege }: { eintraege: { href: string; text: string; an: boolean }[] }) {
  return (
    <nav aria-label="Ansicht" className="mb-5 inline-flex rounded-xl border border-line bg-surface p-1 text-sm font-semibold">
      {eintraege.map((e) => (
        <Link key={e.href} href={e.href} aria-current={e.an ? "page" : undefined} className={`rounded-lg px-4 py-2 ${e.an ? "bg-brand text-white" : "text-ink hover:bg-bg"}`}>
          {e.text}
        </Link>
      ))}
    </nav>
  );
}

export const UEBERSICHT = (an: "heute" | "zahlen") => [
  { href: "/crm", text: "Heute", an: an === "heute" },
  { href: "/crm/zahlen", text: "Zahlen", an: an === "zahlen" },
];

export const TEAM = (an: "team" | "provision") => [
  { href: "/crm/team", text: "Team", an: an === "team" },
  { href: "/crm/partner", text: "Provision & Einladen", an: an === "provision" },
];
