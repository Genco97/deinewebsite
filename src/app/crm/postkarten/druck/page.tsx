import type { Metadata } from "next";
import Link from "next/link";
import { DruckenButton } from "@/components/crm/DruckenButton";
import { Kopf } from "@/components/crm/Kopf";
import { LogoMark } from "@/components/Logo";
import { Karte, buttonClass } from "@/components/ui";
import { holeProfil } from "@/lib/crm";
import { FIRMA } from "@/lib/firma";
import { codeLesbar, empfaengerZeilen, karteBasis, karteLink, qrSvg } from "@/lib/karte";
import { createClient } from "@/lib/supabase/server";
import { wienGrenzen } from "@/lib/zeit";

export const metadata: Metadata = { title: "Postkarten drucken" };

type Lead = {
  id: string;
  firma: string;
  ansprechpartner: string | null;
  adresse: string | null;
  bezirk: string | null;
  karten_code: string;
};

/** A6 quer: 148 × 105 mm. Beide Seiten werden nacheinander gedruckt (beidseitig, an der kurzen Kante wenden). */
const SEITE = "relative h-[105mm] w-[148mm] overflow-hidden bg-white text-[#16243A] break-after-page print:shadow-none";

function Vorderseite() {
  return (
    <div className={`${SEITE} flex flex-col justify-between p-[9mm] shadow-sm`}>
      <div className="flex items-center gap-2 text-[13pt] font-extrabold tracking-[-0.04em]">
        <LogoMark className="h-[8mm] w-[8mm]" verlaufId="ursprung-verlauf-karte" />
        {FIRMA.name}
      </div>
      <div>
        <p className="font-serif text-[21pt] font-semibold leading-[1.1] tracking-tight">
          Wer Sie sucht,
          <br />
          soll Sie finden.
        </p>
        <p className="mt-[3mm] max-w-[105mm] text-[9.5pt] leading-snug text-[#3b4658]">
          Ihre Kunden suchen online. Mit einer eigenen Website sind Sie dabei – wir bauen sie für Sie, fertig in wenigen
          Tagen, ohne dass Sie sich um Technik kümmern müssen.
        </p>
      </div>
      <ul className="flex gap-[6mm] text-[8.5pt] font-semibold text-[#1d4e89]">
        <li>✓ Gratis-Demo vorab</li>
        <li>✓ Fixpreis</li>
        <li>✓ Aus Wien, für Wien</li>
      </ul>
    </div>
  );
}

async function Rueckseite({ lead }: { lead: Lead }) {
  const svg = await qrSvg(karteLink(lead.karten_code));
  const zeilen = empfaengerZeilen(lead);
  return (
    <div className={`${SEITE} grid grid-cols-2 shadow-sm`}>
      <div className="flex flex-col justify-between border-r border-[#d9dde3] p-[7mm] pr-[5mm]">
        <div>
          <p className="text-[9.5pt] font-semibold leading-snug">Eine Website für {lead.firma}?</p>
          <p className="mt-[2mm] text-[8pt] leading-snug text-[#3b4658]">
            Wir zeigen Ihnen in einem kurzen Anruf, wie sie aussehen könnte – unverbindlich. QR-Code scannen, „Ja, rufen
            Sie mich an“ bestätigen, und wir melden uns zu Ihrer Wunschzeit.
          </p>
        </div>
        <div className="flex items-end gap-[3mm]">
          <div className="h-[24mm] w-[24mm] shrink-0 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="text-[7pt] leading-snug text-[#3b4658]">
            Ohne Handy:
            <br />
            <span className="font-semibold text-[#16243A]">{karteBasis()}</span>
            <br />
            Code: <span className="font-mono text-[8.5pt] font-semibold tracking-wider text-[#16243A]">{codeLesbar(lead.karten_code)}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-col p-[7mm] pl-[5mm]">
        <div className="ml-auto flex h-[22mm] w-[18mm] items-center justify-center border border-dashed border-[#b8bec8] text-center text-[6pt] text-[#8a93a1]">
          Briefmarke
        </div>
        <div className="mt-auto space-y-[0.6mm] pb-[6mm] text-[9pt] leading-snug">
          {zeilen.map((z, i) => (
            <p key={i} className={i === 0 ? "font-semibold" : undefined}>
              {z}
            </p>
          ))}
        </div>
        <p className="text-[6pt] text-[#8a93a1]">
          Absender: {[FIRMA.name, FIRMA.strasse, [FIRMA.plz, FIRMA.ort].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
        </p>
      </div>
    </div>
  );
}

export default async function PostkartenDruck({ searchParams }: PageProps<"/crm/postkarten/druck">) {
  await holeProfil();
  const sp = await searchParams;
  const seitRoh = typeof sp.seit === "string" ? sp.seit : "";
  // Ohne gültigen Zeitpunkt: alle heute erstellten Karten
  const seit = Number.isNaN(Date.parse(seitRoh)) ? wienGrenzen().tagStart : new Date(seitRoh).toISOString();

  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("id, firma, ansprechpartner, adresse, bezirk, karten_code")
    .not("karten_code", "is", null)
    .gte("karte_am", seit)
    .order("bezirk")
    .order("firma")
    .limit(500);
  const leads = (data ?? []) as Lead[];

  return (
    <>
      <style>{`@page { size: 148mm 105mm; margin: 0; } @media print { body { background: #fff; } }`}</style>

      <div className="print:hidden">
        <Kopf titel="Postkarten drucken" text={`${leads.length} Karten · je Vorder- und Rückseite`}>
          <Link href="/crm/postkarten" className={buttonClass("secondary")}>
            Zurück
          </Link>
          {leads.length ? <DruckenButton /> : null}
        </Kopf>
        <Karte className="mb-6 space-y-1 p-5 text-sm text-muted">
          <p>
            <strong className="text-ink">Druckeinstellungen:</strong> Papierformat A6 (oder Postkarte), Ränder „Keine“,
            Skalierung 100 %, beidseitig an der kurzen Kante. Zuerst eine Probekarte drucken.
          </p>
          <p>Für mehr als ein paar Karten: als PDF speichern und bei einer Druckerei auf Postkarten-Karton drucken lassen.</p>
        </Karte>
      </div>

      {leads.length === 0 ? (
        <Karte className="p-6 text-muted print:hidden">
          Keine Karten gefunden.{" "}
          <Link href="/crm/postkarten" className="text-brand underline">
            Karten erstellen
          </Link>
        </Karte>
      ) : (
        <div className="flex flex-col items-center gap-6 print:block print:gap-0">
          {leads.map((l) => (
            <div key={l.id} className="contents">
              <Vorderseite />
              <Rueckseite lead={l} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
