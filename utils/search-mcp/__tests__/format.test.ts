import { describe, expect, test } from "bun:test";
import { formatResponse } from "../format";
import type { SearchResult } from "../types";

function makeResult(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    content: "Search results content",
    sources: [],
    images: [],
    meta: { provider: "perplexity", latencyMs: 150 },
    ...overrides,
  };
}

describe("formatResponse", () => {
  test("returns content as text", () => {
    const result = formatResponse(makeResult());
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Search results content");
  });

  test("includes sources section when sources exist", () => {
    const result = formatResponse(
      makeResult({
        sources: [
          { title: "Example", url: "https://example.com", snippet: "A snippet" },
          { title: "Other", url: "https://other.com" },
        ],
      })
    );
    const text = result.content[0].text;
    expect(text).toContain("**Sources:**");
    expect(text).toContain("[1] [Example](https://example.com)");
    expect(text).toContain("[2] [Other](https://other.com)");
  });

  test("omits sources section when no sources", () => {
    const result = formatResponse(makeResult({ sources: [] }));
    expect(result.content[0].text).not.toContain("**Sources:**");
  });

  test("includes images section when images exist", () => {
    const result = formatResponse(
      makeResult({ images: ["https://img.com/1.png", "https://img.com/2.png"] })
    );
    const text = result.content[0].text;
    expect(text).toContain("**Images:**");
    expect(text).toContain("![](https://img.com/1.png)");
    expect(text).toContain("![](https://img.com/2.png)");
  });

  test("omits images section when no images", () => {
    const result = formatResponse(makeResult({ images: [] }));
    expect(result.content[0].text).not.toContain("**Images:**");
  });

  test("includes meta tag with provider info", () => {
    const result = formatResponse(
      makeResult({
        meta: { provider: "exa", latencyMs: 42, model: "exa-instant" },
      })
    );
    const text = result.content[0].text;
    expect(text).toContain("<meta>");
    expect(text).toContain("</meta>");
    const metaMatch = text.match(/<meta>(.*?)<\/meta>/);
    expect(metaMatch).not.toBeNull();
    const meta = JSON.parse(metaMatch![1]);
    expect(meta.provider).toBe("exa");
    expect(meta.latencyMs).toBe(42);
    expect(meta.model).toBe("exa-instant");
  });

  test("does not set isError for normal results", () => {
    const result = formatResponse(makeResult());
    expect(result.isError).toBeUndefined();
  });

  test("full output structure matches expected format", () => {
    const result = formatResponse(
      makeResult({
        content: "Answer text",
        sources: [{ title: "Src", url: "https://src.com" }],
        images: ["https://img.com/a.png"],
        meta: { provider: "brave", latencyMs: 200 },
      })
    );
    const text = result.content[0].text;
    // Order: content, sources, images, meta
    const contentIdx = text.indexOf("Answer text");
    const sourcesIdx = text.indexOf("**Sources:**");
    const imagesIdx = text.indexOf("**Images:**");
    const metaIdx = text.indexOf("<meta>");
    expect(contentIdx).toBeLessThan(sourcesIdx);
    expect(sourcesIdx).toBeLessThan(imagesIdx);
    expect(imagesIdx).toBeLessThan(metaIdx);
  });
});
