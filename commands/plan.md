# Create Implementation Plan

## Session Naming

Before starting, rename this session for clarity:
- If `$ARGUMENTS` provided: `/rename "Plan: $ARGUMENTS"`
- Otherwise infer from context: `/rename "Plan: {feature-name}"`

## Priorities

Completeness (root cause addressed) > Minimality (surgical changes) > Clarity (readable plan)

## Goal

Create a comprehensive PRD in `plans/*.md` that resolves the given task. The plan must be thorough enough to fix the root cause and prevent regressions, while containing only the minimal changes necessary to address the task.

## Constraints

- Research codebase first (start with README.md, then relevant files)
- Detect genuine ambiguities before planning - use `AskUserQuestion` for decisions that affect implementation
- Fill every section of the PRD template - replace all `<placeholder>` tags with specific values
- Split phases with complexity >5 into sub-tasks (max 5 tasks per phase)
- No decorators - keep implementation simple
- Report new library needs in the Notes section
- After draft: run multi-LLM blindspot review (Codex + Gemini in parallel)
- After review: update frontmatter (`reviewed: true`, add `reviewers`, update `status`)
- Commit plan to new branch, then create GitHub Issue via `/github:create-issue-from-plan`

## Plan Format

Find and read the PRD template using Glob:
- Pattern: `**/sdlc/**/references/prd-template.md`
- Search path: `~/.claude/plugins`

Fill every section completely. Save to `plans/<descriptive-name>.md`.

The template includes:
- Frontmatter with metadata (title, type, issue, status, reviewed, reviewers, created)
- ## Metadata (type, priority, severity, complexity, status)
- ## Overview (problem statement, goals, success metrics)
- ## User Stories
- ## Requirements (functional, non-functional, technical)
- ## Scope (in scope, out of scope, future considerations)
- ## Impact Analysis (affected areas, users, system impact, dependencies, breaking changes)
- ## Steps to Reproduce (for bugs)
- ## Root Cause Analysis (for bugs)
- ## Solution Design (approach, alternatives, data/API/UI changes)
- ## Implementation Plan (Phase 1-5 with **Complexity**: <1-10> | **Priority**: <High|Medium|Low>)
- ## Relevant Files (existing, new, test files)
- ## Testing Strategy (unit, integration, E2E, manual)
- ## Risk Assessment (technical/business risks, mitigation)
- ## Rollback Strategy (steps, conditions)
- ## Validation Commands (bash commands to verify success)
- ## Acceptance Criteria
- ## Dependencies (new/updated packages)
- ## Notes & Context (additional context, assumptions, constraints, related tasks, references, open questions)
- ## Blindspot Review (reviewers, date, addressed/deferred/dismissed concerns)

## Multi-LLM Blindspot Review

Find and read the blindspot review protocol:
- Pattern: `**/sdlc/**/references/blindspot-review-protocol.md`
- Search path: `~/.claude/plugins`

This protocol defines:
- How to run Codex and Gemini plan critics in parallel
- Review consolidation process (deduplicate, flag consensus, sort by severity)
- Plan refinement rules (when to address/defer/dismiss concerns)
- How to document review findings in the plan

## References

Load these files before proceeding (use Glob with path `~/.claude/plugins`):
- `**/sdlc/**/references/prd-template.md` - Full PRD template with all sections
- `**/sdlc/**/references/blindspot-review-protocol.md` - Multi-LLM review protocol

## Workflow

1. **Ambiguity Detection**: Analyze task for genuine ambiguities (architecture approaches, scope boundaries, technology choices, user intent, priority tradeoffs). If found, use `AskUserQuestion` with 1-4 focused questions before planning. If clear, proceed.

2. **Research**: Read README.md, then explore relevant codebase files to understand context.

3. **Draft Plan**: Load PRD template, fill all sections, save to `plans/<name>.md`.

4. **Blindspot Review**: Load protocol, run Codex + Gemini critics in parallel, consolidate feedback, refine plan.

5. **Finalize**: Update frontmatter (reviewed: true, reviewers: ["codex", "gemini"], status: Ready for Implementation), commit to branch `plan/feature-name`, run `/github:create-issue-from-plan plans/<name>.md`.

## Task

$ARGUMENTS

## Report

- Summarize work done in concise bullet points
- Include absolute path to the plan created in `plans/*.md`
