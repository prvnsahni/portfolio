"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usernameSchema } from "@/lib/validation/profile";
import { inputClass } from "@/components/linkbio/form";

export type UsernameStatus = "idle" | "invalid" | "checking" | "available" | "taken" | "current";

type RemoteResult = { name: string; state: "available" | "taken" | "error" };

/**
 * Username input with a debounced live "available / taken" check against the
 * username_available RPC. Format/current/empty states are derived during
 * render; only the async availability result lives in state (set from the
 * timeout callback, never synchronously in an effect). Reports status upward so
 * the parent can gate submission.
 */
export function UsernameField({
  value,
  onChange,
  current,
  onStatusChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  current?: string | null;
  onStatusChange?: (s: UsernameStatus) => void;
  disabled?: boolean;
}) {
  const trimmed = value.trim().toLowerCase();
  const isCurrent = !!current && trimmed === current.toLowerCase();
  const formatOk = usernameSchema.safeParse(trimmed);
  const formatError = !isCurrent && trimmed && !formatOk.success ? formatOk.error.issues[0]?.message : null;

  const [remote, setRemote] = useState<RemoteResult | null>(null);

  // Debounced availability check. Only runs for a well-formed, non-current,
  // non-empty handle; state is set from the async callback.
  useEffect(() => {
    if (isCurrent || !trimmed || !formatOk.success) return;
    let cancelled = false;
    const id = setTimeout(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("username_available", { name: trimmed });
      if (cancelled) return;
      setRemote({ name: trimmed, state: error ? "error" : data ? "available" : "taken" });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [trimmed, isCurrent, formatOk.success]);

  // Derive the single source-of-truth status.
  let status: UsernameStatus;
  let message = "";
  if (isCurrent) {
    status = "current";
    message = "This is your current username.";
  } else if (!trimmed) {
    status = "idle";
  } else if (formatError) {
    status = "invalid";
    message = formatError;
  } else if (remote?.name === trimmed) {
    if (remote.state === "available") {
      status = "available";
      message = "Available";
    } else if (remote.state === "taken") {
      status = "taken";
      message = "Already taken";
    } else {
      status = "invalid";
      message = "Couldn't check availability — try again.";
    }
  } else {
    status = "checking";
    message = "Checking availability…";
  }

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const color =
    status === "available" || status === "current"
      ? "text-good"
      : status === "taken" || status === "invalid"
        ? "text-bad"
        : "text-muted";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-stretch overflow-hidden rounded-lg border border-line bg-surface focus-within:border-accent">
        <span className="flex items-center border-r border-line px-3 font-mono text-xs text-muted">/u/</span>
        <input
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="your-handle"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          disabled={disabled}
          className={`${inputClass} border-0 bg-transparent focus:border-0`}
          aria-describedby="username-status"
        />
      </div>
      {message && (
        <p id="username-status" className={`text-xs ${color}`}>
          {message}
        </p>
      )}
    </div>
  );
}
