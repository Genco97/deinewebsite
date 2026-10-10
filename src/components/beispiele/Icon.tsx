// Feine Linien-Symbole für die Beispiel-Websites (statt Emojis)
const PFADE = {
  tel: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  pin: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5",
  uhr: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  stern: "m12 3 2.7 5.6 6.1.8-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.8z",
  pfeil: "M5 12h14M13 6l6 6-6 6",
  kal: "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 10h18M8 3v4M16 3v4",
  haken: "m5 12 4 4 10-10",
  mail: "M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 7l9 6 9-6",
  geschenk: "M4 9h16v12H4zM3 13h18M12 9v12M12 9S10 4 7.5 5 9 9 12 9zm0 0s2-5 4.5-4S15 9 12 9z",
  rueckruf: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2M15 3h6v6M21 3l-6 6",
} as const;

export type IconName = keyof typeof PFADE;

export function Icon({ name, className = "h-5 w-5", gefuellt = false }: { name: IconName; className?: string; gefuellt?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill={gefuellt ? "currentColor" : "none"}
      stroke={gefuellt ? "none" : "currentColor"}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PFADE[name]} />
    </svg>
  );
}

/** Fünf gefüllte Sterne */
export function Sterne({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span aria-label="5 von 5 Sternen" className="inline-flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon key={i} name="stern" gefuellt className={className} />
      ))}
    </span>
  );
}
