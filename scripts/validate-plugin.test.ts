import { describe, test, expect } from "bun:test";
import { PluginManifestSchema } from "./validate-plugin";

describe("PluginManifestSchema", () => {
  const validManifest = {
    name: "test-plugin",
    version: "1.0.0",
    description: "A test plugin",
    author: { name: "Test Author" },
  };

  test("accepts valid minimal manifest", () => {
    const result = PluginManifestSchema.safeParse(validManifest);
    expect(result.success).toBe(true);
  });

  test("accepts manifest with all optional fields", () => {
    const result = PluginManifestSchema.safeParse({
      ...validManifest,
      homepage: "https://example.com",
      repository: "https://github.com/test/repo",
      license: "MIT",
      keywords: ["test", "plugin"],
      commands: ["cmd1", "cmd2"],
      agents: "agents/",
      hooks: { "pre-commit": "echo test" },
      mcpServers: { server1: { command: "node" } },
    });
    expect(result.success).toBe(true);
  });

  test("rejects missing name", () => {
    const { name, ...noName } = validManifest;
    const result = PluginManifestSchema.safeParse(noName);
    expect(result.success).toBe(false);
  });

  test("rejects invalid version format", () => {
    const result = PluginManifestSchema.safeParse({
      ...validManifest,
      version: "v1.0",
    });
    expect(result.success).toBe(false);
  });

  test("rejects missing author", () => {
    const { author, ...noAuthor } = validManifest;
    const result = PluginManifestSchema.safeParse(noAuthor);
    expect(result.success).toBe(false);
  });

  test("rejects invalid author email", () => {
    const result = PluginManifestSchema.safeParse({
      ...validManifest,
      author: { name: "Test", email: "not-an-email" },
    });
    expect(result.success).toBe(false);
  });

  test("accepts commands as string or array", () => {
    const asString = PluginManifestSchema.safeParse({
      ...validManifest,
      commands: "commands/",
    });
    const asArray = PluginManifestSchema.safeParse({
      ...validManifest,
      commands: ["cmd1", "cmd2"],
    });
    expect(asString.success).toBe(true);
    expect(asArray.success).toBe(true);
  });

  test("validates actual plugin.json", async () => {
    const content = await Bun.file(".claude-plugin/plugin.json").text();
    const json = JSON.parse(content);
    const result = PluginManifestSchema.safeParse(json);
    expect(result.success).toBe(true);
  });
});
