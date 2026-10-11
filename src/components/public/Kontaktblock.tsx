import { Karte, buttonClass } from "@/components/ui";
import { FIRMA } from "@/lib/firma";
import { oeffentlicheKontakte, nurZiffern, type Kontakt } from "@/lib/kontakte";

function Person({ k }: { k: Kontakt }) {
  const ziffern = k.telefon ? nurZiffern(k.telefon) : "";
  return (
    <Karte className="flex flex-col gap-3 p-5">
      <div>
        <p className="font-bold text-ink">{k.name}</p>
        <p className="text-sm text-muted">{k.rolle === "admin" ? `Gründer:in bei ${FIRMA.name}` : `Team ${FIRMA.name}`}</p>
      </div>
      {k.telefon ? (
        <>
          <a href={`tel:+${ziffern}`} className={buttonClass("primary", "w-full")}>
            Anrufen · {k.telefon}
          </a>
          <a
            href={`https://wa.me/${ziffern}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("secondary", "w-full")}
          >
            WhatsApp schreiben
          </a>
        </>
      ) : null}
      {k.email ? (
        <a href={`mailto:${k.email}`} className={buttonClass("secondary", "w-full")}>
          E-Mail schreiben
        </a>
      ) : null}
    </Karte>
  );
}

/** „Direkt erreichbar“: wer im CRM-Profil seine Daten freigegeben hat, steht hier mit Anruf-, WhatsApp- und E-Mail-Knopf. */
export async function Kontaktblock() {
  const kontakte = await oeffentlicheKontakte();
  if (kontakte.length === 0) return null;
  return (
    <div className="mb-8">
      <h3 className="font-serif text-2xl font-semibold text-ink">Direkt erreichbar</h3>
      <p className="mt-1 text-muted">Rufen Sie einfach an oder schreiben Sie uns – wir melden uns schnell.</p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {kontakte.map((k) => (
          <li key={`${k.name}-${k.telefon}-${k.email}`}>
            <Person k={k} />
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted">Oder wir rufen Sie zurück</p>
    </div>
  );
}
