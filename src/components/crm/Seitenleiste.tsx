"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { abmelden } from "@/app/(auth)/actions";

/* Linien-Icons (24er Raster, Strichstärke 1.8) – bewusst ohne Icon-Bibliothek */
const PFADE = {
  dashboard: "M4 4h6v7H4zM14 4h6v4h-6zM14 12h6v8h-6zM4 15h6v5H4z",
  heute: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  leads: "M4 6h16M7 12h10M10 18h4",
  besuche: "M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  karte: "M12 21s-6-5.3-6-11a6 6 0 1 1 12 0c0 5.7-6 11-6 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  postkarten: "M4 6h16v12H4zM4 7l8 6 8-6",
  projekte: "M4 7h16v12H4zM9 7V5h6v2M4 12h16",
  partner: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21 19v-1a4 4 0 0 0-3-3.9M15.5 4.1a3 3 0 0 1 0 5.8",
  admin: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3zM9 12l2 2 4-4",
  profil: "M20 21v-1a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v1M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  abmelden: "M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11",
  menue: "M4 7h16M4 12h16M4 17h16",
  anrufen: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  team: "M6 20V10M12 20V4M18 20v-7",
  schliessen: "M6 6l12 12M18 6L6 18",
} as const;

function Icon({ name, className = "h-5 w-5" }: { name: keyof typeof PFADE; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      <path d={PFADE[name]} />
    </svg>
  );
}

type Eintrag = { href: string; label: string; icon: keyof typeof PFADE; aktiv: boolean; zahl?: number };

function initialen(name: string) {
  const teile = name.trim().split(/\s+/).filter(Boolean);
  const a = teile[0]?.[0] ?? "?";
  const b = teile.length > 1 ? teile[teile.length - 1][0] : "";
  return (a + b).toUpperCase();
}

export function Seitenleiste({ name, admin, faellig = 0 }: { name: string; admin: boolean; faellig?: number }) {
  const pfad = usePathname();
  const [offen, setOffen] = useState(false);
  const schliessenRef = useRef<HTMLButtonElement>(null);
  const menueRef = useRef<HTMLButtonElement>(null);

  const gruppen: { titel: string; eintraege: Eintrag[] }[] = [
    {
      titel: "Übersicht",
      eintraege: [
        { href: "/crm/zahlen", label: "Dashboard", icon: "dashboard", aktiv: pfad.startsWith("/crm/zahlen") },
        { href: "/crm", label: "Heute", icon: "heute", aktiv: pfad === "/crm", zahl: faellig },
        { href: "/crm/team", label: "Team", icon: "team", aktiv: pfad.startsWith("/crm/team") },
      ],
    },
    {
      titel: "Vertrieb",
      eintraege: [
        { href: "/crm/anrufen", label: "Anruf-Modus", icon: "anrufen", aktiv: pfad.startsWith("/crm/anrufen") },
        { href: "/crm/leads", label: "Leads", icon: "leads", aktiv: pfad.startsWith("/crm/leads") },
        { href: "/crm/besuche", label: "Besuche", icon: "besuche", aktiv: pfad.startsWith("/crm/besuche") },
        { href: "/crm/karte", label: "Karte", icon: "karte", aktiv: pfad.startsWith("/crm/karte") },
        { href: "/crm/postkarten", label: "Postkarten", icon: "postkarten", aktiv: pfad.startsWith("/crm/postkarten") },
      ],
    },
    {
      titel: "Kunden",
      eintraege: [{ href: "/crm/projekte", label: "Projekte", icon: "projekte", aktiv: pfad.startsWith("/crm/projekte") }],
    },
    {
      titel: "Verwaltung",
      eintraege: [
        { href: "/crm/partner", label: "Partner & Provision", icon: "partner", aktiv: pfad.startsWith("/crm/partner") },
        ...(admin ? [{ href: "/crm/admin", label: "Admin", icon: "admin" as const, aktiv: pfad.startsWith("/crm/admin") }] : []),
        { href: "/crm/profil", label: "Mein Profil", icon: "profil", aktiv: pfad.startsWith("/crm/profil") },
      ],
    },
  ];

  // Offenes Handy-Menü: Escape schließt, Seite dahinter scrollt nicht mit
  useEffect(() => {
    if (!offen) return;
    schliessenRef.current?.focus();
    const zuvor = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const taste = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOffen(false);
    };
    window.addEventListener("keydown", taste);
    const menueKnopf = menueRef.current;
    return () => {
      document.body.style.overflow = zuvor;
      window.removeEventListener("keydown", taste);
      menueKnopf?.focus();
    };
  }, [offen]);

  const inhalt = (id: string) => (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-5">
        <Link href="/crm" onClick={() => setOffen(false)} className="inline-flex min-h-11 items-center gap-2.5 text-lg font-extrabold tracking-[-0.04em]">
          <LogoMark className="h-7 w-7" verlaufId={`verlauf-${id}`} />
          Ursprung
        </Link>
        {id === "handy" && (
          <button
            ref={schliessenRef}
            type="button"
            onClick={() => setOffen(false)}
            aria-label="Menü schließen"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-brand-light hover:text-brand"
          >
            <Icon name="schliessen" className="h-6 w-6" />
          </button>
        )}
      </div>

      <nav aria-label="CRM-Navigation" className="flex-1 overflow-y-auto px-3 pb-4">
        {gruppen.map((g) => (
          <div key={g.titel} className="mt-4 first:mt-2">
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted/80">{g.titel}</p>
            <ul className="space-y-1">
              {g.eintraege.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOffen(false)}
                    aria-current={l.aktiv ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium origin-left transition-[transform,background-color,color,box-shadow] duration-150 ease-out hover:scale-[1.05] hover:shadow-md active:scale-95 motion-reduce:transform-none motion-reduce:transition-none ${
                      l.aktiv
                        ? "bg-brand text-white shadow-sm"
                        : "text-muted hover:bg-brand-light hover:text-brand"
                    }`}
                  >
                    <Icon name={l.icon} />
                    <span className="truncate">{l.label}</span>
                    {l.zahl ? (
                      <span
                        className="ml-auto rounded-full bg-danger px-1.5 py-0.5 text-[11px] font-bold leading-none text-white"
                        aria-label={`${l.zahl} fällig`}
                      >
                        {l.zahl > 99 ? "99+" : l.zahl}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <form action={abmelden} className="mt-4">
          <button className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-danger origin-left transition-[transform,background-color,color,box-shadow] duration-150 ease-out hover:scale-[1.05] hover:shadow-md active:scale-95 motion-reduce:transform-none motion-reduce:transition-none hover:bg-danger-light">
            <Icon name="abmelden" />
            Abmelden
          </button>
        </form>
      </nav>

      <div className="shrink-0 p-3">
        <Link
          href="/crm/profil"
          onClick={() => setOffen(false)}
          className="flex items-center gap-3 rounded-xl border border-line bg-bg p-3 hover:bg-brand-light"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#3d7fd0] to-brand text-sm font-bold text-white">
            {initialen(name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink">{name}</span>
            <span className="block text-xs text-muted">{admin ? "Gründer · Admin" : "Partner"}</span>
          </span>
        </Link>
      </div>
    </>
  );

  return (
    <div className="print:hidden">
      {/* Handy & Tablet hochkant: Kopfzeile mit Menü-Knopf */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-surface px-2 text-ink md:hidden">
        <button
          ref={menueRef}
          type="button"
          onClick={() => setOffen(true)}
          aria-label="Menü öffnen"
          aria-expanded={offen}
          aria-controls="crm-menue"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg text-brand transition-transform hover:bg-brand-light active:scale-90"
        >
          <Icon name="menue" className="h-6 w-6" />
          {faellig > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-surface" aria-hidden />}
        </button>
        <Link href="/crm" className="inline-flex min-h-11 items-center gap-2 font-extrabold tracking-[-0.04em]">
          <LogoMark className="h-6 w-6" verlaufId="verlauf-kopf" />
          Ursprung
        </Link>
        {faellig > 0 && (
          <Link
            href="/crm"
            className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-brand hover:bg-brand-light"
          >
            Heute
            <span className="rounded-full bg-danger px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
              {faellig > 99 ? "99+" : faellig}
            </span>
          </Link>
        )}
      </header>

      {/* Handy: ausklappbares Menü von links */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${offen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOffen(false)}
        aria-hidden
      />
      <aside
        id="crm-menue"
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
        inert={!offen}
        className={`fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-xs flex-col border-r border-line bg-surface text-ink transition-transform duration-200 md:hidden ${
          offen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {inhalt("handy")}
      </aside>

      {/* Ab Tablet quer / Desktop: feste Seitenleiste */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface text-ink md:flex">{inhalt("desktop")}</aside>
    </div>
  );
}
