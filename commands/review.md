# Adversarial Code Review with Targeted Failure Probing

## Session Naming

Before starting, rename this session:
- If `$ARGUMENTS` provided: `/rename "Review: $ARGUMENTS"`
- Otherwise: `/rename "Review: Current Changes"`

## Priorities

Failure Discovery > Claim Verification > Consensus > Speed

## Goal

Find how code will fail in production. Not "review this code" — that catches 13% of deployment bugs. Instead, ask targeted "what breaks when..." questions that catch 100%.

Two models get **different perspectives** (Codex: failure modes, Gemini: production environment) with mandatory probe checklists and anti-hallucination guards. Findings are cross-examined, not just deduplicated.

## Why This Approach

Research (3,700+ trials, 5 frontier models) shows LLMs behave like expert witnesses: they answer perfectly when asked the right question but never volunteer critical concerns unprompted. The initiative gap scales with distance from code — infrastructure bugs are caught 0-8% in undirected review but 100% when probed directly. Each model also has different blind spots (Opus leads thread safety at 99% but worst on thundering herd at 4%). Divergent perspectives maximize coverage.

---

## Phase 1: Context and Probe Generation

Before spawning reviewers, the orchestrator gathers context and builds targeted probes.

### 1.1 Fetch Diff

**Default scope**: `git diff HEAD` unless `$ARGUMENTS` specifies commit range, files, or PR.

If diff is empty: report "No changes to review" and stop.

### 1.2 Detect System Context

Scan the repository (not just the diff) for deployment and infrastructure signals:

- **Deployment**: Dockerfile, docker-compose.yml, k8s manifests, helm/, serverless.yml, vercel.json, netlify.toml, fly.toml
- **Framework/runtime**: package.json, requirements.txt, go.mod, Cargo.toml, build.gradle
- **Database**: prisma/schema.prisma, drizzle configs, typeorm, sqlalchemy, knex, migration files
- **Queue/cache**: redis configs, rabbitmq, bull, celery
- **CI/CD**: .github/workflows/, Jenkinsfile, .gitlab-ci.yml
- **Scale indicators**: k8s replica counts, load balancer configs, auto-scaling rules

If nothing is detected: "No deployment context found. Reviewing with conservative assumptions — assume multi-instance deployment behind a load balancer."

### 1.3 Load Production Failure Patterns

Load `references/production-failure-patterns.md` via Glob+Read:
```
Glob(pattern: "**/sdlc/**/references/production-failure-patterns.md", path: "~/.claude/plugins")
```

### 1.4 Generate Targeted Probes

Scan the diff content against the pattern library's trigger column. For each match, add the corresponding probe question to the reviewer prompts. Always include Tier 1 (infrastructure) probes for any service-level code.

Build two outputs:
- `SYSTEM_CONTEXT`: formatted block of detected context
- `TARGETED_PROBES`: numbered list of probe questions generated from the diff

---

## Phase 2: Divergent Perspective Reviews

### Model Resolution

Before spawning reviewers, load the model registry:
- `Glob(pattern: "**/sdlc/**/config/model-registry.md", path: "~/.claude/plugins")` → Read result
- Use `codex-flagship` for Codex and `gemini-flagship` for Gemini in the commands below.

Spawn both reviewers **simultaneously in a single message**. Each gets the same diff but a **different perspective, different mandatory probes, and different posture**.

### Codex: Failure Mode Analyst

Use `codex` skill with `codex-flagship` model from registry, reasoning `xhigh`, sandbox `read-only`, full auto mode.

Prompt framing:

```
You are a FAILURE MODE ANALYST. Your job is NOT to review code quality.
Your job is to find how this code will FAIL in production.
Assume every change will eventually encounter its worst-case input.

DEFAULT POSTURE: UNSAFE until proven otherwise.
For each area of the code, you must actively PROVE it handles the failure mode.
If you cannot trace a safety property through the actual code, say so explicitly.
Do NOT say code "looks fine" or "is reasonable" without citing the specific
lines that make it safe.

ANTI-HALLUCINATION RULES:
1. For every finding, QUOTE the exact line(s) of code
2. TRACE the specific execution path that leads to failure
3. State what the code ACTUALLY DOES, not what it appears to do
4. Read the implementation — do not pattern-match from function names
5. If you claim code is safe, cite the exact mechanism (line numbers) that makes it safe

MANDATORY PROBES — answer each for the changed code:
1. CONCURRENCY: What happens when N threads/requests/workers hit this simultaneously?
   Race conditions? Shared mutable state? Lock coverage gaps?
2. RESOURCE EXHAUSTION: What bounds memory, connections, file descriptors, disk?
   Any unbounded collections, missing pagination, no streaming?
3. ERROR PROPAGATION: What errors are caught? What happens to the caller?
   Are any errors swallowed silently? Does the error path leave state inconsistent?
4. BOUNDARY CONDITIONS: Empty inputs, null/undefined, max-size inputs, negative numbers?
5. STATE CORRUPTION: If this crashes halfway, what state is left? Recoverable?
   Partial writes? Transaction boundaries?
6. CRASH RECOVERY: After a process restart, does this resume correctly or corrupt/duplicate?

TARGETED PROBES FROM DIFF ANALYSIS:
{TARGETED_PROBES}

SYSTEM CONTEXT:
{SYSTEM_CONTEXT}

For each finding:
### [TITLE] (P{0-3}, confidence: {0.0-1.0})
**File**: path:line_range
**Execution path**: step-by-step how the failure occurs
**Impact**: what breaks and for whom
**Fix**: specific code change needed

End with:
## Verdict
**Assessment**: SAFE / UNSAFE / NEEDS_INVESTIGATION
**Confidence**: {0.0-1.0}
**Probes with clean verdicts**: [list which mandatory probes found no issues, with brief justification citing code]
```

### Gemini: Production Environment Analyst

Use `gemini` skill with `gemini-flagship` model from registry, approval `yolo`, 300s timeout.

Prompt framing:

```
You are a PRODUCTION ENVIRONMENT ANALYST. Your job is to find what breaks
when this code runs in the REAL deployment environment: at scale, under load,
during deploys, in distributed systems.

Focus on what's NOT in the code that SHOULD be.

DEFAULT POSTURE: NEEDS_INVESTIGATION until you can verify from actual code.
For each area you mark as safe, explain SPECIFICALLY how you verified it.
Do not mark anything safe based on naming conventions or common patterns —
trace the actual implementation.

ANTI-HALLUCINATION RULES:
1. For every finding, reference the SPECIFIC file and line
2. DISTINGUISH between "code does X wrong" (cite the line) and
   "code is MISSING Y" (explain the production scenario that requires Y)
3. When recommending infrastructure (circuit breaker, rate limiter, etc.),
   explain the SPECIFIC failure scenario for THIS code, not as general best practice
4. If you claim code handles a scenario, show the exact line that handles it

MANDATORY PROBES — answer each for the changed code:
1. DEPLOYMENT: What happens during rolling deploys? Old and new code running
   simultaneously? Schema migrations with live traffic?
2. SCALE: What's the big-O? N+1 queries? Fan-out amplification?
   Quadratic behavior hidden in a loop?
3. MISSING INFRASTRUCTURE: Where are the circuit breakers? Rate limiters?
   Backpressure? Health checks? Graceful shutdown? Idempotency keys?
4. OBSERVABILITY: Can you debug this in production? Are errors logged with
   enough context? Metrics for new code paths? Trace IDs?
5. DEPENDENCY FAILURES: What happens when the database/cache/queue/external API
   is down? Slow? Returns unexpected data? Returns partial data?
6. TEMPORAL: Clock skew? Timezone handling? TTL/expiry logic? Cron overlap?
   Stale reads from replication lag?

TARGETED PROBES FROM DIFF ANALYSIS:
{TARGETED_PROBES}

SYSTEM CONTEXT:
{SYSTEM_CONTEXT}

For each finding:
### [TITLE] (P{0-3}, confidence: {0.0-1.0})
**File**: path:line_range (or "MISSING — should be at [location]")
**Production scenario**: specific real-world situation that triggers this
**Impact**: what breaks at what scale
**Fix**: specific change or addition needed

End with:
## Verdict
**Assessment**: APPROVE / REQUEST_CHANGES / NEEDS_INVESTIGATION
**Confidence**: {0.0-1.0}
**Probes with clean verdicts**: [list which mandatory probes found no issues, with brief justification citing code]
```

---

## Phase 3: Adversarial Consolidation

After both reviewers complete, **cross-examine** — don't just deduplicate.

### 3.1 Cross-Check Clean Verdicts

For each probe where one reviewer said "no issues found":
- Did the other reviewer find something in that same area?
- If yes: this is a **contradiction** — one model certified code as safe that the other flagged as dangerous. Surface this prominently. This is the exact "expert witness" failure pattern.

### 3.2 Confidence Recalibration

- **Consensus** (both found same issue): confidence += 0.2 (cap at 1.0)
- **Single reviewer with code citation**: keep reported confidence
- **Single reviewer without code citation**: confidence -= 0.3 (pattern-matched, not verified)
- **"Code looks safe" verdict on any probe**: confidence capped at 0.6 (research shows clean verdicts are unreliable)

### 3.3 Categorize and Sort

1. **Consensus findings** (both found same issue) — highest signal
2. **Contradictions** (one praised what the other flagged) — needs human judgment, second highest
3. **Unique findings with code citations** — single-reviewer but verified
4. **Unique findings without citations** — flagged as "unverified"

Within each category, sort by priority (P0 > P1 > P2 > P3), then confidence.

---

## Priority Levels

**P0 - Critical**: Production outage, data loss, security breach. The thundering herd that takes down your service. The fetchAll that OOMs on a real table. Block deployment.

**P1 - High**: Incorrect behavior under realistic conditions. Double-execution, race conditions, silent data corruption. Fix before merge.

**P2 - Medium**: Works now but breaks at scale or under failure conditions. Missing circuit breakers, no backpressure, unbounded growth. Worth addressing.

**P3 - Low**: Observability gaps, missing metrics, suboptimal patterns. Consider trade-off between value and friction.

## Finding Format

Each finding must include:
- Specific location: file path + line range
- Problem statement with **execution path** (how the failure actually occurs step by step)
- Impact (what breaks, for whom, at what scale)
- Confidence (0.0-1.0)
- Whether it was found by one or both reviewers

Findings without execution paths or code citations are demoted to "unverified."

## Edge Cases

**Empty diff**: Report "No changes to review" without spawning reviewers.

**Large diffs** (>10k lines): Warn about token limits, suggest chunking by component/module.

**Partial failures** (one reviewer times out): Proceed with available review, note partial coverage and which perspective is missing.

**No targeted probes generated**: Use mandatory probes only. Note "No diff-specific patterns matched — review used mandatory probes only."

---

## Output: Consolidated Report

```markdown
# Code Review: [scope]
**Date**: [timestamp] | **Reviewers**: [codex-flagship] (Failure Mode Analyst), [gemini-flagship] (Production Environment Analyst)

## System Context
[Auto-detected deployment topology, framework, database, scale indicators]
[Or: "No deployment context detected — reviewed with conservative assumptions"]

## Summary
| Priority | Count | Description |
|----------|-------|-------------|
| P0 | X | [brief] |
| P1 | X | [brief] |
| P2 | X | [brief] |
| P3 | X | [brief] |

**Signal quality**: X consensus, X contradictions, X unique verified, X unverified

## Overall Verdict
**[APPROVE / REQUEST_CHANGES / NEEDS_INVESTIGATION]**

Codex (Failure Mode): [SAFE/UNSAFE/NEEDS_INVESTIGATION] (confidence: X)
Gemini (Production): [APPROVE/REQUEST_CHANGES/NEEDS_INVESTIGATION] (confidence: X)
[If contradictory: explain what they disagreed on and why it matters]

## Consensus Findings
[Both reviewers independently found the same issue — highest confidence]

## Contradictions
[One reviewer praised code that the other flagged — requires human judgment]
[For each: what Reviewer A said vs what Reviewer B said, with both code citations]

## Unique Findings
[Single-reviewer findings backed by specific code citations and execution paths]

## Unverified Concerns
[Single-reviewer findings without specific code paths — lower confidence, may be pattern-matched]

## Probes with Clean Verdicts
[Transparency: list each probe that found no issues, with the reviewer's justification]

## What Was NOT Checked
[Failure modes not applicable to this diff or not probed — shows remaining blind spots]

---
Generated by /sdlc:review — Adversarial review with targeted failure probing
```

Highlight P0/P1 issues as blocking. If Contradictions section is non-empty, always verdict NEEDS_INVESTIGATION regardless of individual reviewer verdicts.

## Scope

$ARGUMENTS
