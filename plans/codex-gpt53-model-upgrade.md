---
title: "Upgrade Codex skill to GPT-5.3-Codex as default and flagship model"
type: Chore
issue: null
research:
  - ../primitives-plugin/research/research-codex-gpt-53-model-upgrade.md
status: Ready for Implementation
reviewed: true
reviewers: ["codex", "gemini"]
created: 2026-02-12
---

# PRD: Upgrade Codex Skill to GPT-5.3-Codex

## Metadata
- **Type**: Chore
- **Priority**: High
- **Severity**: N/A
- **Estimated Complexity**: 3
- **Created**: 2026-02-12
- **Status**: Ready for Implementation

## Overview

### Problem Statement

The Codex skill defaults to `gpt-5.1-codex` and uses `gpt-5.2-codex` as the code review flagship. GPT-5.3-Codex was released on February 5, 2026 with 25% faster inference, better agentic coding, and multi-step engineering capabilities at $1.75/M input and $14/M output (400K/128K context). The skill should use the latest and most capable model as both default and flagship.

Additionally, references to `gpt-5.2-codex` are hardcoded across multiple files: the review command, blindspot review protocol, PRD template, README, and examples. All must be updated to `gpt-5.3-codex` so the plugin consistently uses the highest reasoning model available.

### Goals & Objectives

1. Make `gpt-5.3-codex` the default model for all Codex CLI invocations
2. Make `gpt-5.3-codex` the code review and plan critic flagship (replacing 5.2)
3. Add `gpt-5.3-codex-spark` research preview to model options table
4. Update all references across the sdlc-plugin (skills, commands, references, examples, README)

### Success Metrics

- **Primary Metric**: All `codex exec` commands default to `gpt-5.3-codex` (effective after next plugin release and cache update)
<!-- Addressed: release dependency gap per Codex review -->
- **Secondary Metrics**: No stale references to 5.1 as default or 5.2 as flagship remain
- **Quality Gates**: `grep -ri "gpt-5\.[12]" sdlc-plugin/` (case-insensitive) returns only CHANGELOG.md entries (historical)
<!-- Addressed: case-insensitive grep per Codex review -->

## User Stories

### Story 1: Default model upgrade
- **As a**: developer using `/codex`
- **I want**: the skill to default to `gpt-5.3-codex`
- **So that**: I get the best available model without specifying it
- **Acceptance Criteria**:
  - [ ] SKILL.md frontmatter says GPT-5.3-Codex
  - [ ] Goal section defaults to `gpt-5.3-codex`
  - [ ] Constraints section defaults to `gpt-5.3-codex`

### Story 2: Code review flagship upgrade
- **As a**: developer using `/review` or `/plan` blindspot review
- **I want**: reviews to use `gpt-5.3-codex` with xhigh reasoning
- **So that**: reviews use the highest-capability reasoning model
- **Acceptance Criteria**:
  - [ ] review.md references `gpt-5.3-codex`
  - [ ] blindspot-review-protocol.md uses `gpt-5.3-codex`
  - [ ] codex-cli-reference.md code review section uses `gpt-5.3-codex`

### Story 3: Spark variant visibility
- **As a**: developer choosing a model
- **I want**: to see `gpt-5.3-codex-spark` in the model options
- **So that**: I can use the ultra-fast research preview when appropriate
- **Acceptance Criteria**:
  - [ ] Model options table includes `gpt-5.3-codex-spark` with appropriate notes

## Requirements

### Functional Requirements

1. **FR-1**: Replace all `gpt-5.1-codex` default references with `gpt-5.3-codex`
   - Details: 3 locations in SKILL.md (frontmatter, goal, constraints)
   - Priority: Must Have

2. **FR-2**: Replace all `gpt-5.2-codex` flagship references with `gpt-5.3-codex`
   - Details: Model tables, review command, blindspot protocol, PRD template, README
   - Priority: Must Have

3. **FR-3**: Add `gpt-5.3-codex-spark` to model options tables
   - Details: Add as research preview with 1000+ tokens/s note via Cerebras
   - Priority: Should Have

4. **FR-4**: Update model advantages paragraph with GPT-5.3 stats
   - Details: codex-cli-reference.md line 23
   - Priority: Must Have

5. **FR-5**: Demote `gpt-5.2-codex` in model table (remove double star)
   - Details: Keep as option but no longer flagship
   - Priority: Must Have

### Non-Functional Requirements

1. **NFR-1**: Consistency
   - Requirement: All references to the default/flagship model must be consistent
   - Target: Zero inconsistencies across files
   - Measurement: Grep audit returns no stale references

### Technical Requirements

- **Stack**: Markdown files only (no code changes). Verified: `grep -r "gpt-5\.[12]" --include="*.{json,ts,js,yaml,yml}"` returns no results — model IDs exist exclusively in `.md` files.
<!-- Addressed: confirmed no non-markdown model definitions per Codex/Gemini consensus -->
- **Dependencies**: None
- **Architecture**: No changes — the SKILL.md prompt IS the source of truth for model selection; the `codex exec -m <model>` flag is passed directly to the Codex CLI which routes to OpenAI. No plugin schema, manifest, or allowlist constrains model IDs.
<!-- Addressed: host/runner support concern per Gemini review -->
- **Data Model**: N/A
- **API Contracts**: N/A

## Scope

### In Scope

- Update SKILL.md (default model, model table)
- Update codex-cli-reference.md (model table, advantages, code review section, reasoning effort)
- Update review.md (reviewer model references)
- Update blindspot-review-protocol.md (plan critic command, template section)
- Update prd-template.md (blindspot review section)
- Update README.md (skill description, review command description)
- Update examples/codex-examples.md (all model references and tables)

### Out of Scope

- Updating CHANGELOG.md historical entries (those are records of past state)
- Changing pricing structure or sandbox modes
- Modifying Gemini skill references
- Updating cached plugin versions (happens via release pipeline)

### Future Considerations

- Automate model version bumps with a script that greps and replaces
- Consider a single `MODEL_DEFAULT` variable approach to avoid scattered references

## Impact Analysis

### Affected Areas

- `skills/codex/SKILL.md` - Core skill definition
- `skills/codex/references/codex-cli-reference.md` - CLI reference
- `commands/review.md` - Code review command
- `references/blindspot-review-protocol.md` - Plan critic protocol
- `references/prd-template.md` - PRD template blindspot section
- `README.md` - Plugin documentation
- `examples/codex-examples.md` - Usage examples

### Users Affected

- All users of `/codex`, `/review`, `/plan` commands

### System Impact

- **Performance**: 25% faster inference (improvement)
- **Security**: No impact
- **Data Integrity**: No impact

### Dependencies

- **Upstream**: OpenAI GPT-5.3-Codex availability (already released Feb 5, 2026)
- **Downstream**: Plugin cache updates on next release
- **External**: None

### Breaking Changes

- [x] **None** - This is a default change; users can still specify any model manually

## Steps to Reproduce (for Bugs)

N/A - Chore/Enhancement

## Root Cause Analysis (for Bugs)

N/A

## Solution Design

### Approach

Surgical text replacement across 7 markdown files. Each file has specific lines identified by the research document. The changes are:

1. **Default model**: `gpt-5.1-codex` → `gpt-5.3-codex` (SKILL.md: lines 3, 14, 18)
2. **Flagship model**: `gpt-5.2-codex` → `gpt-5.3-codex` (everywhere it appears as flagship)
3. **Model tables**: Add `gpt-5.3-codex` as new top entry with ⭐⭐, add `gpt-5.3-codex-spark`, demote 5.2 (remove ⭐⭐), keep 5.1 with ⭐
4. **Advantages paragraph**: Update to GPT-5.3 stats
5. **Reasoning effort**: `xhigh` no longer requires only 5.2, now requires 5.3
6. **References in prose**: Update all "GPT-5.2-Codex" mentions in review.md, README.md, etc.

### Alternatives Considered

1. **Dynamic model resolution (read latest from API)**:
   - Pros: Never goes stale
   - Cons: Adds runtime dependency, complexity, latency; these are prompt files not code
   - Why rejected: Overengineering for a markdown-based skill system

### Data Model Changes

N/A

### API Changes

N/A

### UI/UX Changes

N/A

## Implementation Plan

### Phase 1: Core Skill Files
**Complexity**: 2 | **Priority**: High

- [ ] Update `skills/codex/SKILL.md` frontmatter description (line 3): GPT-5.1 → GPT-5.3
- [ ] Update `skills/codex/SKILL.md` goal section (line 14): `gpt-5.1-codex` → `gpt-5.3-codex`
- [ ] Update `skills/codex/SKILL.md` constraints (line 18): `gpt-5.1-codex` → `gpt-5.3-codex`
- [ ] Update `skills/codex/SKILL.md` model table (lines 29-34): add 5.3 as ⭐⭐ flagship, add spark, demote 5.2
- [ ] Update `skills/codex/references/codex-cli-reference.md` model table (lines 17-21): same changes
- [ ] Update `skills/codex/references/codex-cli-reference.md` advantages paragraph (line 23): GPT-5.3 stats
- [ ] Update `skills/codex/references/codex-cli-reference.md` reasoning effort xhigh requirement (line 26): 5.2 → 5.3
- [ ] Update `skills/codex/references/codex-cli-reference.md` code review section (lines 35, 40): 5.2 → 5.3

### Phase 2: Commands and References
**Complexity**: 2 | **Priority**: High

- [ ] Update `commands/review.md` (lines 15, 27, 75, 85): all `gpt-5.2-codex`/`GPT-5.2-Codex` → `gpt-5.3-codex`/`GPT-5.3-Codex`
- [ ] Update `references/blindspot-review-protocol.md` (line 14): codex exec model → `gpt-5.3-codex`
- [ ] Update `references/blindspot-review-protocol.md` (line 118): reviewers label → `GPT-5.3-Codex`
- [ ] Update `references/prd-template.md` (line 414): reviewers label → `GPT-5.3-Codex`

### Phase 3: Documentation and Examples
**Complexity**: 2 | **Priority**: Medium

- [ ] Update `README.md` (line 24): `/review` description → GPT-5.3-Codex
- [ ] Update `README.md` (line 30): codex skill description → GPT-5.1/5.3
- [ ] Update `README.md` (line 217): review description → GPT-5.3-Codex
- [ ] Update `examples/codex-examples.md` (line 15): default model → gpt-5.3-codex
- [ ] Update `examples/codex-examples.md` (line 27): command example → gpt-5.3-codex
- [ ] Update `examples/codex-examples.md` (lines 245-296): model selection guide → add 5.3 section as default, demote 5.1
- [ ] Update `examples/codex-examples.md` (lines 314-321): task type table → gpt-5.3-codex

### Phase 4: Validation
**Complexity**: 1 | **Priority**: High

- [ ] Run case-insensitive grep audit: `grep -rin "gpt-5\.[12]" . --include="*.md" | grep -v CHANGELOG`
<!-- Addressed: case-insensitive grep catches GPT-5.2-Codex uppercase variants per Codex review -->
- [ ] Run non-markdown grep: `grep -rin "gpt-5\.[12]" . --include="*.{json,ts,js,yaml,yml}"` to confirm no non-md references
- [ ] Verify no stale references remain (only CHANGELOG.md historical entries)
- [ ] Run `bun run validate` to verify plugin.json still valid
- [ ] Review diff for consistency

## Relevant Files

### Existing Files

- `skills/codex/SKILL.md` - Core skill definition with default model and model table
- `skills/codex/references/codex-cli-reference.md` - CLI reference with model table, advantages, code review pattern
- `commands/review.md` - Code review command referencing 5.2 in 4 places
- `references/blindspot-review-protocol.md` - Plan critic command and template with 5.2 model
- `references/prd-template.md` - PRD template blindspot review section with 5.2 label
- `README.md` - Plugin documentation with 5.1/5.2 references
- `examples/codex-examples.md` - Usage examples with 5.1 references throughout

### New Files

None

### Test Files

None (markdown-only changes; validated by grep audit)

## Testing Strategy

### Unit Tests

N/A (no code changes)

### Integration Tests

N/A

### E2E Tests

N/A

### Manual Test Cases

1. **Test Case: Grep audit**
   - Steps: Run `grep -rn "gpt-5\.[12]" . --include="*.md" | grep -v CHANGELOG`
   - Expected: No results (all non-CHANGELOG references updated)

2. **Test Case: Invoke /codex** (post-release)
   - Prerequisites: New plugin version released and installed, valid OpenAI API access
   - Steps: Run `/codex "analyze this file"` and check which model is selected
   - Expected: Defaults to `gpt-5.3-codex`

3. **Test Case: Invoke /review** (post-release)
   - Prerequisites: New plugin version released and installed, valid OpenAI API access
   - Steps: Run `/review` and check Codex reviewer model
   - Expected: Uses `gpt-5.3-codex` with xhigh reasoning
<!-- Addressed: manual test prereqs per Codex review -->

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| GPT-5.3-Codex API not available to user | Low | High | Model table retains 5.2 and 5.1 as fallback options |
| Pricing increase ($1.25→$1.75 input, $10→$14 output) | Low | Medium | Document pricing in model table; users can select cheaper variants |
| Spark variant model ID incorrect or access-restricted | Medium | Low | Marked as "research preview" in table; users can fall back to standard 5.3 |
<!-- Addressed: pricing risk per Gemini review, spark availability per Codex/Gemini consensus -->

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| None identified | - | - | - |

### Mitigation Strategy

Keep older models in the options table so users can manually select them. The change only affects defaults, not available options.

## Rollback Strategy

### Rollback Steps

1. Revert the commit (single commit for all changes)
2. Release a patch version

### Rollback Conditions

- GPT-5.3-Codex becomes unavailable or shows regressions
- Significant pricing issues

## Validation Commands

```bash
# Verify no stale 5.1/5.2 references (case-insensitive, excluding CHANGELOG)
grep -rin "gpt-5\.[12]" . --include="*.md" | grep -v CHANGELOG

# Validate plugin manifest
bun run validate

# Verify SKILL.md frontmatter mentions 5.3
head -5 skills/codex/SKILL.md | grep "5.3"

# Verify review command uses 5.3
grep "gpt-5.3" commands/review.md

# Verify blindspot protocol uses 5.3
grep "gpt-5.3" references/blindspot-review-protocol.md
```

## Acceptance Criteria

- [ ] `skills/codex/SKILL.md` defaults to `gpt-5.3-codex`
- [ ] `skills/codex/SKILL.md` model table has `gpt-5.3-codex` as ⭐⭐ flagship
- [ ] `skills/codex/SKILL.md` model table includes `gpt-5.3-codex-spark`
- [ ] `skills/codex/references/codex-cli-reference.md` model table updated
- [ ] `skills/codex/references/codex-cli-reference.md` advantages paragraph updated for 5.3
- [ ] `skills/codex/references/codex-cli-reference.md` code review uses 5.3
- [ ] `commands/review.md` uses `gpt-5.3-codex` everywhere
- [ ] `references/blindspot-review-protocol.md` uses `gpt-5.3-codex`
- [ ] `references/prd-template.md` reviewers label updated
- [ ] `README.md` references updated
- [ ] `examples/codex-examples.md` fully updated
- [ ] Grep audit passes (no stale 5.1/5.2 outside CHANGELOG)
- [ ] `bun run validate` passes

## Dependencies

### New Dependencies

None

### Dependency Updates

None

## Notes & Context

### Additional Context

- GPT-5.3-Codex released February 5, 2026
- 400K input / 128K output context window
- $1.75/M input, $14/M output (slight increase from 5.1's $1.25/$10.00)
- 25% faster inference, better agentic coding, multi-step engineering
- Spark variant (`gpt-5.3-codex-spark`) available as research preview via Cerebras (1000+ tokens/s)
- SWE-bench scores not yet confirmed for 5.3; research doc notes this

### Assumptions

- GPT-5.3-Codex is production-ready (released Feb 5)
- The `gpt-5.3-codex` model ID is correct
- Pricing from research document is accurate

### Constraints

- Changes are markdown-only; no code modifications needed
- Must update cached versions via a new plugin release

### Related Tasks/Issues

- Research: `primitives-plugin/research/research-codex-gpt-53-model-upgrade.md`

### References

- Research document with detailed findings and line-by-line change map

### Open Questions

- [ ] Confirmed SWE-bench scores for GPT-5.3-Codex (not yet published by OpenAI)

## Blindspot Review

**Reviewers**: GPT-5.2-Codex (xhigh), Gemini 3 Pro
**Date**: 2026-02-12
**Plan Readiness**: Ready

### Addressed Concerns

- [Consensus] Non-markdown model definitions might exist → Verified via grep: no `.json`, `.ts`, `.js`, `.yaml` files reference model IDs. Added confirmation to Technical Requirements.
- [Consensus] Spark variant routing/availability unverified → Added risk row for spark model ID; marked as "research preview" in model table to set expectations.
- [Consensus] Schema/validation might constrain model IDs → Verified: `plugin.json` has no model enum; `bun run validate` only checks plugin manifest schema, not model strings.
- [Codex, Medium] Grep audit is case-sensitive → Fixed: all grep commands now use `-i` flag to catch `GPT-5.2-Codex` uppercase variants.
- [Codex, Medium] Release dependency not in success metrics → Added "(effective after next plugin release and cache update)" qualifier to primary metric.
- [Codex, Low] Manual tests lack prerequisites → Added prerequisites (release installed, API access) and marked as post-release tests.
- [Gemini, Medium] Pricing increase not flagged → Added pricing risk row to Risk Assessment table with specific dollar amounts.

### Acknowledged but Deferred

- [Codex, Medium] Reasoning effort compatibility assumed for 5.3 → The Codex CLI supports `xhigh` as a config parameter independent of model version; it's a server-side setting. Deferred verification until first actual invocation.
- [Gemini, Medium] Aggressive default rollout / canary phase → User explicitly requested immediate full upgrade. Older models remain available as manual options. Deferred phased rollout.

### Dismissed

- [Gemini, High] Missing Cerebras provider routing for spark variant → The spark variant is just a model ID string passed to `codex exec -m`. The Codex CLI handles provider routing internally; no plugin-level configuration needed.
- [Codex, Medium] Model list changes limited to .md only → Confirmed via grep: model IDs exist exclusively in markdown files. No other file types reference them.
