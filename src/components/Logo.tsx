import Link from "next/link";

/** Bildmarke: blaues abgerundetes Quadrat mit „U“ – der Punkt steht für den Ursprung. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={`shrink-0 ${className}`}>
      <rect width="32" height="32" rx="8" fill="#1D4E89" />
      <path d="M10 8.5v8a6 6 0 0 0 12 0v-8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="16.5" r="2.3" fill="#fff" />
    </svg>
  );
}

export function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center gap-2.5 text-lg font-bold tracking-tight ${
        light ? "text-white" : "text-ink"
      }`}
    >
      <LogoMark />
      Ursprung
    </Link>
  );
}
