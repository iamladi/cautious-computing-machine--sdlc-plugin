import { describe, expect, test } from "bun:test";
import { searchBrave } from "../providers/brave";
import type { SearchInput, BraveOptions } from "../types";

describe("searchBrave", () => {
  test("returns SearchResult from Brave response", async () => {
    const mockResponse = {
      web: {
        results: [
          {
            title: "Test Page",
            url: "https://example.com",
            description: "Test description",
            thumbnail: { src: "https://example.com/thumb.jpg" },
          },
        ],
      },
    };

    const fakeFetch: typeof fetch = async () => {
      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const input: SearchInput = {
      query: "test query",
      provider: "brave",
      num_results: 10,
    };

    const result = await searchBrave(input, {}, { apiKey: "test-key", fetchFn: fakeFetch });

    expect(result).toMatchObject({
      content: "Test description",
      sources: [
        {
          title: "Test Page",
          url: "https://example.com",
          snippet: "Test description",
        },
      ],
      images: ["https://example.com/thumb.jpg"],
      meta: {
        provider: "brave",
        latencyMs: expect.any(Number),
      },
    });
  });

  test("maps results to sources with title, url, snippet", async () => {
    const mockResponse = {
      web: {
        results: [
          {
            title: "First Result",
            url: "https://first.com",
            description: "First snippet",
          },
          {
            title: "Second Result",
            url: "https://second.com",
            description: "Second snippet",
          },
        ],
      },
    };

    const fakeFetch: typeof fetch = async () => {
      return new Response(JSON.stringify(mockResponse), { status: 200 });
    };

    const input: SearchInput = {
      query: "test",
      provider: "brave",
    };

    const result = await searchBrave(input, {}, { apiKey: "test-key", fetchFn: fakeFetch });

    expect(result.sources).toEqual([
      { title: "First Result", url: "https://first.com", snippet: "First snippet" },
      { title: "Second Result", url: "https://second.com", snippet: "Second snippet" },
    ]);
  });

  test("extracts thumbnail images", async () => {
    const mockResponse = {
      web: {
        results: [
          {
            title: "Page 1",
            url: "https://page1.com",
            description: "Desc 1",
            thumbnail: { src: "https://img1.com/thumb.jpg" },
          },
          {
            title: "Page 2",
            url: "https://page2.com",
            description: "Desc 2",
            thumbnail: { src: "https://img2.com/thumb.jpg" },
          },
          {
            title: "Page 3",
            url: "https://page3.com",
            description: "Desc 3",
          },
        ],
      },
    };

    const fakeFetch: typeof fetch = async () => {
      return new Response(JSON.stringify(mockResponse), { status: 200 });
    };

    const input: SearchInput = {
      query: "test",
      provider: "brave",
    };

    const result = await searchBrave(input, {}, { apiKey: "test-key", fetchFn: fakeFetch });

    expect(result.images).toEqual(["https://img1.com/thumb.jpg", "https://img2.com/thumb.jpg"]);
  });

  test("maps recency to freshness param in URL", async () => {
    const capturedUrls: string[] = [];

    const fakeFetch: typeof fetch = async (input: RequestInfo | URL) => {
      capturedUrls.push(input.toString());
      return new Response(JSON.stringify({ web: { results: [] } }), { status: 200 });
    };

    const testCases: Array<{ recency: "day" | "week" | "month" | "year"; expected: string }> = [
      { recency: "day", expected: "pd" },
      { recency: "week", expected: "pw" },
      { recency: "month", expected: "pm" },
      { recency: "year", expected: "py" },
    ];

    for (const { recency, expected } of testCases) {
      const input: SearchInput = {
        query: "test",
        provider: "brave",
        recency,
      };

      await searchBrave(input, {}, { apiKey: "test-key", fetchFn: fakeFetch });
    }

    expect(capturedUrls[0]).toContain("freshness=pd");
    expect(capturedUrls[1]).toContain("freshness=pw");
    expect(capturedUrls[2]).toContain("freshness=pm");
    expect(capturedUrls[3]).toContain("freshness=py");
  });

  test("clamps num_results to max 20", async () => {
    const capturedUrls: string[] = [];

    const fakeFetch: typeof fetch = async (input: RequestInfo | URL) => {
      capturedUrls.push(input.toString());
      return new Response(JSON.stringify({ web: { results: [] } }), { status: 200 });
    };

    const input: SearchInput = {
      query: "test",
      provider: "brave",
      num_results: 50, // Should be clamped to 20
    };

    await searchBrave(input, {}, { apiKey: "test-key", fetchFn: fakeFetch });

    expect(capturedUrls[0]).toContain("count=20");
  });

  test("handles missing web.results gracefully", async () => {
    const mockResponse = {
      web: {},
    };

    const fakeFetch: typeof fetch = async () => {
      return new Response(JSON.stringify(mockResponse), { status: 200 });
    };

    const input: SearchInput = {
      query: "test",
      provider: "brave",
    };

    const result = await searchBrave(input, {}, { apiKey: "test-key", fetchFn: fakeFetch });

    expect(result.content).toBe("No results found");
    expect(result.sources).toEqual([]);
    expect(result.images).toEqual([]);
  });

  test("handles missing thumbnails", async () => {
    const mockResponse = {
      web: {
        results: [
          {
            title: "Page 1",
            url: "https://page1.com",
            description: "Desc 1",
          },
          {
            title: "Page 2",
            url: "https://page2.com",
            description: "Desc 2",
            thumbnail: { src: "https://img2.com/thumb.jpg" },
          },
        ],
      },
    };

    const fakeFetch: typeof fetch = async () => {
      return new Response(JSON.stringify(mockResponse), { status: 200 });
    };

    const input: SearchInput = {
      query: "test",
      provider: "brave",
    };

    const result = await searchBrave(input, {}, { apiKey: "test-key", fetchFn: fakeFetch });

    expect(result.images).toEqual(["https://img2.com/thumb.jpg"]);
  });

  test("measures latencyMs", async () => {
    const fakeFetch: typeof fetch = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return new Response(JSON.stringify({ web: { results: [] } }), { status: 200 });
    };

    const input: SearchInput = {
      query: "test",
      provider: "brave",
    };

    const result = await searchBrave(input, {}, { apiKey: "test-key", fetchFn: fakeFetch });

    expect(result.meta.latencyMs).toBeGreaterThanOrEqual(50);
  });

  test("throws on non-OK response with status", async () => {
    const fakeFetch: typeof fetch = async () => {
      return new Response(JSON.stringify({ error: "Invalid API key" }), { status: 401 });
    };

    const input: SearchInput = {
      query: "test",
      provider: "brave",
    };

    await expect(searchBrave(input, {}, { apiKey: "bad-key", fetchFn: fakeFetch })).rejects.toThrow(
      "brave error (401):"
    );
  });

  test(
    "throws on timeout",
    async () => {
      const fakeFetch: typeof fetch = async (_url, options?: RequestInit) => {
        return new Promise((resolve, reject) => {
          const signal = options?.signal;
          if (signal) {
            signal.addEventListener("abort", () => {
              const error = new Error("The operation was aborted");
              error.name = "AbortError";
              reject(error);
            });
          }
          // Never resolve - let the abort signal handle it
        });
      };

      const input: SearchInput = {
        query: "test",
        provider: "brave",
      };

      await expect(searchBrave(input, {}, { apiKey: "test-key", fetchFn: fakeFetch })).rejects.toThrow(
        "brave error (timeout): Request timed out after 30s"
      );
    },
    35000
  );
});
