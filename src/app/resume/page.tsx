import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Resume",
  description: "Download Praveen Kumar's resume: combined, React-focused or Angular-focused.",
};

const versions = [
  {
    file: "/resume/Praveen_Kumar_Resume_Combined.pdf",
    title: "Combined",
    body: "Angular and React equally. Best for Frontend Engineer and Frontend Lead roles.",
  },
  {
    file: "/resume/Praveen_Kumar_Resume_React.pdf",
    title: "React / Next.js",
    body: "Leads with React, Next.js and the three React products I built solo.",
  },
  {
    file: "/resume/Praveen_Kumar_Resume_Angular.pdf",
    title: "Angular",
    body: "Leads with Angular, RxJS and the DDMind data-grid work.",
  },
];

export default function ResumePage() {
  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading as="h1" eyebrow="Resume" title="Download my resume" intro="Three versions of the same facts, ordered for different roles. Each is two pages." />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {versions.map((v) => (
          <a
            key={v.file}
            href={v.file}
            download
            className="group rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent/50"
          >
            <p className="font-mono text-xs text-muted">PDF · 2 pages</p>
            <h2 className="mt-2 text-lg font-semibold group-hover:text-accent">{v.title}</h2>
            <p className="mt-2 text-sm text-muted">{v.body}</p>
            <p className="mt-4 text-sm text-accent">Download ↓</p>
          </a>
        ))}
      </div>
    </Container>
  );
}
