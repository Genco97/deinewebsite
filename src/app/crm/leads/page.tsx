import type { Metadata } from "next";
import Link from "next/link";
import { Kopf } from "@/components/crm/Kopf";
import { CsvImport } from "@/components/crm/CsvImport";
import { LeadAnlegen } from "@/components/crm/LeadAnlegen";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { ZuteilenLeiste } from "@/components/crm/ZuteilenLeiste";
import { Hinweis, Karte, Select, buttonClass, inputClass } from "@/components/ui";
import { aktivePersonen, holeProfil } from "@/lib/crm";
import { LEAD_STATUS, STATUS_LABEL, istLeadStatus, type LeadStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { datumZeit } from "@/lib/zeit";

export const metadata: Metadata = { title: "Leads" };

const LIMIT = 200;

export default async function Leads({ searchParams }: PageProps<"/crm/leads">) {
  const profil = await holeProfil();
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 100);
  const status = typeof sp.status === "string" && istLeadStatus(sp.status) ? sp.status : "";
  const admin = profil.rolle === "admin";
  const personen = admin ? await aktivePersonen() : [];
  const gruender = personen.filter((p) => p.rolle === "admin").map((p) => p.id);
  // Filter „Zugeteilt an“ (nur Gründer): Person-ID oder „offen“ = liegt noch bei Gründern
  const besitzer =
    admin && typeof sp.besitzer === "string" && (sp.besitzer === "offen" || personen.some((p) => p.id === sp.besitzer))
      ? sp.besitzer
      : "";
  const ok = typeof sp.ok === "string" ? sp.ok : null;
  const fehler = typeof sp.fehler === "string" ? sp.fehler : null;
  const filter = new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(besitzer ? { besitzer } : {}) });
  const hier = filter.size ? `/crm/leads?${filter}` : "/crm/leads";

  const supabase = await createClient();
  let abfrage = supabase
    .from("leads")
    .select("id, firma, branche, telefon, bezirk, status, naechster_rueckruf, einwilligung_wie, besitzer:profiles!leads_besitzer_id_fkey(name)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  if (status) abfrage = abfrage.eq("status", status);
  if (besitzer === "offen") abfrage = abfrage.in("besitzer_id", gruender.length ? gruender : [profil.id]);
  else if (besitzer) abfrage = abfrage.eq("besitzer_id", besitzer);
  if (q) {
    // Zeichen entfernen, die in PostgREST-Filtern eine Bedeutung haben
    const sicher = q.replace(/[,()%*\\:"]/g, " ").trim();
    if (sicher) {
      const m = `%${sicher}%`;
      abfrage = abfrage.or(`firma.ilike.${m},branche.ilike.${m},telefon.ilike.${m},bezirk.ilike.${m},adresse.ilike.${m}`);
    }
  }

  const { data, count, error } = await abfrage;
  const leads = (data ?? []) as unknown as {
    id: string;
    firma: string;
    branche: string | null;
    telefon: string | null;
    bezirk: string | null;
    status: LeadStatus;
    naechster_rueckruf: string | null;
    einwilligung_wie: string | null;
    besitzer: { name: string } | null;
  }[];

  return (
    <>
      <Kopf titel="Leads" text={admin ? "Alle Leads im Team." : "Deine Leads."} />

      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <LeadAnlegen />
        <CsvImport personen={personen} ichId={profil.id} />
      </div>

      <form
        method="get"
        className={`mb-4 grid gap-2 ${admin ? "sm:grid-cols-[1fr_180px_200px_auto]" : "sm:grid-cols-[1fr_200px_auto]"}`}
        role="search"
      >
        <label className="sr-only" htmlFor="q">
          Suche
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Firma, Branche, Telefon, Bezirk …"
          className={inputClass}
        />
        <label className="sr-only" htmlFor="status">
          Status
        </label>
        <Select name="status" defaultValue={status}>
          <option value="">Alle Status</option>
          {LEAD_STATUS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        {admin ? (
          <>
            <label className="sr-only" htmlFor="filter-besitzer">
              Zugeteilt an
            </label>
            <Select id="filter-besitzer" name="besitzer" defaultValue={besitzer}>
              <option value="">Alle Personen</option>
              <option value="offen">Noch nicht verteilt</option>
              {personen.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.trim() || p.email}
                </option>
              ))}
            </Select>
          </>
        ) : null}
        <div className="flex gap-2">
          <button className={buttonClass("primary", "flex-1")}>Filtern</button>
          {q || status || besitzer ? (
            <Link href="/crm/leads" className={buttonClass("secondary")}>
              Zurücksetzen
            </Link>
          ) : null}
        </div>
      </form>

      <p className="mb-2 text-sm text-muted">
        {count ?? 0} {count === 1 ? "Lead" : "Leads"}
        {count && count > LIMIT ? ` – die neuesten ${LIMIT} werden angezeigt. Grenz die Suche ein.` : ""}
      </p>

      {error ? <p className="text-danger">Die Leads konnten nicht geladen werden.</p> : null}

      {ok ? (
        <div className="mb-4">
          <Hinweis art="ok">{ok}</Hinweis>
        </div>
      ) : null}
      {fehler ? (
        <div className="mb-4">
          <Hinweis art="fehler">{fehler}</Hinweis>
        </div>
      ) : null}
      {admin && leads.length > 0 ? <ZuteilenLeiste personen={personen} zurueck={hier} /> : null}

      <Karte className="overflow-hidden">
        {leads.length === 0 ? (
          <p className="px-5 py-10 text-center text-muted">Keine Leads gefunden.</p>
        ) : (
          <>
            {/* Mobil: Liste */}
            <ul className="divide-y divide-line md:hidden">
              {leads.map((l) => (
                <li key={l.id} className="flex items-start">
                  {admin ? (
                    <label className="flex min-h-14 items-start py-3 pl-4">
                      <span className="sr-only">{l.firma} markieren</span>
                      <input type="checkbox" name="ids" value={l.id} form="zuteilen" className="mt-0.5 h-5 w-5 accent-brand" />
                    </label>
                  ) : null}
                  <Link href={`/crm/leads/${l.id}`} className="block min-w-0 flex-1 px-4 py-3 hover:bg-bg">
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0 font-semibold text-ink">{l.firma}</span>
                      <StatusBadge status={l.status} />
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {[l.branche, l.bezirk].filter(Boolean).join(" · ") || "–"}
                    </span>
                    {l.naechster_rueckruf ? (
                      <span className="mt-0.5 block text-sm text-ink">Rückruf: {datumZeit(l.naechster_rueckruf)}</span>
                    ) : null}
                    {l.status !== "nicht_anrufen" && !l.einwilligung_wie ? (
                      <span className="mt-0.5 block text-sm text-amber-800">Kein Anruf – nur Besuch oder Brief</span>
                    ) : null}
                    {admin && l.besitzer ? <span className="mt-0.5 block text-xs text-muted">Bei: {l.besitzer.name}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop: Tabelle */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="border-b border-line bg-bg text-xs uppercase tracking-wide text-muted">
                <tr>
                  {admin ? <th className="w-10 py-3 pl-4"><span className="sr-only">Markieren</span></th> : null}
                  <th className="px-4 py-3 font-semibold">Firma</th>
                  <th className="px-4 py-3 font-semibold">Branche</th>
                  <th className="px-4 py-3 font-semibold">Telefon</th>
                  <th className="px-4 py-3 font-semibold">Bezirk</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Rückruf</th>
                  {admin ? <th className="px-4 py-3 font-semibold">Zugeteilt an</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-bg">
                    {admin ? (
                      <td className="py-3 pl-4">
                        <input
                          type="checkbox"
                          name="ids"
                          value={l.id}
                          form="zuteilen"
                          aria-label={`${l.firma} markieren`}
                          className="h-5 w-5 accent-brand"
                        />
                      </td>
                    ) : null}
                    <td className="px-4 py-3">
                      <Link href={`/crm/leads/${l.id}`} className="font-semibold text-ink hover:text-brand">
                        {l.firma}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{l.branche ?? "–"}</td>
                    <td className="px-4 py-3 text-muted">
                      {l.status === "nicht_anrufen" ? (
                        <span className="text-danger">ausgeblendet</span>
                      ) : (
                        <>
                          {l.telefon ?? "–"}
                          {l.einwilligung_wie ? null : (
                            <span className="block text-xs text-amber-800">kein Anruf – Besuch/Brief</span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{l.bezirk ?? "–"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">{datumZeit(l.naechster_rueckruf)}</td>
                    {admin ? <td className="px-4 py-3 text-muted">{l.besitzer?.name ?? "–"}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Karte>
    </>
  );
}
