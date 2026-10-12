import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth-shared";

/** Paths that require a logged-in user. */
const PROTECTED = ["/dashboard", "/admin"];

/**
 * Refreshes the Supabase auth session on every matched request and guards
 * protected routes. Must return the `supabaseResponse` (with refreshed cookies)
 * untouched, per the @supabase/ssr contract.
 *
 * NOTE: this is a first line of defence only. Because Server Actions are POSTs
 * that a matcher can skip, every protected page/action also re-checks the
 * session server-side.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // If Supabase isn't configured yet, do nothing — this keeps the rest of the
  // portfolio fully working before the link-in-bio backend is set up.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getUser() — it
  // keeps the session fresh and avoids hard-to-debug logout bugs.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Admin area additionally requires an allow-listed email.
  if (user && (pathname === "/admin" || pathname.startsWith("/admin/")) && !isAdminEmail(user.email)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/edit";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
