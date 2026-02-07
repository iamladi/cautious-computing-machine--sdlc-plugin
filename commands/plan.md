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

**Research codebase first (start with README.md, then relevant files)**
Plans based on assumptions rather than actual code state lead to mismatched implementations. Reading the README establishes architecture patterns and conventions. Reading relevant files reveals existing abstractions, naming patterns, and integration points that the plan must align with.

**Detect genuine ambiguities before planning**
Early ambiguity detection is cheaper than replanning after implementation starts. Use `AskUserQuestion` for decisions that affect implementation (architecture approaches, scope boundaries, technology choices, user intent, priority tradeoffs). Clarifying upfront prevents wasted implementation cycles.

**Fill every section of the PRD template completely**
Incomplete plans cause implementation ambiguity and require mid-task clarifications that break flow. Each template section prevents a specific class of error: missing Impact Analysis causes unexpected breakage, missing Root Cause Analysis fixes symptoms instead of causes, missing Rollback Strategy creates deployment risk. Replace all `<placeholder>` tags with specific values.

**Split phases with complexity >5 into sub-tasks (max 5 tasks per phase)**
Agent context windows can't reliably hold large tasks without dropping requirements or losing track of dependencies. Splitting high-complexity phases into sub-tasks keeps each implementation unit small enough to fit in working memory, preventing silent omissions.

**No decorators - keep implementation simple**
Decorators add abstraction complexity that conflicts with the "Minimality" priority. They make debugging harder (stack traces are less direct), increase cognitive load for future maintainers, and often hide side effects. Explicit code aligns better with surgical changes.

**Report new library needs in the Notes section**
New dependencies need human approval for security audits, maintenance burden assessment, licensing compatibility checks, and bundle size impact review. Documenting these in Notes ensures they get evaluated before implementation rather than discovered during code review.

**Run multi-LLM blindspot review after draft**
Different models have different blind spots - Codex catches API misuse, Gemini catches architectural inconsistencies. Running both in parallel provides broader coverage than single-model review. Load the blindspot review protocol for consolidation and refinement rules.

**Update frontmatter after review, then commit and create issue**
Marking `reviewed: true` signals the plan is ready for implementation. Committing to a feature branch creates an audit trail. Creating a GitHub Issue via `/github:create-issue-from-plan` makes the work trackable and prevents plans from being forgotten in the repository.

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

**Ambiguity Detection Checkpoint**
Analyze the task for genuine ambiguities (architecture approaches, scope boundaries, technology choices, user intent, priority tradeoffs). Detecting these early is cheaper than replanning mid-implementation - clarifying upfront prevents wasted cycles. If ambiguities exist, use `AskUserQuestion` with 1-4 focused questions. Only proceed to research once the task is unambiguous.

**Research Checkpoint**
Read README.md to understand architecture patterns and conventions, then explore relevant codebase files to map existing abstractions and integration points. Plans grounded in actual code state avoid mismatched implementations. This checkpoint ensures the plan aligns with what exists rather than what you assume exists.

**Draft Plan Checkpoint**
Load the PRD template and fill every section completely. Each section prevents a specific failure mode: incomplete Impact Analysis causes unexpected breakage, missing Root Cause Analysis fixes symptoms instead of causes, missing Testing Strategy creates untestable code. Save to `plans/<name>.md`. The template structure ensures completeness by making gaps visible.

**Blindspot Review Checkpoint**
Load the blindspot review protocol, then run Codex and Gemini critics in parallel. Different models catch different issues - Codex finds API misuse, Gemini finds architectural inconsistencies. Consolidate their feedback (deduplicate, flag consensus issues, sort by severity), then refine the plan by addressing, deferring, or dismissing each concern with justification. Multi-LLM review catches blind spots that single-model review misses.

**Finalization Checkpoint**
Update frontmatter to mark `reviewed: true`, add `reviewers: ["codex", "gemini"]`, and set `status: Ready for Implementation`. This signals the plan passed review and is implementation-ready. Commit to branch `plan/feature-name` to create an audit trail, then run `/github:create-issue-from-plan plans/<name>.md` to make the work trackable. Plans without tracking get forgotten; GitHub Issues ensure visibility and accountability.

## Task

$ARGUMENTS

## Report

- Summarize work done in concise bullet points
- Include absolute path to the plan created in `plans/*.md`
