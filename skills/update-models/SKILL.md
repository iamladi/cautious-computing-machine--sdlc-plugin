---
name: update-models
description: Re-resolve the model registry by querying OpenAI Codex cache, Google AI API, and Oracle CLI. Use when models feel stale or after a major model release.
---

# Update Models Skill

## Goal

Run the model resolution script to refresh the central model registry with the latest available models.

## Workflow

1. Run: `cd <sdlc-plugin-dir> && bun run resolve-models`
   - Find sdlc-plugin via: `Glob(pattern: "**/sdlc-plugin/package.json", path: "~/.claude/plugins")`
2. Read the script output for changes or errors
3. If models changed, show the user what was updated
4. Check `~/.codex/config.toml` — if its `model` field doesn't match `codex-flagship` from the new registry, suggest updating it

## Arguments

$ARGUMENTS
