# Prompting for Claude Opus 4.7

This is the workspace reference for writing prompts (commands, agents, skills) that get the best out of Claude Opus 4.7. It exists because prompts tuned for 4.5/4.6 and earlier often *actively hurt* output quality on 4.7 — not by a little, but enough to suppress findings, over-trigger tools, or flatten reasoning. If you're writing or editing any prompt file in this workspace, read this first.

Canonical reference files — when in doubt, model after these:
- `sdlc-plugin/skills/interview/SKILL.md` — onboarding-doc structure, `<thinking>` example
- `sdlc-plugin/commands/review.md` — evidence-backed protocol, find-then-filter split (§7)
- `sdlc-plugin/agents/implementer.md` — multi-surface worker: scope-boundaries, family-boundary framing, rigid-output contract (§13)
- `sdlc-plugin/agents/spec-reviewer.md` + `sdlc-plugin/agents/code-quality-reviewer.md` — sibling reviewers citing each other's scope so scope-leaks are self-diagnosable
- `primitives-plugin/skills/prompt-as-onboarding/SKILL.md` — canonical onboarding-doc skill
- `primitives-plugin/skills/de-slop/SKILL.md` — tool-delegation pattern (§9)

## Why this document exists

Opus 4.7 is not Opus 4.6 with more horsepower. Three shifts matter for prompt design:

1. **It reasons more, and earlier.** It trends toward fewer tool calls and more internal deliberation. Scaffolding that nudged earlier models to "think harder" now creates noise or inconsistent behavior.
2. **It's more literal.** It does not silently generalize an instruction from the first item to the rest of a list, and it does not infer requests you didn't make. Implicit generalization that worked on 4.6 now leaves work undone.
3. **API surface changed.** `temperature`, `top_p`, `top_k`, `budget_tokens`, and assistant-message prefill all return 400. Behavior shaping moves fully into the prompt. Effort (not `budget_tokens`) is the intelligence dial.

What follows are the principles those shifts imply, with the reasoning so you can judge edge cases we haven't seen yet.

## Principles

### 1. Write prompts as onboarding documents, not rule lists.

Open with role → why this role exists → what success looks like. Then reasoning examples. Then edge cases. Rule-lists ("you MUST do X; you MUST NEVER do Y") generalize worse than reasoned prose because 4.7 follows the spirit of a principle, and spirit needs a reason attached.

**Why:** The Claude Constitution (Anthropic, Jan 2026, CC0) and the 4.7 prompting docs both show broad, reasoned principles outperform command lists. Threat-framed or caps-locked rules correlate with brittle behavior under edge cases that the rule didn't anticipate.

### 2. Explain *why* inline with every constraint.

Compare:
- ❌ "Never mock the database in integration tests."
- ✅ "Don't mock the database in integration tests — last quarter mocked tests passed while the prod migration broke, which is exactly the class of bug integration tests exist to catch."

**How to apply:** If removing the *why* would leave the reader unable to judge an edge case, the *why* needs to be there.

### 3. State scope explicitly.

4.7 will not generalize "apply this formatting" to every section unless you say so. If you want a rule applied to a list, say "for every item" or "across all sections." If you want the model to fan out, say "for each." Assume nothing carries implicitly.

**Family-boundary framing.** When an agent has siblings that share a controller, state scope by *naming what each sibling owns*, not just what the current agent does. Rule-list form can express "don't do X" but can't express "don't do X because sibling Y owns it"; the sibling citation converts a directive into a decidable judgment and makes scope-creep failures self-diagnosable by the agent at runtime. See `agents/spec-reviewer.md` and `agents/implementer.md` for the pattern.

Six family topologies appear in this workspace, each with a characteristic boundary:

- **Documentarian trio** (locator/analyzer/pattern-finder dispatched by `/research`) — peer siblings split by question-type (where / how / prior-art).
- **Reviewer pair** (spec-reviewer + code-quality-reviewer dispatched by `/implement`) — peer siblings split by check-class (spec-match / code-sanity).
- **Implement triad** (implementer + spec-reviewer + code-quality-reviewer) — worker + peer reviewers; worker cites reviewer check-classes to pre-empt misses one loop cycle earlier.
- **Skill-agent pair** (`test` skill + `test-writer` agent sharing `test-patterns.md`) — same reference contract, different invocation paths.
- **Cross-platform research** (web-search-researcher + `x-search` skill) — boundary runs between data-source domains.
- **Merge gate** (`research-synthesizer` consuming N collectors) — fan-in shape; boundary runs between gather and merge concerns, and the merge-gate owns thematic consolidation while collectors own gather/refine.

**Symmetry obligation.** Family-boundary framing imposes a symmetry requirement: if one sibling cites the other's scope, the other must mirror the citation back. Asymmetric framing (A names B's scope but B doesn't name A's) leaves cross-routing decisions unreasoned on the silent side — the agent without the mirror can't judge "should I hand this off to sibling X?" because from its vantage point sibling X has no named boundary. This surfaces most often when migrating one side of a pair first and treating the second side as done by association; it isn't, because the sibling citation only works in the direction it's written. When migrating family members, migrate the set — or if staged, record the mirror obligation as a follow-up so the asymmetry doesn't calcify.

### 4. Drop compensation phrases.

Remove "think step by step", "take your time", "be thorough", "carefully consider." These compensated for pre-4.x reasoning gaps that `effort` now closes at the API level. Leaving them in adds noise and token waste.

**If you need deeper reasoning:** raise `effort` to `high` or `xhigh` and say so in the prompt ("Run at `high` thinking effort — long-horizon branching reasoning justifies the budget"). Don't chant.

### 5. Don't weaponize capitals.

`CRITICAL:`, `MUST`, `NEVER`, `IMPORTANT` used as rule-emphasis are noise. 4.7 treats reasoned prose with the same weight as caps-walls — and caps-walls with threatening tone ("or users will be harmed") actively degrade generalization.

**Keep caps for:**
- Genuinely destructive operations the user needs to see before approving (real warnings).
- Quoting error messages verbatim.
- Protocol names / IDs that happen to be capitalized.

### 6. Remove defensive step-numbering where the model can plan.

"Step 1 do X. Step 2 do Y. Step 3 do Z." invites over-triggering — the model follows the literal sequence even when a step doesn't apply. State the goal and the invariants; let the model pick the path.

**Keep step-numbering only where sequence correctness is load-bearing** — e.g., team-cleanup ordering where skipping a step leaks resources. In that case, explain the invariant too ("the team must be deleted before returning control, regardless of success/failure — skipping leaks slots"). See §13 for the related contract-preservation exception for rigid output formats and reference files.

### 7. Separate find from filter in review and audit prompts.

4.7 follows "report only high-severity issues" faithfully and will suppress findings you'd have wanted. Split the pipeline:

```
Find stage: report every issue with confidence and severity attached.
Filter stage: downstream pass drops low-confidence or low-severity findings.
```

This is why `sdlc-plugin/commands/review.md` reports everything in its divergent-reviews phase, then cross-examines in a separate phase.

### 8. Cite evidence when recommending a pattern.

"Do X because a study across 3,700 trials on 5 frontier models found a 13% → 100% bug-catch delta when Y was applied" beats "do X because it's good practice." 4.7 grounds its own behavior better when the prompt is grounded too. See `sdlc-plugin/commands/review.md` for the template.

### 9. Trust tool output; don't replicate tool logic.

If you delegate to `desloppify`, `codex`, `gemini`, `update-models` — trust what they return. Don't include prose that second-guesses their output or re-implements their logic "just in case." The `de-slop` skill is the reference: it delegates cleanly and falls back only when the tool is unavailable.

### 10. Parallel tool calls: be explicit when needed.

4.7 defaults to fewer, more sequential tool calls. For tasks where fan-out matters (reading many files, spawning independent subagents), include a one-liner:

```
If you intend to call multiple tools and there are no dependencies between them, make all independent calls in parallel.
```

Don't include this by default — it's only earning its keep where fan-out is the whole point.

### 11. Anti-preamble in system prompt.

Prefill is gone (returns 400 on 4.7). Replace any reliance on prefill with a system-prompt line:

```
Respond directly without preamble. Don't start with "Here is…", "Based on…", "Sure,…", or similar.
```

This is also why "no sycophantic openers" lives in HAL's global CLAUDE.md — it's the successor to prefill.

### 12. Use XML tags for mixed-content prompts.

For long commands that mix instructions, context, examples, and constraints (`implement.md`, `research-deep.md`, `review.md`), XML tags reduce misread:

```xml
<role>…</role>
<success-criteria>…</success-criteria>
<examples>
  <example>…</example>
</examples>
<invariants>…</invariants>
```

Short prompts don't need this — prose sections are fine. Reach for tags when the same file contains more than three distinct instruction types.

### 13. Pin downstream contracts.

Anti-templating (§6) and anti-rule-list (§1) pressure is about removing *decorative* scaffolding, not *load-bearing* shapes. Two exceptions recur often enough to name, because both superficially look like the anti-patterns above and tend to get trimmed during migrations.

**Rigid output formats are contracts when something parses them.** If a specific output shape is consumed downstream — by a tool, a paired skill, or a reviewer who needs a predictable field to scan — the template is load-bearing. Preserve it, and name the consumer inline so future editors don't trim it on the grounds that it "looks prescriptive."

Examples from this workspace:
- `skills/agent-change-walkthrough/` — `CHANGED` / `UNCHANGED` markers and `file:line` shape consumed by a reviewer diffing against the repo.
- `skills/tdd/` — the horizontal-slicing diagram encodes a load-bearing invariant; phrasing it as prose loses the visual-invariant.
- `skills/judgment-eval/` — scenario-report layout is a contract with `system-prompt-clinic`.
- `skills/system-prompt-clinic/` — closing handoff line is a contract with `constitution-compliance-review`.
- `skills/constitution-compliance-review/` — dimension-rubric labels are consumed by `system-prompt-clinic` and graders.

**Reference files are contracts when a skill delegates to them.** When a SKILL.md points at `references/*.md` (or a sibling `FORMAT.md`) and says "model after this — don't paraphrase", the reference is the source of truth. Paraphrasing it back into SKILL.md prose is how outdated styles leak back in during migrations — the why is that the reference file typically carries nuance (examples, anti-examples, edge cases) that compresses poorly into a single paragraph.

Examples:
- `skills/test/references/test-patterns.md`
- `skills/system-prompt-clinic/references/transformation-patterns.md`
- `skills/constitution-compliance-review/references/{scoring-rubric.md,baseline-scores.md}`
- `skills/domain-model/{CONTEXT-FORMAT.md,ADR-FORMAT.md}`

**Reference pointers must use the portable Glob form, not absolute dev paths.** Plugins install to a versioned cache (`~/.claude/plugins/cache/<plugin>/sdlc/<VERSION>/`) where the version segment changes each install, so any hard-coded `/Users/<dev>/Projects/...` path resolves only on the author's laptop. Downstream consumers then load an empty result and silently fabricate around the missing contract — indistinguishable from paraphrase drift, but worse because the reference file still exists on disk. Use this exact shape:

```
Glob(pattern: "**/sdlc/**/references/<filename>.md", path: "~/.claude/plugins") → Read result
```

The `**/sdlc/**/` prefix survives the version segment; `~/.claude/plugins` resolves on any machine. See `references/README.md` for the full convention and the files currently under contract.

**How to apply:** when editing a prompt, ask of every rigid shape and every reference pointer "what consumes this?" If the answer names a downstream parser, skill, or reader — that's a contract; preserve it and label the consumer. If nothing depends on the shape, it's decorative scaffolding — trim it per §6. For reference pointers specifically, also verify the path is portable before committing — an absolute dev path is the same class of contract violation as paraphrasing the reference, just harder to spot in review.

### 14. Name the fabrication failure the agent's output invites.

§13 pins the *shape* of downstream handoffs; this principle pins the *content*. When an agent's output lands in a controller or synthesis layer that cannot re-verify every claim, plausible-but-wrong output is indistinguishable from correct output — so the agent must know which fabrication pattern its role structurally invites and be told to resist that specific pattern. Rule-list form cannot express this ("don't fabricate" is too broad to operationalize); reasoned prose names the failure mode, which lets the agent catch itself at the moment of temptation.

Three fabrication classes recur across agent migrations, each tied to an agent's surface:

- **Reverse-AHA** (test-writer). When writing tests against real source, the temptation is to invent edge-cases the source can't actually produce, padding coverage with fictional inputs. The downstream reader can't distinguish a real edge-case from a fabricated one without re-reading the source themselves. Frame: "if the source can't produce it, the test is fiction."
- **Citation discipline** (web-search-researcher). When searching, empty or thin results tempt the agent to backfill from training memory and present it as researched. The synthesis layer then attributes a fabricated claim to a real search surface. Frame: "a finding without a citation is indistinguishable from fabrication once it lands in synthesis."
- **False consensus** (research-synthesizer). When merging N collector reports, genuine disagreement tempts the merger to paraphrase both sides into a consensus that neither actually held. The downstream reader loses dissent signal and treats the false consensus as settled. Frame: "preserve the disagreement verbatim; naming who disagreed is the finding."

**How to apply:** for every agent whose output is consumed without independent verification, ask "what would plausibly-wrong output look like here?" Name that pattern inline with the framing the agent needs to self-diagnose — not a bare prohibition. New fabrication classes should be added to this taxonomy as they surface, since the set is open-ended across agent surfaces (a planning agent invites phantom-requirement fabrication, a refactor agent invites ghost-callsite fabrication, etc.).

## Breaking changes to scrub from older prompts

If you're migrating a pre-4.7 prompt, check for these:

| Pattern | What to do |
|---|---|
| `temperature`, `top_p`, `top_k` in any SDK call | Remove — returns 400 on 4.7. |
| `budget_tokens` in thinking config | Remove — use `effort` parameter instead. |
| Assistant-message prefill | Remove — returns 400. Replace with system-prompt "respond directly" line. |
| "think step by step", "take your time" | Remove. Raise `effort` if depth is needed. |
| Hardcoded model IDs (`claude-opus-4-5-20250929`, etc.) | Replace with registry-resolved aliases (`opus`, `sonnet`, `haiku`). |
| Hardcoded `max_tokens` budgets | Re-check — 4.7 tokenizer produces ~1x–1.35x more tokens per unit text. |
| "CRITICAL: ALWAYS use tool X" | Rewrite as "Use tool X when [condition]; skip when [condition]." |
| Post-every-N-calls "summarize progress" scaffolding | Remove — 4.7 already narrates progress in agentic traces. |

## Before / after examples

### Example A — command (research routing)

Before (rule-heavy, 4.6-style):

```markdown
## CRITICAL: Route Selection

BEFORE taking any other action, check `$ARGUMENTS` for the `--no-swarm` flag:

1. If `--no-swarm` IS present: remove it from the arguments (the remaining text
   is the research topic), then skip directly to **Standard Workflow**. Do NOT
   execute any Swarm Workflow steps.
2. If `--no-swarm` is NOT present: the full `$ARGUMENTS` is the research topic,
   skip directly to **Swarm Workflow**. Do NOT execute any Standard Workflow steps.

If no research topic remains after processing, ask the user for a research
question before proceeding.
```

After (reasoning-based, 4.7-native):

```markdown
## Routing

Swarm is the default — research usually benefits from teammates sharing discoveries in real time. If the user passes `--no-swarm`, strip the flag and run the standard solo workflow instead. If the remaining topic is empty, ask for a research question rather than guessing.
```

Shorter, less forceful, same semantics. The model owns the branching.

### Example B — skill (review stage split)

Before (single-stage, will suppress findings on 4.7):

```markdown
Review the PR. Report only high-severity issues that definitely need to be fixed.
Filter out anything minor.
```

After (find / filter split):

```markdown
## Find stage

Report every issue you notice, including low-confidence ones. For each finding:
- severity: blocker | major | minor | nit
- confidence: high | medium | low
- one-line reasoning

Don't filter at this stage — coverage matters here, precision comes next.

## Filter stage

From the findings list, surface to the user:
- All blockers (any confidence)
- Majors with confidence ≥ medium
- Nits grouped together, one line each
```

Separating stages stops 4.7 from silently dropping findings it thought were "not important enough."

## Source URLs

Anthropic primary sources:
- [What's new in Claude Opus 4.7](https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7)
- [Migration guide (4.6 → 4.7 and 4.5 → 4.7)](https://platform.claude.com/docs/en/about-claude/models/migration-guide)
- [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Adaptive thinking](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking)
- [Extended thinking tips](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/extended-thinking-tips)
- [Effort parameter](https://platform.claude.com/docs/en/build-with-claude/effort)
- [Task budgets (beta)](https://platform.claude.com/docs/en/build-with-claude/task-budgets)
- [Introducing Claude Opus 4.7](https://www.anthropic.com/news/claude-opus-4-7)
- [Claude's Constitution (Jan 2026, CC0)](https://www.anthropic.com/news/claudes-constitution)

## How this document is used

- Anyone writing or editing a prompt in this workspace — read this first.
- The `system-prompt-clinic` skill references these principles when transforming rule-based prompts.
- The `constitution-compliance-review` skill scores prompts against a superset of these principles.
- When in doubt: read `sdlc-plugin/skills/interview/SKILL.md` and `sdlc-plugin/commands/review.md` and model the style.

Prompts age. If you find a principle here that's been superseded by later guidance from Anthropic, update this file — it's the canonical reference, so the canonical reference is the one that gets fixed.
