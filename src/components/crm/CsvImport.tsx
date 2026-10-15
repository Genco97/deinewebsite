"use client";

import { useState, useTransition } from "react";
import { leadsImportieren } from "@/app/crm/leads/actions";
import { Hinweis, Select, buttonClass } from "@/components/ui";
import type { Person } from "@/lib/crm";
import { parseCsv } from "@/lib/csv";
import { csvZuLeads, type ImportZeile } from "@/lib/csv-import";

const VORSCHAU = [
  ["firma", "Firma"],
  ["ansprechpartner", "Inhaber/in"],
  ["telefon", "Telefon"],
  ["email", "E-Mail"],
  ["adresse", "Adresse"],
  ["bezirk", "Bezirk"],
] as const;

export function CsvImport({ personen = [], ichId }: { personen?: Person[]; ichId?: string }) {
  const [besitzer, setBesitzer] = useState(ichId ?? "");
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
    setZeilen(csvZuLeads(parseCsv(await datei.text())));
  }

  function importieren() {
    starte(async () => {
      const r = await leadsImportieren(gueltig, besitzer || undefined);
      setMeldung({ art: r.ok ? "ok" : "fehler", text: r.meldung });
      if (r.ok) setZeilen([]);
    });
  }

  return (
    <details className="group rounded-lg border border-line bg-surface open:order-last open:col-span-2 open:basis-full">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 whitespace-nowrap px-4 text-sm font-semibold text-ink group-open:min-h-12 group-open:justify-start group-open:text-base [&::-webkit-details-marker]:hidden">
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current group-open:hidden" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
        <span className="group-open:hidden">Importieren</span>
        <span className="hidden group-open:inline">Liste importieren</span>
        <span aria-hidden className="ml-auto hidden text-xl leading-none text-muted group-open:inline">×</span>
      </summary>
      <div className="space-y-3 border-t border-line p-4">
        <p className="text-sm text-muted">
          Erkannte Spalten (Kopfzeile):{" "}
          <code className="rounded bg-bg px-1">firma; inhaber; branche; telefon; e-mail; adresse; plz; ort; bezirk</code>.
          Alle weiteren Spalten – z. B. Öffnungszeiten oder Quelle – werden als Notiz beim Lead gespeichert. Ohne
          Kopfzeile: <code className="rounded bg-bg px-1">firma; branche; telefon; adresse; bezirk</code>. Trenner
          Semikolon oder Komma.
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
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="sticky top-0 bg-bg text-muted">
                  <tr>
                    {VORSCHAU.map(([s, titel]) => (
                      <th key={s} className="whitespace-nowrap px-2 py-2 font-semibold">
                        {titel}
                      </th>
                    ))}
                    <th className="px-2 py-2 font-semibold">Notiz</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {zeilen.slice(0, 20).map((z, i) => (
                    <tr key={i} className={z.firma ? "" : "bg-danger-light"}>
                      {VORSCHAU.map(([s]) => (
                        <td key={s} className="whitespace-nowrap px-2 py-1.5">
                          {z[s] || "–"}
                        </td>
                      ))}
                      <td className="px-2 py-1.5" title={z.notiz}>
                        {z.notiz ? `${z.notiz.split("\n").length} Angaben` : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {zeilen.length > 20 ? <p className="text-xs text-muted">Vorschau: erste 20 von {zeilen.length} Zeilen.</p> : null}
            {personen.length > 0 ? (
              <div className="sm:max-w-xs">
                <label htmlFor="import-besitzer" className="mb-1.5 block text-sm font-semibold text-ink">
                  Leads zuteilen an
                </label>
                <Select id="import-besitzer" value={besitzer} onChange={(e) => setBesitzer(e.target.value)}>
                  {personen.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name.trim() || p.email}
                      {p.id === ichId ? " (ich)" : p.rolle === "admin" ? " (Gründer)" : ""}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
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
