"use server";

import { redirect } from "next/navigation";
import { holeProfil } from "@/lib/crm";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Vergibt Karten-Codes für die ausgewählten Leads und öffnet die Druckansicht. */
export async function kartenErstellen(fd: FormData) {
  await holeProfil();
  const ids = [...new Set(fd.getAll("id").filter((v): v is string => typeof v === "string" && UUID.test(v)))].slice(0, 500);
  if (ids.length === 0) redirect("/crm/postkarten?fehler=Bitte+w%C3%A4hle+mindestens+einen+Betrieb+aus.");

  const seit = new Date(Date.now() - 1000).toISOString();
  const supabase = await createClient();
  const { error } = await supabase.rpc("karten_vorbereiten", { p_ids: ids });
  if (error) {
    console.error("Karten konnten nicht erstellt werden", error.message);
    redirect("/crm/postkarten?fehler=Die+Karten+konnten+nicht+erstellt+werden.");
  }
  redirect(`/crm/postkarten/druck?seit=${encodeURIComponent(seit)}`);
}
