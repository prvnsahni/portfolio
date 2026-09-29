import type { CSSProperties, ReactNode } from "react";

/**
 * Building blocks for the case-study architecture diagrams.
 *
 * These are plain server components — no client JS, no images. Every colour
 * comes from the globals.css design tokens. CSS custom properties only resolve
 * through the `style` prop (not as SVG presentation attributes), so fills and
 * strokes are set there.
 *
 * Each diagram is a single <svg> that scales to its container width
 * (`width: 100%`, `height: auto`) so it never overflows on mobile.
 */

const titleStyle: CSSProperties = { fill: "var(--text)", fontWeight: 600 };
const subStyle: CSSProperties = { fill: "var(--muted)" };
const edgeStyle: CSSProperties = { stroke: "var(--muted)" };

export function DiagramFrame({
  label,
  width,
  height,
  children,
}: {
  /** Plain-words description, used as the accessible name. */
  label: string;
  width: number;
  height: number;
  children: ReactNode;
}) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{
        width: "100%",
        height: "auto",
        maxWidth: "100%",
        display: "block",
        fontFamily: "var(--font-sans)",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="diagram-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path
            d="M1,1 L9,5 L1,9"
            style={{ fill: "none", stroke: "var(--muted)" }}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
      {children}
    </svg>
  );
}

export function Node({
  x,
  y,
  w,
  h = 56,
  title,
  subtitle,
  accent = false,
  titleSize = 15,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  title: string;
  subtitle?: string;
  accent?: boolean;
  titleSize?: number;
}) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        style={{ fill: "var(--surface)", stroke: accent ? "var(--accent)" : "var(--line)" }}
        strokeWidth={accent ? 2 : 1.5}
      />
      <text
        x={cx}
        y={subtitle ? cy - 8 : cy}
        textAnchor="middle"
        dominantBaseline="middle"
        style={titleStyle}
        fontSize={titleSize}
      >
        {title}
      </text>
      {subtitle ? (
        <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle" style={subStyle} fontSize={12}>
          {subtitle}
        </text>
      ) : null}
    </g>
  );
}

export function Edge({
  from,
  to,
  label,
  dashed = false,
}: {
  from: [number, number];
  to: [number, number];
  label?: string;
  dashed?: boolean;
}) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        style={edgeStyle}
        strokeWidth={1.5}
        strokeDasharray={dashed ? "5 5" : undefined}
        markerEnd="url(#diagram-arrow)"
      />
      {label ? (
        <text x={mx} y={Math.min(y1, y2) - 8} textAnchor="middle" style={subStyle} fontSize={11}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

/** Small uppercase lane label. */
export function Caption({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <text x={x} y={y} style={{ fill: "var(--muted)" }} fontSize={11} fontWeight={600} letterSpacing={1.5}>
      {children}
    </text>
  );
}

/** Full-width plain-words note under a diagram. */
export function NoteText({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <text x={x} y={y} style={{ fill: "var(--muted)" }} fontSize={12}>
      {children}
    </text>
  );
}
