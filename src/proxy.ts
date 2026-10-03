import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16: „proxy“ ist der neue Name für Middleware.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/crm/:path*", "/login", "/registrieren"],
};
