import type { Metadata } from "next";
import Link from "next/link";
import { CsvImport } from "@/components/crm/CsvImport";
import { LeadAnlegen } from "@/components/crm/LeadAnlegen";
import { NummerEintragen } from "@/components/crm/NummerEintragen";
import { DatenErgaenzen, type UnvollstaendigerLead } from "@/components/crm/DatenErgaenzen";
import { StatusAuswahl } from "@/components/crm/StatusAuswahl";
import { WhatsAppKnopf } from "@/components/crm/WhatsApp";
import { ZuteilenLeiste } from "@/components/crm/ZuteilenLeiste";
import { Hinweis, Karte, Select, buttonClass, inputClass } from "@/components/ui";
import { aktivePersonen, holeProfil } from "@/lib/crm";
import { EINWILLIGUNG_ARTEN } from "@/lib/einwilligung";
import { LEAD_STATUS, STATUS_LABEL, istLeadStatus, type LeadStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { datum, datumZeit, heuteWien, isoZuWienLokal } from "@/lib/zeit";
import { einwilligungSetzen } from "./actions";

export const metadata: Metadata = { title: "Leads" };

const LIMIT = 200;

const QUELLE_KURZ: Record<string, string> = {
  manuell: "Manuell",
  csv: "Import",
  leadfinder: "Lead Finder",
  recherche: "Recherche",
};
const quelleKurz = (q: string) => (q.startsWith("anfrage:") ? "Website" : (QUELLE_KURZ[q] ?? q));

/** Schlichte Linien-Symbole */
const PFADE = {
  telefon:
    "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z",
  ort: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  schloss: "M6 11h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM8 11V7a4 4 0 0 1 8 0v4",
  suche: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4.3-4.3",
  uhr: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
};
function Symbol({ name, className = "h-4 w-4" }: { name: keyof typeof PFADE; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`shrink-0 fill-none stroke-current ${className}`} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={PFADE[name]} />
    </svg>
  );
}

export default async function Leads({ searchParams }: PageProps<"/crm/leads">) {
  const profil = await holeProfil();
  const sp = await searchParams;
  const wert = (k: string, max = 100) => (typeof sp[k] === "string" ? (sp[k] as string).trim().slice(0, max) : "");
  const q = wert("q");
  const status = istLeadStatus(sp.status) ? sp.status : "";
  const branche = wert("branche");
  const bezirk = wert("bezirk");
  const admin = profil.rolle === "admin";
  const personen = admin ? await aktivePersonen() : [];
  const gruender = personen.filter((p) => p.rolle === "admin").map((p) => p.id);
  // „Bei“ (nur Gründer): Person-ID oder „offen“ = liegt noch bei Gründern
  const besitzer =
    admin && typeof sp.besitzer === "string" && (sp.besitzer === "offen" || personen.some((p) => p.id === sp.besitzer))
      ? sp.besitzer
      : "";
  const ok = wert("ok", 300) || null;
  const fehler = wert("fehler", 300) || null;
  const filter = new URLSearchParams({
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    ...(branche ? { branche } : {}),
    ...(bezirk ? { bezirk } : {}),
    ...(besitzer ? { besitzer } : {}),
  });
  const hier = filter.size ? `/crm/leads?${filter}` : "/crm/leads";
  const mehrOffen = !!(branche || bezirk || besitzer);

  const supabase = await createClient();

  // „Unvollständig“: offene Leads ohne Telefon oder ohne Adresse – zum Nachtragen
  const unv = sp.liste === "unvollstaendig";
  const fehlt = sp.fehlt === "telefon" || sp.fehlt === "adresse" ? sp.fehlt : "";
  const geschlossen = "(verkauft,kein_interesse,falsche_nummer,nicht_anrufen)";
  const offeneLeads = () => supabase.from("leads").select("id", { count: "exact", head: true }).not("status", "in", geschlossen);
  const [zAlle, zUnv, zTel, zAdr] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    offeneLeads().or("telefon.is.null,adresse.is.null"),
    offeneLeads().is("telefon", null),
    offeneLeads().is("adresse", null),
  ]);
  const umschalter = (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-xl border border-line bg-surface p-1 text-sm font-semibold">
        {[
          { href: "/crm/leads", text: "Alle Leads", zahl: zAlle.count ?? 0, an: !unv },
          { href: "/crm/leads?liste=unvollstaendig", text: "Unvollständig", zahl: zUnv.count ?? 0, an: unv },
        ].map((t) => (
          <Link key={t.href} href={t.href} aria-current={t.an ? "page" : undefined} className={`rounded-lg px-3.5 py-2 ${t.an ? "bg-brand text-white" : "text-ink hover:bg-bg"}`}>
            {t.text} <span className={t.an ? "text-white/75" : "text-muted"}>{t.zahl}</span>
          </Link>
        ))}
      </div>
      {unv ? <p className="text-sm text-muted">Fehlendes ist gelb – eintippen, speichern, fertig.</p> : null}
    </div>
  );
  let abfrage = supabase
    .from("leads")
    .select(
      "id, firma, ansprechpartner, branche, telefon, bezirk, quelle, status, status_seit, naechster_rueckruf, einwilligung_wie, created_at, besitzer:profiles!leads_besitzer_id_fkey(name)",
      { count: "exact" },
    )
    // Geplante Rückrufe zuerst (der früheste oben), dann die neuesten Leads
    .order("naechster_rueckruf", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  if (status) abfrage = abfrage.eq("status", status);
  if (branche) abfrage = abfrage.eq("branche", branche);
  if (bezirk) abfrage = abfrage.eq("bezirk", bezirk);
  if (besitzer === "offen") abfrage = abfrage.in("besitzer_id", gruender.length ? gruender : [profil.id]);
  else if (besitzer) abfrage = abfrage.eq("besitzer_id", besitzer);
  if (q) {
    // Zeichen entfernen, die in PostgREST-Filtern eine Bedeutung haben
    const sicher = q.replace(/[,()%*\\:"]/g, " ").trim();
    if (sicher) {
      const m = `%${sicher}%`;
      const ziffern = sicher.replace(/\D/g, "");
      abfrage = abfrage.or(
        [
          `firma.ilike.${m}`,
          `ansprechpartner.ilike.${m}`,
          `branche.ilike.${m}`,
          `email.ilike.${m}`,
          `telefon.ilike.${m}`,
          // Nummer auch ohne Leerzeichen/Schrägstriche finden: „0664 123“ findet „0664/123…“
          ...(ziffern.length >= 4 ? [`telefon.ilike.*${ziffern.split("").join("*")}*`] : []),
          `bezirk.ilike.${m}`,
          `adresse.ilike.${m}`,
        ].join(","),
      );
    }
  }

  const [{ data, count, error }, { data: werteRoh }, { data: waRoh }] = await Promise.all([
    abfrage,
    // Vorkommende Branchen und Bezirke für die Filter
    supabase.from("leads").select("branche, bezirk").limit(5000),
    supabase.from("vorlagen").select("id, titel, text").eq("kanal", "whatsapp").order("reihenfolge"),
  ]);
  const sortiert = (liste: (string | null)[]) =>
    [...new Set(liste.map((x) => (x ?? "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
  const branchen = sortiert((werteRoh ?? []).map((w) => w.branche as string | null));
  const bezirke = sortiert((werteRoh ?? []).map((w) => w.bezirk as string | null));

  const leads = (data ?? []) as unknown as {
    id: string;
    firma: string;
    ansprechpartner: string | null;
    branche: string | null;
    telefon: string | null;
    bezirk: string | null;
    quelle: string;
    status: LeadStatus;
    status_seit: string;
    naechster_rueckruf: string | null;
    einwilligung_wie: string | null;
    created_at: string;
    besitzer: { name: string } | null;
  }[];
  type Zeile = (typeof leads)[number];

  // WhatsApp: Vorlagen und bei wem die mündliche Zustimmung schon bestätigt ist
  const waVorlagen = (waRoh ?? []) as { id: string; titel: string; text: string }[];
  const waZustimmung = new Set<string>();
  if (leads.length) {
    const { data: zu } = await supabase
      .from("lead_verlauf")
      .select("lead_id")
      .in("lead_id", leads.map((l) => l.id))
      .eq("art", "system")
      .like("text", "WhatsApp-Zustimmung bestätigt%")
      .limit(1000);
    for (const z of zu ?? []) waZustimmung.add(z.lead_id as string);
  }
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const meinName = profil.name.trim() || profil.email;
  const heute = heuteWien();
  const jetzt = new Date().toISOString();

  const gesperrt = (l: Zeile) => l.status === "nicht_anrufen" || l.status === "falsche_nummer";
  const anrufbar = (l: Zeile) => !!l.telefon && !!l.einwilligung_wie && !gesperrt(l);
  const nummer = (t: string) => t.replace(/[^+0-9]/g, "");

  const waKnopf = (l: Zeile) =>
    l.telefon && !gesperrt(l) ? (
      <WhatsAppKnopf
        symbol
        lead={{ id: l.id, firma: l.firma, ansprechpartner: l.ansprechpartner, telefon: l.telefon, erlaubt: !!l.einwilligung_wie || waZustimmung.has(l.id), frage: true }}
        daten={{ vorlagen: waVorlagen, site, meinName }}
        anlass={l.status === "demo" ? "demo" : l.status === "nicht_erreicht" ? "nicht_erreicht" : "gespraech"}
      />
    ) : null;

  /** Rückruf-Hinweis: „Rückruf heute 16:00“, überfällig in Rot */
  const rueckruf = (l: Zeile) => {
    if (!l.naechster_rueckruf || gesperrt(l)) return null;
    const lokal = isoZuWienLokal(l.naechster_rueckruf);
    const wann = lokal.slice(0, 10) === heute ? "heute" : datum(l.naechster_rueckruf);
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${l.naechster_rueckruf < jetzt ? "text-danger" : "text-amber-800"}`}>
        <Symbol name="uhr" className="h-3.5 w-3.5" />
        Rückruf {wann} {lokal.slice(11, 16)}
      </span>
    );
  };

  /** Nummer: antippen = anrufen. Ohne eingetragene Zustimmung gesperrt, mit einem Tipp eintragbar. */
  const telefon = (l: Zeile, gross: boolean) => {
    const hoehe = gross ? "min-h-12 text-base" : "min-h-9 text-sm";
    if (!l.telefon) return l.status === "nicht_anrufen" ? <span className={`flex ${hoehe} flex-1 items-center justify-center rounded-lg bg-bg px-3 text-muted`}>Keine Nummer</span> : <NummerEintragen id={l.id} gross={gross} />;
    if (gesperrt(l))
      return <span className={`flex ${hoehe} flex-1 items-center justify-center rounded-lg bg-bg px-3 text-muted`}>{STATUS_LABEL[l.status]}</span>;
    if (anrufbar(l))
      return (
        <a
          href={`tel:${nummer(l.telefon)}`}
          className={`flex ${hoehe} flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand-light px-3 font-semibold text-brand hover:bg-brand hover:text-white`}
        >
          <Symbol name="telefon" />
          {l.telefon}
        </a>
      );
    return (
      <details className="relative flex-1">
        <summary
          className={`flex ${hoehe} cursor-pointer list-none flex-col items-center justify-center rounded-lg bg-bg px-3 text-center leading-tight [&::-webkit-details-marker]:hidden`}
        >
          <span className="flex items-center gap-1.5 whitespace-nowrap text-muted">
            <Symbol name="schloss" className="h-3.5 w-3.5" />
            {l.telefon}
          </span>
          <span className="text-xs font-semibold text-brand">Zustimmung eintragen</span>
        </summary>
        <form action={einwilligungSetzen} className="absolute left-0 right-0 z-20 mt-1 min-w-64 space-y-2 rounded-lg border border-line bg-surface p-3 shadow-lg">
          <input type="hidden" name="id" value={l.id} />
          <p className="text-xs text-muted">Nur eintragen, wenn der Betrieb wirklich zugestimmt hat. Danach ist die Nummer antippbar.</p>
          <Select name="wie" required defaultValue="" aria-label="Wie hat der Betrieb zugestimmt?">
            <option value="" disabled>
              Wie hat er zugestimmt?
            </option>
            {EINWILLIGUNG_ARTEN.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
          <button className={buttonClass("primary", "w-full")}>Zustimmung speichern</button>
        </form>
      </details>
    );
  };

  const kopf = (
      <div className="mb-4 flex flex-wrap items-end gap-x-2 gap-y-3">
        <div className="mr-auto min-w-48">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Vertrieb</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Leads</h1>
          <p className="mt-1 text-sm text-muted">{admin ? "Alle Leads im Team und wie weit ihr seid." : "Deine Leads und wie weit ihr seid."}</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
          <LeadAnlegen />
          <CsvImport personen={personen} ichId={profil.id} />
        </div>
      </div>
  );

  if (unv) {
    let u = supabase
      .from("leads")
      .select("id, firma, branche, telefon, adresse, bezirk, besitzer:profiles!leads_besitzer_id_fkey(name)")
      .not("status", "in", geschlossen)
      .order("created_at", { ascending: false })
      .limit(LIMIT);
    u = fehlt === "telefon" ? u.is("telefon", null) : fehlt === "adresse" ? u.is("adresse", null) : u.or("telefon.is.null,adresse.is.null");
    const { data: uRoh } = await u;
    const liste: UnvollstaendigerLead[] = ((uRoh ?? []) as unknown as (Omit<UnvollstaendigerLead, "bei"> & { besitzer: { name: string } | null })[]).map(
      ({ besitzer: b, ...l }) => ({ ...l, bei: admin ? (b?.name ?? null) : null }),
    );
    const chips = [
      { wert: "", text: "Alle", zahl: zUnv.count ?? 0 },
      { wert: "telefon", text: "Ohne Telefon", zahl: zTel.count ?? 0 },
      { wert: "adresse", text: "Ohne Adresse", zahl: zAdr.count ?? 0 },
    ];
    return (
      <>
        {kopf}
        {umschalter}
        <div className="mb-3 flex flex-wrap gap-2">
          {chips.map((c) => (
            <Link
              key={c.wert}
              href={`/crm/leads?liste=unvollstaendig${c.wert ? `&fehlt=${c.wert}` : ""}`}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${fehlt === c.wert ? "border-brand bg-brand-light text-brand" : "border-line bg-surface text-ink hover:bg-bg"}`}
            >
              {c.text} {c.zahl}
            </Link>
          ))}
        </div>
        {liste.length === 0 ? (
          <Karte>
            <p className="px-5 py-10 text-center text-muted">Alles vollständig – hier ist nichts mehr nachzutragen.</p>
          </Karte>
        ) : (
          <>
            <ul className="space-y-3 md:hidden">
              {liste.map((l) => (
                <DatenErgaenzen key={l.id} lead={l} tabelle={false} />
              ))}
            </ul>
            <div className="hidden rounded-xl border border-line bg-surface md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-bg text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Firma</th>
                    <th className="px-2 py-3 font-semibold">Telefon</th>
                    <th className="px-2 py-3 font-semibold">Adresse</th>
                    <th className="px-2 py-3 font-semibold">Bezirk</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {liste.map((l) => (
                    <DatenErgaenzen key={l.id} lead={l} tabelle />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div aria-hidden className="h-20" />
      </>
    );
  }

  return (
    <>
      {kopf}
      {umschalter}

      <form key={hier} method="get" role="search" className="mb-4 rounded-xl border border-line bg-surface p-3 sm:p-4">
        <div className="grid gap-2 md:grid-cols-[1fr_200px_auto]">
          <label className="relative block">
            <span className="sr-only">Suche</span>
            <Symbol name="suche" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input name="q" type="search" defaultValue={q} placeholder="Firma, Name, Telefon …" className={`${inputClass} pl-9`} />
          </label>
          <label className="block">
            <span className="sr-only">Status</span>
            <Select name="status" defaultValue={status}>
              <option value="">Alle Status</option>
              {LEAD_STATUS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </label>
          <div className="flex gap-2">
            <button className={buttonClass("primary", "flex-1 px-5")}>Filtern</button>
            {filter.size ? (
              <Link href="/crm/leads" className={buttonClass("secondary", "px-3")}>
                Zurücksetzen
              </Link>
            ) : null}
          </div>
        </div>
        <details open={mehrOffen} className="group mt-2">
          <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1 text-sm font-semibold text-brand [&::-webkit-details-marker]:hidden">
            Mehr Filter
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current transition-transform group-open:rotate-180" strokeWidth={2}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className={`mt-2 grid gap-2 ${admin ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
            <Select name="branche" defaultValue={branche} aria-label="Branche">
              <option value="">Alle Branchen</option>
              {branche && !branchen.includes(branche) ? <option value={branche}>{branche}</option> : null}
              {branchen.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
            <Select name="bezirk" defaultValue={bezirk} aria-label="Bezirk">
              <option value="">Alle Bezirke</option>
              {bezirk && !bezirke.includes(bezirk) ? <option value={bezirk}>{bezirk}</option> : null}
              {bezirke.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
            {admin ? (
              <Select name="besitzer" defaultValue={besitzer} aria-label="Bei wem">
                <option value="">Alle Personen</option>
                <option value="offen">Noch nicht verteilt</option>
                {personen.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.trim() || p.email}
                  </option>
                ))}
              </Select>
            ) : null}
          </div>
        </details>
      </form>

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
      {error ? <p className="mb-4 text-danger">Die Leads konnten nicht geladen werden.</p> : null}

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-semibold text-ink">
          {admin ? "Alle Leads" : "Meine Leads"}
          <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-sm text-brand">{count ?? 0}</span>
        </p>
        {count && count > LIMIT ? <p className="text-xs text-muted">Die ersten {LIMIT} werden angezeigt – grenz die Suche ein.</p> : null}
      </div>
      {admin && leads.length > 0 ? <ZuteilenLeiste personen={personen} zurueck={hier} /> : null}

      {leads.length === 0 ? (
        <Karte>
          <p className="px-5 py-10 text-center text-muted">Keine Leads gefunden.</p>
        </Karte>
      ) : (
        <>
          {/* Handy: Karten */}
          <ul className="space-y-3 md:hidden">
            {leads.map((l) => (
              <li key={l.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {admin ? (
                      <label className="mr-1 flex items-center">
                        <span className="sr-only">{l.firma} markieren</span>
                        <input type="checkbox" name="ids" value={l.id} form="zuteilen" className="h-5 w-5 accent-brand" />
                      </label>
                    ) : null}
                    {l.branche ? <span className="rounded-md border border-line px-2 py-0.5 text-xs font-semibold text-muted">{l.branche}</span> : null}
                  </div>
                  {rueckruf(l) ?? <span className="text-xs text-muted">{datum(l.created_at)}</span>}
                </div>
                <Link href={`/crm/leads/${l.id}`} className="mt-2 block">
                  <span className="block text-lg font-semibold leading-snug text-ink">{l.firma}</span>
                  {l.ansprechpartner ? <span className="block text-sm text-muted">{l.ansprechpartner}</span> : null}
                </Link>
                <div className="mt-3 flex items-stretch gap-2">
                  {telefon(l, true)}
                  {waKnopf(l)}
                </div>
                <p className="mt-2.5 flex items-center gap-1.5 text-sm text-muted">
                  <Symbol name="ort" />
                  {l.bezirk ?? "Kein Bezirk"}
                  {admin && l.besitzer ? <span className="ml-auto text-xs">Bei {l.besitzer.name}</span> : null}
                </p>
                <div className="mt-3 flex items-start justify-between gap-3 border-t border-line pt-3">
                  <div className="min-w-0 flex-1">
                    <StatusAuswahl id={l.id} status={l.status} admin={admin} />
                  </div>
                  <p className="text-right text-xs text-muted">
                    <span className="block font-semibold uppercase tracking-wide">Bearbeitet</span>
                    <span className="text-ink">{datumZeit(l.status_seit)}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Computer: Tabelle */}
          <div className="hidden rounded-xl border border-line bg-surface md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-bg text-xs uppercase tracking-wide text-muted">
                <tr>
                  {admin ? (
                    <th className="w-10 py-3 pl-4">
                      <span className="sr-only">Markieren</span>
                    </th>
                  ) : null}
                  <th className="px-4 py-3 font-semibold">Firma</th>
                  <th className="px-4 py-3 font-semibold">Telefon</th>
                  <th className="px-4 py-3 font-semibold">Bezirk</th>
                  <th className="w-52 px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Bearbeitet</th>
                  {admin ? <th className="px-4 py-3 font-semibold">Bei</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {leads.map((l) => (
                  <tr key={l.id} className="align-middle hover:bg-bg/60">
                    {admin ? (
                      <td className="py-3 pl-4">
                        <input type="checkbox" name="ids" value={l.id} form="zuteilen" aria-label={`${l.firma} markieren`} className="h-5 w-5 accent-brand" />
                      </td>
                    ) : null}
                    <td className="px-4 py-3">
                      <Link href={`/crm/leads/${l.id}`} className="font-semibold text-ink hover:text-brand">
                        {l.firma}
                      </Link>
                      <span className="block text-xs text-muted">{[l.branche, l.ansprechpartner, quelleKurz(l.quelle)].filter(Boolean).join(" · ")}</span>
                      {rueckruf(l)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex w-64 items-center gap-2">
                        {telefon(l, false)}
                        {waKnopf(l)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink">{l.bezirk ?? <span className="text-muted">–</span>}</td>
                    <td className="px-4 py-3">
                      <StatusAuswahl id={l.id} status={l.status} admin={admin} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{datumZeit(l.status_seit)}</td>
                    {admin ? <td className="whitespace-nowrap px-4 py-3 text-muted">{l.besitzer?.name ?? "–"}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <div aria-hidden className="h-20" />
    </>
  );
}
