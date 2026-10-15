/** Held-Foto der Pro-Beispielseite: ruhiges Bild, ohne Wellen oder Mausbewegung. */
export function ProWasserBild({ bild }: { bild: string }) {
  return <div aria-hidden className="absolute inset-0" style={{ background: `center / cover url(${bild})` }} />;
}
