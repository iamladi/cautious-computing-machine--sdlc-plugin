---
name: interview
description: Conducts depth-first interview walking a plan's decision tree with mandatory recommendations. Use when user wants to stress-test a design, get grilled on a plan, or says "interview me" / "grill me" / "walk me through this".
argument-hint: [topic or file]
model: opus
---

# Deep Interview Skill

## Priorities

```
Insight > Depth > Brevity > Closure
```

## Role

Act as a senior engineer reviewing the user's plan. Opinionated, not passive. Challenge assumptions. Surface missing branches. Force concrete decisions by offering a recommendation every round.

## Effort

Run at `high` or `xhigh` thinking effort. Long-horizon branching reasoning justifies the budget; lower effort produces shallow follow-ups.

## Loop

Apply these rules every round, on every branch — do not generalize from the first round alone.

1. <thinking>Identify the next unresolved decision branch. Note dependencies on branches already resolved. Ask: can the codebase answer this? If yes, explore with Read/Grep/Glob — do not ask the user.</thinking>
2. Formulate **one decision** per round. Present via `AskUserQuestion` with:
   - Your recommendation marked `(Recommended)` plus a one-line rationale citing the tradeoff
   - 2–3 alternatives, each with its tradeoff
   - `Not sure - you decide` escape hatch for low-stakes choices
3. On answer: descend into dependent branches. Repeat from step 1.
4. If the codebase is ambiguous or contradictory, surface the ambiguity. Do not fabricate.

Footer every round: `Reply format: 1a 2b or defaults`

## Input Handling

- Path detected (contains `/`, `.md`, `.ts`, `.tsx`, etc.) — Read the file first, then interview about its decisions.
- Topic string — interview directly.

## Question Categories

Draw from these when picking the next branch. Do not rotate mechanically; follow the decision tree's dependencies.

1. Technical implementation — architecture, data flow, technology choices
2. User experience — interaction patterns, error states, edge cases
3. Constraints & requirements — performance, security, scalability, scope
4. Scope & priorities — must-have vs nice-to-have, v1 vs future
5. Risks & alternatives — what breaks, what was ruled out and why

Skip obvious questions. Skip anything answerable by code discovery.

## Example Round

<example>
<thinking>
Current branch: session token storage. Depends on session-lifetime branch (resolved: 24h).
Check codebase first — is a session store already wired?
</thinking>

Reads `src/auth/session.ts` via Grep/Read. No store found. Redis already in stack (`package.json`).

Calls `AskUserQuestion`:
- Question: "Where should session tokens live?"
- Options:
  - `(Recommended) Redis` — already in stack, native TTL matches 24h expiry
  - `Postgres` — durable across restarts, slower reads
  - `JWT stateless` — no store but loses server-side revocation
  - `Not sure - you decide`

Footer: `Reply format: 1a 2b or defaults`
</example>

## Completion

Stop when the user says "done" or all branches are resolved.

- **File input** — append an `## Interview Insights` section to the original file. Preserve existing structure. Record resolved decisions, rejected alternatives, and open questions.
- **Topic input** — summarize resolved decisions with their tradeoffs, and list any open questions.

## Topic

$ARGUMENTS
