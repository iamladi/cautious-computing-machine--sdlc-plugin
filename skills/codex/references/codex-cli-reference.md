<!-- Codex CLI Reference - Extracted from skills/codex/SKILL.md -->
<!-- Used by: /codex skill -->

## Quick Reference

| Use case | Sandbox mode | Key flags |
| --- | --- | --- |
| Read-only review or analysis | `read-only` | `--sandbox read-only 2>/dev/null` |
| Apply local edits | `workspace-write` | `--sandbox workspace-write --full-auto 2>/dev/null` |
| Permit network or broad access | `danger-full-access` | `--sandbox danger-full-access --full-auto 2>/dev/null` |
| Resume recent session | Inherited from original | `echo "prompt" \| codex exec --skip-git-repo-check resume --last 2>/dev/null` (no flags allowed) |
| Run from another directory | Match task needs | `-C <DIR>` plus other flags `2>/dev/null` |

## Model Options

| Model | Best for | Context window | Key features |
| --- | --- | --- | --- |
| `gpt-5.2-codex` ⭐⭐ | **Code review flagship**: xhigh reasoning, security analysis, architecture review | 400K input / 128K output | 79% SWE-bench Pro, best for reviews |
| `gpt-5.1-codex` ⭐ | **Flagship model**: Software engineering, agentic coding workflows | 400K input / 128K output | 76.3% SWE-bench, adaptive reasoning, $1.25/$10.00 |
| `gpt-5.1-codex-mini` | Cost-efficient coding (4x more usage allowance) | 400K input / 128K output | Near SOTA performance, $0.25/$2.00 |
| `gpt-5.1-thinking` | Ultra-complex reasoning, deep problem analysis | 400K input / 128K output | Adaptive thinking depth, runs 2x slower on hardest tasks |

**GPT-5.1-Codex Advantages**: 76.3% SWE-bench (vs 72.8% GPT-5), 30% faster on average tasks, better tool handling, reduced hallucinations, improved code quality. Knowledge cutoff: September 30, 2024.

**Reasoning Effort Levels**:
- `xhigh` - Maximum quality (code review, security analysis, architecture review) - requires `gpt-5.2-codex`
- `high` - Complex tasks (refactoring, architecture, security analysis, performance optimization)
- `medium` - Standard tasks (refactoring, code organization, feature additions, bug fixes)
- `low` - Simple tasks (quick fixes, simple changes, code formatting, documentation)

**Cached Input Discount**: 90% off ($0.125/M tokens) for repeated context, cache lasts up to 24 hours.

## Code Review Mode

For automated code reviews with maximum quality, use `gpt-5.2-codex` with `xhigh` reasoning:

### Review Command Pattern
```bash
codex exec --skip-git-repo-check \
  -m gpt-5.2-codex \
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
