"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { abmelden } from "@/app/(auth)/actions";

export function Seitenleiste({ name, admin }: { name: string; admin: boolean }) {
  const pfad = usePathname();
  const links = [
    { href: "/crm", label: "Heute", aktiv: pfad === "/crm" },
    { href: "/crm/leads", label: "Leads", aktiv: pfad.startsWith("/crm/leads") },
    { href: "/crm/partner", label: "Partner & Provision", aktiv: pfad.startsWith("/crm/partner") },
    ...(admin ? [{ href: "/crm/admin", label: "Admin", aktiv: pfad.startsWith("/crm/admin") }] : []),
    { href: "/crm/profil", label: "Mein Profil", aktiv: pfad.startsWith("/crm/profil") },
  ];

  return (
    <aside className="bg-sidebar text-white md:fixed md:inset-y-0 md:left-0 md:flex md:w-60 md:flex-col">
      <div className="flex h-14 items-center justify-between gap-2 px-4 md:h-16">
        <Link href="/crm" className="inline-flex min-h-11 items-center gap-2.5 font-bold">
          <LogoMark className="h-6 w-6" />
          Ursprung
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/70">
            CRM
          </span>
        </Link>
        <form action={abmelden} className="md:hidden">
          <button className="inline-flex min-h-11 items-center px-2 text-sm text-white/70 hover:text-white">Abmelden</button>
        </form>
      </div>

      <nav aria-label="CRM-Navigation" className="md:flex-1">
        <ul className="flex flex-wrap gap-1 px-2 pb-2 md:flex-col md:flex-nowrap md:px-3 md:pb-0">
          {links.map((l) => (
            <li key={l.href} className="shrink-0">
              <Link
                href={l.href}
                aria-current={l.aktiv ? "page" : undefined}
                className={`flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 text-[15px] font-medium ${
                  l.aktiv ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="hidden border-t border-white/10 p-4 md:block">
        <Link href="/crm/profil" className="block truncate text-sm font-semibold hover:underline">
          {name}
        </Link>
        <p className="text-xs text-white/60">{admin ? "Gründer · Admin" : "Partner"}</p>
        <form action={abmelden} className="mt-2">
          <button className="inline-flex min-h-11 items-center text-sm text-white/70 hover:text-white">Abmelden</button>
        </form>
      </div>
    </aside>
  );
}
