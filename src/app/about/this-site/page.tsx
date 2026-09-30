import type { Metadata } from "next";
import Link from "next/link";
import scores from "@/content/lighthouse-scores.json";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "How this site is built",
  description:
    "The stack, static generation, testing and CI, the accessibility approach, and the latest measured Lighthouse scores for this portfolio.",
};

const categories = [
  { key: "performance", label: "Performance" },
  { key: "accessibility", label: "Accessibility" },
  { key: "bestPractices", label: "Best practices" },
  { key: "seo", label: "SEO" },
] as const;

function ScoreCell({ value }: { value: number }) {
  const tone = value >= 90 ? "text-good" : value >= 50 ? "text-warn" : "text-bad";
  return <span className={`font-mono ${tone}`}>{value}</span>;
}

export default function ThisSitePage() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="max-w-3xl">
        <Eyebrow>Colophon</Eyebrow>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">How this site is built</h1>
        <p className="mt-4 text-muted">
          This portfolio is meant to demonstrate the same care I put into client work, so its own quality is measured
          and enforced, not asserted. Here is what runs it and how the numbers below are produced.
        </p>

        <div className="prose-body mt-8">
          <h2>Stack</h2>
          <p>
            Next.js (App Router) with TypeScript and Tailwind CSS v4. Long-form content — case studies and study notes —
            is authored in MDX. The one heavy interactive piece, a 17,000-row grid demo, uses TanStack Virtual. Fonts are
            Geist, self-hosted. There is no analytics script and no third-party embed.
          </p>

          <h2>Static generation</h2>
          <p>
            Every page is prerendered at build time. Pages with no parameters are statically generated; the case studies,
            study notes and their social images come from <code>generateStaticParams</code>, so each URL is built to
            static HTML with no server rendering at request time. That is why the performance scores are what they are —
            the browser receives finished HTML and a small amount of JavaScript.
          </p>

          <h2>Testing and CI</h2>
          <p>
            The test suite runs in Playwright across a desktop and a mobile project: smoke tests that every page returns
            200 with a single <code>h1</code>, behavioural tests for the demos, and accessibility checks (below). GitHub
            Actions runs lint, a production build, the Playwright suite, and Lighthouse CI on every push and pull request.
          </p>

          <h2>Accessibility</h2>
          <p>
            The approach is semantic HTML first: one <code>h1</code> per page, real landmarks, labelled form controls, a
            skip link, visible focus rings, and respect for <code>prefers-reduced-motion</code>. Every main page is
            scanned with <code>@axe-core/playwright</code> against the WCAG 2.1 A and AA rule sets as part of the test
            suite, and Lighthouse&apos;s accessibility audit gates the build at 90.
          </p>
        </div>
      </div>

      <section className="mt-14" aria-labelledby="scores-heading">
        <h2 id="scores-heading" className="text-xl font-semibold tracking-tight">
          Latest Lighthouse scores
        </h2>
        <p className="mt-2 text-sm text-muted">
          Measured on {scores.measuredAt} with the Lighthouse <span className="font-mono">{scores.preset}</span> preset
          against the production build. The build fails if any category drops below 90. These numbers come from the CI
          report — see{" "}
          <Link href="/notes" className="text-accent underline underline-offset-4">
            the notes
          </Link>{" "}
          for the techniques behind them.
        </p>

        <div
          tabIndex={0}
          role="group"
          aria-label="Lighthouse scores table, scrollable"
          className="mt-5 overflow-x-auto rounded-2xl border border-line bg-surface focus-visible:outline-2 focus-visible:outline-accent"
        >
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Lighthouse category scores by route, out of 100</caption>
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th scope="col" className="px-4 py-3 font-medium">
                  Route
                </th>
                {categories.map((c) => (
                  <th key={c.key} scope="col" className="px-4 py-3 text-right font-medium">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scores.routes.map((route) => (
                <tr key={route.path} className="border-b border-line/60 last:border-0">
                  <th scope="row" className="px-4 py-3 font-mono text-xs font-normal text-text">
                    {route.path}
                  </th>
                  {categories.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-right">
                      <ScoreCell value={route[c.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Scores live in <span className="font-mono">src/content/lighthouse-scores.json</span> and are updated from the
          Lighthouse CI artifact, so nothing here is a number I haven&apos;t measured.
        </p>
      </section>
    </Container>
  );
}
