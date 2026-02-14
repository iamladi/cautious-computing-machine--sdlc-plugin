import { describe, expect, test } from "bun:test";
import {
  recencyToDate,
  clampNumResults,
  validateProviderParams,
  PROVIDER_PARAM_MATRIX,
  type SearchProvider,
  type Recency,
} from "../types";

describe("recencyToDate", () => {
  test("day returns ISO date ~24h ago", () => {
    const now = new Date("2026-02-14T12:00:00Z");
    const result = recencyToDate("day", now);
    expect(result).toBe("2026-02-13T12:00:00.000Z");
  });

  test("week returns ISO date ~7d ago", () => {
    const now = new Date("2026-02-14T12:00:00Z");
    const result = recencyToDate("week", now);
    expect(result).toBe("2026-02-07T12:00:00.000Z");
  });

  test("month returns ISO date ~30d ago", () => {
    const now = new Date("2026-02-14T12:00:00Z");
    const result = recencyToDate("month", now);
    expect(result).toBe("2026-01-15T12:00:00.000Z");
  });

  test("year returns ISO date ~365d ago", () => {
    const now = new Date("2026-02-14T12:00:00Z");
    const result = recencyToDate("year", now);
    expect(result).toBe("2025-02-14T12:00:00.000Z");
  });

  test("defaults to current time when no reference provided", () => {
    const before = Date.now();
    const result = recencyToDate("day");
    const after = Date.now();
    const resultMs = new Date(result).getTime();
    const expectedMin = before - 24 * 60 * 60 * 1000;
    const expectedMax = after - 24 * 60 * 60 * 1000;
    expect(resultMs).toBeGreaterThanOrEqual(expectedMin - 1000);
    expect(resultMs).toBeLessThanOrEqual(expectedMax + 1000);
  });
});

describe("clampNumResults", () => {
  test("brave clamps to max 20", () => {
    expect(clampNumResults("brave", 50)).toBe(20);
  });

  test("brave passes through values <= 20", () => {
    expect(clampNumResults("brave", 10)).toBe(10);
  });

  test("exa clamps to max 100", () => {
    expect(clampNumResults("exa", 200)).toBe(100);
  });

  test("exa passes through values <= 100", () => {
    expect(clampNumResults("exa", 50)).toBe(50);
  });

  test("perplexity returns undefined (LLM-based, no num_results)", () => {
    expect(clampNumResults("perplexity", 10)).toBeUndefined();
  });

  test("returns undefined when num_results is undefined", () => {
    expect(clampNumResults("brave", undefined)).toBeUndefined();
    expect(clampNumResults("exa", undefined)).toBeUndefined();
  });
});

describe("validateProviderParams", () => {
  test("allows common params for any provider", () => {
    const errors = validateProviderParams("perplexity", {
      query: "test",
      recency: "day",
    });
    expect(errors).toEqual([]);
  });

  test("rejects exa-only params on perplexity", () => {
    const errors = validateProviderParams("perplexity", {
      include_domains: ["example.com"],
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("include_domains");
    expect(errors[0]).toContain("exa");
  });

  test("rejects exa-only params on brave", () => {
    const errors = validateProviderParams("brave", {
      search_type: "instant",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("search_type");
    expect(errors[0]).toContain("exa");
  });

  test("allows exa-specific params on exa", () => {
    const errors = validateProviderParams("exa", {
      include_domains: ["example.com"],
      search_type: "instant",
      exclude_domains: ["spam.com"],
      category: "news",
      include_text: true,
    });
    expect(errors).toEqual([]);
  });

  test("rejects perplexity-only params on exa", () => {
    const errors = validateProviderParams("exa", {
      model: "perplexity/sonar-pro",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("model");
    expect(errors[0]).toContain("perplexity");
  });

  test("rejects brave-only params on perplexity", () => {
    const errors = validateProviderParams("perplexity", {
      result_filter: "web",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("result_filter");
    expect(errors[0]).toContain("brave");
  });

  test("allows brave-specific params on brave", () => {
    const errors = validateProviderParams("brave", {
      result_filter: "web",
    });
    expect(errors).toEqual([]);
  });

  test("reports multiple invalid params at once", () => {
    const errors = validateProviderParams("brave", {
      include_domains: ["example.com"],
      model: "perplexity/sonar-pro",
    });
    expect(errors).toHaveLength(2);
  });

  test("allows perplexity LLM tuning params", () => {
    const errors = validateProviderParams("perplexity", {
      temperature: 0.5,
      top_p: 0.9,
      top_k: 40,
      max_tokens: 1000,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
    });
    expect(errors).toEqual([]);
  });
});

describe("PROVIDER_PARAM_MATRIX", () => {
  test("maps exa-only params correctly", () => {
    expect(PROVIDER_PARAM_MATRIX.include_domains).toBe("exa");
    expect(PROVIDER_PARAM_MATRIX.exclude_domains).toBe("exa");
    expect(PROVIDER_PARAM_MATRIX.search_type).toBe("exa");
    expect(PROVIDER_PARAM_MATRIX.category).toBe("exa");
    expect(PROVIDER_PARAM_MATRIX.include_text).toBe("exa");
  });

  test("maps perplexity-only params correctly", () => {
    expect(PROVIDER_PARAM_MATRIX.model).toBe("perplexity");
    expect(PROVIDER_PARAM_MATRIX.temperature).toBe("perplexity");
    expect(PROVIDER_PARAM_MATRIX.top_p).toBe("perplexity");
    expect(PROVIDER_PARAM_MATRIX.top_k).toBe("perplexity");
    expect(PROVIDER_PARAM_MATRIX.max_tokens).toBe("perplexity");
    expect(PROVIDER_PARAM_MATRIX.frequency_penalty).toBe("perplexity");
    expect(PROVIDER_PARAM_MATRIX.presence_penalty).toBe("perplexity");
  });

  test("maps brave-only params correctly", () => {
    expect(PROVIDER_PARAM_MATRIX.result_filter).toBe("brave");
  });
});
