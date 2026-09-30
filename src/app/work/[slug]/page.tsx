import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchitectureDiagram } from "@/components/diagrams";
import { ButtonLink, Container, Eyebrow, Tag } from "@/components/ui";
import { getProject, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata(props: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: `${project.name} case study`, description: project.summary };
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-10">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function ProjectPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];

  const toc: [string, string][] = [
    ["problem", "Problem"],
    ["constraints", "Constraints"],
    ...(project.diagram ? ([["architecture", "Architecture"]] as [string, string][]) : []),
    ["approach", "What I built"],
    ["decisions", "Decisions and trade-offs"],
    ["results", "Results"],
    ["lessons", "What I'd do differently"],
  ];

  return (
    <Container className="py-16 sm:py-20">
      <Link href="/work" className="text-sm text-muted hover:text-text">
        ← All work
      </Link>

      <header className="mt-6 max-w-3xl">
        <Eyebrow>{project.period}</Eyebrow>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{project.name}</h1>
        <p className="mt-2 text-lg text-muted">{project.subtitle}</p>
        <p className="mt-6 leading-relaxed text-muted">{project.summary}</p>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Role</dt>
            <dd className="mt-1">{project.role}</dd>
          </div>
          {project.client && (
            <div>
              <dt className="text-muted">Client</dt>
              <dd className="mt-1">{project.client}</dd>
            </div>
          )}
        </dl>
        <div className="mt-6 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
        {(project.demos?.length || project.publicLink) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {project.demos?.map((d) => (
              <ButtonLink key={d.href} href={d.href}>
                {d.label}
              </ButtonLink>
            ))}
            {project.publicLink && (
              <ButtonLink href={project.publicLink.href} variant="ghost" external>
                {project.publicLink.label} ↗
              </ButtonLink>
            )}
          </div>
        )}
      </header>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {project.metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-line bg-surface p-4">
            <p className="font-mono text-2xl font-semibold text-accent">{m.value}</p>
            <p className="mt-1 text-xs text-muted">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-[200px_1fr]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-24 space-y-2 text-sm">
            {toc.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="text-muted hover:text-text">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl space-y-12">
          <Section id="problem" title="Problem">
            {project.problem.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-muted first:mt-0">
                {p}
              </p>
            ))}
          </Section>

          <Section id="constraints" title="Constraints">
            <ul className="list-disc space-y-2 pl-5 text-muted">
              {project.constraints.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Section>

          {project.diagram && (
            <Section id="architecture" title="Architecture">
              <div className="rounded-2xl border border-line bg-surface/40 p-5 sm:p-6">
                <ArchitectureDiagram slug={project.slug} label={project.diagram} />
              </div>
            </Section>
          )}

          <Section id="approach" title="What I built">
            <div className="space-y-6">
              {project.approach.map((a, i) => (
                <div key={a.title} className="flex gap-4">
                  <span className="mt-0.5 font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-medium">{a.title}</h3>
                    <p className="mt-1 leading-relaxed text-muted">{a.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="decisions" title="Decisions and trade-offs">
            <div className="space-y-4">
              {project.decisions.map((d) => (
                <div key={d.title} className="rounded-xl border border-line bg-surface p-5">
                  <h3 className="font-medium">{d.title}</h3>
                  <p className="mt-2 text-sm text-muted">
                    <span className="text-text">Choice: </span>
                    {d.choice}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    <span className="text-text">Trade-off: </span>
                    {d.tradeoff}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="results" title="Results">
            <ul className="space-y-2">
              {project.results.map((r) => (
                <li key={r} className="flex gap-3 text-muted">
                  <span aria-hidden className="text-good">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="lessons" title="What I'd do differently">
            <ul className="list-disc space-y-2 pl-5 text-muted">
              {project.lessons.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </Section>

          <div className="border-t border-line pt-10">
            <p className="text-sm text-muted">Next case study</p>
            <Link href={`/work/${next.slug}`} className="mt-1 inline-block text-xl font-semibold hover:text-accent">
              {next.name} →
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
