import Link from "next/link";
import type { Project } from "@/content/projects";
import { Tag } from "./ui";

export function ProjectCard({ project }: { project: Project }) {
  const top = project.metrics[0];
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight group-hover:text-accent">{project.name}</h3>
          <p className="mt-1 text-sm text-muted">{project.subtitle}</p>
        </div>
        {top && (
          <div className="shrink-0 text-right">
            <p className="font-mono text-lg font-semibold text-accent">{top.value}</p>
            <p className="text-[11px] text-muted">{top.label}</p>
          </div>
        )}
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted">{project.summary}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
        {project.stack.slice(0, 5).map((s) => (
          <Tag key={s}>{s}</Tag>
        ))}
      </div>
      <p className="mt-4 text-sm text-accent">
        Read case study <span aria-hidden>→</span>
      </p>
    </Link>
  );
}
