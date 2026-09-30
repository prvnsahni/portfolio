import type { Metadata } from "next";
import Link from "next/link";
import { ChatDemo } from "@/components/demos/chat-demo";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Streaming chat demo",
  description:
    "A mock streaming AI chat that renders canned answers token by token, with Stop, error and retry — the technique behind the streaming LLM chats I built on DDMind and CCM. No AI API is called.",
};

const pieces = [
  { term: "Stream", body: "A fake server yields the answer token by token with randomised delays — an async generator here, a WebSocket in the real apps." },
  { term: "Buffer", body: "Each token is appended to the current assistant message in state as it arrives." },
  { term: "Render", body: "The message re-renders on every token, so text appears progressively with a caret." },
  { term: "Abort", body: "Stop calls AbortController.abort(); the generator throws, streaming halts, and the partial answer is kept." },
  { term: "Error", body: "A toggle makes the next reply fail mid-stream, the way a dropped connection would." },
  { term: "Retry", body: "Retry re-runs the same question on the existing message and streams it to completion." },
];

export default function ChatDemoPage() {
  return (
    <Container className="py-16 sm:py-20">
      <Link href="/work/ddmind" className="text-sm text-muted hover:text-text">
        ← DDMind case study
      </Link>
      <div className="mt-6 max-w-3xl">
        <Eyebrow>Live demo</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A streaming chat, faked end to end</h1>
        <p className="mt-4 text-muted">
          On DDMind and CCM I built WebSocket chats with streaming responses, so users could ask a question about a
          company, report or contract and read the answer as it arrived. This demo recreates the front-end mechanics —
          token-by-token rendering, auto-scroll, Stop, error and retry — with a fake server and canned answers about my
          own work. <strong className="text-text">No AI API is called and nothing is sent anywhere.</strong>
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ChatDemo />

        <aside className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-sm font-semibold">The pieces</h2>
          <dl className="mt-4 space-y-4">
            {pieces.map((p) => (
              <div key={p.term}>
                <dt className="font-mono text-xs uppercase tracking-wide text-accent">{p.term}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted">{p.body}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      <div className="mt-10 max-w-3xl rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold">How this maps to the real thing</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          In production the stream came over a WebSocket from a backend that routed between OpenAI and Anthropic. The
          UI concerns are identical to what you see here: buffer tokens into a message, keep the view scrolled unless the
          reader scrolls up, let people cancel a long answer, and recover cleanly when the connection drops. Read the{" "}
          <Link href="/work/ddmind" className="text-accent underline underline-offset-4">
            DDMind case study
          </Link>{" "}
          for the wider architecture.
        </p>
      </div>
    </Container>
  );
}
