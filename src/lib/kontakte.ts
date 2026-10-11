import "server-only";
import { createClient } from "@supabase/supabase-js";
import { FIRMA } from "@/lib/firma";

export type Kontakt = {
  name: string;
  rolle: "admin" | "partner";
  telefon: string | null;
  /** Eigene E-Mail der Person – sonst die Firmen-E-Mail */
  email: string | null;
};

/** Ziffern für tel:- und WhatsApp-Links: +43 660 123 → 43660123, 0660 123 → 43660123 */
export function nurZiffern(telefon: string) {
  const t = telefon.trim();
  const z = t.replace(/\D/g, "");
  if (t.startsWith("+")) return z;
  if (t.startsWith("00")) return z.slice(2);
  if (z.startsWith("0")) return `43${z.slice(1)}`;
  return z;
}

/**
 * Team-Mitglieder, die ihre Kontaktdaten selbst für die Website freigegeben haben.
 * Ohne Login nur über die Datenbankfunktion `oeffentliche_kontakte` – sie liefert
 * nichts anderes als Name, Rolle, Telefon und E-Mail. Bei Fehlern: leere Liste.
 */
export async function oeffentlicheKontakte(): Promise<Kontakt[]> {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.rpc("oeffentliche_kontakte");
    if (error || !Array.isArray(data)) return [];
    return (data as Kontakt[])
      .map((k) => ({
        name: String(k.name ?? "").trim(),
        rolle: k.rolle === "admin" ? ("admin" as const) : ("partner" as const),
        telefon: k.telefon?.trim() || null,
        email: k.email?.trim() || FIRMA.email || null,
      }))
      .filter((k) => k.name && (k.telefon || k.email));
  } catch {
    return [];
  }
}
