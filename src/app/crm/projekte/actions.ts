"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nurAdmin } from "@/lib/crm";
import { istPhase } from "@/lib/projekte";
import { createClient } from "@/lib/supabase/server";
import { text } from "@/lib/validierung";
import { istTag } from "@/lib/zeit";

function zurueck(fehler?: string): never {
  revalidatePath("/crm/projekte");
  redirect(`/crm/projekte${fehler ? `?fehler=${encodeURIComponent(fehler)}` : ""}`);
}

export async function phaseSetzen(fd: FormData) {
  await nurAdmin();
  const id = text(fd, "id", 50);
  const phase = text(fd, "phase", 20);
  if (!istPhase(phase)) zurueck("Ungültige Phase.");
  const supabase = await createClient();
  const update: Record<string, unknown> = { projekt_phase: phase };
  if (phase === "online") update.projekt_faellig = null;
  const { data, error } = await supabase.from("deals").update(update).eq("id", id).select("lead_id").single();
  if (error) zurueck("Die Phase konnte nicht gespeichert werden.");
  if (data?.lead_id) revalidatePath(`/crm/leads/${data.lead_id}`);
  zurueck();
}

export async function projektSpeichern(fd: FormData) {
  await nurAdmin();
  const id = text(fd, "id", 50);
  const faellig = text(fd, "faellig", 10);
  const url = text(fd, "website_url", 300);
  if (faellig && !istTag(faellig)) zurueck("Bitte ein gültiges Datum eingeben.");
  if (url && !/^https?:\/\/\S+$/i.test(url)) zurueck("Die Website-Adresse muss mit https:// beginnen.");
  const genutzt = Number(text(fd, "aenderungsrunden_genutzt", 3));

  const update: Record<string, unknown> = { projekt_faellig: faellig || null, website_url: url || null };
  if (Number.isInteger(genutzt) && genutzt >= 0 && genutzt <= 20) update.aenderungsrunden_genutzt = genutzt;

  const supabase = await createClient();
  const { error } = await supabase.from("deals").update(update).eq("id", id);
  if (error) zurueck("Das Projekt konnte nicht gespeichert werden.");
  zurueck();
}
