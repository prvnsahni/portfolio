/**
 * Study corner registry. To add a note:
 * 1. Create src/content/notes/<slug>.mdx
 * 2. Add an entry below.
 * "production" = something I used in real client work.
 * "learning"   = something I'm studying and haven't shipped at work yet.
 */
export type NoteKind = "production" | "learning";

export type Note = {
  slug: string;
  title: string;
  tech: "Angular" | "React" | "Next.js" | "Performance" | "TypeScript" | "RxJS" | "Architecture";
  kind: NoteKind;
  summary: string;
  updated: string; // YYYY-MM-DD
};

export const notes: Note[] = [
  {
    slug: "why-virtualization-matters",
    title: "Why virtualization matters for big tables",
    tech: "Performance",
    kind: "production",
    summary: "What actually makes a 17,000-row table slow, and the two layers that fix it: paged data and virtualized rendering.",
    updated: "2026-09-29",
  },
  {
    slug: "react-memo-usememo-usecallback",
    title: "React.memo, useMemo and useCallback — see the re-renders",
    tech: "React",
    kind: "production",
    summary: "When memoization helps, when it doesn't, and a live render counter to prove it.",
    updated: "2026-09-29",
  },
  {
    slug: "angular-onpush-and-trackby",
    title: "Angular OnPush and trackBy in practice",
    tech: "Angular",
    kind: "production",
    summary: "How OnPush change detection and trackBy (or @for track) cut wasted work in list-heavy screens.",
    updated: "2026-09-29",
  },
  {
    slug: "config-driven-forms",
    title: "How a config-driven form engine works",
    tech: "Architecture",
    kind: "production",
    summary: "Describe a form as data, then render, validate and show or hide fields from that config — with a live editor you can try.",
    updated: "2026-09-29",
  },
];

export const techOrder: Note["tech"][] = ["Angular", "React", "Next.js", "Performance", "TypeScript", "RxJS", "Architecture"];

export function getNote(slug: string) {
  return notes.find((n) => n.slug === slug);
}
