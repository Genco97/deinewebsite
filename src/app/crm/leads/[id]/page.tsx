import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KontaktFormular } from "@/components/crm/KontaktFormular";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { VerkaufFormular } from "@/components/crm/VerkaufFormular";
import { Hinweis, Karte, Textarea, buttonClass, inputClass } from "@/components/ui";
import { holeProfil } from "@/lib/crm";
import { PAKET_NAMEN, type PaketId } from "@/lib/pakete";
import { DEAL_STATUS_LABEL, LEAD_STATUS, STATUS_LABEL, type LeadStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { datumZeit, euro, isoZuWienLokal } from "@/lib/zeit";
import { notizHinzufuegen, rueckrufSetzen, statusSetzen } from "../actions";

export const metadata: Metadata = { title: "Lead" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Abschnitt({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <Karte className="p-4 sm:p-5">
      <h2 className="mb-4 font-bold text-ink">{titel}</h2>
      {children}
    </Karte>
  );
}

export default async function LeadDetail({ params, searchParams }: PageProps<"/crm/leads/[id]">) {
  const { id } = await params;
  const { fehler } = await searchParams;
  if (!UUID.test(id)) notFound();

  const profil = await holeProfil();
  const admin = profil.rolle === "admin";
  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("id, firma, ansprechpartner, branche, telefon, email, adresse, bezirk, status, naechster_rueckruf, quelle, created_at")
    .eq("id", id)
    .maybeSingle();
  // RLS: fremde Leads liefern keine Zeile → 404
  if (!lead) notFound();

  const [{ data: verlauf }, { data: deals }] = await Promise.all([
    supabase
      .from("lead_verlauf")
      .select("id, art, text, created_at, autor:profiles!lead_verlauf_autor_id_fkey(name)")
      .eq("lead_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("deals").select("id, paket, betrag, status, created_at").eq("lead_id", id).order("created_at"),
  ]);

  const status = lead.status as LeadStatus;
  const gesperrt = status === "nicht_anrufen";
  // Telefonnummer bei „nicht anrufen“ gar nicht erst an den Browser schicken
  const kontakt = { ...lead, telefon: gesperrt ? null : lead.telefon };
  const statusButtons = LEAD_STATUS.filter((s) => s !== "verkauft");

  return (
    <>
      <Link href="/crm/leads" className="mb-3 inline-flex min-h-11 items-center text-sm text-brand hover:underline">
        ← Alle Leads
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{lead.firma}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-muted">
            <StatusBadge status={status} />
            {[lead.branche, lead.bezirk].filter(Boolean).join(" · ")}
          </p>
        </div>
        {!gesperrt && lead.telefon ? (
          <a href={`tel:${lead.telefon.replace(/[^+0-9]/g, "")}`} className={buttonClass("primary")}>
            Anrufen: {lead.telefon}
          </a>
        ) : null}
      </div>

      {typeof fehler === "string" ? (
        <div className="mb-4">
          <Hinweis art="fehler">{fehler}</Hinweis>
        </div>
      ) : null}

      {gesperrt ? (
        <div className="mb-4">
          <Hinweis art="fehler">
            <strong>Nicht anrufen.</strong> Die Telefonnummer ist ausgeblendet.{" "}
            {admin ? "Als Admin kannst du die Sperre aufheben." : "Nur ein Admin kann das zurücksetzen."}
          </Hinweis>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Abschnitt titel="Status">
            {gesperrt && !admin ? (
              <p className="text-sm text-muted">Der Status ist gesperrt.</p>
            ) : gesperrt && admin ? (
              <form action={statusSetzen}>
                <input type="hidden" name="id" value={lead.id} />
                <input type="hidden" name="status" value="neu" />
                <button className={buttonClass("danger")}>Sperre aufheben (Status „Neu“)</button>
              </form>
            ) : (
              <div className="flex flex-wrap gap-2">
                {statusButtons.map((s) => (
                  <form key={s} action={statusSetzen}>
                    <input type="hidden" name="id" value={lead.id} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      aria-pressed={s === status}
                      className={`min-h-11 rounded-lg border px-3 text-sm font-semibold ${
                        s === status
                          ? "border-brand bg-brand text-white"
                          : s === "nicht_anrufen"
                            ? "border-danger/30 text-danger hover:bg-danger-light"
                            : "border-line text-ink hover:border-brand hover:text-brand"
                      }`}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  </form>
                ))}
              </div>
            )}
          </Abschnitt>

          {!gesperrt ? (
            <Abschnitt titel="Nächster Rückruf">
              <form action={rueckrufSetzen} className="space-y-3">
                <input type="hidden" name="id" value={lead.id} />
                <label htmlFor="rueckruf" className="sr-only">
                  Datum und Uhrzeit
                </label>
                <input
                  id="rueckruf"
                  name="rueckruf"
                  type="datetime-local"
                  defaultValue={isoZuWienLokal(lead.naechster_rueckruf)}
                  className={inputClass}
                />
                <label className="flex min-h-11 items-center gap-3 text-sm text-muted">
                  <input type="checkbox" name="als_rueckruf" defaultChecked className="h-5 w-5 accent-brand" />
                  Status auf „Rückruf“ setzen
                </label>
                <div className="flex flex-wrap gap-2">
                  <button className={buttonClass("primary")}>Rückruf speichern</button>
                </div>
              </form>
              {lead.naechster_rueckruf ? (
                <form action={rueckrufSetzen} className="mt-2">
                  <input type="hidden" name="id" value={lead.id} />
                  <input type="hidden" name="rueckruf" value="" />
                  <button className={buttonClass("ghost")}>Rückruf entfernen</button>
                </form>
              ) : null}
            </Abschnitt>
          ) : null}

          <Abschnitt titel="Notizen und Verlauf">
            <form action={notizHinzufuegen} className="space-y-2">
              <input type="hidden" name="id" value={lead.id} />
              <label htmlFor="notiz" className="sr-only">
                Neue Notiz
              </label>
              <Textarea name="notiz" rows={3} placeholder="Was wurde besprochen?" required />
              <button className={buttonClass("secondary")}>Notiz speichern</button>
            </form>
            <ol className="mt-5 space-y-4 border-l-2 border-line pl-4">
              {(verlauf ?? []).map((v) => {
                const autor = (v.autor as unknown as { name: string } | null)?.name;
                return (
                  <li key={v.id} className="relative">
                    <span
                      aria-hidden
                      className={`absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-surface ${
                        v.art === "notiz" ? "bg-brand" : "bg-line"
                      }`}
                    />
                    <p className={`whitespace-pre-wrap ${v.art === "notiz" ? "text-ink" : "text-sm text-muted"}`}>{v.text}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {datumZeit(v.created_at)}
                      {autor ? ` · ${autor}` : ""}
                    </p>
                  </li>
                );
              })}
              <li className="relative">
                <span aria-hidden className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-surface bg-line" />
                <p className="text-sm text-muted">Lead angelegt ({lead.quelle})</p>
                <p className="mt-0.5 text-xs text-muted">{datumZeit(lead.created_at)}</p>
              </li>
            </ol>
          </Abschnitt>
        </div>

        <div className="space-y-6">
          <Abschnitt titel="Kontakt">
            <KontaktFormular lead={kontakt} telefonSperre={gesperrt} />
          </Abschnitt>

          <Abschnitt titel="Verkauf">
            {(deals ?? []).length > 0 ? (
              <ul className="mb-4 divide-y divide-line rounded-lg border border-line">
                {(deals ?? []).map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                    <span>
                      <span className="font-semibold text-ink">{PAKET_NAMEN[d.paket as PaketId]}</span>{" "}
                      <span className="text-muted">· {DEAL_STATUS_LABEL[d.status]}</span>
                    </span>
                    <span className="font-semibold">{euro(d.betrag)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {gesperrt ? (
              <p className="text-sm text-muted">Für gesperrte Leads kann kein Verkauf gemeldet werden.</p>
            ) : (
              <VerkaufFormular leadId={lead.id} />
            )}
          </Abschnitt>
        </div>
      </div>
    </>
  );
}
