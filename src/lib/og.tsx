import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

/**
 * Shared renderer for the site's Open Graph / Twitter images.
 *
 * Runs in the Node.js runtime (needs the filesystem to read fonts) and is
 * imported by each `opengraph-image.tsx` route. Satori — the engine behind
 * `next/og` — supports flexbox and a subset of CSS only, so everything here
 * uses inline styles and flex layouts (no grid, no Tailwind classes).
 *
 * Colours mirror the design tokens in globals.css.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const colors = {
  bg: "#0b0d12",
  text: "#e8eaef",
  muted: "#9aa3b2",
  accent: "#5eead4",
  line: "#262b36",
  good: "#34d399",
  warn: "#fbbf24",
};

// Fonts don't depend on request data, so read them once at module scope.
const fontsDir = join(process.cwd(), "node_modules/geist/dist/fonts");
const [geistRegular, geistSemiBold, geistMonoMedium] = await Promise.all([
  readFile(join(fontsDir, "geist-sans/Geist-Regular.ttf")),
  readFile(join(fontsDir, "geist-sans/Geist-SemiBold.ttf")),
  readFile(join(fontsDir, "geist-mono/GeistMono-Medium.ttf")),
]);

function clamp(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** A coloured pill shown at the top-right, echoing KindBadge. */
export type OgBadge = { label: string; tone: "good" | "warn" };

export type OgContent = {
  /** Small uppercase label above the title (e.g. "Case study"). */
  eyebrow: string;
  /** The headline. */
  title: string;
  /** One-line supporting sentence, clamped to keep the layout tidy. */
  subtitle: string;
  /** Optional mono text shown at the bottom-right (e.g. a headline metric). */
  footerRight?: string;
  /** Optional coloured badge shown at the top-right. */
  badge?: OgBadge;
};

export function renderOgImage({ eyebrow, title, subtitle, footerRight, badge }: OgContent) {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: colors.bg,
          color: colors.text,
          fontFamily: "Geist",
          padding: "72px 80px",
        }}
      >
        {/* Accent glow, echoing the hero backdrop. */}
        <div
          style={{
            position: "absolute",
            top: -220,
            left: -160,
            width: 720,
            height: 720,
            background: `radial-gradient(circle, rgba(94,234,212,0.16), rgba(94,234,212,0) 70%)`,
          }}
        />

        {/* Eyebrow, with an optional badge pill on the right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: colors.accent,
                marginRight: 16,
              }}
            />
            <div
              style={{
                fontFamily: "GeistMono",
                fontSize: 24,
                letterSpacing: 4,
                color: colors.accent,
              }}
            >
              {eyebrow.toUpperCase()}
            </div>
          </div>
          {badge ? (
            <div
              style={{
                display: "flex",
                fontFamily: "GeistMono",
                fontSize: 22,
                color: colors[badge.tone],
                background: `${colors[badge.tone]}26`,
                border: `1px solid ${colors[badge.tone]}59`,
                borderRadius: 999,
                padding: "8px 20px",
              }}
            >
              {badge.label}
            </div>
          ) : null}
        </div>

        {/* Title + subtitle */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 960,
            }}
          >
            {clamp(title, 80)}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 30,
              lineHeight: 1.35,
              color: colors.muted,
              maxWidth: 900,
            }}
          >
            {clamp(subtitle, 130)}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${colors.line}`,
            paddingTop: 28,
            fontFamily: "GeistMono",
            fontSize: 22,
            color: colors.muted,
          }}
        >
          <div>{site.url.replace("https://", "")}</div>
          {footerRight ? <div>{footerRight}</div> : null}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Geist", data: geistRegular, weight: 400, style: "normal" },
        { name: "Geist", data: geistSemiBold, weight: 600, style: "normal" },
        { name: "GeistMono", data: geistMonoMedium, weight: 500, style: "normal" },
      ],
    },
  );
}
