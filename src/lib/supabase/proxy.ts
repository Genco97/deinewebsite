import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() prüft die Signatur des Tokens lokal (ohne Anfrage an den Auth-Server)
  // und frischt eine abgelaufene Session vorher auf.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims?.sub ? data.claims : null;

  const path = request.nextUrl.pathname;

  if (!user && path.startsWith("/crm")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?weiter=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }

  if (user && (path === "/login" || path === "/registrieren")) {
    const url = request.nextUrl.clone();
    url.pathname = "/crm";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
