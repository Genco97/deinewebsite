import Link from "next/link";

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <span aria-hidden className={`inline-block rounded-md bg-brand ${className}`} />
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
      Sichtbar
    </Link>
  );
}
