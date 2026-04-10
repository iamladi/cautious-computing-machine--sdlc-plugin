---
name: codex
description: Use when the user asks to run Codex CLI (codex exec, codex resume) or references OpenAI Codex for code analysis, refactoring, or automated editing. Resolves the latest flagship model from the model registry.
---

# Codex Skill

## Priorities

Correctness > Security > Efficiency

## Model Registry

Load current models before executing — this overrides any model names in the tables below:
- `Glob(pattern: "**/sdlc/**/config/model-registry.md", path: "~/.claude/plugins")` → Read result
- Use `codex-flagship` as the default model. Offer user `codex-fast` for cost-sensitive tasks.
- If registry load fails, fall back to the tables below.

## Goal

Execute OpenAI Codex CLI for automated code analysis, refactoring, and editing tasks. Default to the flagship model from the registry with user-specified reasoning effort. Suppress stderr thinking tokens by default unless debugging is needed.

## Constraints

- Default model: flagship from model registry (ask user for reasoning effort: high, medium, or low)
- Sandbox mode: `--sandbox read-only` (default), `workspace-write` (for edits), `danger-full-access` (network/broad access)
- Always use `--skip-git-repo-check` flag
- Suppress stderr by default: append `2>/dev/null` to all `codex exec` commands
- Resume sessions: `echo "prompt" | codex exec --skip-git-repo-check resume --last 2>/dev/null` (no config flags between exec and resume unless user specifies)
- Ask permission before using high-impact flags (`--full-auto`, `--sandbox danger-full-access`)
- Stop and report on non-zero exit codes
- Inform user after completion: "You can resume this Codex session at any time by saying 'codex resume'"

## Model Options (fallback — prefer registry)

These model names may be outdated. Always prefer model-registry.md values when available.

| Model | Best for | Context window | Key features |
| --- | --- | --- | --- |
| `gpt-5.4` | **Flagship**: Software engineering, code review, agentic coding | 400K input / 128K output | Latest frontier model |
| `gpt-5.4-mini` | Cost-efficient coding | 400K input / 128K output | Smaller frontier model |
| `gpt-5.3-codex` | Previous flagship | 400K input / 128K output | 25% faster than 5.1, $1.75/$14.00 |

## References

Load CLI reference and code review patterns:
- `Glob(pattern: "**/sdlc/**/skills/codex/references/codex-cli-reference.md", path: "~/.claude/plugins")` → Read result

## Arguments

$ARGUMENTS
