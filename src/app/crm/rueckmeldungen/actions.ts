"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { holeProfil } from "@/lib/crm";
import { createClient } from "@/lib/supabase/server";
import { text } from "@/lib/validierung";

/** Kunden-Rückmeldung abhaken (RLS: Gründer oder wer verkauft hat) */
export async function rueckmeldungErledigt(fd: FormData) {
  await holeProfil();
  const id = text(fd, "id", 50);
  const zurueck = text(fd, "zurueck", 200);
  const supabase = await createClient();
  await supabase.from("kunden_feedback").update({ erledigt: true }).eq("id", id);
  revalidatePath("/crm", "layout");
  redirect(zurueck.startsWith("/crm") ? zurueck : "/crm");
}
