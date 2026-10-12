import type { ReactNode } from "react";

/** Shared field styling for the link-in-bio auth + editor forms. */
export const inputClass =
  "w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-accent disabled:opacity-60";

export const labelClass = "flex flex-col gap-2 text-sm font-medium text-text";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-line px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-50";

export function Alert({ kind, children }: { kind: "error" | "success" | "info"; children: ReactNode }) {
  const styles = {
    error: "border-bad/40 bg-bad/5 text-bad",
    success: "border-good/40 bg-good/5 text-good",
    info: "border-line bg-surface-2 text-muted",
  }[kind];
  return <p className={`rounded-lg border p-3 text-sm ${styles}`}>{children}</p>;
}
