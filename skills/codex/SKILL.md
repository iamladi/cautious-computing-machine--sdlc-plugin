---
name: codex
description: Use when the user asks to run Codex CLI (codex exec, codex resume) or references OpenAI Codex for code analysis, refactoring, or automated editing. Uses GPT-5.1-Codex by default for state-of-the-art software engineering.
---

# Codex Skill

## Priorities

Correctness > Security > Efficiency

## Goal

Execute OpenAI Codex CLI for automated code analysis, refactoring, and editing tasks. Default to `gpt-5.1-codex` model with user-specified reasoning effort. Suppress stderr thinking tokens by default unless debugging is needed.

## Constraints

- Default model: `gpt-5.1-codex` (ask user for reasoning effort: high, medium, or low)
- Sandbox mode: `--sandbox read-only` (default), `workspace-write` (for edits), `danger-full-access` (network/broad access)
- Always use `--skip-git-repo-check` flag
- Suppress stderr by default: append `2>/dev/null` to all `codex exec` commands
- Resume sessions: `echo "prompt" | codex exec --skip-git-repo-check resume --last 2>/dev/null` (no config flags between exec and resume unless user specifies)
- Ask permission before using high-impact flags (`--full-auto`, `--sandbox danger-full-access`)
- Stop and report on non-zero exit codes
- Inform user after completion: "You can resume this Codex session at any time by saying 'codex resume'"

## Model Options

| Model | Best for | Context window | Key features |
| --- | --- | --- | --- |
| `gpt-5.2-codex` ⭐⭐ | **Code review flagship**: xhigh reasoning, security analysis, architecture review | 400K input / 128K output | 79% SWE-bench Pro, best for reviews |
| `gpt-5.1-codex` ⭐ | **Flagship model**: Software engineering, agentic coding workflows | 400K input / 128K output | 76.3% SWE-bench, adaptive reasoning, $1.25/$10.00 |
| `gpt-5.1-codex-mini` | Cost-efficient coding (4x more usage allowance) | 400K input / 128K output | Near SOTA performance, $0.25/$2.00 |
| `gpt-5.1-thinking` | Ultra-complex reasoning, deep problem analysis | 400K input / 128K output | Adaptive thinking depth, runs 2x slower on hardest tasks |

## References

Load CLI reference and code review patterns:
- `Glob(pattern: "**/sdlc/**/skills/codex/references/codex-cli-reference.md", path: "~/.claude/plugins")` → Read result

## Arguments

$ARGUMENTS
