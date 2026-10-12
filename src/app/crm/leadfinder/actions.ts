"use server";

import { revalidatePath } from "next/cache";
import { nurAdmin } from "@/lib/crm";
import { firmaNorm, telNorm } from "@/lib/leadfinder";
import { GRUPPEN_NAMEN, type Fund } from "@/lib/leadfinder-gruppen";
import { funde as osmFunde, type Bbox, type FundeErgebnis } from "@/lib/leadfinder-suche";
import { createClient } from "@/lib/supabase/server";
import { istEmail } from "@/lib/validierung";

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
// Abgleich mit dem CRM (nur Gründer) – die Suche selbst läuft im Browser
// ---------------------------------------------------------------------------
/** Gibt die Schlüssel der Treffer zurück, die es im CRM schon gibt */
export async function fundeAbgleichen(liste: { key: string; firma: string; telefon: string }[]): Promise<string[]> {
  await nurAdmin();
  if (!Array.isArray(liste)) return [];
  const b = await bestehende();
  return liste
    .slice(0, 2000)
    .filter((f) => typeof f?.key === "string" && istDoppelt({ firma: String(f.firma ?? ""), telefon: String(f.telefon ?? "") }, b))
    .map((f) => f.key);
}

/** Ersatzweg, falls der Browser OpenStreetMap nicht erreicht: dieselbe Abfrage vom Server aus */
export async function fundeVomServer(
  areaId: number,
  gruppen: string[],
  bbox?: Bbox,
): Promise<({ ok: true } & FundeErgebnis) | { ok: false; meldung: string }> {
  await nurAdmin();
  if (!Number.isInteger(areaId) || areaId < 3_600_000_000 || areaId >= 3_700_000_000) return { ok: false, meldung: "ungültiges Gebiet" };
  const auswahl = Array.isArray(gruppen) ? gruppen.filter((g) => GRUPPEN_NAMEN.includes(g)) : [];
  if (auswahl.length === 0) return { ok: false, meldung: "keine Branche gewählt" };
  // Kartenausschnitt nur annehmen, wenn er plausibel und nicht riesig ist
  let box: Bbox | undefined;
  if (Array.isArray(bbox) && bbox.length === 4 && bbox.every((n) => typeof n === "number" && Number.isFinite(n))) {
    const [sued, west, nord, ost] = bbox;
    if (sued >= -90 && nord <= 90 && west >= -180 && ost <= 180 && sued < nord && west < ost && nord - sued <= 3 && ost - west <= 4) box = bbox;
  }
  try {
    const r = await osmFunde(areaId, auswahl, {
      headers: { "User-Agent": "UrsprungCRM/1.0 (Lead Finder)", Accept: "application/json" },
      budgetMs: 50_000,
      bbox: box,
    });
    return { ok: true, ...r };
  } catch (e) {
    return { ok: false, meldung: e instanceof Error ? e.message : "unbekannter Fehler" };
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
