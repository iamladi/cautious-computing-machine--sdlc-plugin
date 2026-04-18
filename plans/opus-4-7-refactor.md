# Opus 4.7 Refactor — sdlc-plugin

## Context

Anthropic shipped Claude Opus 4.7 (`claude-opus-4-7`, 1M-token variant available). Prompts in this repo were tuned for 4.5/4.6 and earlier. 4.7 behaves differently enough that old scaffolding actively hurts output quality. The repo already started migrating — `#57` rewrote the interview skill for 4.7 and `#51` rewrote the review command with research citations and targeted failure probes. This plan continues that trajectory across the rest of sdlc-plugin.

**Why now:** 4.7 is more literal, less implicit-generalizing, trends toward fewer tool calls, and has breaking API changes (sampling params, prefill, `budget_tokens` all removed). Defensive scaffolding that "just worked" on 4.6 now produces over-triggering, suppressed findings, or outright degraded reasoning.

**Intended outcome:** (a) a workspace-level principles doc so future prompts start on-spec, (b) full rewrites of the highest-friction sdlc-plugin commands, (c) surgical passes on borderline cases. Scope stays in `sdlc-plugin/` per user decision.

---

## Opus 4.7 deltas that matter for prompt design

Sourced from platform.claude.com docs, the Jan-2026 Claude Constitution, and Anthropic's 4.7 migration guide (see `OPUS_4_7_PROMPTING.md` for URLs).

| Area | 4.6 behavior | 4.7 behavior | Prompt implication |
|---|---|---|---|
| Literalness | Generalizes instruction to similar items | Applies only to stated scope | State scope explicitly ("all items", "every section") |
| Tool calls | Eager, especially with "always use X" | Trends to fewer, more internal reasoning | Remove "aggressive anti-laziness"; raise effort + explicit parallel-tool guidance where needed |
| Sampling | `temperature`, `top_p`, `top_k` supported | All return 400 | Shape via prompt, not knobs |
| Thinking | `budget_tokens` | Adaptive only, controlled by `effort` | Remove "think step by step" compensation phrases; raise effort instead |
| Prefill | Assistant-message prefill allowed | Returns 400 | Replace with system-prompt instruction: "respond directly, no preamble" |
| Tokenizer | Baseline | ~1x–1.35x more tokens per unit text | Re-check any hardcoded token budgets |
| Rule style | Tolerates MUST/NEVER walls | Brittle under threat-phrased rules | Explain *why*, not bark commands |
| Code review | Filters per "report only high-sev" | Will suppress findings aggressively | Decouple find-stage from filter-stage |

## Refactor principles (content for `OPUS_4_7_PROMPTING.md`)

The deliverable principles doc will capture these as the canonical "how we write prompts for 4.7 in this workspace" reference.

1. **Onboarding-doc structure over rule-lists.** Open with role + why this role exists + what success looks like, then reasoning examples, then edge cases. Model after `sdlc-plugin/skills/interview/SKILL.md` (85 lines) and `sdlc-plugin/agents/implementer.md` (84 lines).
2. **Explain *why* inline with any constraint.** "Never mock the DB in integration tests — mocked tests passed in Q3 while the prod migration broke" beats "NEVER MOCK THE DB."
3. **State scope explicitly.** 4.7 will not generalize "apply formatting" across all sections unless told.
4. **Drop compensation phrases.** Remove "think step by step", "take your time", "be thorough" — these compensated for pre-4.x reasoning gaps and now just add noise. Raise `effort` where depth is needed.
5. **Don't weaponize caps.** Replace `CRITICAL:`, `MUST`, `NEVER` with reasoned prose unless quoting an error or protocol ID. Keep caps for genuine destructive-op warnings.
6. **Remove defensive step-numbering where the model can plan.** "Step 1 do X, Step 2 do Y, Step 3…" invites overtriggering. Keep step-numbered protocols only where sequence correctness is load-bearing (e.g. team-cleanup ordering).
7. **Separate find from filter in review/audit prompts.** Per the 4.7 code-review guidance — have the prompt collect findings with confidence + severity, and do the filtering in a downstream pass.
8. **Cite evidence when recommending a pattern.** `commands/review.md` is the template — "13% vs 100% bug catch rates" anchors the protocol in data, not vibes.
9. **Trust tool output; don't replicate tool logic.** `skills/de-slop` delegates to `desloppify` cleanly. Mirror this for `codex`, `gemini`, `update-models`.
10. **Parallel tool calls: be explicit when needed.** 4.7 defaults conservatively. Add a one-liner where fan-out matters.
11. **Anti-sycophancy / no preamble.** Put "respond directly, no preamble" in the system prompt now that prefill is gone.
12. **XML tags for mixed-content prompts.** `<instructions>`, `<context>`, `<examples>`, `<constraints>` reduce misread on long commands like `implement.md`.

## sdlc-plugin file triage

Rankings combine line count, `MUST/NEVER/ALWAYS/CRITICAL` density, step-number rigidity, and whether the file is on the hot path (commands/agents used every session).

### Tier 1 — Full rewrite (reasoning-based, modeled on interview.md / review.md)

| File | Lines | Why it qualifies |
|---|---|---|
| `commands/research-deep.md` | 283 | 5 CRITICAL/MUST tokens; rigid Step 1–7 per mode; swarm/standard branching logic the model can own; exhaustive cleanup guards |
| `commands/implement.md` | 292 | 3 CRITICAL/MUST; dual-mode scaffolding; prescriptive TDD injection sequence; subagent-dispatch logic spelled out line-by-line |
| `commands/research.md` | 197 | Rigid routing (`--no-swarm`) at top; "YOUR ONLY JOB" all-caps; overlap with research-deep |
| `commands/plan.md` | 151 | Phased planning scaffolding the model should orchestrate from goals |
| `skills/judgment-eval/SKILL.md` | 202 | High-value skill, worth modernizing to 4.7 evaluation style (find-then-filter) |
| `skills/system-prompt-clinic/SKILL.md` | 188 | Already a reasoning-based skill but predates 4.7 patterns — align with principles doc |

### Tier 2 — Surgical pass (keep structure, strip anti-patterns)

| File | Lines | Move |
|---|---|---|
| `commands/verify.md` | 31 | Audit for caps/MUST, align wording |
| `commands/submit.md` | 26 | Same |
| `skills/tdd/SKILL.md` | 133 | Align TDD framing with 4.7 effort model; keep mode semantics |
| `skills/codex/SKILL.md` + references | 51+56 | Ensure registry delegation is explicit; strip compensation phrases |
| `skills/gemini/SKILL.md` + references | 52+132 | 2 CRITICAL tokens — review |
| `skills/x-search/SKILL.md` + refs | 78+112 | Light touch |
| `skills/agent-change-walkthrough/SKILL.md` | 52 | Light touch |
| `skills/update-models/SKILL.md` | 22 | Light touch |
| `skills/finish-branch/SKILL.md` | 48 | Light touch |
| `skills/test/SKILL.md` + references | 86+441 | Big reference file; audit for 4.7 alignment without rewriting test-patterns.md from scratch |
| `skills/constitution-compliance-review/*` | 129+557+74 | Already constitution-aligned; audit scoring rubric wording |
| `agents/*` (9 files, 34–86 lines each) | — | Most already lean. Verify against principles. `spec-reviewer.md` and `code-quality-reviewer.md` are worth extra attention since they drive the review pipeline. |

### Tier 3 — Reference / leave alone

| File | Why |
|---|---|
| `skills/interview/SKILL.md` | Already Opus 4.7 template (#57) |
| `commands/review.md` | Already Opus 4.7 template (#51) |
| `agents/implementer.md` | Already onboarding-doc style |

## Per-file refactor notes — Tier 1

### `commands/research-deep.md`
- Collapse "Step 1–7" into a goal block + cleanup invariant. The model can own the sequence if we state the invariant: "Team must be deleted before returning control, regardless of success/failure."
- Replace `SWARM_MODE=true/false` imperative branching with: "If `--swarm` passed, use agent teams; otherwise work directly. On team failure, fall back to direct work."
- Strip `CRITICAL:`, `DO NOT`, `MUST` — restate as reasoned guidance.
- Delete per-step "mandatory" reminders; keep the cleanup invariant as a single prominent line.

### `commands/implement.md`
- Replace "Subagent Workflow step 1–N" with a role statement ("You orchestrate; implementers execute"), then success criteria, then a worked example of one task loop.
- TDD injection: move from "read mocking.md, inject boundary-only rule" to "pass the TDD reference docs to the implementer; they're trusted to apply them." Trust the agent.
- Fold `Standard Workflow` / `Swarm Workflow` into one flow with a branching paragraph.

### `commands/research.md`
- Same routing cleanup as research-deep.
- Remove "YOUR ONLY JOB IS TO DOCUMENT" caps-lock wall — replace with a short "scope" paragraph explaining why documentarian mode exists (prevents unsolicited refactors during research).

### `commands/plan.md`
- Audit phase scaffolding. Likely can compress similarly.

### `skills/judgment-eval/SKILL.md`
- Apply find-then-filter separation to scenario evaluation.
- Align with 4.7 effort model: scenarios benefit from `high` effort, call that out explicitly.

### `skills/system-prompt-clinic/SKILL.md`
- Already reasoning-based. Ensure its transformation patterns reference the new `OPUS_4_7_PROMPTING.md` principles so outputs produced by the clinic land on-spec.

## Deliverables

1. **`OPUS_4_7_PROMPTING.md`** — new file at workspace root `/Users/iamladi/Projects/claude-code-plugins/OPUS_4_7_PROMPTING.md`. Contains the principles section above plus sourced URLs, plus two worked before/after examples (one command, one skill). Canonical reference going forward.
2. **Tier 1 rewrites** — 6 files rewritten in-place in `sdlc-plugin/commands/` and `sdlc-plugin/skills/*/SKILL.md`.
3. **Tier 2 surgical passes** — batch edits across the remaining files to strip anti-patterns without restructuring.

Commits grouped per file (or per coherent pair). Conventional commits, `refactor:` prefix.

## Verification

- **Principles doc**: run `skills/constitution-compliance-review` against it once drafted; target score ≥ baseline for the `prompt-as-onboarding` skill.
- **Each Tier 1 rewrite**: run `skills/judgment-eval` with 3 scenarios covering happy path + two edge cases; compare against current version.
- **Behavioral spot-check**: for `research-deep.md` and `implement.md`, do one dry run each against a small real task and observe tool-call density + output quality vs. current version.
- **CI / validation**: `bun run validate` from workspace root to confirm plugin manifest still parses.
- **Git hygiene**: `git log --oneline` per commit; confirm commits are scoped per file/pair, not omnibus.

## Critical files to modify

- `/Users/iamladi/Projects/claude-code-plugins/OPUS_4_7_PROMPTING.md` (new)
- `/Users/iamladi/Projects/claude-code-plugins/sdlc-plugin/commands/research-deep.md`
- `/Users/iamladi/Projects/claude-code-plugins/sdlc-plugin/commands/implement.md`
- `/Users/iamladi/Projects/claude-code-plugins/sdlc-plugin/commands/research.md`
- `/Users/iamladi/Projects/claude-code-plugins/sdlc-plugin/commands/plan.md`
- `/Users/iamladi/Projects/claude-code-plugins/sdlc-plugin/skills/judgment-eval/SKILL.md`
- `/Users/iamladi/Projects/claude-code-plugins/sdlc-plugin/skills/system-prompt-clinic/SKILL.md`

## Reference files to reuse as templates

- `/Users/iamladi/Projects/claude-code-plugins/sdlc-plugin/skills/interview/SKILL.md` — onboarding-doc structure, `<thinking>` example
- `/Users/iamladi/Projects/claude-code-plugins/sdlc-plugin/commands/review.md` — evidence-backed protocol, find-then-filter split
- `/Users/iamladi/Projects/claude-code-plugins/sdlc-plugin/agents/implementer.md` — lean role + success criteria
- `/Users/iamladi/Projects/claude-code-plugins/primitives-plugin/skills/prompt-as-onboarding/SKILL.md` — canonical onboarding-doc skill
- `/Users/iamladi/Projects/claude-code-plugins/primitives-plugin/skills/de-slop/SKILL.md` — tool-delegation pattern

## Out of scope (flagged for later)

- Refactor of sibling plugins (`github`, `workflows`, `primitives`, `ts`, `misc`) — deferred per user.
- Workspace-level `CLAUDE.md` updates — may need a pointer to `OPUS_4_7_PROMPTING.md` but not a rewrite.
- Global user `~/.claude/CLAUDE.md` — out of scope.
