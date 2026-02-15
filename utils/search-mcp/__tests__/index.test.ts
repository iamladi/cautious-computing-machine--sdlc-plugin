import { describe, expect, test } from "bun:test";
import {
  detectAvailableProviders,
  resolveDefaultProvider,
  buildToolDescription,
} from "../index";

describe("detectAvailableProviders", () => {
  test("detects perplexity when OPENROUTER_API_KEY is set", () => {
    const result = detectAvailableProviders({
      OPENROUTER_API_KEY: "key",
    });
    expect(result).toContain("perplexity");
  });

  test("detects exa when EXA_API_KEY is set", () => {
    const result = detectAvailableProviders({
      EXA_API_KEY: "key",
    });
    expect(result).toContain("exa");
  });

  test("detects brave when BRAVE_API_KEY is set", () => {
    const result = detectAvailableProviders({
      BRAVE_API_KEY: "key",
    });
    expect(result).toContain("brave");
  });

  test("detects all three when all keys are set, ordered by priority", () => {
    const result = detectAvailableProviders({
      OPENROUTER_API_KEY: "key",
      EXA_API_KEY: "key",
      BRAVE_API_KEY: "key",
    });
    expect(result).toEqual(["exa", "brave", "perplexity"]);
  });

  test("returns empty array when no keys are set", () => {
    const result = detectAvailableProviders({});
    expect(result).toEqual([]);
  });

  test("ignores empty string keys", () => {
    const result = detectAvailableProviders({
      OPENROUTER_API_KEY: "",
    });
    expect(result).toEqual([]);
  });
});

describe("resolveDefaultProvider", () => {
  test("returns DEFAULT_PROVIDER when set and available", () => {
    const result = resolveDefaultProvider("exa", ["perplexity", "exa", "brave"]);
    expect(result).toBe("exa");
  });

  test("returns first available provider when DEFAULT_PROVIDER is not set", () => {
    const result = resolveDefaultProvider(undefined, ["exa", "brave"]);
    expect(result).toBe("exa");
  });

  test("returns first available in priority order: exa, brave, perplexity", () => {
    const result = resolveDefaultProvider(undefined, ["exa", "brave", "perplexity"]);
    expect(result).toBe("exa");
  });

  test("throws when DEFAULT_PROVIDER is set to unavailable provider", () => {
    expect(() =>
      resolveDefaultProvider("brave", ["perplexity", "exa"])
    ).toThrow("DEFAULT_PROVIDER 'brave' is not available");
  });

  test("throws when DEFAULT_PROVIDER is set to unknown value", () => {
    expect(() =>
      resolveDefaultProvider("google", ["perplexity"])
    ).toThrow("DEFAULT_PROVIDER 'google' is not a valid provider");
  });

  test("throws when no providers available", () => {
    expect(() => resolveDefaultProvider(undefined, [])).toThrow(
      "No search providers available"
    );
  });
});

describe("buildToolDescription", () => {
  test("lists all available providers", () => {
    const desc = buildToolDescription(["perplexity", "exa", "brave"], "perplexity");
    expect(desc).toContain("perplexity");
    expect(desc).toContain("exa");
    expect(desc).toContain("brave");
  });

  test("indicates the default provider", () => {
    const desc = buildToolDescription(["perplexity", "exa"], "exa");
    expect(desc).toContain("exa");
    expect(desc).toContain("default");
  });

  test("lists only available providers", () => {
    const desc = buildToolDescription(["perplexity"], "perplexity");
    expect(desc).toContain("perplexity");
    expect(desc).not.toContain("exa");
    expect(desc).not.toContain("brave");
  });

  test("differentiates from built-in WebSearch", () => {
    const desc = buildToolDescription(["exa", "brave"], "exa");
    expect(desc).toContain("Provides deeper, more configurable results than built-in WebSearch");
  });
});
