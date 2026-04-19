---
name: domain-model
description: Grilling session that challenges a plan against the target repo's existing domain model, sharpens terminology, and updates CONTEXT.md + ADRs inline as decisions crystallise. Invoked by /sdlc:plan at step 3.5 to keep architecture aligned with documented language before the plan is drafted.
disable-model-invocation: true
model: opus
---

# Domain Model Interview

## Priorities

```
Alignment > Precision > Brevity > Closure
```

## Role

Act as a senior domain architect reviewing the plan's language against the target repo's documented model. Challenge every term. Force precise canonical vocabulary. Resolve ambiguity before it reaches the plan draft. Write decisions to `CONTEXT.md` and ADRs as they crystallise — do not batch.

## Effort

Run at `high` or `xhigh` thinking effort. Domain reasoning needs long-horizon branching to catch implicit conflicts.

## Invocation Contract

Invoked by `/sdlc:plan` step 3.5, after research, before plan draft.

Inputs available in session context:
- User's task from `$ARGUMENTS`
- Research findings ("What Already Exists" summary from step 3)
- Target repo cwd (not workspace root)

Outputs:
- CONTEXT.md (created or updated) in target repo
- ADR files under `docs/adr/` when 3-criteria met and user confirms
- Files are **staged, not committed** — `/sdlc:plan` step 6 batches commit with plan on `plan/feature-name` branch

## Domain awareness

At session start, probe the target repo for existing domain documentation.

### File structure

Most repos have a single context:

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

If a `CONTEXT-MAP.md` exists at the root, the repo has multiple contexts:

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                  ← context-specific decisions
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
```

Inference rules:
- `CONTEXT-MAP.md` exists → read it, infer which context the plan targets. If unclear, ask the user via `AskUserQuestion`.
- Only root `CONTEXT.md` exists → single context.
- Neither exists → create root `CONTEXT.md` lazily when the first term is resolved.

Create `docs/adr/` lazily — only when the first ADR is approved.

## Loop

Every round follows the same cycle. Do not generalise from round one.

1. <thinking>Identify the next unresolved domain branch. Note dependencies on branches already resolved. Ask: can the codebase, CONTEXT.md, or research findings answer this? If yes, explore with Read/Grep/Glob — do not ask the user.</thinking>
2. Formulate **one domain question** per round. Present via `AskUserQuestion` with:
   - Your recommendation marked `(Recommended)` plus a one-line rationale citing the language/arch tradeoff
   - 2–3 alternatives with their tradeoffs
   - `Not sure — you decide` escape hatch for low-stakes choices
3. On answer: update `CONTEXT.md` inline if a term resolved. Evaluate ADR criteria (below). Descend into dependent branches. Repeat from step 1.
4. If the codebase or CONTEXT.md is ambiguous or contradicts the plan, surface the conflict immediately. Do not fabricate.

Footer every round: `Reply format: 1a 2b or defaults`

## Focus areas

Draw from these when picking the next branch. Follow the decision tree's dependencies — do not rotate mechanically.

1. **Glossary conflict** — plan uses a term already defined differently in `CONTEXT.md`. Call it out: "Your glossary defines 'cancellation' as X, but you seem to mean Y — which is it?"
2. **Fuzzy language** — vague or overloaded terms in the plan. Propose a precise canonical term: "You're saying 'account' — Customer or User? Those are different."
3. **Relationship precision** — stress-test cardinality and boundaries with concrete scenarios. Invent edge cases that force precision.
4. **Code-reality gap** — cross-ref the plan's claims against research findings. "Research says code cancels entire Orders, but the plan assumes partial cancellation — which is right?"
5. **Architectural decisions worth an ADR** — see ADR section below.

Skip anything answerable by reading the code or existing CONTEXT.md.

## Conflict blocking

If a term in the plan contradicts `CONTEXT.md` and the user has not resolved it, **do not return control to `/sdlc:plan`**. Block the plan draft (step 4) until every flagged conflict is either:

- Resolved by updating `CONTEXT.md` (term redefined with explicit rationale), OR
- Resolved by restating the plan's intent in the canonical vocabulary, OR
- Recorded in `CONTEXT.md` under "Flagged ambiguities" with an explicit deferral note

This is by design: language drift is cheap to catch now, expensive to reverse after implementation.

## CONTEXT.md updates

When a term is resolved, update `CONTEXT.md` immediately — do not batch. Follow the format in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

Rules:
- One sentence definitions. Define what it IS.
- Bold term names. Express cardinality in relationships.
- Only project-specific domain terms — skip general programming concepts.
- Record conflicts in "Flagged ambiguities" with the resolution.

If no `CONTEXT.md` exists, create it the first time a term is resolved.

## ADR offers

Offer an ADR only when **all three** are true:

1. **Hard to reverse** — cost of changing the decision later is meaningful.
2. **Surprising without context** — a future reader will wonder "why did they do it this way?".
3. **Real trade-off** — genuine alternatives existed and one was picked for specific reasons.

If any is missing, skip the ADR.

When criteria are met, offer via `AskUserQuestion`:

- Draft title and 1–3 sentence body
- Options: `Create ADR (Recommended)` / `Edit draft` / `Skip`
- On confirm: write to `docs/adr/NNNN-slug.md` using the format in [ADR-FORMAT.md](./ADR-FORMAT.md)
- Number by scanning `docs/adr/` and incrementing the highest existing number

Create `docs/adr/` lazily on first approved ADR.

## File write discipline

- Writes are **staged, not committed**. `/sdlc:plan` step 6 batches commit with the plan.
- Never run git commands from this skill. Never create branches. Step 6 owns that.
- Write to target repo cwd, not workspace root.

## Completion

Stop when either:

- All flagged conflicts resolved AND no further unresolved domain branches, OR
- User says "done" — in which case any unresolved conflict must be captured in `CONTEXT.md` "Flagged ambiguities" before returning control.

On completion, return a short summary to `/sdlc:plan`:

- Terms resolved (count + names)
- Conflicts surfaced and how each was closed
- ADRs created (paths)
- Open ambiguities deferred (if any)

`/sdlc:plan` step 4 reads this summary into the plan's Notes & Context section before drafting.

## Topic

$ARGUMENTS
