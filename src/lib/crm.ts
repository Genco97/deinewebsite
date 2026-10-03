import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Rolle = "admin" | "partner";

export type Profil = {
  id: string;
  name: string;
  email: string;
  rolle: Rolle;
  upline_id: string | null;
  einladungscode: string;
};

/** Eingeloggtes Profil – einmal pro Request geladen. Leitet ohne Login auf /login um. */
export const holeProfil = cache(async (): Promise<Profil> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("id, name, email, rolle, upline_id, einladungscode")
    .eq("id", user.id)
    .single();
  if (!data) redirect("/login?fehler=profil");
  return data as Profil;
});

export async function nurAdmin() {
  const p = await holeProfil();
  if (p.rolle !== "admin") redirect("/crm");
  return p;
}
