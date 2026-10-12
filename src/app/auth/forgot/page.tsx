"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui";
import { Alert, btnPrimary, inputClass, labelClass } from "@/components/linkbio/form";

type Status = { kind: "idle" | "loading" | "sent" } | { kind: "error"; message: string };

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading" });
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/reset`,
    });
    // Show the same confirmation whether or not the email exists, to avoid
    // leaking which addresses have accounts.
    if (error && error.status === 429) {
      setStatus({ kind: "error", message: "Too many requests — please wait a bit and try again." });
      return;
    }
    setStatus({ kind: "sent" });
  }

  const loading = status.kind === "loading";

  return (
    <Container className="flex min-h-[70vh] max-w-md flex-col justify-center py-16">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Reset password</h1>
          <p className="mt-2 text-sm text-muted">
            Enter your email and we&apos;ll send a link to set a new password.
          </p>
        </div>

        {status.kind === "sent" ? (
          <Alert kind="success">
            If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way. Check
            your inbox.
          </Alert>
        ) : (
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

            {status.kind === "error" && <Alert kind="error">{status.message}</Alert>}

            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <Link href="/login" className="text-sm text-muted underline underline-offset-4 hover:text-accent">
          Back to login
        </Link>
      </div>
    </Container>
  );
}
