"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, usernameSchema } from "@/lib/validation/profile";
import { normalizeSocial, SOCIAL_PLATFORMS, type SocialKey } from "@/lib/config/socials";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Save the editable profile fields (not the username — see setUsername). */
export async function saveProfile(raw: unknown): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const v = parsed.data;

  // Normalize each social to a full URL; drop empties.
  const socials: Partial<Record<SocialKey, string>> = {};
  for (const p of SOCIAL_PLATFORMS) {
    const rawVal = (v.socials as Record<string, string | undefined>)[p.key];
    const norm = rawVal ? normalizeSocial(p.key, rawVal) : "";
    if (norm) socials[p.key] = norm;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: v.display_name ?? null,
      bio: v.bio ?? null,
      theme: v.theme,
      phone: v.phone ?? null,
      email: v.email ?? null,
      whatsapp: v.whatsapp ?? null,
      is_published: v.is_published,
      socials,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/edit");
  return { ok: true };
}

/**
 * Claim a username (first login) or change an existing one. On change, the old
 * username is recorded in username_history so old NFC tags/links still redirect.
 */
export async function setUsername(rawName: unknown): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = usernameSchema.safeParse(rawName);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid username." };
  }
  const username = parsed.data;
  const supabase = await createClient();

  const { data: current } = await supabase.from("profiles").select("username").eq("id", user.id).single();
  const oldUsername = current?.username ?? null;
  if (oldUsername === username) return { ok: true };

  // Source-of-truth availability check (bypasses RLS via SECURITY DEFINER).
  const { data: available, error: rpcErr } = await supabase.rpc("username_available", { name: username });
  if (rpcErr) return { ok: false, error: rpcErr.message };
  if (!available) return { ok: false, error: "That username is taken." };

  if (oldUsername) {
    const { error: histErr } = await supabase
      .from("username_history")
      .insert({ old_username: oldUsername, user_id: user.id });
    if (histErr) return { ok: false, error: histErr.message };
  }

  const { error } = await supabase.from("profiles").update({ username }).eq("id", user.id);
  if (error) {
    // Unique-violation safety net (race between the check and the update).
    return { ok: false, error: error.code === "23505" ? "That username is taken." : error.message };
  }

  revalidatePath("/dashboard/edit");
  return { ok: true };
}
