/**
 * Admin check, shared between the proxy and server-side guards. Admins are
 * defined by the comma-separated `ADMIN_EMAILS` env var (case-insensitive).
 * Kept dependency-free so it's safe to import from proxy.ts (Node runtime).
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
