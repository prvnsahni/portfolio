import type { Metadata } from "next";
import Link from "next/link";
import { GridDemo } from "@/components/demos/grid-demo";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Grid demo: why virtualization matters",
  description: "Render 17,000 rows the naive way and with paged fetching plus virtualization, and compare live in your browser.",
};

export default function GridDemoPage() {
  return (
    <Container className="py-16 sm:py-20">
      <Link href="/work/ddmind" className="text-sm text-muted hover:text-text">
        ← DDMind case study
      </Link>
      <div className="mt-6 max-w-3xl">
        <Eyebrow>Live demo</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Why virtualization matters</h1>
        <p className="mt-4 text-muted">
          On DDMind, one table held 17,000+ rows. The original version fetched and rendered everything up front, and
          froze after users loaded several files. This demo recreates the problem and the fix with synthetic data,
          using the same technique: fetch one page at a time, cache what you&apos;ve fetched, and keep only the visible
          rows in the DOM.
        </p>
      </div>

      <div className="mt-10">
        <GridDemo />
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-semibold">Demo numbers vs production result</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The numbers above are measured on your device with synthetic data, so they vary by machine. The production
            result on DDMind, with real data and a real network, was a load-time reduction of about 8–10 seconds and no
            more freezes.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-semibold">How the demo is built</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            React with TanStack Virtual for row virtualization, a simulated paged API with a client-side page cache,
            and requestAnimationFrame to measure paint time and frozen frames. DDMind itself used AG-Grid&apos;s infinite
            row model in Angular. Read the{" "}
            <Link href="/notes/why-virtualization-matters" className="text-accent underline underline-offset-4">
              study note
            </Link>{" "}
            for the full explanation.
          </p>
        </div>
      </div>
    </Container>
  );
}
