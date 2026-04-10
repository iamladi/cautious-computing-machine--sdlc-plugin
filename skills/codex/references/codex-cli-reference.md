<!-- Codex CLI Reference - Extracted from skills/codex/SKILL.md -->
<!-- Used by: /codex skill -->
<!-- NOTE: Model IDs in examples may be outdated. Check config/model-registry.md for current assignments. -->

## Quick Reference

| Use case | Sandbox mode | Key flags |
| --- | --- | --- |
| Read-only review or analysis | `read-only` | `--sandbox read-only 2>/dev/null` |
| Apply local edits | `workspace-write` | `--sandbox workspace-write --full-auto 2>/dev/null` |
| Permit network or broad access | `danger-full-access` | `--sandbox danger-full-access --full-auto 2>/dev/null` |
| Resume recent session | Inherited from original | `echo "prompt" \| codex exec --skip-git-repo-check resume --last 2>/dev/null` (no flags allowed) |
| Run from another directory | Match task needs | `-C <DIR>` plus other flags `2>/dev/null` |

## Model Options (fallback reference — check model-registry.md)

| Model | Best for | Context window | Key features |
| --- | --- | --- | --- |
| `gpt-5.4` ⭐⭐ | **Flagship model**: Software engineering, code review, agentic coding | 400K input / 128K output | Latest frontier model |
| `gpt-5.4-mini` | Cost-efficient coding | 400K input / 128K output | Smaller frontier model |
| `gpt-5.3-codex` | Previous flagship | 400K input / 128K output | 25% faster than 5.1, $1.75/$14.00 |

**Reasoning Effort Levels**:
- `xhigh` - Maximum quality (code review, security analysis, architecture review)
- `high` - Complex tasks (refactoring, architecture, security analysis, performance optimization)
- `medium` - Standard tasks (refactoring, code organization, feature additions, bug fixes)
- `low` - Simple tasks (quick fixes, simple changes, code formatting, documentation)

## Code Review Mode

For automated code reviews with maximum quality, use the flagship model with `xhigh` reasoning:

### Review Command Pattern
```bash
codex exec --skip-git-repo-check \
  -m gpt-5.4 \
  -c model_reasoning_effort="xhigh" \
  --sandbox read-only \
  --full-auto \
  "[review prompt with diff]" 2>/dev/null
```

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
