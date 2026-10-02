"use client";

import { useState, useTransition } from "react";
import { leadsImportieren, type ImportZeile } from "@/app/crm/leads/actions";
import { Hinweis, buttonClass } from "@/components/ui";
import { parseCsv } from "@/lib/csv";

const SPALTEN = ["firma", "branche", "telefon", "adresse", "bezirk"] as const;

function zuZeilen(roh: string[][]): ImportZeile[] {
  if (roh.length === 0) return [];
  const kopf = roh[0].map((k) => k.trim().toLowerCase());
  const hatKopf = kopf.includes("firma");
  const index = SPALTEN.map((s, i) => (hatKopf ? kopf.indexOf(s) : i));
  return (hatKopf ? roh.slice(1) : roh).map((z) => {
    const w = (i: number) => (i >= 0 ? (z[i] ?? "").trim() : "");
    return { firma: w(index[0]), branche: w(index[1]), telefon: w(index[2]), adresse: w(index[3]), bezirk: w(index[4]) };
  });
}

export function CsvImport() {
  const [zeilen, setZeilen] = useState<ImportZeile[]>([]);
  const [dateiname, setDateiname] = useState("");
  const [meldung, setMeldung] = useState<{ art: "ok" | "fehler"; text: string } | null>(null);
  const [laeuft, starte] = useTransition();

  const gueltig = zeilen.filter((z) => z.firma);
  const ohneFirma = zeilen.length - gueltig.length;

  async function dateiGewaehlt(e: React.ChangeEvent<HTMLInputElement>) {
    setMeldung(null);
    const datei = e.target.files?.[0];
    if (!datei) return;
    if (datei.size > 2_000_000) {
      setMeldung({ art: "fehler", text: "Die Datei ist zu groß (max. 2 MB)." });
      return;
    }
    setDateiname(datei.name);
    setZeilen(zuZeilen(parseCsv(await datei.text())));
  }

  function importieren() {
    starte(async () => {
      const r = await leadsImportieren(gueltig);
      setMeldung({ art: r.ok ? "ok" : "fehler", text: r.meldung });
      if (r.ok) setZeilen([]);
    });
  }

  return (
    <details className="group rounded-xl border border-line bg-surface">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
        CSV-Import
        <span aria-hidden className="text-xl text-brand group-open:rotate-45">+</span>
      </summary>
      <div className="space-y-3 border-t border-line p-4">
        <p className="text-sm text-muted">
          Spalten: <code className="rounded bg-bg px-1">firma; branche; telefon; adresse; bezirk</code>. Kopfzeile optional,
          Trenner Semikolon oder Komma.
        </p>
        <label className={buttonClass("secondary", "w-full cursor-pointer sm:w-auto")}>
          Datei wählen
          <input type="file" accept=".csv,text/csv" onChange={dateiGewaehlt} className="sr-only" />
        </label>
        {dateiname ? <p className="text-sm text-muted">{dateiname}</p> : null}
        {meldung ? <Hinweis art={meldung.art}>{meldung.text}</Hinweis> : null}

        {zeilen.length > 0 ? (
          <>
            <p className="text-sm text-ink">
              <strong>{gueltig.length}</strong> Zeilen bereit
              {ohneFirma ? <span className="text-danger"> · {ohneFirma} ohne Firma werden übersprungen</span> : null}
            </p>
            <div className="max-h-64 overflow-auto rounded-lg border border-line">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead className="sticky top-0 bg-bg text-muted">
                  <tr>
                    {SPALTEN.map((s) => (
                      <th key={s} className="px-2 py-2 font-semibold capitalize">
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {zeilen.slice(0, 20).map((z, i) => (
                    <tr key={i} className={z.firma ? "" : "bg-danger-light"}>
                      {SPALTEN.map((s) => (
                        <td key={s} className="px-2 py-1.5">
                          {z[s] || "–"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {zeilen.length > 20 ? <p className="text-xs text-muted">Vorschau: erste 20 von {zeilen.length} Zeilen.</p> : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={importieren}
                disabled={laeuft || gueltig.length === 0}
                className={buttonClass("primary")}
              >
                {laeuft ? "Importiere …" : `${gueltig.length} Leads importieren`}
              </button>
              <button type="button" onClick={() => setZeilen([])} className={buttonClass("ghost")}>
                Abbrechen
              </button>
            </div>
          </>
        ) : null}
      </div>
    </details>
  );
}
