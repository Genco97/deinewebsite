import type { Metadata } from "next";
import Link from "next/link";
import { AlleAuswaehlen } from "@/components/crm/AlleAuswaehlen";
import { Kopf } from "@/components/crm/Kopf";
import { Hinweis, Karte, buttonClass, inputClass } from "@/components/ui";
import { holeProfil } from "@/lib/crm";
import { ABGESCHLOSSEN } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { datum } from "@/lib/zeit";
import { kartenErstellen } from "./actions";

export const metadata: Metadata = { title: "Postkarten" };

type Zeile = {
  id: string;
  firma: string;
  branche: string | null;
  adresse: string | null;
  bezirk: string | null;
  karten_code: string | null;
  karte_am: string | null;
};

export default async function Postkarten({ searchParams }: PageProps<"/crm/postkarten">) {
  await holeProfil();
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 60);
  const alle = sp.alle === "1";
  const fehler = typeof sp.fehler === "string" ? sp.fehler : null;

  const supabase = await createClient();
  let abfrage = supabase
    .from("leads")
    .select("id, firma, branche, adresse, bezirk, karten_code, karte_am")
    .is("einwilligung_wie", null)
    .not("status", "in", `(${ABGESCHLOSSEN.join(",")})`)
    .not("adresse", "is", null)
    .order("bezirk")
    .order("firma")
    .limit(500);
  if (!alle) abfrage = abfrage.is("karte_am", null);
  if (q) {
    const sicher = q.replace(/[,()%*\\:"]/g, " ").trim();
    if (sicher) abfrage = abfrage.or(`bezirk.ilike.%${sicher}%,branche.ilike.%${sicher}%,adresse.ilike.%${sicher}%,firma.ilike.%${sicher}%`);
  }
  const { data } = await abfrage;
  const leads = (data ?? []) as Zeile[];

  return (
    <>
      <Kopf
        titel="Postkarten"
        text="Erstkontakt per Post: Auf jeder Karte steht ein QR-Code. Wer ihn scannt und „Ja, rufen Sie mich an“ bestätigt, hat eingewilligt – dann darfst du anrufen."
      />

      {fehler ? (
        <div className="mb-4">
          <Hinweis art="fehler">{fehler}</Hinweis>
        </div>
      ) : null}

      {/* Erklärung eingeklappt – wer sie kennt, braucht sie nicht jedes Mal */}
      <details className="group mb-4 rounded-xl border border-line bg-surface text-sm text-muted sm:mb-6">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 font-semibold text-ink sm:px-5 [&::-webkit-details-marker]:hidden">
          <span>
            So geht&apos;s: <span className="font-normal text-muted">auswählen → Karten erstellen → drucken → einwerfen</span>
          </span>
          <span aria-hidden className="text-brand transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="space-y-2 border-t border-line px-4 py-3 sm:px-5">
          <p>
            Betriebe auswählen → „Karten erstellen“ → in der Druckansicht drucken (A6, beidseitig) → frankieren und
            einwerfen.
          </p>
          <p>
            Meldet sich ein Betrieb über die Karte, steht die Einwilligung automatisch beim Lead und der Rückruf ist
            sofort bei „Heute“ fällig. Hier erscheinen nur Leads ohne Einwilligung und mit Adresse.
          </p>
        </div>
      </details>

      <form method="get" className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]" role="search">
        <label className="sr-only" htmlFor="q">
          Filter
        </label>
        <input id="q" name="q" type="search" defaultValue={q} placeholder="Bezirk, Branche, Straße …" className={inputClass} />
        <label className="flex min-h-11 items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="alle" value="1" defaultChecked={alle} className="h-5 w-5 accent-brand" />
          auch schon verschickte
        </label>
        <button className={buttonClass("secondary")}>Filtern</button>
      </form>

      {leads.length === 0 ? (
        <Karte className="p-6 text-muted">
          Keine passenden Leads.{" "}
          {!alle ? (
            <Link href={`/crm/postkarten?alle=1${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="text-brand underline">
              Auch schon verschickte zeigen
            </Link>
          ) : null}
        </Karte>
      ) : (
        <form action={kartenErstellen}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted">{leads.length} Betriebe</p>
            <AlleAuswaehlen />
          </div>
          <Karte className="divide-y divide-line">
            {leads.map((l) => (
              <label key={l.id} className="flex min-h-14 cursor-pointer items-start gap-3 px-4 py-3 hover:bg-brand-light/40">
                <input
                  type="checkbox"
                  name="id"
                  value={l.id}
                  defaultChecked={!l.karte_am}
                  className="mt-1 h-5 w-5 shrink-0 accent-brand"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">{l.firma}</span>
                  <span className="block text-sm text-muted">
                    {[l.branche, l.adresse, l.bezirk].filter(Boolean).join(" · ")}
                  </span>
                </span>
                {l.karte_am ? (
                  <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand">
                    Karte {datum(l.karte_am)}
                  </span>
                ) : null}
              </label>
            ))}
          </Karte>
          <div className="sticky bottom-0 mt-4 border-t border-line bg-bg/95 py-3 backdrop-blur">
            <button className={buttonClass("primary", "w-full sm:w-auto")}>Karten erstellen und drucken</button>
          </div>
        </form>
      )}
    </>
  );
}
