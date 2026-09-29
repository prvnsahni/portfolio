"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";

/** Counts commits and flashes the box, writing to the DOM directly so the counter itself never causes a render. */
function useRenderFlash<T extends HTMLElement>() {
  const box = useRef<T>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const count = useRef(0);
  useEffect(() => {
    count.current += 1;
    if (counter.current) counter.current.textContent = String(count.current);
    const el = box.current;
    if (!el) return;
    el.animate(
      [{ boxShadow: "0 0 0 2px var(--warn)" }, { boxShadow: "0 0 0 0 transparent" }],
      { duration: 600, easing: "ease-out" },
    );
  });
  return { box, counter };
}

function ChildCard({ title, note, onSelect }: { title: string; note: string; onSelect: () => void }) {
  const { box, counter } = useRenderFlash<HTMLDivElement>();
  return (
    <div ref={box} className="rounded-xl border border-line bg-surface-2 p-4">
      <p className="font-medium text-text">{title}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
      <div className="mt-3 flex items-center justify-between">
        <p className="font-mono text-sm text-text">
          renders: <span ref={counter}>0</span>
        </p>
        <button type="button" onClick={onSelect} className="text-xs text-muted hover:text-text">
          select
        </button>
      </div>
    </div>
  );
}

function PlainChild({ onSelect }: { onSelect: () => void }) {
  return <ChildCard title="Plain child" note="Re-renders whenever the parent does." onSelect={onSelect} />;
}

const MemoChild = memo(function MemoChild({ onSelect }: { onSelect: () => void }) {
  return <ChildCard title="React.memo child" note="Skips re-render if its props are unchanged." onSelect={onSelect} />;
});

export function MemoDemo() {
  const [count, setCount] = useState(0);
  const [stable, setStable] = useState(false);

  const stableHandler = useCallback(() => {}, []);
  // A new function on every render: breaks React.memo's shallow prop check.
  const inlineHandler = () => {};
  const onSelect = stable ? stableHandler : inlineHandler;

  return (
    <div className="not-prose my-6 rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent-strong"
        >
          Re-render parent (count: {count})
        </button>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={stable} onChange={(e) => setStable(e.target.checked)} />
          Wrap <code className="font-mono text-text">onSelect</code> in useCallback
        </label>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PlainChild onSelect={onSelect} />
        <MemoChild onSelect={onSelect} />
      </div>
      <p className="mt-3 text-xs text-muted">
        Try it: with the box unchecked, both children flash on every click. Check it, and only the plain child
        re-renders.
      </p>
    </div>
  );
}
