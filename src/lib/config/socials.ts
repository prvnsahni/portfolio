// Social platforms shown in the editor and on the public page.
// To add a new one: add an entry here — the form, preview, and public page
// all read from this list. Each value is stored normalized to a full URL.

export type SocialKey =
  | "instagram"
  | "youtube"
  | "twitter"
  | "linkedin"
  | "facebook"
  | "github"
  | "telegram";

export type SocialPlatform = {
  key: SocialKey;
  label: string;
  /** Example hint shown under the input. */
  placeholder: string;
  /** Base used to build a URL from a bare handle. */
  base: string;
  /** YouTube/Telegram/X style handle URLs keep the leading "@". */
  keepAt?: boolean;
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: "instagram", label: "Instagram", placeholder: "@handle or full URL", base: "https://instagram.com/" },
  { key: "youtube", label: "YouTube", placeholder: "@handle or full URL", base: "https://youtube.com/", keepAt: true },
  { key: "twitter", label: "X / Twitter", placeholder: "@handle or full URL", base: "https://x.com/" },
  { key: "linkedin", label: "LinkedIn", placeholder: "profile URL or in/handle", base: "https://linkedin.com/in/" },
  { key: "facebook", label: "Facebook", placeholder: "handle or full URL", base: "https://facebook.com/" },
  { key: "github", label: "GitHub", placeholder: "handle or full URL", base: "https://github.com/" },
  { key: "telegram", label: "Telegram", placeholder: "@handle or full URL", base: "https://t.me/", keepAt: true },
];

export const SOCIAL_MAP: Record<SocialKey, SocialPlatform> = Object.fromEntries(
  SOCIAL_PLATFORMS.map((p) => [p.key, p]),
) as Record<SocialKey, SocialPlatform>;

/**
 * Normalize a raw social input (bare handle OR full URL) to a full URL.
 * Returns "" for empty input. Already-absolute URLs are returned as-is.
 */
export function normalizeSocial(key: SocialKey, raw: string): string {
  const input = raw.trim();
  if (!input) return "";

  // Already a URL (with or without scheme that looks like a domain).
  if (/^https?:\/\//i.test(input)) return input;
  if (/^[\w-]+\.[\w.-]+\//.test(input) || /^(www\.|[\w-]+\.(com|org|net|me|tv|io))/i.test(input)) {
    return `https://${input.replace(/^\/+/, "")}`;
  }

  const platform = SOCIAL_MAP[key];
  const handle = input.replace(/^@+/, "");
  const prefix = platform.keepAt ? "@" : "";
  return `${platform.base}${prefix}${handle}`;
}

/** A compact @handle/label to show in the UI for a stored social URL. */
export function socialDisplay(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\/+|\/+$/g, "");
    return path ? (path.startsWith("@") ? path : `@${path}`) : u.hostname;
  } catch {
    return url;
  }
}
