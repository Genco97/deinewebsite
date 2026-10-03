import { NextResponse, type NextRequest } from "next/server";
import { zuCsv } from "@/lib/csv";
import { createClient } from "@/lib/supabase/server";

const EXPORTE = {
  leads: {
    tabelle: "leads",
    spalten: ["id", "firma", "ansprechpartner", "branche", "telefon", "email", "adresse", "bezirk", "status", "naechster_rueckruf", "quelle", "besitzer_id", "created_at"],
  },
  anfragen: {
    tabelle: "anfragen",
    spalten: ["id", "art", "paket", "firma", "name", "email", "telefon", "branche", "wuensche", "lead_id", "created_at"],
  },
  deals: {
    tabelle: "deals",
    spalten: ["id", "lead_id", "partner_id", "paket", "betrag", "status", "aenderungsrunden_inkl", "aenderungsrunden_genutzt", "voll_bezahlt_am", "notiz", "created_at"],
  },
  provisionen: {
    tabelle: "provisionen",
    spalten: ["id", "deal_id", "empfaenger_id", "verkaeufer_id", "ebene", "prozent", "betrag", "paket", "ausbezahlt", "ausbezahlt_am", "created_at"],
  },
} as const;

export async function GET(request: NextRequest) {
  const typ = request.nextUrl.searchParams.get("typ") ?? "";
  if (!(typ in EXPORTE)) return new NextResponse("Unbekannter Export", { status: 400 });
  const { tabelle, spalten } = EXPORTE[typ as keyof typeof EXPORTE];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Nicht angemeldet", { status: 401 });
  const { data: istAdmin } = await supabase.rpc("is_admin");
  if (istAdmin !== true) return new NextResponse("Kein Zugriff", { status: 403 });

  // Blockweise laden (PostgREST liefert max. 1000 Zeilen pro Abfrage)
  const zeilen: Record<string, unknown>[] = [];
  for (let von = 0; ; von += 1000) {
    const { data, error } = await supabase
      .from(tabelle)
      .select(spalten.join(","))
      .order("created_at")
      .range(von, von + 999);
    if (error) return new NextResponse("Export fehlgeschlagen", { status: 500 });
    zeilen.push(...((data ?? []) as unknown as Record<string, unknown>[]));
    if (!data || data.length < 1000) break;
  }

  const csv = zuCsv([...spalten], zeilen.map((z) => spalten.map((s) => z[s])));
  const datum = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sichtbar-${typ}-${datum}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
