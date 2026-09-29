import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui";
import { KindBadge } from "@/components/kind-badge";
import { notes, techOrder } from "@/content/notes";

export const metadata: Metadata = {
  title: "Study corner",
  description: "Notes on Angular, React, Next.js and frontend performance, with live examples.",
};

export default function NotesPage() {
  const groups = techOrder
    .map((tech) => ({ tech, items: notes.filter((n) => n.tech === tech) }))
    .filter((g) => g.items.length > 0);

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading as="h1"
        eyebrow="Study corner"
        title="Notes from real projects"
        intro="Short, practical notes on the tools I use, each with an example you can try. “From production” means I shipped it in client work; “Learning notes” are topics I’m studying."
      />
      <div className="mt-12 space-y-12">
        {groups.map((g) => (
          <section key={g.tech}>
            <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-muted">{g.tech}</h2>
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {g.items.map((n) => (
                <li key={n.slug}>
                  <Link
                    href={`/notes/${n.slug}`}
                    className="block h-full rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent/50"
                  >
                    <KindBadge kind={n.kind} />
                    <h3 className="mt-3 font-semibold">{n.title}</h3>
                    <p className="mt-2 text-sm text-muted">{n.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-16 text-sm text-muted">New notes are added regularly: Next.js App Router, RxJS, NgRx, Signals and more.</p>
    </Container>
  );
}
