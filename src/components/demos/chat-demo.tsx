"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { answerFor, streamAnswer, SUGGESTIONS } from "@/lib/chat-stream";

type Role = "user" | "assistant";
type Status = "streaming" | "done" | "stopped" | "error";

type Message = {
  id: string;
  role: Role;
  text: string;
  status: Status;
  /** The question that produced this assistant message, so Retry can re-run it. */
  question?: string;
};

let counter = 0;
const nextId = () => `m${++counter}`;

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce motion-reduce:animate-none"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

export function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [failNext, setFailNext] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const controllerRef = useRef<AbortController | null>(null);
  const failRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  const autoScrollRef = useRef(true);

  // Keep the scrollable transcript pinned to the bottom while streaming, unless
  // the user has scrolled up to read earlier messages.
  useEffect(() => {
    if (autoScrollRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    autoScrollRef.current = atBottom;
    setAutoScroll(atBottom);
  }

  function jumpToLatest() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    autoScrollRef.current = true;
    setAutoScroll(true);
  }

  const runAnswer = useCallback(async (assistantId: string, question: string) => {
    const controller = new AbortController();
    controllerRef.current = controller;
    const shouldFail = failRef.current;
    setStreaming(true);
    setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text: "", status: "streaming" } : m)));

    try {
      for await (const token of streamAnswer(answerFor(question), {
        signal: controller.signal,
        failAfter: shouldFail ? 6 : undefined,
      })) {
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text: m.text + token } : m)));
      }
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, status: "done" } : m)));
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === "AbortError";
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, status: aborted ? "stopped" : "error" } : m)),
      );
    } finally {
      setStreaming(false);
      failRef.current = false;
      setFailNext(false);
      controllerRef.current = null;
    }
  }, []);

  function ask(question: string) {
    if (streaming || !question.trim()) return;
    autoScrollRef.current = true;
    setAutoScroll(true);
    const assistantId = nextId();
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", text: question, status: "done" },
      { id: assistantId, role: "assistant", text: "", status: "streaming", question },
    ]);
    setInput("");
    runAnswer(assistantId, question);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    ask(input);
  }

  function stop() {
    controllerRef.current?.abort();
  }

  function retry(assistantId: string, question: string) {
    if (streaming) return;
    inputRef.current?.focus();
    runAnswer(assistantId, question);
  }

  // Move focus to the Retry button when a message errors, so keyboard users land on it.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.status === "error") retryRef.current?.focus();
  }, [messages]);

  const empty = messages.length === 0;

  return (
    <div className="rounded-2xl border border-line bg-surface">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-good" aria-hidden="true" />
          <h3 className="text-sm font-semibold">Ask about my work</h3>
        </div>
        <span className="rounded-full border border-warn/40 bg-warn/10 px-2.5 py-1 font-mono text-[11px] text-warn">
          Simulated responses — no AI API is called
        </span>
      </div>

      {/* Transcript */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        tabIndex={0}
        className="relative h-80 space-y-4 overflow-y-auto px-4 py-4 focus-visible:outline-2 focus-visible:outline-accent"
      >
        {empty && (
          <p className="text-sm text-muted">
            Pick a question below. Answers stream in token by token, like the WebSocket chats I built on DDMind and CCM.
          </p>
        )}

        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              data-testid={m.role === "assistant" ? "assistant-message" : "user-message"}
              data-status={m.status}
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-accent/15 text-text"
                  : m.status === "error"
                    ? "border border-bad/40 bg-bad/10 text-text"
                    : "border border-line bg-surface-2 text-text"
              }`}
            >
              {m.role === "assistant" && m.status === "streaming" && m.text === "" ? (
                <span className="flex items-center gap-2 text-muted">
                  <TypingDots />
                  <span className="sr-only">Assistant is typing…</span>
                </span>
              ) : m.role === "assistant" && m.status === "error" ? (
                <div>
                  <p className="text-bad">Something went wrong while streaming the answer.</p>
                  <button
                    ref={retryRef}
                    type="button"
                    onClick={() => retry(m.id, m.question ?? "")}
                    data-testid="retry-button"
                    className="mt-2 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-text hover:border-accent/60 hover:text-accent"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <span>
                  {m.text}
                  {m.role === "assistant" && m.status === "streaming" && (
                    <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 bg-accent motion-safe:animate-pulse" aria-hidden="true" />
                  )}
                  {m.status === "stopped" && <span className="ml-1 text-xs text-muted">(stopped)</span>}
                </span>
              )}
            </div>
          </div>
        ))}

        {!autoScroll && streaming && (
          <button
            type="button"
            onClick={jumpToLatest}
            className="sticky bottom-0 left-1/2 ml-auto block rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-muted hover:text-text"
          >
            ↓ Jump to latest
          </button>
        )}
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 border-t border-line px-4 pt-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={streaming}
            onClick={() => ask(s.question)}
            className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/50 hover:text-text disabled:opacity-50"
          >
            {s.question}
          </button>
        ))}
      </div>

      {/* Composer */}
      <form onSubmit={onSubmit} className="flex items-center gap-2 px-4 py-3">
        <label htmlFor="chat-input" className="sr-only">
          Ask a question about my work
        </label>
        <input
          id="chat-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-text outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/30"
        />
        {streaming ? (
          <button
            type="button"
            onClick={stop}
            data-testid="stop-button"
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-text hover:border-bad/60 hover:text-bad"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent-strong disabled:opacity-50"
          >
            Send
          </button>
        )}
      </form>

      {/* Error simulation toggle */}
      <div className="border-t border-line px-4 py-3">
        <label className="flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={failNext}
            disabled={streaming}
            onChange={(e) => {
              setFailNext(e.target.checked);
              failRef.current = e.target.checked;
            }}
            className="h-3.5 w-3.5 accent-accent"
          />
          Make the next reply fail, to show the error and Retry
        </label>
      </div>
    </div>
  );
}
