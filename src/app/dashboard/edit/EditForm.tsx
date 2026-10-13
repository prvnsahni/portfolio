"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues, BIO_MAX } from "@/lib/validation/profile";
import { SOCIAL_PLATFORMS, normalizeSocial, type SocialKey } from "@/lib/config/socials";
import { THEMES } from "@/lib/config/themes";
import type { Profile } from "@/lib/linkbio/types";
import { Alert, btnGhost, btnPrimary, inputClass, labelClass } from "@/components/linkbio/form";
import { UsernameField, type UsernameStatus } from "@/components/linkbio/UsernameField";
import { ProfilePreview, type PreviewProfile } from "@/components/linkbio/ProfilePreview";
import { saveProfile, setUsername } from "./actions";

type SaveState = { kind: "idle" | "saving" } | { kind: "ok" } | { kind: "error"; message: string };

function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
      <div>
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function EditForm({ profile }: { profile: Profile }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: profile.display_name ?? "",
      bio: profile.bio ?? "",
      theme: profile.theme,
      phone: profile.phone ?? "",
      email: profile.email ?? "",
      whatsapp: profile.whatsapp ?? "",
      is_published: profile.is_published,
      socials: Object.fromEntries(
        SOCIAL_PLATFORMS.map((p) => [p.key, profile.socials?.[p.key] ?? ""]),
      ) as Record<SocialKey, string>,
    },
  });

  const [save, setSave] = useState<SaveState>({ kind: "idle" });

  // --- Username (Route) section: separate save with a change warning ---
  const [newUsername, setNewUsername] = useState(profile.username ?? "");
  const [uStatus, setUStatus] = useState<UsernameStatus>("current");
  const [uState, setUState] = useState<SaveState>({ kind: "idle" });

  async function onSave(values: ProfileFormValues) {
    setSave({ kind: "saving" });
    const result = await saveProfile(values);
    if (!result.ok) {
      setSave({ kind: "error", message: result.error });
      return;
    }
    setSave({ kind: "ok" });
    router.refresh();
  }

  async function onUpdateUsername() {
    if (uStatus !== "available") return;
    const confirmed = window.confirm(
      "Change your username?\n\nExisting NFC tags and shared links point to your old username. They'll keep working via a redirect, but you should re-write tags when you can.",
    );
    if (!confirmed) return;
    setUState({ kind: "saving" });
    const result = await setUsername(newUsername);
    if (!result.ok) {
      setUState({ kind: "error", message: result.error });
      return;
    }
    setUState({ kind: "ok" });
    router.refresh();
  }

  // --- Live preview ---
  const values = watch();
  const previewSocials: Partial<Record<SocialKey, string>> = {};
  for (const p of SOCIAL_PLATFORMS) {
    const raw = values.socials?.[p.key];
    const norm = raw ? normalizeSocial(p.key, raw) : "";
    if (norm) previewSocials[p.key] = norm;
  }
  const preview: PreviewProfile = {
    username: profile.username,
    display_name: values.display_name,
    bio: values.bio,
    avatar_url: profile.avatar_url,
    theme: values.theme ?? profile.theme,
    phone: values.phone,
    email: values.email,
    whatsapp: values.whatsapp,
    socials: previewSocials,
  };

  const bioLen = (values.bio ?? "").length;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
      {/* ------------------------------ Form ------------------------------ */}
      <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-text">Edit your page</h1>
          {profile.username && (
            <p className="text-sm text-muted">
              Public at{" "}
              <Link href={`/u/${profile.username}`} target="_blank" className="font-mono text-accent hover:underline">
                /u/{profile.username}
              </Link>
            </p>
          )}
        </div>

        {/* Route / username */}
        <Section title="Route" hint="Your public username. Changing it later redirects old links to the new one.">
          <UsernameField
            value={newUsername}
            onChange={setNewUsername}
            current={profile.username}
            onStatusChange={setUStatus}
            disabled={uState.kind === "saving"}
          />
          {uState.kind === "error" && <Alert kind="error">{uState.message}</Alert>}
          {uState.kind === "ok" && <Alert kind="success">Username updated.</Alert>}
          {uStatus === "available" && (
            <button type="button" onClick={onUpdateUsername} className={btnGhost}>
              {uState.kind === "saving" ? "Updating…" : "Update username"}
            </button>
          )}
        </Section>

        {/* Profile */}
        <Section title="Profile">
          <label className={labelClass}>
            Display name
            <input type="text" {...register("display_name")} className={inputClass} placeholder="Praveen Kumar" />
          </label>
          {errors.display_name && <Alert kind="error">{errors.display_name.message}</Alert>}

          <label className={labelClass}>
            <span className="flex items-center justify-between">
              Bio
              <span className={`font-mono text-xs ${bioLen > BIO_MAX ? "text-bad" : "text-muted"}`}>
                {bioLen}/{BIO_MAX}
              </span>
            </span>
            <textarea
              {...register("bio")}
              rows={3}
              className={inputClass}
              placeholder="Frontend engineer. I build fast, accessible UIs."
            />
          </label>
          {errors.bio && <Alert kind="error">{errors.bio.message}</Alert>}
        </Section>

        {/* Contact */}
        <Section title="Contact" hint="All optional. Empty fields are hidden on your public page.">
          <label className={labelClass}>
            Phone
            <input type="tel" {...register("phone")} className={inputClass} placeholder="+91 98765 43210" />
          </label>
          <label className={labelClass}>
            Email
            <input type="email" {...register("email")} className={inputClass} placeholder="you@example.com" />
          </label>
          {errors.email && <Alert kind="error">{errors.email.message}</Alert>}
          <label className={labelClass}>
            WhatsApp number
            <input type="tel" {...register("whatsapp")} className={inputClass} placeholder="+91 98765 43210" />
          </label>
        </Section>

        {/* Socials */}
        <Section title="Social links" hint="Paste a full URL or just your @handle — we'll normalize it.">
          <div className="grid gap-3 sm:grid-cols-2">
            {SOCIAL_PLATFORMS.map((p) => (
              <label key={p.key} className={labelClass}>
                {p.label}
                <input
                  type="text"
                  {...register(`socials.${p.key}` as const)}
                  className={inputClass}
                  placeholder={p.placeholder}
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </label>
            ))}
          </div>
        </Section>

        {/* Theme */}
        <Section title="Theme">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {THEMES.map((t) => (
              <label key={t.id} className="cursor-pointer">
                <input type="radio" value={t.id} {...register("theme")} className="peer sr-only" />
                <div className="rounded-xl border border-line p-3 text-center text-sm transition-colors peer-checked:border-accent peer-checked:text-accent">
                  <span
                    className="mb-2 block h-8 w-full rounded-md border border-line"
                    style={{ background: t.vars["--page-bg"] }}
                  />
                  {t.label}
                </div>
              </label>
            ))}
          </div>
        </Section>

        {/* Publish */}
        <Section title="Visibility">
          <label className="flex items-center gap-3 text-sm text-text">
            <input type="checkbox" {...register("is_published")} className="h-4 w-4 accent-accent" />
            Published — your page is publicly visible
          </label>
        </Section>

        {/* Save bar */}
        <div className="sticky bottom-0 flex items-center gap-4 border-t border-line bg-bg/90 py-4 backdrop-blur">
          <button type="submit" disabled={isSubmitting || save.kind === "saving"} className={btnPrimary}>
            {save.kind === "saving" ? "Saving…" : "Save changes"}
          </button>
          {save.kind === "ok" && <span className="text-sm text-good">Saved ✓</span>}
          {save.kind === "error" && <span className="text-sm text-bad">{save.message}</span>}
        </div>
      </form>

      {/* ---------------------------- Preview ----------------------------- */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Live preview</p>
        <div className="overflow-hidden rounded-3xl border border-line">
          <ProfilePreview profile={preview} />
        </div>
      </div>
    </div>
  );
}
