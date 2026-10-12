import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Uses the request's cookie store so the user's session is read and refreshed
 * server-side. `cookies()` is async in this Next.js version.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // In Server Components cookies are read-only and this throws; that's
          // fine because session refresh is handled in proxy.ts. In Server
          // Actions / Route Handlers the writes succeed.
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // no-op: called from a Server Component render
          }
        },
      },
    },
  );
}
