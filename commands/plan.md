# Create Implementation Plan

## Role

Produce a comprehensive PRD in `plans/*.md` that resolves the given task. The plan is thorough enough to fix the root cause and prevent regressions, while staying surgical — only the minimal changes necessary to address the task.

## Priorities

Completeness (root cause addressed) > Minimality (surgical changes) > Clarity (readable plan)

## Session setup

`/rename "Plan: $ARGUMENTS"` — or infer a feature name from context and use that.

## Workflow

The flow is six checkpoints. Each exists because skipping it reliably produces worse plans: scope challenge stops duplicate work, interview surfaces ambiguity before it becomes rework, codebase research prevents designs that ignore what already exists, domain-model alignment keeps language and architecture consistent with documented decisions, multi-LLM review catches blind spots one model misses, finalization creates the paper trail that lets implementation start.

### 1. Scope challenge

Before interviewing or researching, answer from codebase context:
1. What does existing code already handle that overlaps with this request?
2. What is the minimum file/class footprint to satisfy the goal?
3. Flag if estimated scope exceeds 8 files or 2 new abstractions (smell, not a block — but document it).

Based on findings, pick:
- **Scope reduction** — existing code already solves this, or the ask can be reframed to a smaller change. Stop and present a reduced proposal to the user before proceeding.
- **Proceed** — scope is justified. Continue to the interview.

Document the scope decision (what exists, what's new, why the chosen path) in the Notes & Context section of the plan.

### 2. Interview

Find and read the interview protocol:
- `Glob(pattern: "**/sdlc/**/skills/interview/SKILL.md", path: "~/.claude/plugins")`

Run it in context-only mode (no file updates, no Interview Insights section). Focus on architecture approaches, scope boundaries, technology choices, user intent, priority tradeoffs. Topic is the user's task from `$ARGUMENTS`.

Upfront interviews are much cheaper than replanning after implementation starts.

### 3. Research

Read `README.md` to understand architecture patterns and conventions, then explore relevant codebase files to map existing abstractions and integration points. Plans grounded in actual code state avoid mismatched implementations.

Spawn `web-search-researcher` as a parallel subagent to gather best practices, alternatives, and current documentation. Give it up to 3 minutes — the Solution Design and Alternatives Considered sections should be authored with its findings available. If it fails or returns nothing, proceed with codebase-only findings.

After exploration, produce a **"What Already Exists"** summary before authoring the Solution Design:
- List existing abstractions, utilities, or patterns that partially or fully address the task.
- For each: REUSE, EXTEND, or REPLACE, with a one-line justification.

This prevents designing solutions that duplicate or conflict with existing code.

### 3.5. Domain-model interview

Find and read the domain-model protocol:
- `Glob(pattern: "**/sdlc/**/skills/domain-model/SKILL.md", path: "~/.claude/plugins")`

Run it with the user's task plus the "What Already Exists" summary from step 3 as context. The skill grills the plan's language against the target repo's `CONTEXT.md` (creating one lazily if absent), surfaces conflicts between the plan's vocabulary and documented terms, and offers ADRs when architectural decisions meet the 3-criteria bar (hard to reverse, surprising without context, real trade-off).

Behaviour:
- Writes to `CONTEXT.md` and `docs/adr/NNNN-slug.md` inline as terms resolve and ADRs are confirmed. Files are **staged, not committed** — step 6 batches them into the plan commit.
- **Blocking:** if any term in the plan contradicts `CONTEXT.md`, the skill does not return control until the conflict is resolved (term redefined with rationale, plan restated in canonical vocabulary, or ambiguity recorded under "Flagged ambiguities" with a deferral note).
- Returns a summary of resolved terms, conflicts closed, ADRs created, and any deferred ambiguities. Step 4 reads this summary into the plan's Notes & Context section before drafting.

Language drift is cheap to catch here, expensive to reverse after implementation.

### 4. Draft plan

Load the PRD template:
- `Glob(pattern: "**/sdlc/**/references/prd-template.md", path: "~/.claude/plugins")`

Fill every section — incomplete plans force implementers to ask mid-task, which breaks flow. Save to `plans/<descriptive-name>.md`.

Template sections (abbreviated):
- Frontmatter — title, type, issue, status, reviewed, reviewers, created
- Metadata, Overview, User Stories
- Requirements (functional, non-functional, technical)
- Scope (in / out / future)
- Impact Analysis (affected areas, users, dependencies, breaking changes)
- Steps to Reproduce + Root Cause Analysis (for bugs)
- Solution Design (approach, alternatives, data/API/UI changes)
- Implementation Plan — Phase 1–5, each with `Complexity: <1-10> | Priority: <High|Medium|Low>`
- Relevant Files, Testing Strategy
- Risk Assessment, Rollback Strategy, Validation Commands, Acceptance Criteria
- Dependencies, Notes & Context
- Blindspot Review (filled in step 5)

Keep phases at ≤5 tasks each; split anything with complexity >5 into sub-tasks. Agent context windows don't reliably hold large tasks without dropping requirements.

For each new codepath in the Implementation Plan, add one sentence to Risk Assessment: `[Codepath] — fails when [condition]; manifests as [symptom]; fallback: [recovery]`.

Keep implementation simple — no decorators, no speculative abstractions. New library needs go in Notes & Context so humans can weigh security, maintenance, licensing, and bundle impact before approving.

### 5. Blindspot review

Load the blindspot protocol:
- `Glob(pattern: "**/sdlc/**/references/blindspot-review-protocol.md", path: "~/.claude/plugins")`

Run Codex and Gemini plan critics in parallel per the protocol. They catch different things — Codex tends to flag API misuse, Gemini tends to flag architectural inconsistencies. Consolidate their feedback (deduplicate, flag consensus issues, sort by severity), then refine the plan by addressing, deferring, or dismissing each concern with justification. Document the review in the plan's Blindspot Review section.

### 6. Finalization

Update frontmatter: `reviewed: true`, `reviewers: ["codex", "gemini"]`, `status: Ready for Implementation`. Commit on branch `plan/feature-name` for audit trail — include the plan file plus any `CONTEXT.md` and `docs/adr/NNNN-*.md` files staged by step 3.5 so the language/architecture decisions ship with the plan. Then `/github:create-issue-from-plan plans/<name>.md` to make the work trackable.

Append deferred items from the plan's "Out of Scope / Future Considerations" to `TODOS.md` in the project root (create if absent). Each entry:
```
## <item-title>
Why: <why it matters>
Context: <what to know when revisiting>
Dependencies: <what must exist first>
```

## Task

$ARGUMENTS

## Report

- Work done, concise bullets.
- Absolute path to the plan in `plans/*.md`.
