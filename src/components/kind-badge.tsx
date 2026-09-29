import type { NoteKind } from "@/content/notes";

export function KindBadge({ kind }: { kind: NoteKind }) {
  return kind === "production" ? (
    <span className="rounded-full bg-good/15 px-2 py-0.5 font-mono text-[11px] text-good">From production</span>
  ) : (
    <span className="rounded-full bg-warn/15 px-2 py-0.5 font-mono text-[11px] text-warn">Learning notes</span>
  );
}
