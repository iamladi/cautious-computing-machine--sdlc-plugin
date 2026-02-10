import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.error("OPENROUTER_API_KEY environment variable is required");
  process.exit(1);
}

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "perplexity/sonar-pro";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const TIMEOUT_MS = 120_000;

interface SSEResult {
  content: string;
  citations: string[];
  images: string[];
  model: string;
  usage: Record<string, unknown>;
}

function processSSELine(
  line: string,
  state: { content: string; citations: Set<string>; images: Set<string>; model: string; usage: Record<string, unknown>; pendingError: boolean }
): void {
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
    | Array<{ delta?: { content?: string } }>
    | undefined;
  if (choices?.[0]?.delta?.content) {
    state.content += choices[0].delta.content;
  }

  if (parsed.images) {
    for (const img of parsed.images as string[]) state.images.add(img);
  }
  const choiceImages = (
    choices?.[0] as { delta?: { images?: string[] } } | undefined
  )?.delta?.images;
  if (choiceImages) {
    for (const img of choiceImages) state.images.add(img);
  }
}

async function parseSSEStream(response: Response): Promise<SSEResult> {
  if (!response.body) {
    throw new Error("Response body is null");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  const state = {
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

async function searchWeb(args: {
  query: string;
  model?: string;
  recency?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  const model = args.model || DEFAULT_MODEL;

  const systemParts = [
    "You are a helpful search assistant. Provide accurate, well-cited answers.",
  ];
  if (args.recency) {
    systemParts.push(`Focus on results from the last ${args.recency}.`);
  }

  const body: Record<string, unknown> = {
    model,
    stream: true,
    messages: [
      { role: "system", content: systemParts.join(" ") },
      { role: "user", content: args.query },
    ],
  };

  if (args.temperature !== undefined) body.temperature = args.temperature;
  if (args.top_p !== undefined) body.top_p = args.top_p;
  if (args.top_k !== undefined) body.top_k = args.top_k;
  if (args.max_tokens !== undefined) body.max_tokens = args.max_tokens;
  if (args.frequency_penalty !== undefined) body.frequency_penalty = args.frequency_penalty;
  if (args.presence_penalty !== undefined) body.presence_penalty = args.presence_penalty;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
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
      return {
        content: [{ type: "text", text: `Request timed out after ${TIMEOUT_MS / 1000}s` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: `Network error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }

  if (!response.ok) {
    clearTimeout(timeout);
    let errorBody: string;
    try {
      errorBody = await response.text();
    } catch {
      errorBody = "Unable to read error body";
    }
    return {
      content: [{ type: "text", text: `OpenRouter API error (${response.status}): ${errorBody}` }],
      isError: true,
    };
  }

  let result: SSEResult;
  try {
    result = await parseSSEStream(response);
  } catch (error: unknown) {
    return {
      content: [{ type: "text", text: `SSE parsing error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  } finally {
    clearTimeout(timeout);
  }

  const parts: string[] = [result.content];

  if (result.citations.length > 0) {
    parts.push("\n\n---\n**Sources:**");
    result.citations.forEach((citation, i) => {
      parts.push(`[${i + 1}] ${citation}`);
    });
  }

  if (result.images.length > 0) {
    parts.push("\n\n**Images:**");
    result.images.forEach((image) => {
      parts.push(`![](${image})`);
    });
  }

  const meta = {
    citations: result.citations,
    images: result.images,
    model: result.model,
    usage: result.usage,
  };

  return {
    content: [{ type: "text", text: parts.join("\n") + `\n\n<meta>${JSON.stringify(meta)}</meta>` }],
  };
}

const server = new McpServer({ name: "perplexity", version: "2.0.0" });

server.registerTool(
  "search_web",
  {
    description: "Search the web using Perplexity AI with recency filtering",
    inputSchema: {
      query: z.string().describe("Search query"),
      model: z
        .string()
        .optional()
        .describe(
          "OpenRouter model ID (e.g. perplexity/sonar-pro, perplexity/sonar). Defaults to perplexity/sonar-pro."
        ),
      recency: z
        .enum(["day", "week", "month", "year"])
        .optional()
        .describe("Filter results by recency"),
      temperature: z
        .number()
        .optional()
        .describe("Controls generation randomness, with 0 being deterministic and values approaching 2 being more random."),
      top_p: z
        .number()
        .optional()
        .describe("Nucleus sampling threshold, controlling the token selection pool based on cumulative probability."),
      top_k: z
        .number()
        .optional()
        .describe("Limits the number of high-probability tokens to consider for generation. Set to 0 to disable."),
      max_tokens: z
        .number()
        .optional()
        .describe("The maximum number of tokens to generate."),
      frequency_penalty: z
        .number()
        .optional()
        .describe("Multiplicative penalty for new tokens based on their frequency in the text to avoid repetition."),
      presence_penalty: z
        .number()
        .optional()
        .describe("Penalty for new tokens based on their current presence in the text, encouraging topic variety."),
    },
  },
  async (args) => searchWeb(args)
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
