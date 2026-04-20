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

## Plugin-level references (`references/`)

| File | Lines | Used By |
|------|------:|---------|
| `prd-template.md` | 431 | `commands/plan.md` |
| `blindspot-review-protocol.md` | 144 | `commands/plan.md` |
| `documentarian-constraints.md` | 20 | 3 documentarian agents + `commands/research.md`, `commands/plan.md` |
| `production-failure-patterns.md` | 60 | `commands/review.md` |

## Skill-level references (`skills/<name>/references/`)

| File | Lines | Used By |
|------|------:|---------|
| `skills/codex/references/codex-cli-reference.md` | 61 | `skills/codex/SKILL.md` |
| `skills/gemini/references/gemini-cli-reference.md` | 137 | `skills/gemini/SKILL.md` |
| `skills/test/references/test-patterns.md` | 441 | `skills/test/SKILL.md`, `agents/test-writer.md` |
| `skills/tdd/references/mocking.md` | 107 | `skills/tdd/SKILL.md`, `commands/implement.md`, `agents/test-writer.md` |
| `skills/tdd/references/test-quality.md` | 171 | `skills/tdd/SKILL.md`, `commands/implement.md` |
| `skills/tdd/references/interface-design.md` | 134 | `skills/tdd/SKILL.md`, `commands/implement.md` |
| `skills/tdd/references/refactoring.md` | 77 | `skills/tdd/SKILL.md` |
| `skills/judgment-eval/references/scenario-patterns.md` | 402 | `skills/judgment-eval/SKILL.md` |
| `skills/system-prompt-clinic/references/transformation-patterns.md` | 281 | `skills/system-prompt-clinic/SKILL.md` |
| `skills/constitution-compliance-review/references/scoring-rubric.md` | 557 | `skills/constitution-compliance-review/SKILL.md` |
| `skills/constitution-compliance-review/references/baseline-scores.md` | 74 | `skills/constitution-compliance-review/SKILL.md` |
| `skills/x-search/references/x-api.md` | 112 | `skills/x-search/SKILL.md` |

## Skill-level formats (`skills/<name>/*-FORMAT.md`)

Two `domain-model` contracts live at the skill root (not in a `references/` subdir) because they are authored-output templates, not loaded references — editors of a CONTEXT.md or ADR file read them directly as the document shape, not as prose the skill compresses.

| File | Lines | Used By |
|------|------:|---------|
| `skills/domain-model/CONTEXT-FORMAT.md` | 77 | `skills/domain-model/SKILL.md` |
| `skills/domain-model/ADR-FORMAT.md` | 47 | `skills/domain-model/SKILL.md` |

## Adding a new reference

1. Extract the content from the SKILL.md / command / agent that carries it.
2. Decide: `references/` subdir for content the skill *loads via Glob+Read*, skill-root for content that is an *authored-output template*.
3. Add the table row here with accurate line count (`wc -l`) and every consumer — the table is the index OPUS §13 points new skill authors to when they ask "what reference contracts exist in this plugin?"
4. In the consuming skill/agent/command, use the portable Glob pointer (§13) so the reference resolves from any installed version.

## Maintaining the index

Line counts drift whenever a reference file is edited — style migrations (adding why-inline) and content additions both shift the numbers, but the index doesn't self-update. When touching a referenced file, re-run `wc -l` and update this table in the same change. A ≥10% drift between table and file means the index lies to the next reader about how expensive the reference is to load.
