"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Alert, btnPrimary, inputClass, labelClass } from "@/components/linkbio/form";

type Status = { kind: "idle" | "loading" } | { kind: "error"; message: string };

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading" });
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus({ kind: "error", message: error.message });
      return;
    }
    // Refresh so Server Components re-read the new session cookie, then go.
    router.replace(redirectTo);
    router.refresh();
  }

  const loading = status.kind === "loading";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">Log in</h1>
        <p className="mt-2 text-sm text-muted">Sign in to edit your link-in-bio page.</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className={labelClass}>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </label>

        <label className={labelClass}>
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </label>

        {status.kind === "error" && <Alert kind="error">{status.message}</Alert>}

        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? "Signing in…" : "Log in"}
        </button>
      </form>

      <Link href="/auth/forgot" className="text-sm text-muted underline underline-offset-4 hover:text-accent">
        Forgot password?
      </Link>
    </div>
  );
}
