"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import type { ResumeFile } from "@/lib/resume";

function formatBytes(bytes: number): string {
  if (!bytes) return "";
  const kb = bytes / 1024;
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  // Fixed locale + UTC so server and client render identically — no hydration mismatch.
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

/** Short, collision-safe id baked into each upload's pathname (`<id>__name.pdf`). */
function shortId(): string {
  const uuid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return uuid.split("-")[0];
}

type ExistingRow = { kind: "existing"; file: ResumeFile; removed: boolean };
type NewRow = { kind: "new"; key: string; file: File };
type Row = ExistingRow | NewRow;

type SaveState =
  | { phase: "idle" }
  | { phase: "saving"; message: string }
  | { phase: "done"; message: string }
  | { phase: "error"; message: string };

export function ResumeManager({ initial }: { initial: ResumeFile[] }) {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [rows, setRows] = useState<Row[]>(() => initial.map((file) => ({ kind: "existing", file, removed: false })));
  const [save, setSave] = useState<SaveState>({ phase: "idle" });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-sync from the server whenever its list changes — e.g. after a successful
  // save triggers router.refresh(). Adjusting state during render (React's
  // recommended pattern) rather than in an effect avoids a cascading re-render.
  // Staged (unsaved) edits reset at that point since they've just been committed.
  const signature = initial.map((f) => f.id).join("|");
  const [syncedSignature, setSyncedSignature] = useState(signature);
  if (signature !== syncedSignature) {
    setSyncedSignature(signature);
    setRows(initial.map((file) => ({ kind: "existing", file, removed: false })));
  }

  const staged = rows.filter((r): r is NewRow => r.kind === "new");
  const existing = rows.filter((r): r is ExistingRow => r.kind === "existing");
  const toDelete = existing.filter((r) => r.removed);
  const hasChanges = staged.length > 0 || toDelete.length > 0;
  const saving = save.phase === "saving";

  function addFiles(files: FileList | File[]) {
    const pdfs = Array.from(files).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    if (pdfs.length === 0) {
      setSave({ phase: "error", message: "Only PDF files are allowed." });
      return;
    }
    setRows((prev) => [...prev, ...pdfs.map((file) => ({ kind: "new" as const, key: shortId(), file }))]);
    setSave({ phase: "idle" });
  }

  function toggleRemove(id: string) {
    setRows((prev) =>
      prev.map((r) => (r.kind === "existing" && r.file.id === id ? { ...r, removed: !r.removed } : r)),
    );
  }

  function unstage(key: string) {
    setRows((prev) => prev.filter((r) => !(r.kind === "new" && r.key === key)));
  }

  async function onSave() {
    if (!secret) {
      setSave({ phase: "error", message: "Enter the admin password first." });
      return;
    }
    if (!hasChanges || saving) return;

    if (toDelete.length > 0) {
      const summary =
        `Permanently delete ${toDelete.length} resume(s)?\n\n` +
        toDelete.map((r) => `• ${r.file.title} — ${r.file.filename}`).join("\n") +
        (staged.length ? `\n\n…and add ${staged.length} new file(s).` : "");
      if (!window.confirm(summary)) return;
    }

    try {
      // 1. Upload each staged file — a fresh unique id goes into every pathname,
      //    so even a same-named file becomes a distinct, identifiable object.
      for (let i = 0; i < staged.length; i++) {
        const { file } = staged[i];
        setSave({ phase: "saving", message: `Uploading ${file.name} (${i + 1}/${staged.length})…` });
        await upload(`resume/${shortId()}__${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/resume/upload",
          contentType: "application/pdf",
          clientPayload: JSON.stringify({ secret }),
        });
      }

      // 2. Delete the files explicitly marked for removal.
      if (toDelete.length > 0) {
        setSave({ phase: "saving", message: `Removing ${toDelete.length} file(s)…` });
        const res = await fetch("/api/resume/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secret, urls: toDelete.map((r) => r.file.url) }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "Delete failed.");
        }
      }

      setSave({ phase: "done", message: "Saved — your resume list is live." });
      router.refresh();
    } catch (err) {
      setSave({ phase: "error", message: err instanceof Error ? err.message : "Save failed." });
    }
  }

  return (
    <div className="mt-10 flex max-w-2xl flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text">Admin password</span>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="RESUME_ADMIN_SECRET"
          autoComplete="off"
          className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-accent"
        />
      </label>

      {/* Current + staged resumes */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-text">
          Resumes <span className="font-normal text-muted">({existing.filter((r) => !r.removed).length + staged.length} after save)</span>
        </p>

        {existing.length === 0 && staged.length === 0 && (
          <p className="rounded-lg border border-dashed border-line bg-surface-2 p-4 text-sm text-muted">
            No resumes yet — add a PDF below.
          </p>
        )}

        {existing.map((r) => (
          <div
            key={r.file.id}
            className={`flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors ${
              r.removed ? "border-red-500/40 bg-red-500/5" : "border-line bg-surface"
            }`}
          >
            <div className="min-w-0">
              <p className={`truncate font-semibold ${r.removed ? "text-muted line-through" : "text-text"}`}>
                {r.file.title}
              </p>
              <p className="truncate font-mono text-xs text-muted">
                {r.file.filename} · {formatBytes(r.file.size)}
                {formatDate(r.file.uploadedAt) && ` · updated ${formatDate(r.file.uploadedAt)}`} · id {r.file.id}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleRemove(r.file.id)}
              className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                r.removed
                  ? "border-line text-text hover:border-accent/60"
                  : "border-red-500/40 text-red-400 hover:bg-red-500/10"
              }`}
            >
              {r.removed ? "Undo" : "Remove"}
            </button>
          </div>
        ))}

        {staged.map((r) => (
          <div
            key={r.key}
            className="flex items-center justify-between gap-3 rounded-xl border border-accent/50 bg-surface p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-accent">{r.file.name}</p>
              <p className="font-mono text-xs text-muted">New · {formatBytes(r.file.size)} · not saved yet</p>
            </div>
            <button
              type="button"
              onClick={() => unstage(r.key)}
              className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/60 hover:text-text"
            >
              Discard
            </button>
          </div>
        ))}
      </div>

      {/* Add files */}
      <div
        role="button"
        tabIndex={0}
        aria-disabled={saving}
        onClick={() => !saving && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !saving) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        className={`flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-accent bg-surface" : "border-line bg-surface-2 hover:border-accent/60"
        } ${saving ? "pointer-events-none opacity-70" : ""}`}
      >
        <p className="font-medium text-text">Drag PDFs here, or click to choose</p>
        <p className="font-mono text-xs text-muted">Add as many as you like · the filename becomes the title · max 10 MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Save bar */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onSave}
          disabled={!hasChanges || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {hasChanges && !saving && (
          <p className="text-sm text-muted">
            {staged.length > 0 && `${staged.length} to add`}
            {staged.length > 0 && toDelete.length > 0 && " · "}
            {toDelete.length > 0 && `${toDelete.length} to remove`}
          </p>
        )}
      </div>

      {save.phase === "saving" && <p className="text-sm text-muted">{save.message}</p>}
      {save.phase === "done" && (
        <p className="rounded-lg border border-accent/40 bg-surface p-4 text-sm text-accent">
          {save.message}{" "}
          <a href="/resume" className="text-text underline hover:text-accent">
            View the resume page →
          </a>
        </p>
      )}
      {save.phase === "error" && (
        <p className="rounded-lg border border-red-500/40 bg-surface p-4 text-sm text-red-400">{save.message}</p>
      )}
    </div>
  );
}
