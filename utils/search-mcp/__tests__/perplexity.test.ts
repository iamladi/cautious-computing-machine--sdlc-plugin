import { describe, test, expect, mock, beforeEach } from "bun:test";
import type {
  SearchInput,
  SearchResult,
  PerplexityOptions,
} from "../types.ts";
import { searchPerplexity } from "../providers/perplexity.ts";

describe("searchPerplexity", () => {
  let mockFetch: ReturnType<typeof mock>;

  beforeEach(() => {
    mockFetch = mock(() =>
      Promise.resolve(
        new Response("data: [DONE]\n", {
          status: 200,
          headers: { "Content-Type": "text/event-stream" },
        })
      )
    );
    global.fetch = mockFetch as any;
  });

  test("returns SearchResult with content from SSE stream", async () => {
    const sseStream = `data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":" world"}}]}
data: [DONE]
`;
    mockFetch.mockResolvedValue(
      new Response(sseStream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const input: SearchInput = {
      query: "test query",
      provider: "perplexity",
    };

    const result = await searchPerplexity(
      input,
      {},
      { apiKey: "test-key", defaultModel: "perplexity/sonar-pro" }
    );

    expect(result.content).toBe("Hello world");
    expect(result.meta.provider).toBe("perplexity");
  });

  test("extracts citations into sources array", async () => {
    const sseStream = `data: {"citations":["https://example.com","https://test.com"]}
data: {"choices":[{"delta":{"content":"Answer"}}]}
data: [DONE]
`;
    mockFetch.mockResolvedValue(
      new Response(sseStream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const input: SearchInput = {
      query: "test query",
      provider: "perplexity",
    };

    const result = await searchPerplexity(
      input,
      {},
      { apiKey: "test-key" }
    );

    expect(result.sources).toHaveLength(2);
    expect(result.sources[0].url).toBe("https://example.com");
    expect(result.sources[0].title).toBe("https://example.com");
    expect(result.sources[1].url).toBe("https://test.com");
  });

  test("extracts images from SSE stream", async () => {
    const sseStream = `data: {"images":["https://img1.com/a.jpg"]}
data: {"choices":[{"delta":{"images":["https://img2.com/b.jpg"]}}]}
data: {"choices":[{"delta":{"content":"Answer"}}]}
data: [DONE]
`;
    mockFetch.mockResolvedValue(
      new Response(sseStream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const input: SearchInput = {
      query: "test query",
      provider: "perplexity",
    };

    const result = await searchPerplexity(
      input,
      {},
      { apiKey: "test-key" }
    );

    expect(result.images).toHaveLength(2);
    expect(result.images).toContain("https://img1.com/a.jpg");
    expect(result.images).toContain("https://img2.com/b.jpg");
  });

  test("includes model in meta", async () => {
    const sseStream = `data: {"model":"perplexity/sonar-pro"}
data: {"choices":[{"delta":{"content":"Answer"}}]}
data: [DONE]
`;
    mockFetch.mockResolvedValue(
      new Response(sseStream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const input: SearchInput = {
      query: "test query",
      provider: "perplexity",
    };

    const result = await searchPerplexity(
      input,
      {},
      { apiKey: "test-key" }
    );

    expect(result.meta.model).toBe("perplexity/sonar-pro");
  });

  test("measures latencyMs", async () => {
    const sseStream = `data: {"choices":[{"delta":{"content":"Answer"}}]}
data: [DONE]
`;
    mockFetch.mockResolvedValue(
      new Response(sseStream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const input: SearchInput = {
      query: "test query",
      provider: "perplexity",
    };

    const result = await searchPerplexity(
      input,
      {},
      { apiKey: "test-key" }
    );

    expect(result.meta.latencyMs).toBeGreaterThanOrEqual(0);
    expect(typeof result.meta.latencyMs).toBe("number");
  });

  test("applies recency to system prompt", async () => {
    const sseStream = `data: {"choices":[{"delta":{"content":"Answer"}}]}
data: [DONE]
`;
    mockFetch.mockResolvedValue(
      new Response(sseStream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const input: SearchInput = {
      query: "test query",
      provider: "perplexity",
      recency: "week",
    };

    await searchPerplexity(input, {}, { apiKey: "test-key" });

    const callArgs = mockFetch.mock.calls[0] as any[];
    const body = JSON.parse(callArgs[1].body);
    const systemMessage = body.messages[0].content;

    expect(systemMessage).toContain("Focus on results from the last week");
  });

  test("passes LLM tuning params to API request", async () => {
    const sseStream = `data: {"choices":[{"delta":{"content":"Answer"}}]}
data: [DONE]
`;
    mockFetch.mockResolvedValue(
      new Response(sseStream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const input: SearchInput = {
      query: "test query",
      provider: "perplexity",
    };

    const options: PerplexityOptions = {
      temperature: 0.7,
      top_p: 0.9,
      top_k: 50,
      max_tokens: 1000,
      frequency_penalty: 0.5,
      presence_penalty: 0.3,
    };

    await searchPerplexity(input, options, { apiKey: "test-key" });

    const callArgs = mockFetch.mock.calls[0] as any[];
    const body = JSON.parse(callArgs[1].body);

    expect(body.temperature).toBe(0.7);
    expect(body.top_p).toBe(0.9);
    expect(body.top_k).toBe(50);
    expect(body.max_tokens).toBe(1000);
    expect(body.frequency_penalty).toBe(0.5);
    expect(body.presence_penalty).toBe(0.3);
  });

  test("throws on non-OK response with status code", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "Bad request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    );

    const input: SearchInput = {
      query: "test query",
      provider: "perplexity",
    };

    await expect(
      searchPerplexity(input, {}, { apiKey: "test-key" })
    ).rejects.toThrow('perplexity error (400): {"error":"Bad request"}');
  });

  test("throws on timeout", async () => {
    mockFetch.mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => {
          const error = new Error("The operation was aborted");
          error.name = "AbortError";
          reject(error);
        }, 10);
      });
    });

    const input: SearchInput = {
      query: "test query",
      provider: "perplexity",
    };

    // Use shorter timeout for testing
    await expect(
      searchPerplexity(input, {}, { apiKey: "test-key" }, 50)
    ).rejects.toThrow("perplexity error (timeout): Request timed out after");
  }, 1000);

  test("throws on SSE error event", async () => {
    const sseStream = `event: error
data: Rate limit exceeded
`;
    mockFetch.mockResolvedValue(
      new Response(sseStream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const input: SearchInput = {
      query: "test query",
      provider: "perplexity",
    };

    await expect(
      searchPerplexity(input, {}, { apiKey: "test-key" })
    ).rejects.toThrow("SSE error: Rate limit exceeded");
  });

  test("uses defaultModel when not specified in options", async () => {
    const sseStream = `data: {"choices":[{"delta":{"content":"Answer"}}]}
data: [DONE]
`;
    mockFetch.mockResolvedValue(
      new Response(sseStream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const input: SearchInput = {
      query: "test query",
      provider: "perplexity",
    };

    await searchPerplexity(
      input,
      {},
      { apiKey: "test-key", defaultModel: "perplexity/sonar-pro" }
    );

    const callArgs = mockFetch.mock.calls[0] as any[];
    const body = JSON.parse(callArgs[1].body);

    expect(body.model).toBe("perplexity/sonar-pro");
  });

  test("uses model from options when specified", async () => {
    const sseStream = `data: {"choices":[{"delta":{"content":"Answer"}}]}
data: [DONE]
`;
    mockFetch.mockResolvedValue(
      new Response(sseStream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const input: SearchInput = {
      query: "test query",
      provider: "perplexity",
    };

    await searchPerplexity(
      input,
      { model: "perplexity/sonar" },
      { apiKey: "test-key", defaultModel: "perplexity/sonar-pro" }
    );

    const callArgs = mockFetch.mock.calls[0] as any[];
    const body = JSON.parse(callArgs[1].body);

    expect(body.model).toBe("perplexity/sonar");
  });

  test("uses baseUrl from deps when provided", async () => {
    const sseStream = `data: {"choices":[{"delta":{"content":"Answer"}}]}
data: [DONE]
`;
    mockFetch.mockResolvedValue(
      new Response(sseStream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const input: SearchInput = {
      query: "test query",
      provider: "perplexity",
    };

    await searchPerplexity(
      input,
      {},
      { apiKey: "test-key", baseUrl: "https://custom-url.com/v1/chat" }
    );

    const callArgs = mockFetch.mock.calls[0] as any[];
    const url = callArgs[0];

    expect(url).toBe("https://custom-url.com/v1/chat");
  });
});
