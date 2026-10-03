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

  // Wichtig: getUser() prüft das Token beim Auth-Server und frischt die Session auf.
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
