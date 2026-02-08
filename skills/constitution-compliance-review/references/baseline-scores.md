# Baseline Alignment Scores

Date: 2026-02-07
Scored by: HAL (calibrated against system-prompt-design.md=9.0, commit.md=2.4)

## Calibration Results

| File | Expected | Actual | Status |
|------|----------|--------|--------|
| system-prompt-design.md (reference) | 9/10 | 9.0/10 | ✓ Pass |
| commit.md (known low) | 2/10 | 2.4/10 | ✓ Pass |

## Baseline Scores (Pre-Rewrite)

| File | Constraint | Workflow | Format | Trust | Edge Cases | Overall | Classification |
|------|-----------|----------|--------|-------|------------|---------|---------------|
| primitives-plugin/commands/commit.md | 2 | 2 | 3 | 2 | 3 | **2.4** | Rule-Heavy |
| sdlc-plugin/commands/review.md | 5 | 3 | 3 | 4 | 3 | **3.6** | Mostly Rules |
| primitives-plugin/skills/agent-ready-repo-setup/SKILL.md | 2 | 4 | 3 | 3 | 2 | **2.8** | Rule-Heavy |
| sdlc-plugin/commands/research.md | 3 | 3 | 5 | 4 | 5 | **4.0** | Mostly Rules |
| sdlc-plugin/commands/plan.md | 5 | 5 | 6 | 6 | 7 | **5.8** | Hybrid |
| sdlc-plugin/skills/tdd/SKILL.md | 5 | 6 | 6 | 6 | 5 | **5.6** | Hybrid |
| sdlc-plugin/agents/implementer.md | 7 | 7 | 6 | 7 | 6 | **6.6** | Hybrid |

## Scoring Notes

### commit.md (2.4/10)
- Steps 1-4 are verbatim bash scripts with no reasoning
- "Never git add ." — bare rule, no explanation why
- Batching rules are bullet lists without justification
- Report template is rigid fill-in-the-blank format
- Zero trust in model judgment for commit message crafting

### review.md (3.6/10)
- P0-P3 levels are judgment-criteria-style (good, score 5 on constraints)
- But workflow is procedural: "Spawn both agents simultaneously"
- Finding format rigidly prescribed: `### [TITLE] (P{0-3}, confidence: {0.0-1.0})`
- No trust in model to decide report structure
- No guidance for edge cases (what if reviewers deeply disagree?)

### agent-ready-repo-setup/SKILL.md (2.8/10)
- Entirely a constraint list with prescribed tools (Pino, Husky, JUnit XML)
- No reasoning for why any specific tool/config choice
- No guidance for adapting to different project types
- Priorities declared (good) but immediately followed by prescriptive list

### research.md (4.0/10)
- Priorities declared with reasoning (good)
- But swarm workflow is an 8-step state machine with rigid teammate instructions
- Teammate prompts are prescriptive scripts ("Send a message: RESEARCH COMPLETE")
- Output format section is reasonably flexible
- Standard workflow has better judgment latitude than swarm workflow

### plan.md (5.8/10)
- Good ambiguity detection step (reasoning-aligned)
- Blindspot review concept is reasoning-aligned
- But "Fill every section" is rigid instruction
- Workflow is still step-by-step (1-5)
- Constraints mix reasoning and bare rules

### tdd/SKILL.md (5.6/10)
- Mode system is well-structured with clear justification
- Priorities declared with reasoning
- But modes described as state machine (strict/soft/off) rather than principles
- Test discovery patterns are an enumerated list
- Red-Green-Refactor example is outcome-driven (good)

### implementer.md (6.6/10)
- Priorities clearly stated
- Goal is outcome-driven
- TDD awareness integrates well
- But self-review is a rigid checklist without reasoning
- Commit format is prescribed (could explain why conventional format matters)
- "Implement ONLY what the task requires" is rule-based (could explain why scope discipline matters)
