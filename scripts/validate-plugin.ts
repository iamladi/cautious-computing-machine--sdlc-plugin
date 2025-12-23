#!/usr/bin/env bun
import { z } from 'zod';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { validateVersions } from './validate-versions';

const PluginManifestSchema = z.object({
  name: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must follow semver format'),
  description: z.string(),
  author: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    url: z.string().url().optional(),
  }),
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  license: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  commands: z.union([z.string(), z.array(z.string())]).optional(),
  agents: z.union([z.string(), z.array(z.string())]).optional(),
  hooks: z.union([z.string(), z.record(z.any())]).optional(),
  mcpServers: z.union([z.string(), z.record(z.any())]).optional(),
});

async function validatePlugin() {
  const pluginJsonPath = join(process.cwd(), '.claude-plugin/plugin.json');

  try {
    const content = await readFile(pluginJsonPath, 'utf-8');
    const json = JSON.parse(content);

    const result = PluginManifestSchema.safeParse(json);

    if (!result.success) {
      console.error('❌ Plugin validation failed:');
      console.error(JSON.stringify(result.error.format(), null, 2));
      process.exit(1);
    }

    console.log(`✅ ${result.data.name} v${result.data.version} is valid`);

  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error reading plugin.json:', error.message);
    }
    process.exit(1);
  }
}

async function validateReadmeCommands() {
  const commandsDir = join(process.cwd(), 'commands');
  const readmePath = join(process.cwd(), 'README.md');

  if (!existsSync(commandsDir)) {
    console.log('ℹ️  No commands directory found, skipping README validation');
    return;
  }

  if (!existsSync(readmePath)) {
    console.log('ℹ️  No README.md found, skipping README validation');
    return;
  }

  try {
    // Get actual command files
    const commandFiles = await readdir(commandsDir);
    const actualCommands = commandFiles
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''))
      .sort();

    // Parse README to find documented commands
    const readmeContent = await readFile(readmePath, 'utf-8');
    // Match both formats: `### /command` and `- **/command**`
    const commandHeaderRegex = /(?:^### `\/([a-z_-]+)`|^- \*\*\/([a-z_-]+)\*\*)/gm;
    const documentedCommands: string[] = [];
    let match;

    while ((match = commandHeaderRegex.exec(readmeContent)) !== null) {
      // Get whichever capture group matched
      documentedCommands.push(match[1] || match[2]);
    }

    documentedCommands.sort();

    // Compare
    const missingInReadme = actualCommands.filter(cmd => !documentedCommands.includes(cmd));
    const extraInReadme = documentedCommands.filter(cmd => !actualCommands.includes(cmd));

    let hasErrors = false;

    if (missingInReadme.length > 0) {
      console.error('❌ Commands exist but not documented in README.md:');
      missingInReadme.forEach(cmd => console.error(`   - /${cmd}`));
      hasErrors = true;
    }

    if (extraInReadme.length > 0) {
      console.error('❌ Commands documented in README.md but files don\'t exist:');
      extraInReadme.forEach(cmd => console.error(`   - /${cmd} (missing commands/${cmd}.md)`));
      hasErrors = true;
    }

    if (!hasErrors) {
      console.log(`✅ README.md documents all ${actualCommands.length} commands correctly`);
    } else {
      process.exit(1);
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error validating README commands:', error.message);
    }
    process.exit(1);
  }
}

async function main() {
  // Version synchronization check (run first)
  const versionResult = await validateVersions();
  if (!versionResult.success) {
    console.error('❌ Version synchronization failed!\n');
    console.error(versionResult.mismatchDetails);
    console.error('\nAll three files must have the same version:');
    console.error('  1. package.json (version field)');
    console.error('  2. .claude-plugin/plugin.json (version field)');
    console.error('  3. CHANGELOG.md (latest ## [X.Y.Z] header)');
    process.exit(1);
  }
  const version = versionResult.versions.find((v) => v.version)?.version;
  console.log(`✅ Versions synchronized: ${version}`);

  await validatePlugin();
  await validateReadmeCommands();
}

main();
