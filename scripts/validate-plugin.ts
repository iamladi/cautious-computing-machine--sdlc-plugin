#!/usr/bin/env bun
import { z } from 'zod';
import { readFile } from 'fs/promises';
import { join } from 'path';

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
  engines: z.object({
    claude: z.string().optional(),
    node: z.string().optional(),
  }).optional(),
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

validatePlugin();
