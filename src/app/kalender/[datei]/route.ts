import { createClient } from "@supabase/supabase-js";
import { kalenderIcs, type KalenderEintrag } from "@/lib/ical";

// Kalender-Abo: /kalender/<token>.ics – wird vom Kalender-Programm ohne Login abgerufen.
// Der lange, zufällige Token ist das Passwort; die Datenbank prüft ihn (kalender_eintraege).
export async function GET(_req: Request, ctx: RouteContext<"/kalender/[datei]">) {
  const { datei } = await ctx.params;
  const token = datei.replace(/\.ics$/i, "");
  if (!/^[0-9a-f]{40,128}$/.test(token)) return new Response("Nicht gefunden", { status: 404 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc("kalender_eintraege", { p_token: token });
  if (error) return new Response("Fehler", { status: 500 });
  // Falscher Token liefert einfach einen leeren Kalender – kein Hinweis, ob er existiert

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return new Response(kalenderIcs((data ?? []) as KalenderEintrag[], site), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="ursprung.ics"',
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
