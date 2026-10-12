import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth-shared";

/** The current authenticated user, or null. Reads/validates the session cookie. */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Require a logged-in user in a Server Component / Server Action. Redirects to
 * /login when there's no session. This is the real guard — the proxy is only a
 * first line of defence (see the note in proxy.ts).
 */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** Require an admin (email in ADMIN_EMAILS). Non-admins go to their own editor. */
export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdminEmail(user.email)) redirect("/dashboard/edit");
  return user;
}
