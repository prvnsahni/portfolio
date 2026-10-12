"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui";
import { Alert, btnPrimary, inputClass, labelClass } from "@/components/linkbio/form";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");

  // The recovery link establishes a session via the URL (handled by the
  // Supabase browser client). Wait for that session before allowing a change.
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setStatus("saving");
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setStatus("idle");
      return;
    }
    setStatus("done");
    setTimeout(() => {
      router.replace("/dashboard/edit");
      router.refresh();
    }, 1200);
  }

  return (
    <Container className="flex min-h-[70vh] max-w-md flex-col justify-center py-16">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Set a new password</h1>
          <p className="mt-2 text-sm text-muted">Choose a new password for your account.</p>
        </div>

        {!ready ? (
          <Alert kind="info">
            Open the reset link from your email to continue. If you landed here directly, request a new link from{" "}
            <Link href="/auth/forgot" className="underline underline-offset-4 hover:text-accent">
              Forgot password
            </Link>
            .
          </Alert>
        ) : status === "done" ? (
          <Alert kind="success">Password updated — taking you to your dashboard…</Alert>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className={labelClass}>
              New password
              <input
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                disabled={status === "saving"}
              />
            </label>

            <label className={labelClass}>
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
                disabled={status === "saving"}
              />
            </label>

            {error && <Alert kind="error">{error}</Alert>}

            <button type="submit" disabled={status === "saving"} className={btnPrimary}>
              {status === "saving" ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </Container>
  );
}
