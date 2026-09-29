import { HeroGrid } from "@/components/hero-grid";
import { ProjectCard } from "@/components/project-card";
import { ButtonLink, Container, Eyebrow, SectionHeading } from "@/components/ui";
import { projects } from "@/content/projects";
import { site } from "@/lib/site";

const stats = [
  { value: "7 yrs", label: "frontend, Angular and React" },
  { value: "8–10 s", label: "faster load on a 20,000-record grid" },
  { value: "3", label: "React products built solo, 0 to prod" },
  { value: "6+", label: "engineers mentored" },
];

const strengths = [
  {
    title: "Data-heavy interfaces",
    body: "Grids with tens of thousands of rows, config-driven tabs, charts and dynamic forms that stay fast.",
  },
  {
    title: "Performance",
    body: "Server-side pagination, virtualization, lazy loading, prefetching and caching, chosen per problem.",
  },
  {
    title: "Real-time and AI",
    body: "Streaming LLM chat over WebSockets with switchable OpenAI and Anthropic models, in production apps.",
  },
  {
    title: "Ownership",
    body: "From empty repo to production: architecture, tooling, quality gates, estimates and client calls.",
  },
];

const timeline = [
  { year: "2019", text: "Joined Finoit as a trainee. Angular 7 on a pet-care booking app." },
  { year: "2020–21", text: "Angular 8 and 10: recruitment SaaS, lawyer hiring platform, Stripe payments." },
  { year: "2021–22", text: "Moved into React. Sole frontend on Qbench's config-driven lab portal." },
  { year: "2023–24", text: "Senior Software Engineer. Built Paper Tiger and Block Power alone." },
  { year: "2025", text: "Led DDMind: data grids at scale, Angular v20, streaming LLM chat." },
  { year: "2026", text: "Set up and stabilized CCM on Next.js. Now open to new roles." },
];

export default function Home() {
  const featured = projects.filter((p) => p.featured);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-backdrop pointer-events-none absolute inset-0" />
        <Container className="relative grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Eyebrow>
              {site.title} · {site.availability}
            </Eyebrow>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {site.tagline}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              I&apos;m {site.name}. For {site.years} years I&apos;ve built Angular and React/Next.js applications for
              fintech research, SaaS and data-intensive products — and led the teams that ship them.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/work">See my work</ButtonLink>
              <ButtonLink href="/resume" variant="ghost">
                Resume
              </ButtonLink>
              <ButtonLink href="/contact" variant="ghost">
                Contact
              </ButtonLink>
            </div>
          </div>
          <div className="hidden justify-center lg:flex">
            <HeroGrid />
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="border-y border-line/70 bg-surface/40">
        <Container className="grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-mono text-2xl font-semibold text-accent">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* Featured work */}
      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="Selected work"
            title="Case studies"
            intro="Each project page covers the problem, the constraints, the decisions and trade-offs, and the result."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {featured.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
          <div className="mt-8">
            <ButtonLink href="/work" variant="ghost">
              All projects →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Live demo callout */}
      <section className="pb-20">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-accent/30 bg-accent/5 p-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <Eyebrow>Live demo</Eyebrow>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Why virtualization matters, measured in your browser</h2>
              <p className="mt-2 text-muted">
                Render 17,000 rows the naive way, then with virtualization and paged fetching, and compare the
                numbers yourself. Synthetic data; the technique is the one I used on DDMind.
              </p>
            </div>
            <ButtonLink href="/work/ddmind/grid-demo">Open the demo</ButtonLink>
          </div>
        </Container>
      </section>

      {/* Strengths */}
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="What I do" title="Where I add the most value" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {strengths.map((s) => (
              <div key={s.title} className="rounded-2xl border border-line bg-surface p-6">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Career" title="Seven years, one path" />
          <ol className="mt-10 border-l border-line">
            {timeline.map((t) => (
              <li key={t.year} className="relative pb-8 pl-8 last:pb-0">
                <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                <p className="font-mono text-sm text-accent">{t.year}</p>
                <p className="mt-1 text-muted">{t.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <Container>
          <div className="rounded-2xl border border-line bg-surface p-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Hiring a senior frontend engineer?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              I&apos;m {site.availability.toLowerCase()} for Angular, React or Next.js roles — onsite, hybrid or remote.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href={`mailto:${site.email}`}>Email me</ButtonLink>
              <ButtonLink href="/resume" variant="ghost">
                Download resume
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
