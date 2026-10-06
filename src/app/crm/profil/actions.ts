"use server";

import { revalidatePath } from "next/cache";
import { holeProfil } from "@/lib/crm";
import { createClient } from "@/lib/supabase/server";
import { text } from "@/lib/validierung";

export type ProfilStatus = { ok?: boolean; meldung?: string };

export async function nameSpeichern(_v: ProfilStatus, fd: FormData): Promise<ProfilStatus> {
  const profil = await holeProfil();
  const name = text(fd, "name", 100);
  if (name.length < 2) return { meldung: "Bitte gib deinen Namen ein." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ name }).eq("id", profil.id);
  if (error) return { meldung: "Der Name konnte nicht gespeichert werden." };
  revalidatePath("/crm", "layout");
  return { ok: true, meldung: "Name gespeichert." };
}

export async function tageszielSpeichern(_v: ProfilStatus, fd: FormData): Promise<ProfilStatus> {
  const profil = await holeProfil();
  const ziel = Number(text(fd, "tagesziel", 5));
  if (!Number.isInteger(ziel) || ziel < 1 || ziel > 500) return { meldung: "Bitte gib eine Zahl zwischen 1 und 500 ein." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ tagesziel: ziel }).eq("id", profil.id);
  if (error) return { meldung: "Das Tagesziel konnte nicht gespeichert werden." };
  revalidatePath("/crm", "layout");
  return { ok: true, meldung: `Tagesziel gespeichert: ${ziel} Kontakte pro Tag.` };
}

export async function passwortAendern(_v: ProfilStatus, fd: FormData): Promise<ProfilStatus> {
  await holeProfil();
  const pw = typeof fd.get("passwort") === "string" ? (fd.get("passwort") as string) : "";
  const pw2 = typeof fd.get("passwort2") === "string" ? (fd.get("passwort2") as string) : "";
  if (pw.length < 8) return { meldung: "Das Passwort muss mindestens 8 Zeichen haben." };
  if (pw !== pw2) return { meldung: "Die beiden Passwörter stimmen nicht überein." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: pw });
  if (error) {
    return {
      meldung:
        error.code === "same_password"
          ? "Das neue Passwort muss sich vom alten unterscheiden."
          : "Das Passwort konnte nicht geändert werden. Bitte melde dich neu an und versuch es nochmal.",
    };
  }
  return { ok: true, meldung: "Passwort geändert." };
}

/** Neuen privaten Kalender-Link erzeugen – der alte funktioniert danach nicht mehr. */
export async function kalenderLinkNeu() {
  await holeProfil();
  const supabase = await createClient();
  await supabase.rpc("kalender_link_neu");
  revalidatePath("/crm/profil");
}
