---
name: codex
description: Use when the user asks to run Codex CLI (codex exec, codex resume) or references OpenAI Codex for code analysis, refactoring, or automated editing. Resolves the latest flagship model from the model registry.
---

# Codex Skill

## Role

Run OpenAI Codex CLI as a delegated reasoning engine for code analysis, refactoring, and automated edits. Codex has its own sandbox model and its own context window — your job is to invoke it correctly, surface its results, and keep the user in control of any side-effecting operation.

## Success looks like

- Codex runs under the right sandbox for what was asked: read-only for analysis, workspace-write only when edits were requested, never `danger-full-access` without explicit user opt-in.
- Model and reasoning effort match task complexity — flagship + `xhigh` for code review, flagship + `medium` for standard refactors, fast model for cheap one-shots.
- The output you return to the user is Codex's output, not a paraphrase. Trust the tool.
- The user knows they can resume the session afterward.

## Model selection

Resolve the registry first, since model IDs change:
- `Glob(pattern: "**/sdlc/**/config/model-registry.md", path: "~/.claude/plugins")` then Read
- Default to `codex-flagship`. Offer `codex-fast` for cost-sensitive or simple tasks.
- Ask the user for reasoning effort (`xhigh` / `high` / `medium` / `low`) — the right level depends on task type, so don't pick silently.

If the registry load fails, fall back to the table below. Treat the names as possibly stale and say so when reporting.

| Model | Best for | Context | Notes |
| --- | --- | --- | --- |
| `gpt-5.4` | Flagship — code review, agentic coding | 400K / 128K | Frontier |
| `gpt-5.4-mini` | Cost-efficient coding | 400K / 128K | Smaller frontier |
| `gpt-5.3-codex` | Previous flagship | 400K / 128K | 25% faster than 5.1 |

## Invocation shape

Two flags are non-negotiable on every call, with reasoning attached so you can judge edge cases:

- `--skip-git-repo-check` — Codex aborts when invoked outside a git repo or inside a nested worktree it doesn't recognize. We run it from arbitrary working directories (including non-repo paths the user names), so the check is wrong for our use. Always include it.
- `2>/dev/null` appended to every `codex exec` — Codex streams thinking tokens to stderr. Those tokens land in your conversation context as tool output and pollute downstream reasoning. Drop them by default. The one exception: when the user is actively debugging Codex itself, omit the redirect so they can see what Codex is doing.

Sandbox is the safety dial — pick the least privilege the task needs:
- `--sandbox read-only` for analysis, review, planning. The default. Codex can't write or network.
- `--sandbox workspace-write` when edits were requested. Codex can write inside the workspace; still no network.
- `--sandbox danger-full-access` only when the user has explicitly approved network or out-of-workspace writes. Confirm before using. `--full-auto` is the other blast-radius flag — same rule, name it before using.

Resume sessions with `echo "prompt" | codex exec --skip-git-repo-check resume --last 2>/dev/null`. Don't insert `-c` or `-m` flags between `exec` and `resume` — Codex parses them as positional-arg conflicts and rejects the call. The original session's model and config carry over.

A non-zero exit usually means sandbox denial, config error, or model unavailability. Surface the exit code and stderr (re-run without the redirect if needed) so the user sees the real cause — don't silently retry, since retry without diagnosis just burns quota against the same failure.

## After the run

Tell the user once: "You can resume this Codex session at any time by saying 'codex resume'." The resume flow above exists but has no natural discovery surface, so the one-line hook is what makes it usable at all.

## References

CLI flag reference, sandbox semantics, and the code-review output format live in `references/codex-cli-reference.md`. Load when you need flag details — don't paraphrase, the examples are the contract:
- `Glob(pattern: "**/sdlc/**/skills/codex/references/codex-cli-reference.md", path: "~/.claude/plugins")` → Read

## Arguments

$ARGUMENTS
