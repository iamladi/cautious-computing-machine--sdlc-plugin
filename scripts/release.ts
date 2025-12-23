#!/usr/bin/env bun
/**
 * Atomic Version Bump Script
 *
 * Updates version in all three files simultaneously:
 * - package.json
 * - .claude-plugin/plugin.json
 * - CHANGELOG.md (adds new entry)
 *
 * Usage:
 *   bun run scripts/release.ts patch   # 1.4.0 → 1.4.1
 *   bun run scripts/release.ts minor   # 1.4.0 → 1.5.0
 *   bun run scripts/release.ts major   # 1.4.0 → 2.0.0
 */

import { readFile, writeFile } from "fs/promises";
import { join } from "path";

type BumpType = "major" | "minor" | "patch";

function bumpVersion(current: string, type: BumpType): string {
  const [major, minor, patch] = current.split(".").map(Number);
  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
  }
}

function formatDate(): string {
  return new Date().toISOString().split("T")[0];
}

async function release(type: BumpType) {
  const cwd = process.cwd();

  // 1. Read current version from package.json
  const pkgPath = join(cwd, "package.json");
  const pkgContent = await readFile(pkgPath, "utf-8");
  const pkg = JSON.parse(pkgContent);
  const currentVersion = pkg.version;
  const newVersion = bumpVersion(currentVersion, type);

  console.log(`Bumping version: ${currentVersion} → ${newVersion}\n`);

  // 2. Update package.json
  pkg.version = newVersion;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`✅ Updated package.json`);

  // 3. Update plugin.json
  const pluginPath = join(cwd, ".claude-plugin/plugin.json");
  const pluginContent = await readFile(pluginPath, "utf-8");
  const plugin = JSON.parse(pluginContent);
  plugin.version = newVersion;
  await writeFile(pluginPath, JSON.stringify(plugin, null, 2) + "\n");
  console.log(`✅ Updated .claude-plugin/plugin.json`);

  // 4. Update CHANGELOG.md
  const changelogPath = join(cwd, "CHANGELOG.md");
  let changelog = await readFile(changelogPath, "utf-8");

  const newEntry = `## [${newVersion}] - ${formatDate()}\n\n### Changed\n- TODO: Add changes\n\n`;

  // Find the first version header and insert before it
  const firstVersionMatch = changelog.match(/^## \[\d+\.\d+\.\d+\]/m);
  if (firstVersionMatch && firstVersionMatch.index !== undefined) {
    changelog =
      changelog.slice(0, firstVersionMatch.index) +
      newEntry +
      changelog.slice(firstVersionMatch.index);
  } else {
    // No existing version, find end of header and append
    const headerEnd = changelog.indexOf("\n\n") + 2;
    changelog =
      changelog.slice(0, headerEnd) + newEntry + changelog.slice(headerEnd);
  }

  await writeFile(changelogPath, changelog);
  console.log(`✅ Updated CHANGELOG.md`);

  console.log(`\n🎉 Version ${newVersion} prepared\n`);
  console.log("Next steps:");
  console.log("  1. Edit CHANGELOG.md to add actual changes");
  console.log(`  2. git add -A && git commit -m "chore: release v${newVersion}"`);
  console.log(`  3. git tag v${newVersion}`);
  console.log("  4. git push && git push --tags");
}

// Parse CLI args
const type = process.argv[2] as BumpType;
if (!["major", "minor", "patch"].includes(type)) {
  console.error("Usage: bun run scripts/release.ts <major|minor|patch>");
  process.exit(1);
}

release(type);
