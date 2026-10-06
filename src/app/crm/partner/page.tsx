import { ProvisionsRechner } from "@/components/crm/ProvisionsRechner";
import type { Metadata } from "next";
import { Kopf } from "@/components/crm/Kopf";
import { KopierFeld } from "@/components/crm/KopierFeld";
import { Karte, buttonClass } from "@/components/ui";
import { holeProfil } from "@/lib/crm";
import { PAKET_NAMEN, type PaketId } from "@/lib/pakete";
import { DEAL_STATUS_LABEL } from "@/lib/status";
import { gewinnProMonat } from "@/lib/gewinn";
import { createClient } from "@/lib/supabase/server";
import { datum, euro } from "@/lib/zeit";

export const metadata: Metadata = { title: "Partner & Provision" };

const EBENEN = [
  { ebene: 1, prozent: 20, titel: "Ebene 1", text: "Deine eigenen Verkäufe" },
  { ebene: 2, prozent: 5, titel: "Ebene 2", text: "Verkäufe von Partnern, die du eingeladen hast" },
  { ebene: 3, prozent: 2, titel: "Ebene 3", text: "Verkäufe von deren eingeladenen Partnern" },
];

type Provision = {
  id: string;
  ebene: number;
  prozent: number;
  betrag: number;
  paket: PaketId;
  ausbezahlt: boolean;
  ausbezahlt_am: string | null;
  created_at: string;
};

type TeamMitglied = { id: string; name: string; upline_id: string | null; created_at: string };

export default async function Partner() {
  const profil = await holeProfil();
  const supabase = await createClient();

  const [{ data: prov }, { data: team }, { data: deals }] = await Promise.all([
    supabase
      .from("provisionen")
      .select("id, ebene, prozent, betrag, paket, ausbezahlt, ausbezahlt_am, created_at")
      .eq("empfaenger_id", profil.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, name, upline_id, created_at").neq("id", profil.id).order("created_at"),
    supabase
      .from("deals")
      .select("id, paket, betrag, status, created_at, leads(firma)")
      .eq("partner_id", profil.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const provisionen = (prov ?? []) as Provision[];
  const summe = (f: (p: Provision) => boolean) => provisionen.filter(f).reduce((s, p) => s + Number(p.betrag), 0);
  const offen = summe((p) => !p.ausbezahlt);
  const ausbezahlt = summe((p) => p.ausbezahlt);

  // Team: direkt eingeladen (bringt dir Provision der Ebene 2) und deren Eingeladene (Ebene 3).
  // Admins sehen per RLS alle Profile – hier zählt aber nur das eigene Team.
  const alle = (team ?? []) as TeamMitglied[];
  const direkt = alle.filter((t) => t.upline_id === profil.id);
  const direktIds = new Set(direkt.map((d) => d.id));
  const indirekt = alle.filter((t) => t.upline_id && direktIds.has(t.upline_id));
  const nameVon = (id: string | null) => alle.find((a) => a.id === id)?.name ?? "";

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const link = `${site.replace(/\/$/, "")}/registrieren?code=${profil.einladungscode}`;
  const gruender = profil.rolle === "admin";
  const gewinn = gruender ? await gewinnProMonat() : null;
  const anzahlGruender = Math.max(gewinn?.gruender.length ?? 1, 1);
  const topfGesamt = gewinn?.monate.reduce((s, m) => s + m.topf, 0) ?? 0;
  const topfMonat = gewinn?.monate[0]?.topf ?? 0;
  const meineDeals = (deals ?? []) as unknown as {
    id: string;
    paket: PaketId;
    betrag: number;
    status: string;
    created_at: string;
    leads: { firma: string } | null;
  }[];

  return (
    <>
      <Kopf
        titel="Partner & Provision"
        text={
          gruender
            ? "Dein Gründer-Anteil, dein Einladungslink und dein Team."
            : "Deine Provisionen, dein Einladungslink und dein Team."
        }
      />

      {gruender ? (
        <Karte className="mb-6 border-2 border-brand p-5">
          <p className="text-sm font-semibold text-muted">Dein Gründer-Anteil</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-brand">{euro(topfGesamt / anzahlGruender)}</p>
          <p className="mt-1 text-sm text-muted">
            Insgesamt, bei {gewinn?.gruender.length ?? 0} Gründern
            {gewinn?.monate[0] ? ` · ${gewinn.monate[0].label}: ${euro(topfMonat / anzahlGruender)}` : ""}.
          </p>
          <p className="mt-3 text-sm text-muted">
            Als Gründer bekommst du keine persönlichen Provisionen. Alles, was nach den Partner-Provisionen übrig
            bleibt, wird gleich unter den Gründern aufgeteilt. Details unter Admin → Gewinn.
          </p>
        </Karte>
      ) : null}

      {gruender ? (
        <>
      <Karte className="p-5">
        <h2 className="font-bold text-ink">So verdienen eure Partner</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {EBENEN.map((e) => (
            <li key={e.ebene} className="flex items-baseline justify-between gap-4 border-b border-line pb-2 last:border-0">
              <span className="text-muted">
                <span className="font-semibold text-ink">{e.titel}:</span>{" "}
                {e.ebene === 1
                  ? "auf die eigenen Verkäufe"
                  : e.ebene === 2
                    ? "auf Verkäufe der Partner, die er/sie eingeladen hat"
                    : "auf Verkäufe von deren eingeladenen Partnern"}
              </span>
              <span className="shrink-0 font-serif text-xl font-semibold text-brand">{e.prozent} %</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Wäre eine dieser Ebenen ein Gründer, entsteht dort keine Provision – der Betrag bleibt im Gründer-Topf.
        </p>
      </Karte>

      <div className="mt-6">
        <ProvisionsRechner gruender />
      </div>

        </>
      ) : (
        <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Karte className="p-5">
          <p className="text-sm font-semibold text-muted">Offen</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-ink">{euro(offen)}</p>
          <p className="mt-1 text-sm text-muted">Noch nicht ausbezahlt</p>
        </Karte>
        <Karte className="p-5">
          <p className="text-sm font-semibold text-muted">Ausbezahlt</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-ink">{euro(ausbezahlt)}</p>
          <p className="mt-1 text-sm text-muted">Bisher insgesamt</p>
        </Karte>
      </div>

      <div className="mt-6">
        <ProvisionsRechner gruender={false} />
      </div>

      <h2 className="mb-3 mt-8 font-bold text-ink">Provision nach Ebene</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {EBENEN.map((e) => {
          const liste = provisionen.filter((p) => p.ebene === e.ebene);
          return (
            <Karte key={e.ebene} className="p-5">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-ink">{e.titel}</p>
                <p className="font-serif text-2xl font-semibold text-brand">{e.prozent} %</p>
              </div>
              <p className="mt-1 text-sm text-muted">{e.text}</p>
              <p className="mt-4 flex justify-between border-t border-line pt-3 text-sm">
                <span className="text-muted">{liste.length} {liste.length === 1 ? "Provision" : "Provisionen"}</span>
                <span className="font-semibold text-ink">{euro(liste.reduce((s, p) => s + Number(p.betrag), 0))}</span>
              </p>
            </Karte>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-muted">
        Provisionen entstehen automatisch, sobald ein Gründer den Verkauf als voll bezahlt markiert. Ist die Person
        über dir ein Gründer, bleibt ihr Anteil im Gründer-Topf.
      </p>

        </>
      )}

      <Karte className="mt-8 p-5">
        <h2 className="font-bold text-ink">Dein Einladungslink</h2>
        <p className="mb-3 mt-1 text-sm text-muted">
          {gruender
            ? "Wer sich über diesen Link registriert, wird Partner in deinem Team und bekommt 20 % auf die eigenen Verkäufe. Die 5 % für die einladende Person gehen bei Gründern in den Gründer-Topf."
            : "Wer sich über diesen Link registriert, kommt in dein Team. Die Person bekommt 20 % auf ihre eigenen Verkäufe – und du zusätzlich 5 % vom Verkaufsbetrag."}
        </p>
        <KopierFeld wert={link} label="Einladungslink" />
      </Karte>

      <Karte className="mt-6 p-5">
        <h2 className="font-bold text-ink">Flyer zum Ausdrucken</h2>
        <p className="mb-3 mt-1 text-sm text-muted">
          A5, beidseitig, mit QR-Code zur Gratis-Demo. Trag auf der Rückseite deinen Namen und deine Telefonnummer ein
          und gib den Flyer beim Besuch persönlich ab – ruft der Betrieb dich dann an, ist das erlaubt.
        </p>
        <a href="/flyer-ursprung-a5.pdf" download className={buttonClass("secondary")}>
          Flyer herunterladen (PDF)
        </a>
      </Karte>

      <div className={`mt-8 grid gap-6 ${gruender ? "" : "lg:grid-cols-2"}`}>
        <Karte>
          <h2 className="border-b border-line px-5 py-3 font-bold text-ink">Dein Team</h2>
          {direkt.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted">Noch niemand im Team. Teile deinen Einladungslink.</p>
          ) : (
            <ul className="divide-y divide-line">
              {[...direkt.map((d) => ({ ...d, ebene: 2 })), ...indirekt.map((d) => ({ ...d, ebene: 3 }))].map((t) => (
                <li key={t.id} className="flex min-h-14 items-center justify-between gap-3 px-5 py-3">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink">{t.name.trim() || "Ohne Namen"}</span>
                    <span className="block text-sm text-muted">
                      {t.ebene === 2 ? "Direkt eingeladen" : `Eingeladen von ${nameVon(t.upline_id)}`} · seit{" "}
                      {datum(t.created_at)}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand">
                    {t.ebene === 2 ? "Direkt" : "Indirekt"} · {t.ebene === 2 ? 5 : 2} %{gruender ? " → Gründer-Topf" : " für dich"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Karte>

        {gruender ? null : (
        <Karte>
          <h2 className="border-b border-line px-5 py-3 font-bold text-ink">Deine Provisionen</h2>
          {provisionen.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted">Noch keine Provisionen.</p>
          ) : (
            <ul className="divide-y divide-line">
              {provisionen.map((p) => (
                <li key={p.id} className="flex min-h-14 items-center justify-between gap-3 px-5 py-3">
                  <span>
                    <span className="block font-semibold text-ink">
                      {PAKET_NAMEN[p.paket]} · Ebene {p.ebene} ({Number(p.prozent)} %)
                    </span>
                    <span className="block text-sm text-muted">
                      {datum(p.created_at)} · {p.ausbezahlt ? `ausbezahlt am ${datum(p.ausbezahlt_am)}` : "offen"}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold text-ink">{euro(p.betrag)}</span>
                </li>
              ))}
            </ul>
          )}
        </Karte>
        )}
      </div>

      <Karte className="mt-6">
        <h2 className="border-b border-line px-5 py-3 font-bold text-ink">Deine gemeldeten Verkäufe</h2>
        {meineDeals.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">Noch keine Verkäufe gemeldet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {meineDeals.map((d) => (
              <li key={d.id} className="flex min-h-14 items-center justify-between gap-3 px-5 py-3">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">{d.leads?.firma ?? "–"}</span>
                  <span className="block text-sm text-muted">
                    {PAKET_NAMEN[d.paket]} · {DEAL_STATUS_LABEL[d.status]} · {datum(d.created_at)}
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-ink">{euro(d.betrag)}</span>
              </li>
            ))}
          </ul>
        )}
      </Karte>
    </>
  );
}
