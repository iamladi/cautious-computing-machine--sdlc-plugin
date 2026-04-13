import { describe, expect, test } from "bun:test";
import {
  resolveCodexModels,
  resolveGeminiModels,
  resolveOracleModels,
  generateRegistry,
  type ModelEntry,
  type CodexCacheModel,
} from "./resolve-models";

// --- Codex cache parsing ---

const codexCache: CodexCacheModel[] = [
  { slug: "gpt-5.4", description: "Latest frontier agentic coding model.", priority: 0, visibility: "list" },
  { slug: "gpt-5.4-mini", description: "Smaller frontier agentic coding model.", priority: 2, visibility: "list" },
  { slug: "gpt-5.3-codex", description: "Frontier Codex-optimized agentic coding model.", priority: 5, visibility: "list" },
  { slug: "gpt-5.2-codex", description: "Frontier agentic coding model.", priority: 8, visibility: "list" },
  { slug: "gpt-5.1-codex", description: "Optimized for codex.", priority: 11, visibility: "hide" },
  { slug: "gpt-5.1-codex-mini", description: "Cheaper, faster.", priority: 19, visibility: "list" },
  { slug: "gpt-5-codex-mini", description: "Cheaper, faster.", priority: 20, visibility: "hide" },
];

describe("resolveCodexModels", () => {
  test("picks lowest-priority visible model as flagship", () => {
    const result = resolveCodexModels(codexCache);
    expect(result.flagship.id).toBe("gpt-5.4");
  });

  test("picks first visible mini model as fast variant", () => {
    const result = resolveCodexModels(codexCache);
    expect(result.fast!.id).toBe("gpt-5.4-mini");
  });

  test("picks next visible non-mini model as previous", () => {
    const result = resolveCodexModels(codexCache);
    expect(result.previous!.id).toBe("gpt-5.3-codex");
  });

  test("ignores hidden models", () => {
    const result = resolveCodexModels(codexCache);
    const ids = [result.flagship.id, result.fast!.id, result.previous!.id];
    expect(ids).not.toContain("gpt-5.1-codex");
    expect(ids).not.toContain("gpt-5-codex-mini");
  });

  test("returns descriptions from cache", () => {
    const result = resolveCodexModels(codexCache);
    expect(result.flagship.notes).toBe("Latest frontier agentic coding model.");
  });

  test("handles single-model cache", () => {
    const single: CodexCacheModel[] = [
      { slug: "gpt-6.0", description: "Only model.", priority: 0, visibility: "list" },
    ];
    const result = resolveCodexModels(single);
    expect(result.flagship.id).toBe("gpt-6.0");
    expect(result.fast).toBeUndefined();
    expect(result.previous).toBeUndefined();
  });

  test("throws on empty visible models", () => {
    const hidden: CodexCacheModel[] = [
      { slug: "gpt-5.0", description: "Hidden.", priority: 0, visibility: "hide" },
    ];
    expect(() => resolveCodexModels(hidden)).toThrow();
  });
});

// --- Gemini API parsing ---

const geminiModels = [
  { name: "models/gemini-2.5-pro-preview-05-06", displayName: "Gemini 2.5 Pro Preview 05-06", description: "Strong all-around" },
  { name: "models/gemini-2.5-flash-preview-05-20", displayName: "Gemini 2.5 Flash Preview", description: "Fast" },
  { name: "models/gemini-2.5-flash-lite-preview-06-17", displayName: "Gemini 2.5 Flash-Lite", description: "Fastest" },
  { name: "models/gemini-2.0-flash", displayName: "Gemini 2.0 Flash", description: "Legacy flash" },
  { name: "models/gemini-2.0-flash-lite", displayName: "Gemini 2.0 Flash-Lite", description: "Legacy lite" },
  { name: "models/chat-bison-001", displayName: "Chat Bison", description: "Not gemini" },
  { name: "models/gemini-3-pro-preview", displayName: "Gemini 3 Pro Preview", description: "Gen 3 pro" },
  { name: "models/gemini-3-flash", displayName: "Gemini 3 Flash", description: "Gen 3 flash" },
  { name: "models/gemini-3.1-pro-preview", displayName: "Gemini 3.1 Pro Preview", description: "Latest pro" },
];

describe("resolveGeminiModels", () => {
  test("picks highest-version pro model as flagship", () => {
    const result = resolveGeminiModels(geminiModels);
    expect(result.flagship.id).toBe("gemini-3.1-pro-preview");
  });

  test("picks highest-version flash model as fast (excluding lite)", () => {
    const result = resolveGeminiModels(geminiModels);
    expect(result.fast!.id).toBe("gemini-3-flash");
  });

  test("filters out non-gemini models", () => {
    const result = resolveGeminiModels(geminiModels);
    const allIds = [result.flagship.id, result.fast!.id];
    expect(allIds.every((id) => id.startsWith("gemini-"))).toBe(true);
  });

  test("handles missing pro models gracefully", () => {
    const flashOnly = [
      { name: "models/gemini-3-flash", displayName: "Flash", description: "Fast" },
    ];
    expect(() => resolveGeminiModels(flashOnly)).toThrow();
  });

  test("strips models/ prefix from IDs", () => {
    const result = resolveGeminiModels(geminiModels);
    expect(result.flagship.id).not.toContain("models/");
  });
});

// --- Oracle CLI parsing ---

describe("resolveOracleModels", () => {
  test("extracts default model from help output", () => {
    const helpText = `Oracle CLI v0.9.0
  -m, --model <model>  Model to target (gpt-5.4-pro default). Also gpt-5.4, gpt-5.1-pro`;
    const result = resolveOracleModels(helpText);
    expect(result.default.id).toBe("gpt-5.4-pro");
  });

  test("extracts alternative models", () => {
    const helpText = `  -m, --model <model>  Model to target (gpt-5.4-pro default). Also gpt-5.4, gpt-5.1-pro, gpt-5-pro`;
    const result = resolveOracleModels(helpText);
    expect(result.alt).toBeDefined();
    expect(result.alt!.id).toBe("gpt-5.4");
  });

  test("throws on unparseable help output", () => {
    expect(() => resolveOracleModels("some random text")).toThrow();
  });
});

// --- Registry generation ---

describe("generateRegistry", () => {
  const codex = {
    flagship: { id: "gpt-5.4", notes: "Latest" } as ModelEntry,
    fast: { id: "gpt-5.4-mini", notes: "Fast" } as ModelEntry,
    previous: { id: "gpt-5.3-codex", notes: "Previous" } as ModelEntry,
  };
  const gemini = {
    flagship: { id: "gemini-3.1-pro-preview", notes: "Latest pro" } as ModelEntry,
    fast: { id: "gemini-3-flash", notes: "Latest flash" } as ModelEntry,
  };
  const oracle = {
    default: { id: "gpt-5.4-pro", notes: "Oracle CLI default" } as ModelEntry,
    alt: { id: "gpt-5.4", notes: "Alternative" } as ModelEntry,
  };

  test("produces valid markdown with all sections", () => {
    const md = generateRegistry(codex, gemini, oracle);
    expect(md).toContain("# Model Registry");
    expect(md).toContain("## Codex (OpenAI)");
    expect(md).toContain("## Gemini (Google)");
    expect(md).toContain("## Oracle");
  });

  test("includes AUTO-GENERATED comment", () => {
    const md = generateRegistry(codex, gemini, oracle);
    expect(md).toContain("AUTO-GENERATED");
  });

  test("includes timestamp", () => {
    const md = generateRegistry(codex, gemini, oracle);
    expect(md).toMatch(/Last updated: \d{4}-\d{2}-\d{2}T/);
  });

  test("includes all model IDs in tables", () => {
    const md = generateRegistry(codex, gemini, oracle);
    expect(md).toContain("gpt-5.4");
    expect(md).toContain("gpt-5.4-mini");
    expect(md).toContain("gpt-5.3-codex");
    expect(md).toContain("gemini-3.1-pro-preview");
    expect(md).toContain("gemini-3-flash");
    expect(md).toContain("gpt-5.4-pro");
  });

  test("includes role names in tables", () => {
    const md = generateRegistry(codex, gemini, oracle);
    expect(md).toContain("codex-flagship");
    expect(md).toContain("codex-fast");
    expect(md).toContain("codex-previous");
    expect(md).toContain("gemini-flagship");
    expect(md).toContain("gemini-fast");
    expect(md).toContain("oracle-default");
    expect(md).toContain("oracle-alt");
  });

  test("handles missing optional fields", () => {
    const codexMinimal = {
      flagship: { id: "gpt-6.0", notes: "Only one" } as ModelEntry,
    };
    const geminiMinimal = {
      flagship: { id: "gemini-4-pro", notes: "Only one" } as ModelEntry,
    };
    const oracleMinimal = {
      default: { id: "gpt-6.0-pro", notes: "Default" } as ModelEntry,
    };
    const md = generateRegistry(codexMinimal, geminiMinimal, oracleMinimal);
    expect(md).toContain("gpt-6.0");
    expect(md).toContain("gemini-4-pro");
    expect(md).not.toContain("codex-fast");
    expect(md).not.toContain("codex-previous");
  });
});
