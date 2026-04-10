<!-- Blindspot Review Protocol - Extracted from commands/plan.md -->
<!-- Used by: /plan command -->

## Phase 2: Multi-LLM Blindspot Review

After creating the draft plan, run it through Codex and Gemini in parallel to uncover blindspots.

**IMPORTANT**: Spawn both review agents in a single message to run them in parallel.

### Codex Plan Critic

```bash
codex exec --skip-git-repo-check \
  -m gpt-5.4 \
  -c model_reasoning_effort="xhigh" \
  --sandbox read-only \
  --full-auto \
  "You are a plan critic. Review this implementation plan for blindspots and gaps.

Focus on finding what the plan author may have MISSED:
- Missing edge cases (error states, timeouts, rate limits, auth failures)
- Unclear or ambiguous requirements that could cause confusion
- Dependency gaps (things that need to exist before a step can work)
- Risk underestimation (migrations without rollback, breaking changes unmarked)
- Scope creep signals (does this touch more than intended?)
- Testing gaps (untested paths, missing integration scenarios)
- Sequence issues (steps in wrong order, missing prerequisites)

DO NOT:
- Suggest general improvements or best practices
- Critique writing style
- Add nice-to-haves not related to plan correctness

For each finding, provide:
### [TITLE] (Severity: Critical/High/Medium/Low, Confidence: {0.0-1.0})
**Section**: [which plan section is affected]
**Issue**: [what's missing or wrong]
**Recommendation**: [specific fix]

End with:
## Overall Assessment
**Plan Readiness**: [Ready / Needs Revision / Major Gaps]
**Confidence**: {0.0-1.0}
**Key Blindspots Found**: {count}

---
PLAN TO REVIEW:
$(cat plans/[plan-file].md)" 2>/dev/null
```

### Gemini Plan Critic

```bash
timeout 300 gemini -m gemini-3-pro-preview --approval-mode yolo \
  "You are a plan critic. Review this implementation plan for blindspots and gaps.

Focus on finding what the plan author may have MISSED:
- Missing edge cases (error states, timeouts, rate limits, auth failures)
- Unclear or ambiguous requirements that could cause confusion
- Dependency gaps (things that need to exist before a step can work)
- Risk underestimation (migrations without rollback, breaking changes unmarked)
- Scope creep signals (does this touch more than intended?)
- Testing gaps (untested paths, missing integration scenarios)
- Sequence issues (steps in wrong order, missing prerequisites)

DO NOT:
- Suggest general improvements or best practices
- Critique writing style
- Add nice-to-haves not related to plan correctness

For each finding, provide:
### [TITLE] (Severity: Critical/High/Medium/Low, Confidence: {0.0-1.0})
**Section**: [which plan section is affected]
**Issue**: [what's missing or wrong]
**Recommendation**: [specific fix]

End with:
## Overall Assessment
**Plan Readiness**: [Ready / Needs Revision / Major Gaps]
**Confidence**: {0.0-1.0}
**Key Blindspots Found**: {count}

---
PLAN TO REVIEW:
$(cat plans/[plan-file].md)"
```

### Wait and Consolidate

**CRITICAL**: Wait for BOTH critics to complete before proceeding.

Consolidate their feedback:
1. **Parse findings** from each critic
2. **Deduplicate** overlapping concerns (same section + similar issue = merge)
3. **Flag consensus**: When both critics identify the same issue, mark as `[Consensus]` (high confidence)
4. **Flag unique**: When only one critic found it, mark as `[Codex]` or `[Gemini]`
5. **Sort by severity**: Critical > High > Medium > Low

## Phase 3: Plan Refinement

Review the consolidated feedback and update the plan:

1. **Critical/High + Consensus**: Must address these. Update the plan.
2. **Critical/High + Single reviewer**: Evaluate carefully. Address if valid.
3. **Medium + Consensus**: Should address. Update if straightforward.
4. **Medium/Low + Single reviewer**: Optional. Use judgment.

For each addressed concern, add a comment in the relevant plan section:
```
<!-- Addressed: [brief description of what was added/changed] -->
```

Add a new section to the plan after `## Notes & Context`:

```markdown
## Blindspot Review

**Reviewers**: GPT-5.4 (xhigh), Gemini 3 Pro
**Date**: [timestamp]

### Addressed Concerns
- [Consensus] Missing rollback strategy for database migration → Added to Phase 1
- [Codex] No timeout handling for external API calls → Added NFR-3
- [Gemini] Test coverage gap for error states → Added to Testing Strategy

### Acknowledged but Deferred
- [Low] Could add more logging → Out of scope for MVP

### Dismissed
- [Codex, Low] Suggested caching layer → Not needed for current scale
```
