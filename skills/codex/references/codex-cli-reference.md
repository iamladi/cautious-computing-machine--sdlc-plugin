<!-- Codex CLI Reference - Extracted from skills/codex/SKILL.md -->
<!-- Used by: /codex skill -->
<!-- Model selection is sourced from ~/.codex/config.toml (kept fresh by /update-models). Invocations below omit `-m` to defer to that config — re-pinning in a snippet bypasses the registry-resolution path the skill relies on. -->

## Quick Reference

| Use case | Sandbox mode | Key flags |
| --- | --- | --- |
| Read-only review or analysis | `read-only` | `--sandbox read-only 2>/dev/null` |
| Apply local edits | `workspace-write` | `--sandbox workspace-write --full-auto 2>/dev/null` |
| Permit network or broad access | `danger-full-access` | `--sandbox danger-full-access --full-auto 2>/dev/null` |
| Resume recent session | Inherited from original | `echo "prompt" \| codex exec --skip-git-repo-check resume --last 2>/dev/null` (no flags allowed) |
| Run from another directory | Match task needs | `-C <DIR>` plus other flags `2>/dev/null` |

## Model roles (resolve via config/model-registry.md)

The codex skill resolves registry roles at invocation time — these role names are the stable surface; the model IDs below are fallback snapshots that drift. Treat the IDs as hints, not as the contract.

| Role | Current ID (may be stale) | Best for | Context window |
| --- | --- | --- | --- |
| `codex-flagship` ⭐⭐ | `gpt-5.4` | Software engineering, code review, agentic coding | 400K / 128K |
| `codex-fast` | `gpt-5.4-mini` | Cost-efficient coding | 400K / 128K |
| `codex-previous` | `gpt-5.3-codex` | Previous flagship — fallback if flagship unavailable | 400K / 128K |

Run `/update-models` if the current IDs feel stale or a newer frontier model has shipped.

**Reasoning Effort Levels**:
- `xhigh` - Maximum quality (code review, security analysis, architecture review)
- `high` - Complex tasks (refactoring, architecture, security analysis, performance optimization)
- `medium` - Standard tasks (refactoring, code organization, feature additions, bug fixes)
- `low` - Simple tasks (quick fixes, simple changes, code formatting, documentation)

## Code Review Mode

For automated code reviews with maximum quality, pair the flagship role (resolved from `~/.codex/config.toml`) with `xhigh` reasoning:

### Review Command Pattern
```bash
codex exec --skip-git-repo-check \
  -c model_reasoning_effort="xhigh" \
  --sandbox read-only \
  --full-auto \
  "[review prompt with diff]" 2>/dev/null
```

Model selection is deliberately omitted — Codex reads the active model from `~/.codex/config.toml`, which `/update-models` keeps synced with the `codex-flagship` registry role. Pinning `-m` here would silently bypass that path and refreeze the reference against a specific ID.

### Review Output Format
Structure findings with priority levels:
- **P0** - Critical: Security vulnerabilities, data loss, crashes
- **P1** - High: Logic errors, significant bugs, performance issues
- **P2** - Medium: Code quality, maintainability concerns
- **P3** - Low: Style, minor improvements, suggestions

Each finding should include:
- Title (max 80 chars)
- File path and line range
- Confidence score (0-1)
- Detailed explanation

End with overall verdict: "patch is correct" or "patch is incorrect" with justification.
