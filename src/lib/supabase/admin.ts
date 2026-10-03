import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client mit Service-Role-Key – umgeht RLS.
 * Nur in Server Actions / Route Handlers verwenden, nachdem die Berechtigung geprüft wurde.
 * Durch `server-only` schlägt der Build fehl, falls das Modul im Client landet.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY fehlt");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
