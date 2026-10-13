import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Monatslimit der Google-Prüfungen. Gratis-Kontingent von Google: 1.000 pro Monat (Stand: Preisliste, bitte selbst prüfen). */
export function monatsLimit() {
  const n = Number(process.env.GOOGLE_PRUEFUNG_LIMIT);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1000;
}

export type PruefStand = { benutzt: number; limit: number; rest: number };

/** Wie viele Prüfungen in diesem Monat schon gelaufen sind */
export async function pruefStand(supabase: SupabaseClient): Promise<PruefStand> {
  const jetzt = new Date();
  const monatsanfang = new Date(Date.UTC(jetzt.getUTCFullYear(), jetzt.getUTCMonth(), 1)).toISOString();
  const { data } = await supabase.from("google_pruefungen").select("anzahl").gte("created_at", monatsanfang).limit(10_000);
  const benutzt = (data ?? []).reduce((s, z) => s + Number(z.anzahl ?? 0), 0);
  const limit = monatsLimit();
  return { benutzt, limit, rest: Math.max(0, limit - benutzt) };
}
