import type { Metadata } from "next";
import Link from "next/link";
import { AnrufModus, type AnrufLead } from "@/components/crm/AnrufModus";
import { Kopf } from "@/components/crm/Kopf";
import { Karte, buttonClass } from "@/components/ui";
import { anzeigename, holeProfil } from "@/lib/crm";
import { createClient } from "@/lib/supabase/server";
import { wienGrenzen } from "@/lib/zeit";

export const metadata: Metadata = { title: "Anruf-Modus" };

const AKTIV = ["neu", "nicht_erreicht", "rueckruf", "interessiert", "demo", "angebot"];
const KONTAKT_ARTEN = ["notiz", "status", "rueckruf", "besuch", "verkauf"];

type Roh = Omit<AnrufLead, "notizen" | "grund"> & { created_at: string };

export default async function Anrufen() {
  const profil = await holeProfil();
  const supabase = await createClient();
  const { tagStart, tagEnde } = wienGrenzen();

  const [leadsRes, heuteRes, ohneRes] = await Promise.all([
    // Nur Leads mit Einwilligung – Werbeanrufe ohne Einwilligung sind in Österreich verboten (§ 174 TKG)
    supabase
      .from("leads")
      .select("id, firma, ansprechpartner, branche, telefon, adresse, bezirk, status, naechster_rueckruf, created_at")
      .eq("besitzer_id", profil.id)
      .not("einwilligung_wie", "is", null)
      .not("telefon", "is", null)
      .in("status", AKTIV)
      .limit(500),
    supabase
      .from("lead_verlauf")
      .select("lead_id")
      .eq("autor_id", profil.id)
      .in("art", KONTAKT_ARTEN)
      .not("text", "like", "Aus dem CSV-Import%")
      .gte("created_at", tagStart)
      .limit(1000),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("besitzer_id", profil.id)
      .is("einwilligung_wie", null)
      .in("status", AKTIV),
  ]);

  // Reihenfolge: fällige Rückrufe (älteste zuerst), dann neue Leads, dann „nicht erreicht“ ohne Termin
  const alle = (leadsRes.data ?? []) as Roh[];
  const faellig = alle.filter((l) => l.naechster_rueckruf && l.naechster_rueckruf < tagEnde).sort((a, b) => a.naechster_rueckruf!.localeCompare(b.naechster_rueckruf!));
  const neu = alle.filter((l) => !l.naechster_rueckruf && l.status === "neu").sort((a, b) => a.created_at.localeCompare(b.created_at));
  const wieder = alle.filter((l) => !l.naechster_rueckruf && l.status === "nicht_erreicht");
  const reihe = [...faellig, ...neu, ...wieder].slice(0, 100);

  const notizen = new Map<string, { text: string; created_at: string }[]>();
  if (reihe.length) {
    const { data } = await supabase
      .from("lead_verlauf")
      .select("lead_id, text, created_at")
      .in("lead_id", reihe.map((l) => l.id))
      .in("art", ["notiz", "besuch"])
      .order("created_at", { ascending: false })
      .limit(400);
    for (const n of (data ?? []) as { lead_id: string; text: string; created_at: string }[]) {
      const liste = notizen.get(n.lead_id) ?? [];
      if (liste.length < 2) liste.push({ text: n.text, created_at: n.created_at });
      notizen.set(n.lead_id, liste);
    }
  }

  const leads: AnrufLead[] = reihe.map((l) => ({
    ...l,
    grund: faellig.includes(l) ? "rueckruf" : l.status === "neu" ? "neu" : "wieder",
    notizen: notizen.get(l.id) ?? [],
  }));
  const heuteKontakte = new Set(((heuteRes.data ?? []) as { lead_id: string }[]).map((z) => z.lead_id)).size;
  const ohne = ohneRes.count ?? 0;

  if (leads.length === 0) {
    return (
      <>
        <Kopf titel="Anruf-Modus" text="Ein Lead nach dem anderen – ohne Suchen und Klicken." />
        <Karte className="max-w-2xl p-6">
          <p className="text-4xl" aria-hidden>
            ☕
          </p>
          <h2 className="mt-3 text-xl font-bold text-ink">Gerade ist niemand zum Anrufen da.</h2>
          <p className="mt-2 text-muted">
            Hier landen nur Leads mit Einwilligung zum Anruf – ohne Einwilligung sind Werbeanrufe in Österreich auch bei Firmen
            verboten (§ 174 TKG).
            {ohne > 0 ? ` Du hast ${ohne} Leads ohne Einwilligung: Schau persönlich vorbei oder schick eine Rückmeldekarte – sagt der Betrieb Ja, taucht er hier auf.` : ""}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link href="/crm/besuche" className={buttonClass("primary")}>
              Besuche planen
            </Link>
            <Link href="/crm/postkarten" className={buttonClass("secondary")}>
              Rückmeldekarten
            </Link>
          </div>
        </Karte>
      </>
    );
  }

  return <AnrufModus leads={leads} tagesziel={profil.tagesziel} heuteKontakte={heuteKontakte} meinName={anzeigename(profil)} ohneEinwilligung={ohne} />;
}
