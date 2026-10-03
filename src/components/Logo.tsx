import Link from "next/link";

/**
 * Bildmarke „Der Sprung“: Ein Punkt – der Ursprung – springt in einem Bogen nach oben.
 * Mehrere Logos auf einer Seite teilen dieselbe Verlaufs-ID; die Definition ist identisch.
 */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={`shrink-0 ${className}`}>
      <defs>
        <linearGradient id="ursprung-verlauf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3D7FD0" />
          <stop offset="1" stopColor="#173F70" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#ursprung-verlauf)" />
      <path
        d="M8.5 23.5C10 14 16 9.5 23.5 9"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="0.1 4.2"
        opacity=".7"
      />
      <circle cx="8.5" cy="23.5" r="3" fill="#fff" />
      <circle cx="23.5" cy="9" r="2.2" fill="#BFD9F7" />
    </svg>
  );
}

export function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center gap-2.5 text-lg font-extrabold tracking-[-0.04em] ${
        light ? "text-white" : "text-ink"
      }`}
    >
      <LogoMark />
      Ursprung
    </Link>
  );
}
