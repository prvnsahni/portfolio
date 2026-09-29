/**
 * Placeholder hero visual: a small "data grid" with a few live cells.
 * Phase 3 replaces this with the 3D data-portrait (React Three Fiber),
 * keeping this as the fallback for phones and reduced motion.
 */
const COLS = 12;
const ROWS = 10;

// Deterministic pattern so server and client render the same markup.
function isLive(i: number) {
  return (i * 37 + 11) % 13 === 0 || (i * 17) % 29 === 3;
}

export function HeroGrid() {
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => i);
  return (
    <div aria-hidden className="relative w-full max-w-md">
      <div className="absolute -inset-8 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative rounded-2xl border border-line bg-surface/80 p-3 shadow-2xl">
        <div className="mb-2 flex items-center gap-1.5 px-1">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="ml-3 font-mono text-[10px] text-muted">rows 1–40 of 17,000 · virtualized</span>
        </div>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
          {cells.map((i) => (
            <span
              key={i}
              className={`h-4 rounded-[3px] ${
                i < COLS ? "bg-surface-2" : isLive(i) ? "cell-pulse bg-accent" : "bg-surface-2/70"
              }`}
              style={isLive(i) ? { animationDelay: `${(i % 7) * 0.4}s` } : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
