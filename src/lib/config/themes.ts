// Theme presets for the public page. One place to add/tweak themes — the
// editor's picker, the live preview, and the public page all read from here.
// Values are plain CSS so they work in a server-rendered inline style.

export type ThemeId = "light" | "dark" | "gradient" | "minimal";

export type Theme = {
  id: ThemeId;
  label: string;
  /** CSS custom properties applied to the page root. */
  vars: {
    "--page-bg": string;
    "--page-fg": string;
    "--page-muted": string;
    "--card-bg": string;
    "--card-border": string;
    "--btn-bg": string;
    "--btn-fg": string;
    "--accent": string;
  };
};

export const THEMES: Theme[] = [
  {
    id: "dark",
    label: "Dark",
    vars: {
      "--page-bg": "#0b0d12",
      "--page-fg": "#e8eaef",
      "--page-muted": "#9aa3b2",
      "--card-bg": "#12151c",
      "--card-border": "#262b36",
      "--btn-bg": "#181c25",
      "--btn-fg": "#e8eaef",
      "--accent": "#5eead4",
    },
  },
  {
    id: "light",
    label: "Light",
    vars: {
      "--page-bg": "#f7f8fa",
      "--page-fg": "#15171c",
      "--page-muted": "#5b6472",
      "--card-bg": "#ffffff",
      "--card-border": "#e3e6eb",
      "--btn-bg": "#ffffff",
      "--btn-fg": "#15171c",
      "--accent": "#0d9488",
    },
  },
  {
    id: "gradient",
    label: "Gradient",
    vars: {
      "--page-bg": "linear-gradient(160deg, #4f46e5 0%, #9333ea 55%, #db2777 100%)",
      "--page-fg": "#ffffff",
      "--page-muted": "rgba(255,255,255,0.78)",
      "--card-bg": "rgba(255,255,255,0.12)",
      "--card-border": "rgba(255,255,255,0.25)",
      "--btn-bg": "rgba(255,255,255,0.16)",
      "--btn-fg": "#ffffff",
      "--accent": "#ffffff",
    },
  },
  {
    id: "minimal",
    label: "Minimal",
    vars: {
      "--page-bg": "#ffffff",
      "--page-fg": "#111111",
      "--page-muted": "#6b6b6b",
      "--card-bg": "#ffffff",
      "--card-border": "#111111",
      "--btn-bg": "#111111",
      "--btn-fg": "#ffffff",
      "--accent": "#111111",
    },
  },
];

export const THEME_MAP: Record<string, Theme> = Object.fromEntries(THEMES.map((t) => [t.id, t]));

export const DEFAULT_THEME: ThemeId = "dark";

export function getTheme(id: string | null | undefined): Theme {
  return (id && THEME_MAP[id]) || THEME_MAP[DEFAULT_THEME];
}
