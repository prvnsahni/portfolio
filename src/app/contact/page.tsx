import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${site.name}.`,
};

const channels = [
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "LinkedIn", value: "linkedin.com/in/prvnsahni", href: site.linkedin },
  { label: "GitHub", value: "github.com/prvnsahni", href: site.github },
];

export default function ContactPage() {
  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading as="h1"
        eyebrow="Contact"
        title="Let's talk"
        intro={`${site.availability}. Open to senior frontend, Angular, React and Next.js roles — ${site.location.replace("India · ", "in India, ")}.`}
      />
      <ul className="mt-10 max-w-xl divide-y divide-line rounded-2xl border border-line bg-surface">
        {channels.map((c) => (
          <li key={c.label}>
            <a
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="flex items-center justify-between p-5 hover:text-accent"
            >
              <span className="text-muted">{c.label}</span>
              <span className="font-mono text-sm">{c.value}</span>
            </a>
          </li>
        ))}
      </ul>
    </Container>
  );
}
