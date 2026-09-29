import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KindBadge } from "@/components/kind-badge";
import { Container } from "@/components/ui";
import { getNote, notes } from "@/content/notes";

export function generateStaticParams() {
  return notes.map((n) => ({ slug: n.slug }));
}

export const dynamicParams = false;

export async function generateMetadata(props: PageProps<"/notes/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const note = getNote(slug);
  if (!note) return {};
  return { title: note.title, description: note.summary };
}

export default async function NotePage(props: PageProps<"/notes/[slug]">) {
  const { slug } = await props.params;
  const note = getNote(slug);
  if (!note) notFound();

  const { default: Body } = await import(`@/content/notes/${slug}.mdx`);

  return (
    <Container className="py-16 sm:py-20">
      <Link href="/notes" className="text-sm text-muted hover:text-text">
        ← Study corner
      </Link>
      <article className="mt-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <KindBadge kind={note.kind} />
          <span className="font-mono text-xs text-muted">
            {note.tech} · updated {note.updated}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{note.title}</h1>
        <p className="mt-3 text-lg text-muted">{note.summary}</p>
        <div className="prose-body mt-8">
          <Body />
        </div>
      </article>
    </Container>
  );
}
