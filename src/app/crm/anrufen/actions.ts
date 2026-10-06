"use server";

import { revalidatePath } from "next/cache";
import { holeProfil } from "@/lib/crm";
import { createClient } from "@/lib/supabase/server";
import { heuteWien, tagVerschieben, wienZuIso } from "@/lib/zeit";

export type Ergebnis = "nicht_erreicht" | "rueckruf" | "interessiert" | "kein_interesse" | "nicht_anrufen";

const LABEL: Record<Ergebnis, string> = {
  nicht_erreicht: "nicht erreicht",
  rueckruf: "Rückruf vereinbart",
  interessiert: "interessiert",
  kein_interesse: "kein Interesse",
  nicht_anrufen: "will keine Anrufe mehr",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Nächster Werktag (Mo–Sa) um 10:00 – für „nicht erreicht“ ohne eigene Zeit */
function naechsterVersuch() {
  let tag = tagVerschieben(heuteWien(), 1);
  if (new Date(`${tag}T12:00:00Z`).getUTCDay() === 0) tag = tagVerschieben(tag, 1);
  return wienZuIso(`${tag}T10:00`)!;
}

/**
 * G3: Ergebnis eines Anrufs speichern – Notiz in den Verlauf, Status und nächster Rückruf am Lead.
 * Jeder Anruf hinterlässt eine Notiz, damit er im Tagesziel als Kontakt zählt.
 */
export async function anrufErgebnis(eingabe: { id: string; ergebnis: Ergebnis; notiz?: string; wann?: string }): Promise<{ ok: true; text: string } | { ok: false; meldung: string }> {
  const profil = await holeProfil();
  const { id, ergebnis } = eingabe;
  if (!UUID.test(id) || !(ergebnis in LABEL)) return { ok: false, meldung: "Ungültige Eingabe." };
  const notiz = (eingabe.notiz ?? "").trim().slice(0, 2000);

  let rueckruf: string | null = null;
  if (ergebnis === "rueckruf" || ergebnis === "interessiert") {
    rueckruf = eingabe.wann ? wienZuIso(eingabe.wann) : null;
    if (!rueckruf) return { ok: false, meldung: "Bitte wähle, wann du wieder anrufst." };
    if (Date.parse(rueckruf) < Date.now() - 5 * 60000) return { ok: false, meldung: "Der Rückruf darf nicht in der Vergangenheit liegen." };
  } else if (ergebnis === "nicht_erreicht") {
    rueckruf = (eingabe.wann && wienZuIso(eingabe.wann)) || naechsterVersuch();
  }

  const supabase = await createClient();
  const { error: e1 } = await supabase
    .from("lead_verlauf")
    .insert({ lead_id: id, autor_id: profil.id, art: "notiz", text: `Anruf: ${LABEL[ergebnis]}${notiz ? ` – ${notiz}` : ""}` });
  if (e1) return { ok: false, meldung: "Das hat nicht geklappt. Bitte versuch es nochmal." };

  const { error: e2 } = await supabase
    .from("leads")
    .update({ status: ergebnis, naechster_rueckruf: rueckruf, besuch_geplant: null })
    .eq("id", id)
    .eq("besitzer_id", profil.id);
  if (e2) return { ok: false, meldung: "Das hat nicht geklappt. Bitte versuch es nochmal." };

  revalidatePath("/crm", "layout");
  return { ok: true, text: LABEL[ergebnis] };
}
