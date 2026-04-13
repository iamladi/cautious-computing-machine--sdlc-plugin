import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { validateVersions } from "./validate-versions";

async function writeJson(dir: string, rel: string, data: unknown) {
  const full = join(dir, rel);
  await mkdir(join(full, ".."), { recursive: true });
  await writeFile(full, JSON.stringify(data, null, 2), "utf-8");
}

async function writeText(dir: string, rel: string, content: string) {
  const full = join(dir, rel);
  await mkdir(join(full, ".."), { recursive: true });
  await writeFile(full, content, "utf-8");
}

const VERSION = "1.2.3";

describe("validateVersions", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "validate-versions-"));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  // --- happy path ---

  test("all versions match → success: true", async () => {
    await writeJson(tmp, "package.json", { version: VERSION });
    await writeJson(tmp, ".claude-plugin/plugin.json", { version: VERSION });
    await writeText(tmp, "CHANGELOG.md", `## [${VERSION}] - 2024-01-01\n\n### Added\n- Initial release\n`);

    const result = await validateVersions(tmp);

    expect(result.success).toBe(true);
    expect(result.mismatchDetails).toBeUndefined();
    expect(result.versions.every((v) => v.version === VERSION || v.version === null)).toBe(true);
  });

  // --- mismatch cases ---

  test("package.json version differs → success: false with mismatch details", async () => {
    await writeJson(tmp, "package.json", { version: "9.9.9" });
    await writeJson(tmp, ".claude-plugin/plugin.json", { version: VERSION });
    await writeText(tmp, "CHANGELOG.md", `## [${VERSION}] - 2024-01-01\n`);

    const result = await validateVersions(tmp);

    expect(result.success).toBe(false);
    expect(result.mismatchDetails).toBeDefined();
    expect(result.mismatchDetails).toContain("Version mismatch detected");
    expect(result.mismatchDetails).toContain("9.9.9");
    expect(result.mismatchDetails).toContain(VERSION);

    const pkgEntry = result.versions.find((v) => v.source === "package.json");
    expect(pkgEntry?.version).toBe("9.9.9");
  });

  test("CHANGELOG.md version differs → success: false", async () => {
    await writeJson(tmp, "package.json", { version: VERSION });
    await writeJson(tmp, ".claude-plugin/plugin.json", { version: VERSION });
    await writeText(tmp, "CHANGELOG.md", `## [0.0.1] - 2023-01-01\n`);

    const result = await validateVersions(tmp);

    expect(result.success).toBe(false);
    expect(result.mismatchDetails).toContain("Version mismatch detected");

    const changelogEntry = result.versions.find((v) => v.source === "CHANGELOG.md");
    expect(changelogEntry?.version).toBe("0.0.1");
  });

  // --- missing / absent files ---

  test("missing CHANGELOG.md → handles gracefully (version null)", async () => {
    await writeJson(tmp, "package.json", { version: VERSION });
    await writeJson(tmp, ".claude-plugin/plugin.json", { version: VERSION });
    // no CHANGELOG.md written

    const result = await validateVersions(tmp);

    const changelogEntry = result.versions.find((v) => v.source === "CHANGELOG.md");
    expect(changelogEntry?.version).toBeNull();

    // Two files agree so it should still succeed
    expect(result.success).toBe(true);
  });

  test("no version files found → success: false with 'No version information found'", async () => {
    // tmp is empty — no package.json, no plugin.json, no CHANGELOG.md
    const result = await validateVersions(tmp);

    expect(result.success).toBe(false);
    expect(result.mismatchDetails).toContain("No version information found");
    expect(result.versions.every((v) => v.version === null)).toBe(true);
  });

  // --- CHANGELOG edge case ---

  test("CHANGELOG has [Unreleased] section before versioned entry → still finds correct version", async () => {
    const changelog = [
      "# Changelog",
      "",
      "## [Unreleased]",
      "### Added",
      "- Something coming soon",
      "",
      `## [${VERSION}] - 2024-01-01`,
      "### Added",
      "- Initial release",
      "",
    ].join("\n");

    await writeJson(tmp, "package.json", { version: VERSION });
    await writeJson(tmp, ".claude-plugin/plugin.json", { version: VERSION });
    await writeText(tmp, "CHANGELOG.md", changelog);

    const result = await validateVersions(tmp);

    expect(result.success).toBe(true);
    const changelogEntry = result.versions.find((v) => v.source === "CHANGELOG.md");
    expect(changelogEntry?.version).toBe(VERSION);
  });
});
