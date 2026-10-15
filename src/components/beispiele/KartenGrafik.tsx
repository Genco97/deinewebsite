/** Kleine Karten-Grafik mit Stecknadel – ein Klick öffnet die Route in Google Maps. Farben über currentColor/akzent. */
export function KartenGrafik({ link, adresse, akzent, className = "" }: { link: string; adresse: string; akzent: string; className?: string }) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`Route zu ${adresse} in Google Maps öffnen`} className={`group relative block overflow-hidden rounded-2xl ${className}`}>
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
        <rect width="400" height="240" fill="currentColor" opacity=".06" />
        <rect x="250" y="20" width="110" height="70" rx="8" fill="#86efac" opacity=".35" />
        <path d="M-10 160 Q120 120 200 150 T420 120" stroke="#93c5fd" strokeWidth="18" fill="none" opacity=".5" />
        <g stroke="currentColor" strokeOpacity=".22" fill="none">
          <path d="M0 60 H400 M0 205 H400 M70 0 V240 M170 0 V240 M300 0 V240" strokeWidth="12" />
          <path d="M0 110 L400 70 M120 240 L230 0" strokeWidth="6" />
        </g>
        <g transform="translate(200 112)">
          <circle r="34" fill={akzent} opacity=".18" className="origin-center animate-ping" />
          <path d="M0 22 C-14 4 -20 -4 -20 -14 A20 20 0 0 1 20 -14 C20 -4 14 4 0 22Z" fill={akzent} />
          <circle cy="-14" r="7" fill="#fff" />
        </g>
      </svg>
      <span className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 rounded-xl bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#111] shadow backdrop-blur">
        <span className="truncate">{adresse}</span>
        <span className="shrink-0" style={{ color: akzent }}>Route →</span>
      </span>
    </a>
  );
}
