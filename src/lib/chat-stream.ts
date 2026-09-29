/**
 * A fake "server" for the streaming chat demo.
 *
 * It streams canned answers token by token with realistic, randomised delays,
 * so the UI can show the same mechanics I built for real streaming LLM chats on
 * DDMind and CCM — without calling any AI API or incurring any cost. Every
 * answer uses only facts from src/content/projects.ts.
 *
 * The transport is an async generator; the component consumes it with
 * `for await`, and passes an AbortSignal so a Stop button can cancel it.
 */

export type Suggestion = { id: string; question: string };

export const SUGGESTIONS: Suggestion[] = [
  { id: "grid", question: "How did you make the grid faster?" },
  { id: "chat", question: "How does the streaming chat work?" },
  { id: "uploads", question: "How do file uploads work?" },
  { id: "tabs", question: "How did you keep tab switching instant?" },
  { id: "upgrade", question: "What did the Angular upgrade change?" },
];

const ANSWERS: Record<string, string> = {
  grid: "The table held over 17,000 rows in a single grid, and the old version fetched and rendered everything at page load — it took a long time to become usable and froze after a few files. I fixed it in two layers. On the data side I moved to server-side pagination: only the page in view is fetched, and an unvisited page is fetched on demand. On the rendering side I used AG-Grid's infinite row model with row virtualization, and cached the pages I had already fetched. Grid load dropped by about 8 to 10 seconds, and the freezes stopped.",
  chat: "It is a WebSocket chat with streaming responses, so a user can ask a direct question about a company or report instead of reading it end to end. Tokens arrive over the socket and render as they come in. OpenAI and Anthropic are switchable, with the provider routing handled on the backend. On CCM the same idea powered AI Sync, a streaming chat for querying the contracts assigned to a user. This demo fakes that stream locally, so no API is called.",
  uploads: "Uploads go straight to storage, not through the API server. The backend hands the frontend a pre-signed URL, and the file uploads directly to S3 — up to 50 MB each, with 10 to 25 files per organization on DDMind. That keeps upload traffic off the API server, at the cost of handling URL expiry and per-organization limits on the client.",
  tabs: "An API response defines the tabs, each holding tables, charts and content. The main content loads first, then every tab's data is prefetched in the background with a small delay and cached. Switching to a tab then reads from the cache, so it feels instant. The trade-off is more backend calls for tabs some users never open, which the client accepted because instant switching was the priority.",
  upgrade: "I proposed and led an upgrade from Angular 16 to 20: standalone components, the new control flow, OnPush and trackBy where lists re-rendered, and removing unused code, packages and libraries. Bundle size came down about 12% and build time about 8%, and deprecated dependencies were removed for the client's certification.",
};

const FALLBACK =
  "This demo only answers a few preset questions about my work — try one of the suggestions. Everything here is canned and streamed locally, so no AI API is called.";

export function answerFor(question: string): string {
  const match = SUGGESTIONS.find((s) => s.question === question);
  return (match && ANSWERS[match.id]) || FALLBACK;
}

/** Split into tokens that keep their trailing space, so re-joining is lossless. */
function tokenize(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [];
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** A cancellable delay that rejects with an AbortError if the signal fires. */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export type StreamOptions = {
  signal?: AbortSignal;
  /** Throw a simulated network error after this many tokens (for the error/retry demo). */
  failAfter?: number;
};

/** Stream an answer token by token with randomised pauses. */
export async function* streamAnswer(text: string, options: StreamOptions = {}): AsyncGenerator<string> {
  const { signal, failAfter } = options;
  const tokens = tokenize(text);

  // Initial "thinking" pause before the first token.
  await delay(rand(280, 560), signal);

  let emitted = 0;
  for (const token of tokens) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    await delay(rand(18, 55), signal);
    // Occasionally pause a little longer, the way a real stream stutters.
    if (Math.random() < 0.06) await delay(rand(120, 260), signal);

    if (failAfter != null && emitted >= failAfter) {
      throw new Error("Simulated network error: the stream was interrupted.");
    }

    emitted += 1;
    yield token;
  }
}
