"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; name: string; percent: number }
  | { kind: "done"; name: string; url: string }
  | { kind: "error"; message: string };

export function ResumeUploader() {
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!secret) {
      setStatus({ kind: "error", message: "Enter the admin password first." });
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setStatus({ kind: "error", message: "Only PDF files are allowed." });
      return;
    }

    setStatus({ kind: "uploading", name: file.name, percent: 0 });
    try {
      // The file streams straight from the browser to Blob storage. Our
      // /api/resume/upload route only vends the token after checking `secret`.
      const result = await upload(`resume/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/resume/upload",
        contentType: "application/pdf",
        clientPayload: JSON.stringify({ secret }),
        onUploadProgress: ({ percentage }) =>
          setStatus({ kind: "uploading", name: file.name, percent: Math.round(percentage) }),
      });
      setStatus({ kind: "done", name: file.name, url: result.url });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setStatus({ kind: "error", message });
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  const uploading = status.kind === "uploading";

  return (
    <div className="mt-10 flex max-w-xl flex-col gap-5">
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

      <div
        role="button"
        tabIndex={0}
        aria-disabled={uploading}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !uploading) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-accent bg-surface" : "border-line bg-surface-2 hover:border-accent/60"
        } ${uploading ? "pointer-events-none opacity-70" : ""}`}
      >
        <p className="font-medium text-text">Drag a PDF here, or click to choose</p>
        <p className="font-mono text-xs text-muted">The filename becomes the resume title · max 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {status.kind === "uploading" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">
            Uploading <span className="text-text">{status.name}</span> — {status.percent}%
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div className="h-full bg-accent transition-all" style={{ width: `${status.percent}%` }} />
          </div>
        </div>
      )}

      {status.kind === "done" && (
        <div className="rounded-lg border border-accent/40 bg-surface p-4 text-sm">
          <p className="font-medium text-accent">Uploaded {status.name} ✓</p>
          <p className="mt-1 text-muted">
            It&apos;s live now —{" "}
            <a href="/resume" className="text-text underline hover:text-accent">
              view the resume page
            </a>
            .
          </p>
        </div>
      )}

      {status.kind === "error" && (
        <p className="rounded-lg border border-red-500/40 bg-surface p-4 text-sm text-red-400">{status.message}</p>
      )}
    </div>
  );
}
