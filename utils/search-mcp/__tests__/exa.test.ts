import { describe, test, expect } from "bun:test";
import type { SearchInput, ExaOptions, SearchResult } from "../types";
import type { ExaClient } from "../providers/exa";
import { searchExa } from "../providers/exa";

describe("searchExa", () => {
  test("returns SearchResult from Exa response", async () => {
    const fakeClient: ExaClient = {
      search: async () => ({
        results: [
          {
            title: "Test Article",
            url: "https://example.com/article",
            text: "This is test content",
          },
        ],
        searchTime: 123,
      }),
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    const result = await searchExa(input, {}, { client: fakeClient });

    expect(result).toMatchObject({
      content: expect.any(String),
      sources: expect.any(Array),
      images: expect.any(Array),
      meta: {
        provider: "exa",
        latencyMs: expect.any(Number),
      },
    });
  });

  test("maps result titles and URLs to sources", async () => {
    const fakeClient: ExaClient = {
      search: async () => ({
        results: [
          {
            title: "First Article",
            url: "https://example.com/first",
            text: "First content",
          },
          {
            title: "Second Article",
            url: "https://example.com/second",
            text: "Second content",
          },
        ],
      }),
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    const result = await searchExa(input, {}, { client: fakeClient });

    expect(result.sources).toHaveLength(2);
    expect(result.sources[0]).toMatchObject({
      title: "First Article",
      url: "https://example.com/first",
      snippet: "First content",
    });
    expect(result.sources[1]).toMatchObject({
      title: "Second Article",
      url: "https://example.com/second",
      snippet: "Second content",
    });
  });

  test("extracts images from results", async () => {
    const fakeClient: ExaClient = {
      search: async () => ({
        results: [
          {
            title: "Article with image",
            url: "https://example.com/article",
            text: "Content",
            image: "https://example.com/image1.jpg",
          },
          {
            title: "Another article",
            url: "https://example.com/article2",
            text: "More content",
            image: "https://example.com/image2.jpg",
          },
        ],
      }),
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    const result = await searchExa(input, {}, { client: fakeClient });

    expect(result.images).toEqual([
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
    ]);
  });

  test("maps recency to startPublishedDate", async () => {
    let capturedOptions: Record<string, unknown> | undefined;
    const fakeClient: ExaClient = {
      search: async (_query, options) => {
        capturedOptions = options;
        return { results: [] };
      },
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
      recency: "week",
    };

    await searchExa(input, {}, { client: fakeClient });

    expect(capturedOptions).toHaveProperty("startPublishedDate");
    expect(typeof capturedOptions?.startPublishedDate).toBe("string");
  });

  test("maps search_type to Exa type param", async () => {
    let capturedOptions: Record<string, unknown> | undefined;
    const fakeClient: ExaClient = {
      search: async (_query, options) => {
        capturedOptions = options;
        return { results: [] };
      },
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    const options: ExaOptions = {
      search_type: "neural",
    };

    await searchExa(input, options, { client: fakeClient });

    expect(capturedOptions?.type).toBe("neural");
  });

  test("maps include_domains and exclude_domains to camelCase", async () => {
    let capturedOptions: Record<string, unknown> | undefined;
    const fakeClient: ExaClient = {
      search: async (_query, options) => {
        capturedOptions = options;
        return { results: [] };
      },
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    const options: ExaOptions = {
      include_domains: ["example.com", "test.com"],
      exclude_domains: ["spam.com"],
    };

    await searchExa(input, options, { client: fakeClient });

    expect(capturedOptions?.includeDomains).toEqual(["example.com", "test.com"]);
    expect(capturedOptions?.excludeDomains).toEqual(["spam.com"]);
  });

  test("clamps num_results to max 100", async () => {
    let capturedOptions: Record<string, unknown> | undefined;
    const fakeClient: ExaClient = {
      search: async (_query, options) => {
        capturedOptions = options;
        return { results: [] };
      },
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
      num_results: 150,
    };

    await searchExa(input, {}, { client: fakeClient });

    expect(capturedOptions?.numResults).toBe(100);
  });

  test("handles null titles as Untitled", async () => {
    const fakeClient: ExaClient = {
      search: async () => ({
        results: [
          {
            title: null,
            url: "https://example.com/no-title",
            text: "Content without title",
          },
        ],
      }),
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    const result = await searchExa(input, {}, { client: fakeClient });

    expect(result.sources[0].title).toBe("Untitled");
  });

  test("handles empty results", async () => {
    const fakeClient: ExaClient = {
      search: async () => ({
        results: [],
      }),
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    const result = await searchExa(input, {}, { client: fakeClient });

    expect(result.sources).toEqual([]);
    expect(result.images).toEqual([]);
    expect(result.content).toBe("No content returned");
  });

  test("includes cost in meta when available", async () => {
    const fakeClient: ExaClient = {
      search: async () => ({
        results: [
          {
            title: "Article",
            url: "https://example.com/article",
            text: "Content",
          },
        ],
        costDollars: { total: 0.0042 },
      }),
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    const result = await searchExa(input, {}, { client: fakeClient });

    expect(result.meta.cost).toBe(0.0042);
  });

  test("passes include_text correctly", async () => {
    let capturedOptions: Record<string, unknown> | undefined;
    const fakeClient: ExaClient = {
      search: async (_query, options) => {
        capturedOptions = options;
        return { results: [] };
      },
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    const optionsWithText: ExaOptions = {
      include_text: true,
    };

    await searchExa(input, optionsWithText, { client: fakeClient });

    expect(capturedOptions?.contents).toEqual({ text: true });

    // Test with include_text false
    const optionsWithoutText: ExaOptions = {
      include_text: false,
    };

    await searchExa(input, optionsWithoutText, { client: fakeClient });

    expect(capturedOptions?.contents).toBe(false);
  });

  test("includes resolvedSearchType as model in meta", async () => {
    const fakeClient: ExaClient = {
      search: async () => ({
        results: [
          {
            title: "Article",
            url: "https://example.com/article",
            text: "Content",
          },
        ],
        resolvedSearchType: "neural",
      }),
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    const result = await searchExa(input, {}, { client: fakeClient });

    expect(result.meta.model).toBe("neural");
  });

  test("uses searchTime for latencyMs when available", async () => {
    const fakeClient: ExaClient = {
      search: async () => ({
        results: [
          {
            title: "Article",
            url: "https://example.com/article",
            text: "Content",
          },
        ],
        searchTime: 456,
      }),
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    const result = await searchExa(input, {}, { client: fakeClient });

    expect(result.meta.latencyMs).toBe(456);
  });

  test("combines result texts into content", async () => {
    const fakeClient: ExaClient = {
      search: async () => ({
        results: [
          {
            title: "First",
            url: "https://example.com/1",
            text: "First piece of content",
          },
          {
            title: "Second",
            url: "https://example.com/2",
            text: "Second piece of content",
          },
        ],
      }),
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    const result = await searchExa(input, {}, { client: fakeClient });

    expect(result.content).toContain("First piece of content");
    expect(result.content).toContain("Second piece of content");
  });

  test("passes category option directly", async () => {
    let capturedOptions: Record<string, unknown> | undefined;
    const fakeClient: ExaClient = {
      search: async (_query, options) => {
        capturedOptions = options;
        return { results: [] };
      },
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    const options: ExaOptions = {
      category: "news",
    };

    await searchExa(input, options, { client: fakeClient });

    expect(capturedOptions?.category).toBe("news");
  });

  test("throws timeout error after 30s", async () => {
    const fakeClient: ExaClient = {
      search: async (_query, _options) => {
        // Simulate AbortController abort by throwing AbortError
        const error = new DOMException("The operation was aborted", "AbortError");
        throw error;
      },
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    await expect(searchExa(input, {}, { client: fakeClient, timeoutMs: 1 })).rejects.toThrow(
      "exa error (timeout): Request timed out after 30s"
    );
  });

  test("normalizes client errors to exa error format", async () => {
    const fakeClient: ExaClient = {
      search: async () => {
        throw new Error("Invalid API key");
      },
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    await expect(searchExa(input, {}, { client: fakeClient })).rejects.toThrow(
      "exa error: Invalid API key"
    );
  });

  test("normalizes non-Error exceptions to exa error format", async () => {
    const fakeClient: ExaClient = {
      search: async () => {
        throw "string error";
      },
    };

    const input: SearchInput = {
      query: "test query",
      provider: "exa",
    };

    await expect(searchExa(input, {}, { client: fakeClient })).rejects.toThrow(
      "exa error: string error"
    );
  });
});
