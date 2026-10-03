import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

// This route never serves a cached response: it mints short-lived, single-use
// upload tokens, so it must run per request.
export const dynamic = "force-dynamic";

const ADMIN_SECRET = process.env.RESUME_ADMIN_SECRET;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB is plenty for a PDF resume.

/**
 * Client-upload endpoint for resumes.
 *
 * The browser never gets a write token up front. Instead `upload()` (in the
 * ResumeUploader component) POSTs here first; we verify the admin secret, and
 * only then does `handleUpload` hand back a short-lived token scoped to this
 * one upload. The PDF then streams from the browser straight to Blob storage —
 * it never passes through this server.
 *
 * Vercel also calls this same route a second time (server-to-server) once the
 * upload finishes; that `upload.completed` event skips onBeforeGenerateToken,
 * which is why the secret check lives inside onBeforeGenerateToken and not at
 * the top of the handler.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!ADMIN_SECRET) {
    return NextResponse.json(
      { error: "Uploads are not configured: set RESUME_ADMIN_SECRET." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // clientPayload carries the password the user typed into the form.
        let secret: string | undefined;
        try {
          secret = clientPayload ? (JSON.parse(clientPayload) as { secret?: string }).secret : undefined;
        } catch {
          secret = undefined;
        }
        if (secret !== ADMIN_SECRET) {
          throw new Error("Not authorized to upload a resume.");
        }
        if (!pathname.toLowerCase().endsWith(".pdf")) {
          throw new Error("Only PDF files are allowed.");
        }

        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: false, // keep the filename stable so re-uploads overwrite.
          allowOverwrite: true,
        };
      },
      // Nothing to persist on our side — the /resume page lists the store live.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
