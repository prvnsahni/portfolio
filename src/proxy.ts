import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

// Renamed from `middleware.ts` in Next.js 16 (runs on the Node.js runtime).
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on everything except Next internals, static assets, and the resume
  // admin API. Keeps auth-cookie refresh working across the app without
  // blocking CSS/JS/images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)"],
};
