import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

// Mutating route — never cached; must verify the admin secret per request.
export const dynamic = "force-dynamic";

const ADMIN_SECRET = process.env.RESUME_ADMIN_SECRET;

/**
 * Delete one or more resume blobs.
 *
 * The browser sends `{ secret, urls }`. We check the same admin secret the
 * uploader uses, and only then call `del()` — the Blob write token stays on the
 * server and never reaches the client. As a guard against a stray/forged URL,
 * we only delete blobs whose path sits under the `resume/` prefix.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!ADMIN_SECRET) {
    return NextResponse.json(
      { error: "Deletes are not configured: set RESUME_ADMIN_SECRET." },
      { status: 500 },
    );
  }

  let secret: string | undefined;
  let urls: unknown;
  try {
    ({ secret, urls } = (await request.json()) as { secret?: string; urls?: unknown });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Not authorized to delete resumes." }, { status: 401 });
  }

  const list = Array.isArray(urls) ? urls.filter((u): u is string => typeof u === "string") : [];
  if (list.length === 0) {
    return NextResponse.json({ error: "No files specified." }, { status: 400 });
  }

  // Only ever touch blobs under the resume/ prefix.
  const safe = list.filter((u) => u.includes("/resume/"));
  if (safe.length !== list.length) {
    return NextResponse.json({ error: "Refusing to delete a non-resume file." }, { status: 400 });
  }

  try {
    await del(safe);
    return NextResponse.json({ deleted: safe.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
