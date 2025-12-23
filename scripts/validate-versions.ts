#!/usr/bin/env bun
/**
 * Version Synchronization Validator
 *
 * Ensures version consistency across:
 * - package.json (version field)
 * - .claude-plugin/plugin.json (version field)
 * - CHANGELOG.md (latest ## [X.Y.Z] header)
 *
 * Exit codes:
 *   0 - All versions synchronized
 *   1 - Version mismatch detected
 */

import { readFile } from "fs/promises";
import { join } from "path";

interface VersionInfo {
  source: string;
  version: string | null;
  path: string;
}

interface ValidationResult {
  success: boolean;
  versions: VersionInfo[];
  mismatchDetails?: string;
}

async function extractPackageVersion(cwd: string): Promise<VersionInfo> {
  const path = join(cwd, "package.json");
  try {
    const content = await readFile(path, "utf-8");
    const json = JSON.parse(content);
    return { source: "package.json", version: json.version || null, path };
  } catch {
    return { source: "package.json", version: null, path };
  }
}

async function extractPluginVersion(cwd: string): Promise<VersionInfo> {
  const path = join(cwd, ".claude-plugin/plugin.json");
  try {
    const content = await readFile(path, "utf-8");
    const json = JSON.parse(content);
    return { source: "plugin.json", version: json.version || null, path };
  } catch {
    return { source: "plugin.json", version: null, path };
  }
}

async function extractChangelogVersion(cwd: string): Promise<VersionInfo> {
  const path = join(cwd, "CHANGELOG.md");
  try {
    const content = await readFile(path, "utf-8");
    // Match first occurrence of ## [X.Y.Z] - ignoring [Unreleased]
    const versionRegex = /^## \[(\d+\.\d+\.\d+)\]/m;
    const match = content.match(versionRegex);
    return {
      source: "CHANGELOG.md",
      version: match ? match[1] : null,
      path,
    };
  } catch {
    return { source: "CHANGELOG.md", version: null, path };
  }
}

export async function validateVersions(
  cwd: string = process.cwd()
): Promise<ValidationResult> {
  const [pkgVersion, pluginVersion, changelogVersion] = await Promise.all([
    extractPackageVersion(cwd),
    extractPluginVersion(cwd),
    extractChangelogVersion(cwd),
  ]);

  const versions = [pkgVersion, pluginVersion, changelogVersion];
  const validVersions = versions.filter((v) => v.version !== null);

  if (validVersions.length === 0) {
    return {
      success: false,
      versions,
      mismatchDetails: "No version information found in any file",
    };
  }

  // Check if all versions match
  const uniqueVersions = new Set(validVersions.map((v) => v.version));

  if (uniqueVersions.size === 1) {
    return { success: true, versions };
  }

  // Build detailed mismatch report
  const mismatchDetails = versions
    .map((v) => `  ${v.source.padEnd(14)} ${v.version ?? "(not found)"}`)
    .join("\n");

  return {
    success: false,
    versions,
    mismatchDetails: `Version mismatch detected:\n${mismatchDetails}`,
  };
}

// CLI entry point
async function main() {
  const result = await validateVersions();

  if (result.success) {
    const version = result.versions.find((v) => v.version)?.version;
    console.log(`✅ All versions synchronized: ${version}`);
    process.exit(0);
  } else {
    console.error("❌ Version synchronization failed!\n");
    console.error(result.mismatchDetails);
    console.error("\nAll three files must have the same version:");
    console.error("  1. package.json (version field)");
    console.error("  2. .claude-plugin/plugin.json (version field)");
    console.error("  3. CHANGELOG.md (latest ## [X.Y.Z] header)");
    process.exit(1);
  }
}

// Only run when executed directly, not when imported
if (import.meta.main) {
  main();
}
