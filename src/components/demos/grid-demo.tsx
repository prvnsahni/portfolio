"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  fetchAllRows,
  fetchPage,
  LATENCY_MS,
  PAGE_SIZE,
  TOTAL_ROWS,
  type FinRow,
} from "@/lib/synthetic-data";

type Strategy = "naive" | "optimized";

type Result = {
  strategy: Strategy;
  timeToRows: number; // ms from click to first rows painted
  domNodes: number;
  requests: number;
  longestFrame: number; // ms, worst main-thread block during the run
};

const ROW_HEIGHT = 36;
const VIEW_HEIGHT = 432;
const TOTAL_PAGES = Math.ceil(TOTAL_ROWS / PAGE_SIZE);

const columns: { key: keyof FinRow; label: string; align?: "right"; format?: (v: number) => string }[] = [
  { key: "id", label: "#", align: "right" },
  { key: "company", label: "Company" },
  { key: "sector", label: "Sector" },
  { key: "region", label: "Region" },
  { key: "revenue", label: "Revenue ($M)", align: "right", format: (v) => v.toLocaleString("en-US", { minimumFractionDigits: 1 }) },
  { key: "ebitda", label: "EBITDA ($M)", align: "right", format: (v) => v.toLocaleString("en-US", { minimumFractionDigits: 1 }) },
  { key: "margin", label: "Margin %", align: "right", format: (v) => v.toFixed(1) },
  { key: "pe", label: "P/E", align: "right", format: (v) => v.toFixed(1) },
  { key: "change", label: "1Y %", align: "right", format: (v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}` },
];

const gridCols = "56px minmax(180px,1.6fr) 110px 120px 110px 110px 84px 64px 72px";
const MIN_WIDTH = 960;

/** Wait until the browser has painted the current DOM. */
const afterPaint = () => new Promise<void>((res) => requestAnimationFrame(() => requestAnimationFrame(() => res())));

/** Tracks frames per second and the longest gap between frames (a blocked main thread). */
function useFrameStats() {
  const [fps, setFps] = useState(0);
  const longestRef = useRef(0);
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let windowStart = last;
    const tick = (now: number) => {
      const gap = now - last;
      if (gap > longestRef.current) longestRef.current = gap;
      last = now;
      frames += 1;
      if (now - windowStart >= 500) {
        setFps(Math.round((frames * 1000) / (now - windowStart)));
        frames = 0;
        windowStart = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return { fps, longestRef };
}

function Cell({ row, col }: { row: FinRow; col: (typeof columns)[number] }) {
  const v = row[col.key];
  const text = typeof v === "number" && col.format ? col.format(v) : String(v);
  const tone = col.key === "change" ? ((v as number) >= 0 ? "text-good" : "text-bad") : "";
  return (
    <div role="cell" className={`truncate px-3 ${col.align === "right" ? "text-right font-mono" : ""} ${tone}`}>
      {text}
    </div>
  );
}

function Row({ row, style }: { row: FinRow; style?: React.CSSProperties }) {
  return (
    <div
      role="row"
      className="grid items-center border-b border-line/60 text-[13px] text-text/90"
      style={{ gridTemplateColumns: gridCols, height: ROW_HEIGHT, ...style }}
    >
      {columns.map((c) => (
        <Cell key={c.key} row={row} col={c} />
      ))}
    </div>
  );
}

function SkeletonRow({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-3 border-b border-line/60 px-3"
      style={{ height: ROW_HEIGHT, ...style }}
    >
      <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
    </div>
  );
}

function Header() {
  return (
    <div role="rowgroup">
      <div
        role="row"
        className="sticky top-0 z-10 grid items-center border-b border-line bg-surface-2 font-mono text-[11px] uppercase tracking-wide text-muted"
        style={{ gridTemplateColumns: gridCols, height: ROW_HEIGHT }}
      >
        {columns.map((c) => (
          <div key={c.key} role="columnheader" className={`px-3 ${c.align === "right" ? "text-right" : ""}`}>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Strategy 1: fetch everything, render everything ---------- */

function NaiveGrid({ rows }: { rows: FinRow[] }) {
  return (
    <div role="rowgroup">
      {rows.map((r) => (
        <Row key={r.id} row={r} />
      ))}
    </div>
  );
}

/* ---------- Strategy 2: paged fetch + cache + virtualized rendering ---------- */

function OptimizedGrid({
  scrollRef,
  onFirstRows,
  onRequest,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onFirstRows: () => void;
  onRequest: () => void;
}) {
  const cache = useRef(new Map<number, FinRow[]>());
  const inflight = useRef(new Set<number>());
  const reported = useRef(false);
  const [, setVersion] = useState(0);

  const virtualizer = useVirtualizer({
    count: TOTAL_ROWS,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const items = virtualizer.getVirtualItems();
  const firstPage = items.length ? Math.floor(items[0].index / PAGE_SIZE) : 0;
  const lastPage = items.length ? Math.floor(items[items.length - 1].index / PAGE_SIZE) : 0;

  useEffect(() => {
    for (let p = firstPage; p <= lastPage; p++) {
      if (cache.current.has(p) || inflight.current.has(p)) continue; // cache hit or already loading
      inflight.current.add(p);
      onRequest();
      fetchPage(p).then((rows) => {
        cache.current.set(p, rows);
        inflight.current.delete(p);
        flushSync(() => setVersion((v) => v + 1));
        if (!reported.current) {
          reported.current = true;
          onFirstRows();
        }
      });
    }
  }, [firstPage, lastPage, onFirstRows, onRequest]);

  return (
    <div role="rowgroup" style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
      {items.map((item) => {
        const page = cache.current.get(Math.floor(item.index / PAGE_SIZE));
        const row = page?.[item.index % PAGE_SIZE];
        const style: React.CSSProperties = { position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${item.start}px)` };
        return row ? <Row key={item.key} row={row} style={style} /> : <SkeletonRow key={item.key} style={style} />;
      })}
    </div>
  );
}

/* ---------- Demo shell ---------- */

export function GridDemo() {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [naiveRows, setNaiveRows] = useState<FinRow[] | null>(null);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Partial<Record<Strategy, Result>>>({});
  const [runId, setRunId] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t0 = useRef(0);
  const requests = useRef(0);
  const { fps, longestRef } = useFrameStats();

  const countNodes = () => scrollRef.current?.getElementsByTagName("*").length ?? 0;

  const finish = useCallback(
    async (s: Strategy) => {
      await afterPaint();
      const timeToRows = performance.now() - t0.current;
      // Let a few more frames pass so a long block after paint is also captured.
      await afterPaint();
      setResults((prev) => ({
        ...prev,
        [s]: { strategy: s, timeToRows, domNodes: countNodes(), requests: requests.current, longestFrame: longestRef.current },
      }));
      setRunning(false);
    },
    [longestRef],
  );

  const start = async (s: Strategy) => {
    if (running) return;
    // Tear down the previous grid first, so its cleanup cost isn't counted against this run.
    flushSync(() => {
      setRunning(true);
      setNaiveRows(null);
      setStrategy(null);
    });
    scrollRef.current?.scrollTo({ top: 0 });
    await afterPaint();

    requests.current = 0;
    longestRef.current = 0;
    t0.current = performance.now();
    setStrategy(s);
    setRunId((n) => n + 1);

    if (s === "naive") {
      requests.current = 1;
      fetchAllRows().then((rows) => {
        flushSync(() => setNaiveRows(rows)); // commit all 17,000 rows now
        finish("naive");
      });
    }
  };

  const onFirstRows = useCallback(() => finish("optimized"), [finish]);
  const onRequest = useCallback(() => {
    requests.current += 1;
  }, []);

  return (
    <div className="rounded-2xl border border-line bg-surface">
      {/* Controls */}
      <div className="flex flex-col gap-4 border-b border-line p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={running}
            onClick={() => start("naive")}
            className="rounded-lg border border-bad/50 px-4 py-2 text-sm font-medium text-bad hover:bg-bad/10 disabled:opacity-50"
          >
            1 · Load all 17,000 rows
          </button>
          <button
            type="button"
            disabled={running}
            onClick={() => start("optimized")}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent-strong disabled:opacity-50"
          >
            2 · Paged + virtualized
          </button>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs text-muted" aria-live="polite">
          <span>
            FPS <span className="text-text">{fps}</span>
          </span>
          <span>{running ? "running…" : strategy ? `showing: ${strategy === "naive" ? "load all" : "paged + virtualized"}` : "pick a strategy"}</span>
        </div>
      </div>

      {/* Grid */}
      <div
        ref={scrollRef}
        tabIndex={0}
        role="group"
        aria-label="Synthetic financial data, scrollable"
        className="overflow-auto rounded-sm focus-visible:outline-2 focus-visible:outline-accent"
        style={{ height: VIEW_HEIGHT }}
      >
        <div style={{ minWidth: MIN_WIDTH }}>
          <div role="table" aria-label="Synthetic financial data">
            <Header />
            {strategy === "naive" && naiveRows && <NaiveGrid rows={naiveRows} />}
            {strategy === "optimized" && (
              <OptimizedGrid key={runId} scrollRef={scrollRef} onFirstRows={onFirstRows} onRequest={onRequest} />
            )}
          </div>
          {!strategy && (
            <p className="p-8 text-center text-sm text-muted">Choose a strategy above. Try the first one, then the second, and compare.</p>
          )}
          {strategy === "naive" && !naiveRows && (
            <p className="p-8 text-center text-sm text-muted">Fetching 17,000 rows…</p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-px border-t border-line bg-line md:grid-cols-2">
        {(["naive", "optimized"] as Strategy[]).map((s) => {
          const r = results[s];
          return (
            <div key={s} className="bg-surface p-5" data-testid={`result-${s}`}>
              <p className={`text-sm font-medium ${s === "naive" ? "text-bad" : "text-accent"}`}>
                {s === "naive" ? "Load all rows" : "Paged + virtualized"}
              </p>
              {r ? (
                <dl className="mt-3 grid grid-cols-2 gap-3 font-mono text-sm">
                  <div>
                    <dt className="text-xs text-muted">Time to rows</dt>
                    <dd>{Math.round(r.timeToRows).toLocaleString()} ms</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Longest frozen frame</dt>
                    <dd>{Math.round(r.longestFrame).toLocaleString()} ms</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">DOM nodes in grid</dt>
                    <dd>{r.domNodes.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Requests</dt>
                    <dd>
                      {r.requests}
                      {s === "optimized" && <span className="text-muted"> of {TOTAL_PAGES} pages</span>}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm text-muted">Not run yet.</p>
              )}
            </div>
          );
        })}
      </div>
      <p className="border-t border-line px-5 py-3 text-xs text-muted">
        Synthetic data, measured live in your browser. Both strategies use the same simulated {LATENCY_MS} ms API latency per
        request. After running strategy 2, scroll the grid: pages load on demand ({PAGE_SIZE} rows each) and scrolling back
        reads from the cache.
      </p>
    </div>
  );
}
