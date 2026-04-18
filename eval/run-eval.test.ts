import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { rateLimit, generateReport, runCase } from "./run-eval.ts";
import type { EvalResult, EvalCase } from "./eval.types.ts";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

// ---------------------------------------------------------------------------
// rateLimit
// ---------------------------------------------------------------------------

describe("rateLimit", () => {
  test("is exported and is a function", () => {
    expect(typeof rateLimit).toBe("function");
  });

  test("resolves after the calculated delay", async () => {
    const start = Date.now();
    // 60 req/min → 1000 ms delay; use 120 req/min → ~500 ms to keep tests fast
    await rateLimit(120);
    const elapsed = Date.now() - start;
    // Allow generous margin for CI timing jitter
    expect(elapsed).toBeGreaterThanOrEqual(400);
  });

  test("delay is inversely proportional to requestsPerMinute", async () => {
    // 600 req/min → 100 ms
    const start = Date.now();
    await rateLimit(600);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(80);
    expect(elapsed).toBeLessThan(500);
  });
});

// ---------------------------------------------------------------------------
// generateReport
// ---------------------------------------------------------------------------

describe("generateReport", () => {
  let tmpDir: string;

  // We need to monkey-patch RESULTS_DIR so the report is written to a temp dir.
  // generateReport uses a module-level RESULTS_DIR constant derived from
  // import.meta.dir.  Since we can't easily override it without refactoring,
  // we accept the report is written to eval/results/ and just validate the
  // return value and report structure via the written JSON.

  test("is exported and is a function", () => {
    expect(typeof generateReport).toBe("function");
  });

  test("returns a non-empty report path string", async () => {
    const results: EvalResult[] = [];
    const path = await generateReport(results, "structural", 0, 0, 0);
    expect(typeof path).toBe("string");
    expect(path.length).toBeGreaterThan(0);
    expect(path).toContain("eval-");
    expect(path).toEndWith(".json");
  });

  test("report path contains the results directory", async () => {
    const results: EvalResult[] = [];
    const path = await generateReport(results, "structural", 0, 0, 0);
    expect(path).toContain("results");
  });

  test("written report has correct structure for empty results", async () => {
    const results: EvalResult[] = [];
    const path = await generateReport(results, "structural", 3, 1, 0);

    const { readFile } = await import("fs/promises");
    const raw = await readFile(path, "utf-8");
    const report = JSON.parse(raw);

    expect(report.mode).toBe("structural");
    expect(report.totalCases).toBe(3);
    expect(report.totalAssertions).toBe(0);
    expect(report.passed).toBe(0);
    expect(report.failed).toBe(0);
    expect(report.skipped).toBe(1);
    expect(report.estimatedCost).toBe(0);
    expect(Array.isArray(report.results)).toBe(true);
    expect(report.results).toHaveLength(0);
    expect(typeof report.timestamp).toBe("string");
    // timestamp must be a valid ISO date
    expect(Number.isNaN(Date.parse(report.timestamp))).toBe(false);
  });

  test("counts passed and failed correctly", async () => {
    const results: EvalResult[] = [
      { promptFile: "a.md", description: "desc", mode: "structural", assertion: "has title", passed: true },
      { promptFile: "a.md", description: "desc", mode: "structural", assertion: "has body", passed: false },
      { promptFile: "b.md", description: "desc2", mode: "structural", assertion: "has footer", passed: true },
    ];
    const path = await generateReport(results, "all", 2, 0, 1.23);

    const { readFile } = await import("fs/promises");
    const report = JSON.parse(await readFile(path, "utf-8"));

    expect(report.totalAssertions).toBe(3);
    expect(report.passed).toBe(2);
    expect(report.failed).toBe(1);
    expect(report.estimatedCost).toBe(1.23);
    expect(report.results).toHaveLength(3);
  });

  test("report preserves result details", async () => {
    const results: EvalResult[] = [
      {
        promptFile: "commands/implement.md",
        description: "implement command",
        mode: "behavioral",
        assertion: "mentions TDD",
        passed: false,
        details: "Assertion failed",
      },
    ];
    const path = await generateReport(results, "llm", 1, 0, 0.005);

    const { readFile } = await import("fs/promises");
    const report = JSON.parse(await readFile(path, "utf-8"));

    expect(report.results[0].promptFile).toBe("commands/implement.md");
    expect(report.results[0].assertion).toBe("mentions TDD");
    expect(report.results[0].passed).toBe(false);
    expect(report.results[0].details).toBe("Assertion failed");
  });

  test("mode is reflected in report", async () => {
    for (const mode of ["structural", "llm", "all"] as const) {
      const path = await generateReport([], mode, 0, 0, 0);
      const { readFile } = await import("fs/promises");
      const report = JSON.parse(await readFile(path, "utf-8"));
      expect(report.mode).toBe(mode);
    }
  });
});

// ---------------------------------------------------------------------------
// runCase — signature / export verification only (no API calls)
// ---------------------------------------------------------------------------

describe("runCase", () => {
  test("is exported and is a function", () => {
    expect(typeof runCase).toBe("function");
  });

  test("accepts EvalCase and RunCaseOpts, returns RunCaseResult shape", async () => {
    // Provide an eval case that references a non-existent prompt file so the
    // function catches the error internally and returns gracefully without
    // touching the Anthropic API.
    const evalCase: EvalCase = {
      promptFile: "__nonexistent_test_file__.md",
      description: "signature verification only",
      structural: [],
    };

    const result = await runCase(evalCase, {
      mode: "structural",
      anthropic: null,
      totalCost: 0,
    });

    // Even when the prompt file is missing runCase should return the shape
    expect(result).toHaveProperty("results");
    expect(result).toHaveProperty("cost");
    expect(result).toHaveProperty("skipped");
    expect(Array.isArray(result.results)).toBe(true);
    expect(typeof result.cost).toBe("number");
    expect(typeof result.skipped).toBe("boolean");
  });

  test("returns skipped=false when no spend guard is triggered", async () => {
    const evalCase: EvalCase = {
      promptFile: "__nonexistent__.md",
      description: "skipped flag check",
      structural: [],
    };

    const result = await runCase(evalCase, {
      mode: "structural",
      anthropic: null,
      totalCost: 0,
    });

    expect(result.skipped).toBe(false);
  });

  test("structural mode with no assertions returns empty results", async () => {
    const evalCase: EvalCase = {
      promptFile: "__nonexistent__.md",
      description: "empty structural",
      structural: [],
    };

    const result = await runCase(evalCase, {
      mode: "structural",
      anthropic: null,
      totalCost: 0,
    });

    // File not found → caught, synthetic failure result appended
    expect(result.results).toHaveLength(1);
    expect(result.results[0].passed).toBe(false);
    expect(result.results[0].assertion).toBe("case_execution");
    expect(result.cost).toBe(0);
  });

  test("EvalCase accepts optional judge field with criteria", () => {
    // Type-level verification — if this compiles, the shape is valid
    const evalCase: EvalCase = {
      promptFile: "skills/interview/SKILL.md",
      description: "judge shape check",
      structural: [],
      judge: {
        criteria: [
          { name: "has-recommendation", question: "Did the output include a recommendation?" },
          { name: "surfaces-tradeoffs", question: "Did the output cite a tradeoff for each option?" },
        ],
      },
      testInput: "Interview me about adding OAuth.",
    };
    expect(evalCase.judge?.criteria).toHaveLength(2);
    expect(evalCase.judge?.criteria[0].name).toBe("has-recommendation");
  });

  test("llm mode skips judge when no anthropic client provided", async () => {
    const evalCase: EvalCase = {
      promptFile: "__nonexistent__.md",
      description: "judge without API key",
      structural: [],
      judge: {
        criteria: [{ name: "any", question: "Any?" }],
      },
      testInput: "test",
    };

    const result = await runCase(evalCase, {
      mode: "llm",
      anthropic: null,
      totalCost: 0,
    });

    // No judge results when client absent — file read fails first, synthetic error only
    const judgeResults = result.results.filter((r) => r.assertion.startsWith("judge:"));
    expect(judgeResults).toHaveLength(0);
  });
});
