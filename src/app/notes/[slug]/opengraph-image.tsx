import { getNote, notes } from "@/content/notes";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Prerender one image per note at build time (mirrors page.tsx).
export function generateStaticParams() {
  return notes.map((n) => ({ slug: n.slug }));
}

export const dynamicParams = false;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNote(slug);

  return renderOgImage({
    eyebrow: note ? `Study note · ${note.tech}` : "Study note",
    title: note?.title ?? "Study note",
    subtitle: note?.summary ?? "",
    badge: note
      ? note.kind === "production"
        ? { label: "From production", tone: "good" }
        : { label: "Learning notes", tone: "warn" }
      : undefined,
  });
}
