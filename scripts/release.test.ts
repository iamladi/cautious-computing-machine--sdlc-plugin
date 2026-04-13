import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, readFile, rm } from "fs/promises";
import { join } from "path";
import { bumpVersion, formatDate } from "./release";

// --- bumpVersion ---

describe("bumpVersion", () => {
  test("increments patch", () => {
    expect(bumpVersion("1.4.0", "patch")).toBe("1.4.1");
  });

  test("increments minor and resets patch", () => {
    expect(bumpVersion("1.4.3", "minor")).toBe("1.5.0");
  });

  test("increments major and resets minor and patch", () => {
    expect(bumpVersion("1.4.3", "major")).toBe("2.0.0");
  });

  test("patch from 0.0.1", () => {
    expect(bumpVersion("0.0.1", "patch")).toBe("0.0.2");
  });

  test("minor from 0.1.9 resets patch", () => {
    expect(bumpVersion("0.1.9", "minor")).toBe("0.2.0");
  });

  test("major from 0.9.9 resets both", () => {
    expect(bumpVersion("0.9.9", "major")).toBe("1.0.0");
  });

  test("major resets minor and patch even when both are non-zero", () => {
    expect(bumpVersion("3.7.12", "major")).toBe("4.0.0");
  });

  test("patch preserves major and minor", () => {
    expect(bumpVersion("2.5.0", "patch")).toBe("2.5.1");
  });
});

// --- formatDate ---

describe("formatDate", () => {
  test("returns a string matching YYYY-MM-DD", () => {
    expect(formatDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("matches current UTC date", () => {
    const expected = new Date().toISOString().split("T")[0];
    expect(formatDate()).toBe(expected);
  });
});

// --- release() end-to-end via bun subprocess ---
//
// release() is not exported, so we invoke it by spawning bun with the script
// directly (as the user would). The temp dir is passed as cwd so all file I/O
// stays isolated from the real repo.

async function setupTempDir(
  dir: string,
  opts: {
    packageVersion?: string;
    pluginVersion?: string;
    changelog?: string;
  } = {}
): Promise<void> {
  const pluginDir = join(dir, ".claude-plugin");
  await mkdir(pluginDir, { recursive: true });

  const pkg = { name: "sdlc-plugin", version: opts.packageVersion ?? "1.4.0" };
  await writeFile(join(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");

  const plugin = { name: "sdlc-plugin", version: opts.pluginVersion ?? "1.4.0" };
  await writeFile(
    join(pluginDir, "plugin.json"),
    JSON.stringify(plugin, null, 2) + "\n"
  );

  const changelog =
    opts.changelog ??
    `# Changelog\n\n## [1.4.0] - 2024-01-01\n\n### Changed\n- Initial\n`;
  await writeFile(join(dir, "CHANGELOG.md"), changelog);
}

describe("release()", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = join(
      import.meta.dir,
      `__release_test_${Date.now()}_${Math.random().toString(36).slice(2)}`
    );
    await mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  async function runRelease(
    type: "major" | "minor" | "patch"
  ): Promise<{ exitCode: number }> {
    const proc = Bun.spawn(
      ["bun", "run", join(import.meta.dir, "release.ts"), type],
      { cwd: tmpDir, stdout: "pipe", stderr: "pipe" }
    );
    const exitCode = await proc.exited;
    return { exitCode };
  }

  test("patch: package.json version bumped", async () => {
    await setupTempDir(tmpDir, { packageVersion: "2.0.0", pluginVersion: "2.0.0" });

    const { exitCode } = await runRelease("patch");
    expect(exitCode).toBe(0);

    const pkg = JSON.parse(
      await readFile(join(tmpDir, "package.json"), "utf-8")
    );
    expect(pkg.version).toBe("2.0.1");
  });

  test("patch: plugin.json version bumped", async () => {
    await setupTempDir(tmpDir, { packageVersion: "2.0.0", pluginVersion: "2.0.0" });

    await runRelease("patch");

    const plugin = JSON.parse(
      await readFile(join(tmpDir, ".claude-plugin/plugin.json"), "utf-8")
    );
    expect(plugin.version).toBe("2.0.1");
  });

  test("patch: CHANGELOG.md gets new entry inserted before existing entry", async () => {
    await setupTempDir(tmpDir, {
      packageVersion: "2.0.0",
      pluginVersion: "2.0.0",
      changelog: `# Changelog\n\n## [2.0.0] - 2024-01-01\n\n### Changed\n- Initial\n`,
    });

    await runRelease("patch");

    const changelog = await readFile(join(tmpDir, "CHANGELOG.md"), "utf-8");
    expect(changelog).toContain("## [2.0.1]");
    expect(changelog).toContain("## [2.0.0]");
    expect(changelog).toContain("- TODO: Add changes");
    expect(changelog.indexOf("## [2.0.1]")).toBeLessThan(
      changelog.indexOf("## [2.0.0]")
    );
  });

  test("patch: CHANGELOG.md entry includes today's date", async () => {
    await setupTempDir(tmpDir, {
      packageVersion: "1.0.0",
      pluginVersion: "1.0.0",
      changelog: `# Changelog\n\n## [1.0.0] - 2024-01-01\n\n### Changed\n- Base\n`,
    });

    await runRelease("patch");

    const today = formatDate();
    const changelog = await readFile(join(tmpDir, "CHANGELOG.md"), "utf-8");
    expect(changelog).toContain(`## [1.0.1] - ${today}`);
  });

  test("minor: bumps minor and resets patch in all three files", async () => {
    await setupTempDir(tmpDir, {
      packageVersion: "1.3.5",
      pluginVersion: "1.3.5",
      changelog: `# Changelog\n\n## [1.3.5] - 2024-01-01\n\n### Changed\n- Previous\n`,
    });

    const { exitCode } = await runRelease("minor");
    expect(exitCode).toBe(0);

    const pkg = JSON.parse(
      await readFile(join(tmpDir, "package.json"), "utf-8")
    );
    expect(pkg.version).toBe("1.4.0");

    const plugin = JSON.parse(
      await readFile(join(tmpDir, ".claude-plugin/plugin.json"), "utf-8")
    );
    expect(plugin.version).toBe("1.4.0");

    const changelog = await readFile(join(tmpDir, "CHANGELOG.md"), "utf-8");
    expect(changelog).toContain("## [1.4.0]");
    expect(changelog).toContain("## [1.3.5]");
  });

  test("major: bumps major and resets minor+patch in all three files", async () => {
    await setupTempDir(tmpDir, {
      packageVersion: "0.9.2",
      pluginVersion: "0.9.2",
      changelog: `# Changelog\n\n## [0.9.2] - 2024-01-01\n\n### Changed\n- Old\n`,
    });

    const { exitCode } = await runRelease("major");
    expect(exitCode).toBe(0);

    const pkg = JSON.parse(
      await readFile(join(tmpDir, "package.json"), "utf-8")
    );
    expect(pkg.version).toBe("1.0.0");

    const plugin = JSON.parse(
      await readFile(join(tmpDir, ".claude-plugin/plugin.json"), "utf-8")
    );
    expect(plugin.version).toBe("1.0.0");

    const changelog = await readFile(join(tmpDir, "CHANGELOG.md"), "utf-8");
    expect(changelog).toContain("## [1.0.0]");
    expect(changelog).toContain("## [0.9.2]");
  });

  test("changelog with no existing version header appends entry after document header", async () => {
    await setupTempDir(tmpDir, {
      packageVersion: "0.1.0",
      pluginVersion: "0.1.0",
      changelog: `# Changelog\n\nAll notable changes.\n`,
    });

    const { exitCode } = await runRelease("patch");
    expect(exitCode).toBe(0);

    const changelog = await readFile(join(tmpDir, "CHANGELOG.md"), "utf-8");
    expect(changelog).toContain("## [0.1.1]");
  });
});
