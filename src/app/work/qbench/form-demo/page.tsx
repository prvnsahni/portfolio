import type { Metadata } from "next";
import Link from "next/link";
import { ConfigFormDemo } from "@/components/demos/config-form-demo";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Config-driven form demo",
  description:
    "Edit a JSON config on the left and watch a form render live on the right — field types, validation, field order and conditional fields, the technique used on Qbench and CCM.",
};

export default function FormDemoPage() {
  return (
    <Container className="py-16 sm:py-20">
      <Link href="/work/qbench" className="text-sm text-muted hover:text-text">
        ← Qbench case study
      </Link>
      <div className="mt-6 max-w-3xl">
        <Eyebrow>Live demo</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A config-driven form</h1>
        <p className="mt-4 text-muted">
          On Qbench, a super admin configured a portal&apos;s columns, fields and form order, and the app rendered them
          with no code changes. On CCM, forms had fields that appeared based on other fields&apos; values. This demo
          rebuilds that idea with synthetic data and my own design: the JSON on the left drives the form on the right.
          Edit the config, switch presets, and submit to see the collected values — nothing is sent anywhere.
        </p>
      </div>

      <div className="mt-10">
        <ConfigFormDemo />
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-semibold">What the engine supports</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Field types text, number, email, select, checkbox, date and textarea; required, min/max and length
            validation; field order straight from the config; and conditional fields — show or hide based on another
            field, including chains like country → state → city.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-semibold">How it&apos;s built</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            A small, pure, typed module — a config schema plus helpers for visibility, validation and collecting
            values — with a thin React renderer on top. Read the{" "}
            <Link href="/notes/config-driven-forms" className="text-accent underline underline-offset-4">
              study note
            </Link>{" "}
            for the full walkthrough.
          </p>
        </div>
      </div>
    </Container>
  );
}
