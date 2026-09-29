import type { Metadata } from "next";
import { ButtonLink, Container, Eyebrow, Tag } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name}, ${site.title}.`,
};

const toolbox: { group: string; items: string[] }[] = [
  { group: "Angular", items: ["Angular 7–20", "Standalone components", "OnPush", "RxJS", "NgRx", "NGXS"] },
  { group: "React", items: ["React", "Next.js (Pages Router, SSR/SSG)", "Redux", "React-Query", "Custom hooks", "Context API"] },
  { group: "Data and UI", items: ["AG-Grid Enterprise", "AG Charts", "DevExpress", "TinyMCE", "Tailwind CSS", "Angular Material"] },
  { group: "Platform", items: ["TypeScript", "WebSockets", "REST", "JWT / OAuth 2.0", "Stripe", "AWS S3", "Azure Blob", "Google Cloud Storage"] },
  { group: "Delivery", items: ["GitHub Actions", "Docker", "ESLint", "Prettier", "Lighthouse", "Chrome DevTools"] },
  { group: "AI", items: ["OpenAI and Anthropic APIs", "Streaming chat UIs", "v0", "GitHub Copilot", "Claude", "Codex"] },
];

export default function AboutPage() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="max-w-3xl">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Hi, I&apos;m {site.name}.</h1>
        <div className="prose-body mt-6">
          <p>
            I&apos;m a senior frontend engineer with {site.years} years at Finoit Technologies, a software services
            company, where I joined as a trainee in 2019 and left as a Senior Software Engineer in 2026.
          </p>
          <p>
            Working in services meant many products, often two at a time: private-equity research, contract
            management, laboratory SaaS, academic writing, civic engagement. I started in Angular, moved into React
            and Next.js, and went back to Angular to lead a data-heavy platform, so I&apos;m comfortable in both.
          </p>
          <p>
            What I enjoy most is the hard middle of frontend work: making a grid with tens of thousands of rows feel
            instant, turning a config file into a whole UI, or streaming an AI answer token by token. I also like the
            parts around the code: estimating with clients, reviewing pull requests, and helping junior engineers get
            unstuck. I&apos;ve mentored more than six.
          </p>
          <h2>How I work</h2>
          <ul>
            <li><strong>Start from the problem.</strong> Measure what&apos;s slow or broken before choosing a fix.</li>
            <li><strong>Own it end to end.</strong> Setup, architecture, quality gates, delivery and handover.</li>
            <li><strong>Leave it better.</strong> Shared components, lint and CI checks, and boilerplate the next developer can build on.</li>
          </ul>
        </div>
      </div>

      <h2 className="mt-16 text-xl font-semibold tracking-tight">Toolbox</h2>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {toolbox.map((t) => (
          <div key={t.group} className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="font-medium">{t.group}</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t.items.map((i) => (
                <Tag key={i}>{i}</Tag>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <ButtonLink href="/work">See the work</ButtonLink>
        <ButtonLink href="/contact" variant="ghost">Get in touch</ButtonLink>
      </div>
    </Container>
  );
}
