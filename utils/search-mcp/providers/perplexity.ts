import type {
  SearchInput,
  SearchResult,
  PerplexityOptions,
} from "../types.ts";

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

interface SSEState {
  content: string;
  citations: Set<string>;
  images: Set<string>;
  model: string;
  usage: Record<string, unknown>;
  pendingError: boolean;
}

interface SSEResult {
  content: string;
  citations: string[];
  images: string[];
  model: string;
  usage: Record<string, unknown>;
}

export function processSSELine(line: string, state: SSEState): void {
  if (line.startsWith("event: error")) {
    state.pendingError = true;
    return;
  }

  if (!line.startsWith("data: ")) {
    if (line.trim() === "") state.pendingError = false;
    return;
  }

  const data = line.slice("data: ".length).trim();

  if (state.pendingError) {
    state.pendingError = false;
    throw new Error(`SSE error: ${data}`);
  }

  if (data === "[DONE]") return;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(data);
  } catch {
    return;
  }

  if (parsed.model) state.model = parsed.model as string;
  if (parsed.usage) state.usage = parsed.usage as Record<string, unknown>;

  if (parsed.citations) {
    for (const c of parsed.citations as string[]) state.citations.add(c);
  }

  const choices = parsed.choices as
    | Array<{ delta?: { content?: string; images?: string[] } }>
    | undefined;
  if (choices?.[0]?.delta?.content) {
    state.content += choices[0].delta.content;
  }

  if (parsed.images) {
    for (const img of parsed.images as string[]) state.images.add(img);
  }

  const choiceImages = choices?.[0]?.delta?.images;
  if (choiceImages) {
    for (const img of choiceImages) state.images.add(img);
  }
}

export async function parseSSEStream(response: Response): Promise<SSEResult> {
  if (!response.body) {
    throw new Error("Response body is null");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  const state: SSEState = {
    content: "",
    citations: new Set<string>(),
    images: new Set<string>(),
    model: "",
    usage: {} as Record<string, unknown>,
    pendingError: false,
  };
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        processSSELine(line, state);
      }
    }

    // Process any residual buffer content
    if (buffer.trim()) {
      processSSELine(buffer, state);
    }
  } finally {
    reader.releaseLock();
  }

  return {
    content: state.content,
    citations: [...state.citations],
    images: [...state.images],
    model: state.model,
    usage: state.usage,
  };
}

export async function searchPerplexity(
  input: SearchInput,
  options: PerplexityOptions,
  deps: { apiKey: string; baseUrl?: string; defaultModel?: string },
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<SearchResult> {
  const startTime = performance.now();
  const model = options.model || deps.defaultModel || "perplexity/sonar-pro";
  const baseUrl = deps.baseUrl || DEFAULT_BASE_URL;

  const systemParts = [
    "You are a helpful search assistant. Provide accurate, well-cited answers.",
  ];
  if (input.recency) {
    systemParts.push(`Focus on results from the last ${input.recency}.`);
  }

  const body: Record<string, unknown> = {
    model,
    stream: true,
    messages: [
      { role: "system", content: systemParts.join(" ") },
      { role: "user", content: input.query },
    ],
  };

  if (options.temperature !== undefined) body.temperature = options.temperature;
  if (options.top_p !== undefined) body.top_p = options.top_p;
  if (options.top_k !== undefined) body.top_k = options.top_k;
  if (options.max_tokens !== undefined) body.max_tokens = options.max_tokens;
  if (options.frequency_penalty !== undefined)
    body.frequency_penalty = options.frequency_penalty;
  if (options.presence_penalty !== undefined)
    body.presence_penalty = options.presence_penalty;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${deps.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/iamladi/sdlc-plugin",
        "X-Title": "SDLC Plugin MCP Server",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error: unknown) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `perplexity error (timeout): Request timed out after ${timeoutMs / 1000}s`
      );
    }
    throw new Error(
      `perplexity error (network): ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (!response.ok) {
    clearTimeout(timeout);
    let errorBody: string;
    try {
      errorBody = await response.text();
    } catch {
      errorBody = "Unable to read error body";
    }
    throw new Error(`perplexity error (${response.status}): ${errorBody}`);
  }

  let sseResult: SSEResult;
  try {
    sseResult = await parseSSEStream(response);
  } finally {
    clearTimeout(timeout);
  }

  const endTime = performance.now();
  const latencyMs = Math.round(endTime - startTime);

  const sources = sseResult.citations.map((url) => ({
    title: url,
    url,
  }));

  return {
    content: sseResult.content,
    sources,
    images: sseResult.images,
    meta: {
      provider: "perplexity",
      model: sseResult.model,
      latencyMs,
    },
  };
}
