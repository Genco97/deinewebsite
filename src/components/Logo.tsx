import Link from "next/link";

/**
 * Bildmarke: das geschwungene „U“ aus dem Logo. Eine Maske mit der Textfarbe, damit sie auf hellem
 * (dunkelblau) wie auf dunklem Grund (weiß) passt. Größe nur über die Höhe, z. B. „h-7“.
 * `verlaufId` bleibt aus Kompatibilität mit den Aufrufern, wird nicht mehr gebraucht.
 */
export function LogoMark({ className = "h-7", light = false }: { className?: string; verlaufId?: string; light?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 aspect-[308/618] ${light ? "bg-white" : "bg-[#0B1B3F]"} ${className}`}
      style={{
        WebkitMaskImage: "url(/logo-mark.png)",
        maskImage: "url(/logo-mark.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      }}
    />
  );
}

export function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link
      href={href}
      aria-label="Ursprung – zur Startseite"
      className={`inline-flex min-h-11 items-center gap-2 font-serif text-[15px] font-bold uppercase tracking-[0.03em] min-[400px]:text-lg sm:text-2xl sm:tracking-[0.04em] ${
        light ? "text-white" : "text-[#0B1B3F]"
      }`}
    >
      <LogoMark className="h-8 sm:h-10" light={light} />
      Ursprung
    </Link>
  );
}
