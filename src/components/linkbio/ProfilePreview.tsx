import type { CSSProperties } from "react";
import { SOCIAL_PLATFORMS, socialDisplay, type SocialKey } from "@/lib/config/socials";
import { getTheme } from "@/lib/config/themes";

export type PreviewProfile = {
  username?: string | null;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  theme: string;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  socials: Partial<Record<SocialKey, string>>;
};

function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Only digits, for tel:/wa.me links. */
function digits(v: string): string {
  return v.replace(/[^\d]/g, "");
}

/**
 * Renders a profile as it appears publicly, themed. Pure/presentational so it
 * can be used both in the editor's live preview and on the public page.
 * Empty fields are omitted entirely.
 */
export function ProfilePreview({ profile, className = "" }: { profile: PreviewProfile; className?: string }) {
  const theme = getTheme(profile.theme);
  const rootStyle = {
    ...(theme.vars as unknown as CSSProperties),
    background: "var(--page-bg)",
    color: "var(--page-fg)",
  } as CSSProperties;

  const cardStyle: CSSProperties = {
    background: "var(--card-bg)",
    borderColor: "var(--card-border)",
  };
  const btnStyle: CSSProperties = {
    background: "var(--btn-bg)",
    color: "var(--btn-fg)",
    borderColor: "var(--card-border)",
  };

  const activeSocials = SOCIAL_PLATFORMS.map((p) => ({ p, url: profile.socials?.[p.key] })).filter(
    (s): s is { p: (typeof SOCIAL_PLATFORMS)[number]; url: string } => Boolean(s.url),
  );

  const contacts: { label: string; href: string }[] = [];
  if (profile.phone) contacts.push({ label: "Call", href: `tel:${profile.phone}` });
  if (profile.whatsapp) contacts.push({ label: "WhatsApp", href: `https://wa.me/${digits(profile.whatsapp)}` });
  if (profile.email) contacts.push({ label: "Email", href: `mailto:${profile.email}` });

  return (
    <div style={rootStyle} className={`min-h-full w-full px-5 py-10 ${className}`}>
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-5 text-center">
        {/* Avatar */}
        <div
          className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border text-2xl font-semibold"
          style={cardStyle}
        >
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span style={{ color: "var(--page-muted)" }}>{initials(profile.display_name)}</span>
          )}
        </div>

        {/* Name + bio */}
        {profile.display_name && <h1 className="text-xl font-semibold">{profile.display_name}</h1>}
        {profile.bio && (
          <p className="text-sm leading-relaxed" style={{ color: "var(--page-muted)" }}>
            {profile.bio}
          </p>
        )}

        {/* Socials */}
        {activeSocials.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {activeSocials.map(({ p, url }) => (
              <a
                key={p.key}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border px-3 py-1 text-xs font-medium"
                style={btnStyle}
                title={socialDisplay(url)}
              >
                {p.label}
              </a>
            ))}
          </div>
        )}

        {/* Contact buttons */}
        {contacts.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="w-full rounded-xl border px-4 py-3 text-sm font-medium"
                style={btnStyle}
              >
                {c.label}
              </a>
            ))}
          </div>
        )}

        {!profile.display_name && !profile.bio && activeSocials.length === 0 && contacts.length === 0 && (
          <p className="text-sm" style={{ color: "var(--page-muted)" }}>
            Your page is empty — fill in the form to see it here.
          </p>
        )}
      </div>
    </div>
  );
}
