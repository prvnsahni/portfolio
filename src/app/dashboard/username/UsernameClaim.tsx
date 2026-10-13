"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UsernameField, type UsernameStatus } from "@/components/linkbio/UsernameField";
import { Alert, btnPrimary } from "@/components/linkbio/form";
import { setUsername } from "@/app/dashboard/edit/actions";

export function UsernameClaim() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<UsernameStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canSubmit = status === "available" && !saving;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    const result = await setUsername(value);
    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }
    router.replace("/dashboard/edit");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">Choose your username</h1>
        <p className="mt-2 text-sm text-muted">
          This is your public link — <span className="font-mono text-text">/u/your-handle</span>. You can change it
          later, but existing NFC tags and shared links would need updating.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <UsernameField value={value} onChange={setValue} onStatusChange={setStatus} disabled={saving} />
        {error && <Alert kind="error">{error}</Alert>}
        <button type="submit" disabled={!canSubmit} className={btnPrimary}>
          {saving ? "Saving…" : "Claim username"}
        </button>
      </form>
    </div>
  );
}
