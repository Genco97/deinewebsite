"use client";

import { DesktopRahmen, HandyRahmen, useHandyBreite } from "./Geraete";
import { vorschauLink } from "./VorschauGenerator";

/** Hero-Bild: am Handy ein Handy, am Computer ein Browserfenster mit Handy davor. Beide zeigen dieselbe Beispielseite. */
export function HeroVorschau() {
  const handy = useHandyBreite();
  const src = vorschauLink("business", "friseur", "");
  return (
    <div>
      {/* Computer: Fenster und Handy überlappen */}
      <div className="relative mx-auto hidden h-[470px] w-full max-w-[560px] lg:block">
        <div className="absolute left-0 top-10 w-[440px]">
          <DesktopRahmen src={src} titel="Beispiel-Website am Computer" adresse="salon-mila.at" hoehe={290} />
        </div>
        <div className="absolute right-0 top-0">
          <HandyRahmen src={src} titel="Beispiel-Website am Handy" breite={200} klickbar={false} />
        </div>
      </div>
      {/* Handy und Tablet: nur das Handy */}
      <div className="lg:hidden">
        <HandyRahmen src={src} titel="Beispiel-Website am Handy" breite={handy ? 220 : 260} klickbar={false} />
      </div>
      <p className="mt-3 text-center text-sm text-muted">So kann Ihre Seite aussehen – gebaut aus Ihren Infos und Fotos.</p>
    </div>
  );
}
