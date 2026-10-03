import { list } from "@vercel/blob";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

/** A single resume PDF, from the Blob store in production or public/resume/ locally. */
export type ResumeFile = {
  title: string;
  filename: string;
  /** URL for inline viewing / preview. */
  url: string;
  /** URL that forces a download (falls back to `url`). */
  downloadUrl: string;
  size: number;
  uploadedAt?: string;
};

const PREFIX = "resume/";

/** Turn a filename like `Praveen_Kumar_Resume_React.pdf` into a friendly title ("React"). */
function deriveTitle(pathname: string): string {
  const base = pathname.split("/").pop() ?? pathname;
  const cleaned = base
    .replace(/\.pdf$/i, "")
    .replace(/praveen[_\- ]*kumar/i, "")
    .replace(/resume/i, "")
    .replace(/[_\-]+/g, " ")
    .trim();
  return cleaned || "Resume";
}

/**
 * List the available resumes. Uses the Vercel Blob store when credentials are
 * configured — either a classic `BLOB_READ_WRITE_TOKEN`, or the OIDC pair that
 * Vercel injects automatically for a connected store (`BLOB_STORE_ID` +
 * `VERCEL_OIDC_TOKEN`). Listing only needs read access, so OIDC is enough and
 * no read-write token has to live in the deployment. Updates then go live
 * without a redeploy. Falls back to the PDFs bundled in public/resume/ so local
 * development works with no credentials at all.
 */
export async function getResumes(): Promise<ResumeFile[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
    try {
      const { blobs } = await list({ prefix: PREFIX });
      return blobs
        .filter((b) => b.pathname.toLowerCase().endsWith(".pdf"))
        .map((b) => ({
          title: deriveTitle(b.pathname),
          filename: b.pathname.slice(PREFIX.length) || b.pathname,
          url: b.url,
          downloadUrl: b.downloadUrl ?? b.url,
          size: b.size,
          uploadedAt:
            b.uploadedAt instanceof Date ? b.uploadedAt.toISOString() : b.uploadedAt ? String(b.uploadedAt) : undefined,
        }))
        .sort((a, b) => a.title.localeCompare(b.title));
    } catch (err) {
      console.error("Failed to list resumes from the Blob store:", err);
    }
  }
  return readLocalResumes();
}

async function readLocalResumes(): Promise<ResumeFile[]> {
  try {
    const dir = path.join(process.cwd(), "public", "resume");
    const entries = await readdir(dir);
    const files = await Promise.all(
      entries
        .filter((f) => f.toLowerCase().endsWith(".pdf"))
        .map(async (f) => {
          const s = await stat(path.join(dir, f));
          const href = `/resume/${encodeURIComponent(f)}`;
          return {
            title: deriveTitle(f),
            filename: f,
            url: href,
            downloadUrl: href,
            size: s.size,
            uploadedAt: s.mtime.toISOString(),
          };
        }),
    );
    return files.sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}
