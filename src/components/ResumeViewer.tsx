"use client";

import { useState } from "react";
import type { ResumeFile } from "@/lib/resume";

function formatBytes(bytes: number): string {
  if (!bytes) return "";
  const kb = bytes / 1024;
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

const btnBase = "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors";
const btnPrimary = `${btnBase} bg-accent text-bg hover:bg-accent-strong`;
const btnGhost = `${btnBase} border border-line text-text hover:border-accent/60 hover:text-accent`;

export function ResumeViewer({ resumes }: { resumes: ResumeFile[] }) {
  const [active, setActive] = useState(0);
  const current = resumes[active] ?? resumes[0];

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr]">
      <div className="flex flex-col gap-3">
        {resumes.length > 1 &&
          resumes.map((r, i) => (
            <button
              key={r.filename}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={`rounded-xl border p-4 text-left transition-colors ${
                i === active ? "border-accent bg-surface" : "border-line bg-surface hover:border-accent/50"
              }`}
            >
              <p className="font-mono text-xs text-muted">PDF{r.size ? ` · ${formatBytes(r.size)}` : ""}</p>
              <p className={`mt-1 font-semibold ${i === active ? "text-accent" : ""}`}>{r.title}</p>
            </button>
          ))}

        <div className="flex flex-wrap gap-3">
          <a href={current.downloadUrl} download className={btnPrimary}>
            Download ↓
          </a>
          <a href={current.url} target="_blank" rel="noreferrer" className={btnGhost}>
            Open in new tab ↗
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface-2">
        <iframe
          key={current.url}
          src={`${current.url}#view=FitH`}
          title={`Preview of ${current.title} resume`}
          className="h-[70vh] w-full sm:h-[85vh]"
        />
      </div>
    </div>
  );
}
