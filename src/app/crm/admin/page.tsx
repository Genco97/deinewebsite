import type { Metadata } from "next";
import Link from "next/link";
import { BestaetigenButton } from "@/components/crm/BestaetigenButton";
import { Kopf } from "@/components/crm/Kopf";
import { Hinweis, Karte, Select, buttonClass, inputClass } from "@/components/ui";
import { nurAdmin } from "@/lib/crm";
import { PAKETE, PAKET_NAMEN, type PaketId } from "@/lib/pakete";
import { DEAL_STATUS_LABEL } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { datum, datumZeit, euro } from "@/lib/zeit";
import { gewinnProMonat } from "@/lib/gewinn";
import {
  aktivSetzen,
  anfrageUebernehmen,
  dealAktualisieren,
  dealAnlegen,
  dealVollBezahlt,
  nameSetzen,
  provisionAusbezahlt,
  rolleSetzen,
} from "./actions";

export const metadata: Metadata = { title: "Admin" };

const TABS = [
  { id: "anfragen", label: "Anfragen" },
  { id: "deals", label: "Deals" },
  { id: "provisionen", label: "Provisionen" },
  { id: "gewinn", label: "Gewinn" },
  { id: "team", label: "Team" },
  { id: "export", label: "Export" },
] as const;
type Tab = (typeof TABS)[number]["id"];

type Person = {
  id: string;
  name: string;
  email: string;
  rolle: string;
  aktiv: boolean;
  upline_id: string | null;
  created_at: string;
};

const ART_LABEL: Record<string, string> = { demo: "Gratis-Demo", rueckruf: "Rückruf", beratung: "Beratung" };

export default async function Admin({ searchParams }: PageProps<"/crm/admin">) {
  const admin = await nurAdmin();
  const sp = await searchParams;
  const tab: Tab = TABS.some((t) => t.id === sp.tab) ? (sp.tab as Tab) : "anfragen";
  const fehler = typeof sp.fehler === "string" ? sp.fehler : "";

  const supabase = await createClient();
  const { data: personenRoh } = await supabase.from("profiles").select("id, name, email, rolle, aktiv, upline_id, created_at")
    .order("name");
  const personen = (personenRoh ?? []) as Person[];
  const name = (id: string | null) => {
    const p = personen.find((x) => x.id === id);
    return p ? p.name.trim() || p.email : "–";
  };
  const aktivePersonen = personen.filter((p) => p.aktiv);

  return (
    <>
      <Kopf titel="Admin" text="Anfragen, Deals, Provisionen und Export." />

      <nav aria-label="Admin-Bereiche" className="mb-6">
        <ul className="flex flex-wrap gap-x-1 border-b border-line">
          {TABS.map((t) => (
            <li key={t.id}>
              <Link
                href={`/crm/admin?tab=${t.id}`}
                aria-current={tab === t.id ? "page" : undefined}
                className={`-mb-px flex min-h-11 items-center whitespace-nowrap border-b-2 px-4 text-[15px] font-semibold ${
                  tab === t.id ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {fehler ? (
        <div className="mb-4">
          <Hinweis art="fehler">{fehler}</Hinweis>
        </div>
      ) : null}

      {tab === "anfragen" ? <Anfragen personen={aktivePersonen} adminId={admin.id} name={name} /> : null}
      {tab === "deals" ? <Deals personen={aktivePersonen} name={name} /> : null}
      {tab === "provisionen" ? <Provisionen name={name} /> : null}
      {tab === "gewinn" ? <Gewinn /> : null}
      {tab === "team" ? <Team personen={personen} ichId={admin.id} name={name} /> : null}
      {tab === "export" ? <Export /> : null}
    </>
  );
}

// ---------------------------------------------------------------------------
async function Anfragen({
  personen,
  adminId,
  name,
}: {
  personen: Person[];
  adminId: string;
  name: (id: string | null) => string;
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("anfragen")
    .select("id, art, paket, firma, name, email, telefon, branche, wuensche, lead_id, created_at, leads(besitzer_id, quelle)")
    .order("created_at", { ascending: false })
    .limit(200);
  const anfragen = (data ?? []) as unknown as {
    id: string;
    art: string;
    paket: string | null;
    firma: string | null;
    name: string;
    email: string | null;
    telefon: string | null;
    branche: string | null;
    wuensche: string | null;
    lead_id: string | null;
    created_at: string;
    leads: { besitzer_id: string | null; quelle: string } | null;
  }[];
  const offen = anfragen.filter((a) => !a.lead_id);
  // Offene Anfragen zuerst, danach die bereits zugeteilten
  anfragen.sort((x, y) => Number(!!x.lead_id) - Number(!!y.lead_id));
  return (
    <section>
      <p className="mb-4 text-muted">
        Neue Anfragen von der Website landen hier. Teile jede Anfrage der Person zu, die sie bearbeiten soll – sie
        erscheint dann bei ihr unter „Heute“ mit Rückruf in 30 Minuten.
      </p>
      <p className="mb-3 text-sm text-muted">
        {offen.length} offen · {anfragen.length - offen.length} zugeteilt
      </p>
      {anfragen.length === 0 ? (
        <Karte className="px-5 py-10 text-center text-muted">Noch keine Anfragen.</Karte>
      ) : (
        <ul className="space-y-3">
          {anfragen.map((a) => (
            <li key={a.id}>
              <Karte className={`p-4 sm:p-5 ${a.lead_id ? "opacity-70" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand">
                        {ART_LABEL[a.art] ?? a.art}
                        {a.paket ? ` · ${PAKET_NAMEN[a.paket as PaketId]}` : ""}
                      </span>
                      <span className="text-xs text-muted">{datumZeit(a.created_at)}</span>
                    </p>
                    <p className="mt-2 font-semibold text-ink">{a.firma || a.name}</p>
                    <p className="text-sm text-muted">
                      {[a.firma ? a.name : null, a.branche].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 break-all text-sm text-ink">
                      {[a.email, a.telefon].filter(Boolean).join(" · ")}
                    </p>
                    {a.wuensche ? <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{a.wuensche}</p> : null}
                  </div>
                </div>
                <div className="mt-3 border-t border-line pt-3">
                  {a.lead_id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm text-muted">
                        Zugeteilt an{" "}
                        <strong className="text-ink">{name(a.leads?.besitzer_id ?? null)}</strong>
                      </p>
                      <Link href={`/crm/leads/${a.lead_id}`} className={buttonClass("ghost")}>
                        Zum Lead
                      </Link>
                    </div>
                  ) : (
                    <form action={anfrageUebernehmen} className="flex flex-col gap-2 sm:flex-row">
                      <input type="hidden" name="id" value={a.id} />
                      <label className="text-sm font-semibold text-ink sm:sr-only" htmlFor={`besitzer-${a.id}`}>
                        Zuteilen an
                      </label>
                      <Select id={`besitzer-${a.id}`} name="besitzer" defaultValue={adminId} className="sm:max-w-xs">
                        {personen.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name.trim() || p.email}
                            {p.rolle === "admin" ? " (Gründer)" : ""}
                          </option>
                        ))}
                      </Select>
                      <button className={buttonClass("primary")}>Zuteilen</button>
                    </form>
                  )}
                </div>
              </Karte>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
async function Deals({ personen, name }: { personen: Person[]; name: (id: string | null) => string }) {
  const supabase = await createClient();
  const [{ data: dealsRoh }, { data: leads }] = await Promise.all([
    supabase
      .from("deals")
      .select(
        "id, lead_id, partner_id, paket, betrag, status, aenderungsrunden_inkl, aenderungsrunden_genutzt, voll_bezahlt_am, created_at, leads(firma)",
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("leads")
      .select("id, firma, besitzer_id")
      .not("status", "in", "(nicht_anrufen,kein_interesse)")
      .order("updated_at", { ascending: false })
      .limit(500),
  ]);
  const deals = (dealsRoh ?? []) as unknown as {
    id: string;
    lead_id: string | null;
    partner_id: string | null;
    paket: PaketId;
    betrag: number;
    status: string;
    aenderungsrunden_inkl: number;
    aenderungsrunden_genutzt: number;
    voll_bezahlt_am: string | null;
    created_at: string;
    leads: { firma: string } | null;
  }[];

  return (
    <section className="space-y-6">
      <details className="group rounded-xl border border-line bg-surface">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
          Deal anlegen
          <span aria-hidden className="text-xl text-brand group-open:rotate-45">+</span>
        </summary>
        <form action={dealAnlegen} className="grid gap-3 border-t border-line p-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-semibold text-ink">
            Lead
            <Select name="lead_id" defaultValue="">
              <option value="">– ohne Lead –</option>
              {(leads ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.firma}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-ink">
            Partner (Verkäufer)
            <Select name="partner_id" defaultValue="">
              <option value="">Ich selbst</option>
              {personen.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.trim() || p.email}
                  {p.rolle === "admin" ? " (Gründer)" : ""}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-ink">
            Paket
            <Select name="paket" defaultValue="business">
              {PAKETE.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.ab ? "ab " : ""}
                  {p.preisText})
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-ink">
            Betrag (€)
            <input name="betrag" inputMode="decimal" placeholder="leer = Paketpreis" className={inputClass} />
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-ink">
            Status
            <Select name="status" defaultValue="offen">
              {Object.entries(DEAL_STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-ink">
            Notiz
            <input name="notiz" className={inputClass} />
          </label>
          <div className="sm:col-span-2">
            <button className={buttonClass("primary", "w-full sm:w-auto")}>Deal anlegen</button>
          </div>
        </form>
      </details>

      {deals.length === 0 ? (
        <Karte className="px-5 py-10 text-center text-muted">Noch keine Deals.</Karte>
      ) : (
        <ul className="space-y-3">
          {deals.map((d) => {
            const bezahlt = d.status === "voll_bezahlt";
            return (
              <li key={d.id}>
                <Karte className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">
                        {d.lead_id ? (
                          <Link href={`/crm/leads/${d.lead_id}`} className="inline-flex min-h-11 items-center hover:text-brand">
                            {d.leads?.firma ?? "Lead"}
                          </Link>
                        ) : (
                          "Ohne Lead"
                        )}
                      </p>
                      <p className="text-sm text-muted">
                        {PAKET_NAMEN[d.paket]} · {name(d.partner_id)} · {datum(d.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-xl font-semibold text-ink">{euro(d.betrag)}</p>
                      <p className={`text-sm font-semibold ${bezahlt ? "text-ok" : "text-muted"}`}>
                        {DEAL_STATUS_LABEL[d.status]}
                        {bezahlt && d.voll_bezahlt_am ? ` am ${datum(d.voll_bezahlt_am)}` : ""}
                      </p>
                    </div>
                  </div>

                  <form action={dealAktualisieren} className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 sm:grid-cols-5">
                    <input type="hidden" name="id" value={d.id} />
                    <label className="col-span-2 space-y-1 text-xs font-semibold text-muted sm:col-span-1">
                      Status
                      <Select name="status" defaultValue={d.status} disabled={bezahlt}>
                        {Object.entries(DEAL_STATUS_LABEL)
                          .filter(([k]) => k !== "voll_bezahlt" || bezahlt)
                          .map(([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          ))}
                      </Select>
                      {bezahlt ? <input type="hidden" name="status" value="voll_bezahlt" /> : null}
                    </label>
                    <label className="col-span-2 space-y-1 text-xs font-semibold text-muted sm:col-span-1">
                      Betrag (€)
                      <input
                        name="betrag"
                        inputMode="decimal"
                        defaultValue={String(d.betrag)}
                        disabled={bezahlt}
                        className={inputClass}
                      />
                    </label>
                    <label className="space-y-1 text-xs font-semibold text-muted">
                      Runden inkl.
                      <input
                        name="aenderungsrunden_inkl"
                        type="number"
                        min={0}
                        defaultValue={d.aenderungsrunden_inkl}
                        className={inputClass}
                      />
                    </label>
                    <label className="space-y-1 text-xs font-semibold text-muted">
                      Runden genutzt
                      <input
                        name="aenderungsrunden_genutzt"
                        type="number"
                        min={0}
                        defaultValue={d.aenderungsrunden_genutzt}
                        className={`${inputClass} ${d.aenderungsrunden_genutzt > d.aenderungsrunden_inkl ? "border-danger text-danger" : ""}`}
                      />
                    </label>
                    <div className="col-span-2 flex items-end sm:col-span-1">
                      <button className={buttonClass("secondary", "w-full")}>Speichern</button>
                    </div>
                  </form>

                  {!bezahlt && d.status !== "storniert" ? (
                    <form action={dealVollBezahlt} className="mt-2">
                      <input type="hidden" name="id" value={d.id} />
                      <BestaetigenButton
                        frage={`Deal über ${euro(d.betrag)} auf „voll bezahlt“ setzen? Dabei werden die Provisionen angelegt. Das lässt sich nicht rückgängig machen.`}
                        className="w-full sm:w-auto"
                      >
                        Voll bezahlt setzen
                      </BestaetigenButton>
                    </form>
                  ) : null}
                </Karte>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
async function Provisionen({ name }: { name: (id: string | null) => string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("provisionen")
    .select("id, deal_id, empfaenger_id, verkaeufer_id, ebene, prozent, betrag, paket, ausbezahlt, ausbezahlt_am, created_at")
    .order("ausbezahlt")
    .order("created_at", { ascending: false })
    .limit(500);
  const prov = data ?? [];
  const offen = prov.filter((p) => !p.ausbezahlt);

  // Offene Summen je Empfänger
  const proEmpfaenger = new Map<string, { summe: number; ids: string[] }>();
  for (const p of offen) {
    const e = proEmpfaenger.get(p.empfaenger_id) ?? { summe: 0, ids: [] };
    e.summe += Number(p.betrag);
    e.ids.push(p.id);
    proEmpfaenger.set(p.empfaenger_id, e);
  }

  return (
    <section className="space-y-6">
      <Karte>
        <h2 className="border-b border-line px-4 py-3 font-bold text-ink sm:px-5">Offen je Partner</h2>
        {proEmpfaenger.size === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">Keine offenen Provisionen.</p>
        ) : (
          <ul className="divide-y divide-line">
            {[...proEmpfaenger.entries()].map(([id, e]) => (
              <li key={id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span>
                  <span className="block font-semibold text-ink">{name(id)}</span>
                  <span className="block text-sm text-muted">
                    {e.ids.length} offen · {euro(e.summe)}
                  </span>
                </span>
                <form action={provisionAusbezahlt}>
                  {e.ids.map((pid) => (
                    <input key={pid} type="hidden" name="id" value={pid} />
                  ))}
                  <BestaetigenButton
                    frage={`${euro(e.summe)} an ${name(id)} als ausbezahlt markieren?`}
                    variante="secondary"
                    className="w-full sm:w-auto"
                  >
                    Alle als ausbezahlt markieren
                  </BestaetigenButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Karte>

      <Karte className="overflow-hidden">
        <h2 className="border-b border-line px-4 py-3 font-bold text-ink sm:px-5">Alle Provisionen</h2>
        {prov.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">Noch keine Provisionen. Sie entstehen, wenn ein Deal voll bezahlt ist.</p>
        ) : (
          <ul className="divide-y divide-line">
            {prov.map((p) => (
              <li key={p.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">
                    {name(p.empfaenger_id)} · {euro(p.betrag)}
                  </span>
                  <span className="block text-sm text-muted">
                    Ebene {p.ebene} ({Number(p.prozent)} %) · {PAKET_NAMEN[p.paket as PaketId]} · verkauft von{" "}
                    {name(p.verkaeufer_id)} · {datum(p.created_at)}
                  </span>
                </span>
                {p.ausbezahlt ? (
                  <span className="text-sm font-semibold text-ok">Ausbezahlt am {datum(p.ausbezahlt_am)}</span>
                ) : (
                  <form action={provisionAusbezahlt}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className={buttonClass("ghost", "w-full sm:w-auto")}>Als ausbezahlt markieren</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </Karte>
    </section>
  );
}

// ---------------------------------------------------------------------------
async function Gewinn() {
  const { monate, gruender } = await gewinnProMonat();
  const anzahl = Math.max(gruender.length, 1);
  const gesamt = monate.reduce(
    (s, m) => ({ umsatz: s.umsatz + m.umsatz, provisionen: s.provisionen + m.provisionen, topf: s.topf + m.topf }),
    { umsatz: 0, provisionen: 0, topf: 0 },
  );

  return (
    <section className="space-y-6">
      <p className="text-muted">
        Gründer-Topf = Umsatz der voll bezahlten Deals minus Partner-Provisionen. Er wird gleich auf alle aktiven
        Gründer aufgeteilt ({gruender.length}: {gruender.map((g) => g.name.trim() || g.email).join(", ")}).
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Karte className="p-5">
          <p className="text-sm font-semibold text-muted">Umsatz gesamt</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-ink">{euro(gesamt.umsatz)}</p>
        </Karte>
        <Karte className="p-5">
          <p className="text-sm font-semibold text-muted">Gründer-Topf gesamt</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-ink">{euro(gesamt.topf)}</p>
          <p className="text-sm text-muted">nach {euro(gesamt.provisionen)} Provisionen</p>
        </Karte>
        <Karte className="border-2 border-brand p-5">
          <p className="text-sm font-semibold text-muted">Anteil je Gründer</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-brand">{euro(gesamt.topf / anzahl)}</p>
          <p className="text-sm text-muted">bei {gruender.length} Gründern</p>
        </Karte>
      </div>

      <Karte className="overflow-hidden">
        <h2 className="border-b border-line px-4 py-3 font-bold text-ink sm:px-5">Nach Monat</h2>
        {monate.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">Noch keine voll bezahlten Deals.</p>
        ) : (
          <ul className="divide-y divide-line">
            {monate.map((m) => (
              <li key={m.schluessel} className="grid gap-1 px-4 py-3 sm:grid-cols-[1.2fr_1fr_1fr_1fr_1fr] sm:items-center sm:px-5">
                <span className="font-semibold text-ink">{m.label}</span>
                <span className="text-sm text-muted">
                  {m.deals} {m.deals === 1 ? "Deal" : "Deals"} · {euro(m.umsatz)}
                </span>
                <span className="text-sm text-muted">− {euro(m.provisionen)} Provision</span>
                <span className="text-sm text-ink">Topf {euro(m.topf)}</span>
                <span className="font-semibold text-brand sm:text-right">{euro(m.topf / anzahl)} je Gründer</span>
              </li>
            ))}
          </ul>
        )}
      </Karte>
      <p className="text-sm text-muted">
        Hinweis: Der Anteil wird mit der aktuellen Zahl aktiver Gründer berechnet. Steuern und laufende Kosten sind
        nicht abgezogen.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
function Team({ personen, ichId, name }: { personen: Person[]; ichId: string; name: (id: string | null) => string }) {
  const gruender = personen.filter((p) => p.rolle === "admin");
  const partner = personen.filter((p) => p.rolle !== "admin");

  const Zeile = ({ p }: { p: Person }) => (
    <li className={`px-4 py-4 sm:px-5 ${p.aktiv ? "" : "opacity-60"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-ink">
            {p.name.trim() || <span className="text-muted">Ohne Namen</span>}
            {p.id === ichId ? <span className="ml-2 text-xs font-normal text-muted">(du)</span> : null}
          </p>
          <p className="break-all text-sm text-muted">{p.email}</p>
          <p className="text-sm text-muted">
            {p.rolle === "admin" ? "Gründer" : `Partner · eingeladen von ${name(p.upline_id)}`} · seit {datum(p.created_at)}
            {p.aktiv ? "" : " · deaktiviert"}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <form action={nameSetzen} className="flex gap-2">
          <input type="hidden" name="id" value={p.id} />
          <label className="sr-only" htmlFor={`name-${p.id}`}>
            Name
          </label>
          <input id={`name-${p.id}`} name="name" defaultValue={p.name} placeholder="Name" className={`${inputClass} sm:w-48`} />
          <button className={buttonClass("secondary", "shrink-0")}>Speichern</button>
        </form>
        {p.id !== ichId ? (
          <>
            <form action={rolleSetzen}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="rolle" value={p.rolle === "admin" ? "partner" : "admin"} />
              <BestaetigenButton
                frage={
                  p.rolle === "admin"
                    ? `${p.name || p.email} zum Partner machen? Er/sie verliert die Admin-Rechte und den Gründer-Anteil.`
                    : `${p.name || p.email} zum Gründer machen? Volle Admin-Rechte, Anteil am Gründer-Topf, keine persönlichen Provisionen mehr.`
                }
                variante="secondary"
                className="w-full sm:w-auto"
              >
                {p.rolle === "admin" ? "Zum Partner machen" : "Zum Gründer machen"}
              </BestaetigenButton>
            </form>
            <form action={aktivSetzen}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="aktiv" value={p.aktiv ? "false" : "true"} />
              <BestaetigenButton
                frage={p.aktiv ? `${p.name || p.email} deaktivieren? Kein Login mehr möglich.` : `${p.name || p.email} wieder aktivieren?`}
                variante={p.aktiv ? "danger" : "secondary"}
                className="w-full sm:w-auto"
              >
                {p.aktiv ? "Deaktivieren" : "Aktivieren"}
              </BestaetigenButton>
            </form>
          </>
        ) : null}
      </div>
    </li>
  );

  return (
    <section className="space-y-6">
      <Karte className="p-5">
        <h2 className="font-bold text-ink">So kommen neue Leute ins Team</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-muted">
          <li>
            Unter <Link href="/crm/profil" className="text-brand underline">Mein Profil</Link> deinen Einladungslink kopieren
            und schicken (WhatsApp, E-Mail …).
          </li>
          <li>Die Person registriert sich darüber mit Name, E-Mail und Passwort.</li>
          <li>Sie ist danach automatisch Partner in deinem Team und kann sich unter /login anmelden.</li>
          <li>Mitgründer: hier unten bei der Person auf „Zum Gründer machen“ tippen.</li>
        </ol>
      </Karte>

      <Karte className="overflow-hidden">
        <h2 className="border-b border-line px-4 py-3 font-bold text-ink sm:px-5">Gründer ({gruender.length})</h2>
        <ul className="divide-y divide-line">
          {gruender.map((p) => (
            <Zeile key={p.id} p={p} />
          ))}
        </ul>
      </Karte>

      <Karte className="overflow-hidden">
        <h2 className="border-b border-line px-4 py-3 font-bold text-ink sm:px-5">Partner ({partner.length})</h2>
        {partner.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">Noch keine Partner. Teile deinen Einladungslink.</p>
        ) : (
          <ul className="divide-y divide-line">
            {partner.map((p) => (
              <Zeile key={p.id} p={p} />
            ))}
          </ul>
        )}
      </Karte>
    </section>
  );
}

// ---------------------------------------------------------------------------
function Export() {
  const exporte = [
    { typ: "leads", label: "Leads" },
    { typ: "anfragen", label: "Anfragen" },
    { typ: "deals", label: "Deals" },
    { typ: "provisionen", label: "Provisionen" },
  ];
  return (
    <section>
      <p className="mb-4 text-muted">CSV mit Semikolon als Trenner – lässt sich direkt in Excel öffnen.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {exporte.map((e) => (
          <a key={e.typ} href={`/crm/admin/export?typ=${e.typ}`} className={buttonClass("secondary", "w-full")} download>
            {e.label} exportieren
          </a>
        ))}
      </div>
    </section>
  );
}
