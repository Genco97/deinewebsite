"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { datenErgaenzen } from "@/app/crm/leads/actions";

export type UnvollstaendigerLead = {
  id: string;
  firma: string;
  branche: string | null;
  telefon: string | null;
  adresse: string | null;
  bezirk: string | null;
  bei: string | null;
};

const FELD = "min-h-11 w-full min-w-0 rounded-lg border px-3 text-[15px] text-ink outline-none ring-brand/20 focus:border-brand focus:ring-4";
const LEER = "border-amber-300 bg-amber-50/60 placeholder:text-amber-900/50";

/** Eine Zeile bzw. Karte zum Nachtragen von Telefon, Adresse (und Bezirk, falls leer). */
export function DatenErgaenzen({ lead, tabelle }: { lead: UnvollstaendigerLead; tabelle: boolean }) {
  const router = useRouter();
  const [telefon, setTelefon] = useState("");
  const [adresse, setAdresse] = useState("");
  const [bezirk, setBezirk] = useState("");
  const [fehler, setFehler] = useState<string | null>(null);
  const [doppelt, setDoppelt] = useState<{ id: string | null; firma: string; besitzer: string }[]>([]);
  const [gespeichert, setGespeichert] = useState(false);
  const [laeuft, starten] = useTransition();
  const google = `https://www.google.com/search?q=${encodeURIComponent([lead.firma, lead.bezirk ?? "Wien"].join(" "))}`;

  function speichern(trotzdem = false) {
    setFehler(null);
    starten(async () => {
      const r = await datenErgaenzen(lead.id, { telefon, adresse, bezirk }, trotzdem);
      if (!r.ok) {
        setFehler(r.meldung ?? "Das hat nicht geklappt.");
        setDoppelt(r.doppelt ?? []);
        return;
      }
      setDoppelt([]);
      setGespeichert(true);
      router.refresh();
    });
  }

  const feld = (wert: string | null, eingabe: string, setzen: (v: string) => void, ph: string, label: string, tel = false) =>
    wert ? (
      <span className="block truncate py-2 text-ink">{wert}</span>
    ) : (
      <input
        aria-label={label}
        type={tel ? "tel" : "text"}
        inputMode={tel ? "tel" : undefined}
        value={eingabe}
        onChange={(e) => setzen(e.target.value)}
        placeholder={ph}
        className={`${FELD} ${LEER}`}
      />
    );

  const hinweis =
    fehler || gespeichert ? (
      <div className="text-xs">
        {gespeichert ? <p className="font-semibold text-ok">Gespeichert.</p> : null}
        {fehler ? <p className="font-semibold text-danger">{fehler}</p> : null}
        {doppelt.length ? (
          <>
            <ul className="mt-0.5 text-ink">
              {doppelt.map((d, i) => (
                <li key={d.id ?? i}>
                  {d.id ? (
                    <Link href={`/crm/leads/${d.id}`} className="underline">
                      {d.firma}
                    </Link>
                  ) : (
                    d.firma
                  )}{" "}
                  · bei {d.besitzer}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => speichern(true)} className="mt-1 font-semibold text-brand underline">
              Trotzdem speichern
            </button>
          </>
        ) : null}
      </div>
    ) : null;

  const knoepfe = (
    <div className="flex items-center gap-2">
      <button
        type="submit"
        disabled={laeuft || !(telefon.trim() || adresse.trim() || bezirk.trim())}
        className="min-h-11 rounded-lg bg-brand px-4 text-sm font-semibold text-white disabled:opacity-50"
      >
        {laeuft ? "Speichert …" : "Speichern"}
      </button>
      <a href={google} target="_blank" rel="noopener noreferrer" className="min-h-11 whitespace-nowrap rounded-lg border border-line bg-surface px-3 py-3 text-sm font-semibold text-ink hover:border-brand">
        Auf Google suchen
      </a>
    </div>
  );

  const absenden = (e: React.FormEvent) => {
    e.preventDefault();
    speichern();
  };

  if (tabelle) {
    return (
      <tr className="align-top">
        <td className="px-4 py-3">
          <Link href={`/crm/leads/${lead.id}`} className="font-semibold text-ink hover:text-brand">
            {lead.firma}
          </Link>
          <span className="block text-xs text-muted">{[lead.branche, lead.bei].filter(Boolean).join(" · ")}</span>
        </td>
        <td className="w-48 px-2 py-2">{feld(lead.telefon, telefon, setTelefon, "Telefon", "Telefon", true)}</td>
        <td className="w-64 px-2 py-2">{feld(lead.adresse, adresse, setAdresse, "Straße und Nr.", "Adresse")}</td>
        <td className="w-40 px-2 py-2">{feld(lead.bezirk, bezirk, setBezirk, "z. B. 1210 Wien", "Bezirk")}</td>
        <td className="px-4 py-2">
          <form onSubmit={absenden}>{knoepfe}</form>
          {hinweis}
        </td>
      </tr>
    );
  }

  return (
    <li className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        {lead.branche ? <span className="rounded-md border border-line px-2 py-0.5 text-xs font-semibold text-muted">{lead.branche}</span> : <span />}
        {lead.bei ? <span className="text-xs text-muted">Bei {lead.bei}</span> : null}
      </div>
      <Link href={`/crm/leads/${lead.id}`} className="mt-2 block text-lg font-semibold text-ink">
        {lead.firma}
      </Link>
      <form onSubmit={absenden} className="mt-3 space-y-2.5">
        {[
          { label: "Telefon", wert: lead.telefon, el: feld(lead.telefon, telefon, setTelefon, "z. B. 0664 123 45 67", "Telefon", true) },
          { label: "Adresse", wert: lead.adresse, el: feld(lead.adresse, adresse, setAdresse, "Straße und Hausnummer", "Adresse") },
          { label: "Bezirk", wert: lead.bezirk, el: feld(lead.bezirk, bezirk, setBezirk, "z. B. 1210 Wien", "Bezirk") },
        ].map((f) => (
          <div key={f.label}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${f.wert || f.label === "Bezirk" ? "text-muted" : "text-amber-800"}`}>
              {f.label}
              {f.wert || f.label === "Bezirk" ? "" : " fehlt"}
            </p>
            {f.el}
          </div>
        ))}
        {knoepfe}
        {hinweis}
      </form>
    </li>
  );
}
