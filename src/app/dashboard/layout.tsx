import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { Container } from "@/components/ui";

// Everything under /dashboard requires a session (re-checked here, not just in
// the proxy).
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-[70vh]">
      <header className="border-b border-line bg-surface/60">
        <Container className="flex items-center justify-between py-3">
          <span className="truncate font-mono text-xs text-muted">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-accent/60 hover:text-accent"
            >
              Sign out
            </button>
          </form>
        </Container>
      </header>
      {children}
    </div>
  );
}
