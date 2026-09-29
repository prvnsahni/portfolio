import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { Container, SectionHeading, Tag } from "@/components/ui";
import { earlierProjects, projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Case studies from seven years of Angular and React/Next.js work.",
};

export default function WorkPage() {
  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading as="h1"
        eyebrow="Work"
        title="Case studies"
        intro="Client work is described in my own words and shown through recreated demos with synthetic data, to respect confidentiality."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>

      <h2 className="mt-20 text-xl font-semibold tracking-tight">Earlier projects</h2>
      <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
        {earlierProjects.map((p) => (
          <li key={p.name} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium">
                {p.name} <span className="ml-2 font-mono text-xs text-muted">{p.period}</span>
              </p>
              <p className="mt-1 text-sm text-muted">{p.summary}</p>
            </div>
            <div className="shrink-0">
              <Tag>{p.stack}</Tag>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  );
}
