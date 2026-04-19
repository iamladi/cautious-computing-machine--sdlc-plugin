---
name: update-models
description: Re-resolve the model registry by querying OpenAI Codex cache, Google AI API, and Oracle CLI. Use when models feel stale or after a major model release.
---

# Update Models Skill

## Role

Refresh `sdlc-plugin/config/model-registry.md` — the single source of truth that codex / gemini / oracle skills read to pick flagship/fast/previous model IDs. The resolver script does the three-source query (Codex cache, Gemini API, Oracle CLI); your job is to invoke it, surface what changed, and flag downstream drift the script can't see.

## Success looks like

- The registry file is written with fresh IDs from all three providers, or the run fails loudly — no partial silent writes.
- The user sees a diff of what changed (added / removed / renamed model IDs), not a vague "registry updated."
- `~/.codex/config.toml` is flagged when its `model` field no longer matches `codex-flagship` — otherwise the user's codex CLI keeps pinning a superseded model without knowing.

## Invocation shape

Find the plugin via portable Glob (per OPUS §13 — absolute dev paths silently return empty when the plugin is installed elsewhere, and the script will then fail to find its own write target):

- `Glob(pattern: "**/sdlc-plugin/package.json", path: "~/.claude/plugins")` → cd into the directory containing the match.
- Run `bun run resolve-models`. The script handles authentication, API pagination, visibility filtering, and the three-source merge. Don't re-implement any part of this from the CLI; fix the script if the output is wrong, not the output itself (§9 trust-the-tool).

The `--dry-run` flag prints the would-be registry to stdout without writing — use it when the user wants to preview changes before committing the file.

## Reporting changes

Read the script output and the resulting `config/model-registry.md`. Show the user:

- Which model IDs changed role (e.g., `gpt-5.4` was `codex-flagship`, now `codex-previous`).
- Any IDs that disappeared from a provider entirely — these usually mean a model was deprecated upstream and any skill pinning the old ID will start failing.
- Any IDs that are net-new.

Silent success ("done, registry updated") hides the signal the user ran this for. The diff is the product, not the write.

## Downstream config drift

After a successful refresh, check `~/.codex/config.toml`. If its `model` field doesn't match the new `codex-flagship` ID, tell the user — don't edit it for them. The codex config is the user's personal CLI pin, and they may be holding a prior model intentionally (cost, workflow lock, reproducibility). Name the drift; let them choose.

## When the script fails

A partial registry (e.g., Codex resolved but Gemini API returned 401) is worse than a stale registry — it poisons codex/gemini skills with asymmetric staleness where one provider looks fresh and the other is silently frozen. If any of the three sources errors:

- Surface the exit code and stderr verbatim.
- Don't write a partial registry. The script's own "all-or-nothing" write is the safe default; preserve it.
- Name the likely cause (expired API key, Oracle CLI not installed, Codex cache missing) but let the user fix it — this skill is the invocation wrapper, not the auth troubleshooter.

## Arguments

$ARGUMENTS
