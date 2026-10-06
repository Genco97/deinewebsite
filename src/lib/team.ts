import "server-only";
import { createClient } from "@/lib/supabase/server";

export type TeamZeile = {
  profil_id: string;
  name: string;
  ich: boolean;
  kontakte: number;
  ziel_tage: number;
  besuche: number;
  verkaeufe: number;
  tagesziel: number;
};

export type FeedEintrag = { art: "verkauf" | "demo" | "ziel" | "neu"; zeit: string; profil_id: string; name: string; ich: boolean; text: string };

export async function teamWoche(von: string, bis: string): Promise<TeamZeile[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("team_woche", { p_von: von, p_bis: bis });
  return (data ?? []) as TeamZeile[];
}

export async function teamFeed(tage = 7): Promise<FeedEintrag[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("team_feed", { p_tage: tage });
  return (data ?? []) as FeedEintrag[];
}

export const SORTIERUNG = ["kontakte", "ziel_tage", "besuche", "verkaeufe"] as const;
export type Sortierung = (typeof SORTIERUNG)[number];

export function sortiere(zeilen: TeamZeile[], nach: Sortierung) {
  return [...zeilen].sort((a, b) => b[nach] - a[nach] || b.kontakte - a.kontakte || a.name.localeCompare(b.name, "de"));
}
