import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses Row Level Security and can perform
 * admin operations (e.g. setting any user's password via the Auth admin API).
 *
 * SECURITY: `import "server-only"` makes the build fail if this module is ever
 * pulled into a Client Component. The service role key must never reach the
 * browser. Only import this from Route Handlers / Server Actions behind an
 * admin check.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
