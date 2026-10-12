import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Clears the session server-side (removes the auth cookies), then redirects to
// login. POST-only so a prefetch/GET can't accidentally log the user out.
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 turns the POST into a GET for the redirect target.
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
