import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Abmelden mit Begründung (z. B. deaktiviertes Konto). Route Handler dürfen Cookies löschen –
// Server Components nicht; sonst entsteht eine Weiterleitungsschleife zwischen /login und /crm.
export async function GET(request: NextRequest) {
  const grund = request.nextUrl.searchParams.get("grund");
  const supabase = await createClient();
  await supabase.auth.signOut();
  const ziel = new URL("/login", request.nextUrl.origin);
  if (grund === "inaktiv" || grund === "profil") ziel.searchParams.set("fehler", grund);
  return NextResponse.redirect(ziel);
}
