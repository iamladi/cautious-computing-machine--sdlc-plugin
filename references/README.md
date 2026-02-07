# References Directory

Extracted reference files loaded on-demand by prompts to reduce per-invocation token cost.

## Path Resolution

Plugin files are installed to a versioned cache path:
```
~/.claude/plugins/cache/cautious-computing-machine/sdlc/<VERSION>/
```

Since the version segment changes on each install, prompts use Glob-based discovery:

```
Glob(pattern: "**/sdlc/**/references/<filename>.md", path: "~/.claude/plugins")
```

This returns the absolute path regardless of installed version. The model then uses Read on the result.

**Cost**: 2 tool calls per reference file (Glob + Read).
**Benefit**: Avoids loading 100-400+ lines of template/reference content into every invocation.

## Files

| File | Extracted From | Lines | Used By |
|------|---------------|-------|---------|
| `prd-template.md` | `commands/plan.md` | ~430 | plan.md |
| `blindspot-review-protocol.md` | `commands/plan.md` | ~80 | plan.md |
| `documentarian-constraints.md` | 5 agent files + 2 commands | ~15 | 7 files |

Skill-level references are in `skills/<name>/references/`:

| File | Extracted From | Lines | Used By |
|------|---------------|-------|---------|
| `skills/test/references/test-patterns.md` | `skills/test/SKILL.md` | ~350 | test/SKILL.md, test-writer.md |
| `skills/gemini/references/gemini-cli-reference.md` | `skills/gemini/SKILL.md` | ~120 | gemini/SKILL.md |
| `skills/codex/references/codex-cli-reference.md` | `skills/codex/SKILL.md` | ~60 | codex/SKILL.md |
