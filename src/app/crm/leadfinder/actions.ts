"use server";

import { revalidatePath } from "next/cache";
import { nurAdmin } from "@/lib/crm";
import { SuchFehler, funde, firmaNorm, gebietSuchen, telNorm } from "@/lib/leadfinder";
import { GRUPPEN_NAMEN, type Fund } from "@/lib/leadfinder-gruppen";
import { createClient } from "@/lib/supabase/server";
import { istEmail } from "@/lib/validierung";

export type SuchErgebnis = {
  ok: boolean;
  meldung: string;
  gebiet?: string;
  funde?: Fund[];
  limit?: boolean;
};

/** Telefonnummern und Namen aller Leads im CRM (Gründer sehen alle) */
async function bestehende() {
  const supabase = await createClient();
  const tel = new Set<string>();
  const firmen = new Set<string>();
  for (let von = 0; von < 20_000; von += 1000) {
    const { data } = await supabase.from("leads").select("firma, telefon").range(von, von + 999);
    if (!data || data.length === 0) break;
    for (const l of data) {
      const t = telNorm(l.telefon as string | null);
      const f = firmaNorm(l.firma as string | null);
      if (t) tel.add(t);
      if (f) firmen.add(f);
    }
    if (data.length < 1000) break;
  }
  return { tel, firmen };
}

const istDoppelt = (f: { firma: string; telefon: string }, b: { tel: Set<string>; firmen: Set<string> }) => {
  const t = telNorm(f.telefon);
  const n = firmaNorm(f.firma);
  return (!!t && b.tel.has(t)) || (!!n && b.firmen.has(n));
};

// ---------------------------------------------------------------------------
// Suchen (nur Gründer)
// ---------------------------------------------------------------------------
export async function leadsSuchen(
  ort: string,
  gruppen: string[],
  nurMitTelefon: boolean,
  ohneSocial: boolean,
): Promise<SuchErgebnis> {
  await nurAdmin();
  const suchort = typeof ort === "string" ? ort.trim().slice(0, 100) : "";
  const auswahl = Array.isArray(gruppen) ? gruppen.filter((g) => GRUPPEN_NAMEN.includes(g)) : [];
  if (suchort.length < 2) return { ok: false, meldung: "Bitte gib einen Ort ein, z. B. „Wien“ oder „Neubau, Wien“." };
  if (auswahl.length === 0) return { ok: false, meldung: "Bitte wähle mindestens eine Branche." };

  try {
    const gebiet = await gebietSuchen(suchort);
    if (!gebiet) return { ok: false, meldung: `Zu „${suchort}“ habe ich kein Gebiet gefunden. Probier z. B. „Graz, Österreich“.` };

    const { liste, limit } = await funde(gebiet.areaId, auswahl);
    const b = await bestehende();
    const gesehen = new Set<string>();
    const ergebnis = liste
      .filter((f) => {
        if (nurMitTelefon && !f.telefon) return false;
        if (ohneSocial && f.social) return false;
        const k = `${f.firma}|${f.adresse}`.toLowerCase();
        if (gesehen.has(k)) return false;
        gesehen.add(k);
        return true;
      })
      .map((f) => ({ ...f, vorhanden: istDoppelt(f, b) }))
      .sort((a, c) => Number(a.vorhanden) - Number(c.vorhanden) || Number(!!c.telefon) - Number(!!a.telefon) || a.firma.localeCompare(c.firma, "de"));

    return {
      ok: true,
      gebiet: gebiet.name,
      funde: ergebnis,
      limit,
      meldung: `${ergebnis.length} Betriebe ohne Website-Eintrag gefunden.`,
    };
  } catch (e) {
    console.error("[leadfinder] Suche", e);
    const detail = e instanceof SuchFehler ? e.message : "unbekannter Fehler";
    return {
      ok: false,
      meldung: `Die Suche hat nicht geklappt – ${detail}. Probier es gleich nochmal oder such einen einzelnen Bezirk (z. B. „Neubau, Wien“).`,
    };
  }
}

// ---------------------------------------------------------------------------
// Ins CRM übernehmen (nur Gründer)
// ---------------------------------------------------------------------------
export async function fundeImportieren(
  auswahl: Fund[],
  besitzerId?: string,
): Promise<{ ok: boolean; meldung: string }> {
  const profil = await nurAdmin();
  const supabase = await createClient();

  let besitzer = profil.id;
  if (besitzerId && besitzerId !== profil.id) {
    const { data: person } = await supabase.from("profiles").select("id").eq("id", besitzerId).eq("aktiv", true).maybeSingle();
    if (!person) return { ok: false, meldung: "Die gewählte Person ist nicht aktiv." };
    besitzer = person.id;
  }
  if (!Array.isArray(auswahl) || auswahl.length === 0) return { ok: false, meldung: "Bitte wähle mindestens einen Betrieb aus." };
  if (auswahl.length > 800) return { ok: false, meldung: "Bitte höchstens 800 Betriebe auf einmal übernehmen." };

  // Eingaben vom Browser nie ungeprüft übernehmen
  const s = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const zahl = (v: unknown, min: number, max: number) => (typeof v === "number" && v >= min && v <= max ? v : null);
  const osm = (v: unknown) => {
    const x = s(v, 100);
    return /^https:\/\/www\.openstreetmap\.org\/(node|way|relation)\/\d+$/.test(x) ? x : "";
  };
  const sauber = auswahl
    .map((f) => {
      const email = s(f?.email);
      return {
        firma: s(f?.firma),
        branche: s(f?.branche) || null,
        telefon: s(f?.telefon, 50),
        email: email && istEmail(email) ? email : null,
        adresse: s(f?.adresse) || null,
        bezirk: s(f?.bezirk, 100) || null,
        lat: zahl(f?.lat, -90, 90),
        lng: zahl(f?.lng, -180, 180),
        osm: osm(f?.osm),
      };
    })
    .filter((f) => f.firma);

  // Noch einmal gegen das CRM prüfen (zwischen Suche und Klick kann etwas dazugekommen sein)
  const b = await bestehende();
  const gesehen = new Set<string>();
  const neu = sauber.filter((f) => {
    if (istDoppelt(f, b)) return false;
    const k = `${firmaNorm(f.firma)}|${telNorm(f.telefon)}`;
    if (gesehen.has(k)) return false;
    gesehen.add(k);
    return true;
  });

  for (let i = 0; i < neu.length; i += 200) {
    const block = neu.slice(i, i + 200);
    const { data, error } = await supabase
      .from("leads")
      .insert(
        block.map((f) => ({
          firma: f.firma,
          branche: f.branche,
          telefon: f.telefon || null,
          email: f.email,
          adresse: f.adresse,
          bezirk: f.bezirk,
          lat: f.lat,
          lng: f.lng,
          geo_status: f.lat !== null && f.lng !== null ? "ok" : null,
          quelle: "leadfinder",
          besitzer_id: besitzer,
        })),
      )
      .select("id");
    if (error || !data) return { ok: false, meldung: `Übernahme nach ${i} Betrieben abgebrochen. Bitte versuch es nochmal.` };

    const notizen = data.map((d, j) => ({
      lead_id: d.id as string,
      autor_id: profil.id,
      art: "notiz",
      text:
        "Über den Lead Finder gefunden (OpenStreetMap). Dort ist keine Website eingetragen – vor dem Kontakt kurz googeln." +
        (block[j]?.osm ? `\n${block[j].osm}` : ""),
    }));
    await supabase.from("lead_verlauf").insert(notizen);
  }

  revalidatePath("/crm/leads");
  revalidatePath("/crm/karte");
  revalidatePath("/crm");
  const doppelt = sauber.length - neu.length;
  return {
    ok: true,
    meldung: `${neu.length} Betriebe als Leads übernommen${doppelt ? `, ${doppelt} schon vorhanden und übersprungen` : ""}.`,
  };
}
