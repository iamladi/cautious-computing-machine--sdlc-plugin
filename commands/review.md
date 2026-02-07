# Parallel Code Review with Codex and Gemini

## Session Naming

Before starting, rename this session for clarity:
- If `$ARGUMENTS` provided: `/rename "Review: $ARGUMENTS"`
- Otherwise: `/rename "Review: Current Changes"`

## Priorities

Correctness > Consensus > Coverage > Speed

## Goal

Run comprehensive code reviews using GPT-5.2-Codex and Gemini 3 Pro in parallel, then consolidate findings into a unified report with priority levels and confidence scores.

## Why Parallel Multi-Model Review

Different models have different strengths and blind spots. Codex excels at detecting subtle logical errors and performance issues due to its specialized training on code execution patterns. Gemini brings architectural perspective and catches broader design concerns. Running both in parallel and synthesizing their findings produces more comprehensive coverage than either model alone.

When both models identify the same issue independently, that's a strong signal of genuine concern. When they diverge, that often reveals trade-offs or judgment calls worth surfacing to the developer.

## Scope and Execution

**Default scope**: Review changes in `git diff HEAD` unless `$ARGUMENTS` specifies a different commit range or file paths.

**Parallel execution**: Spawn both reviewers simultaneously in a single message to maximize throughput. Both reviewers need access to the same diff, so fetch it once before spawning agents.

**Codex reviewer**: Use `codex` skill with model `gpt-5.2-codex`, reasoning effort `xhigh`, sandbox `read-only`, full auto mode. Codex should focus on correctness, performance, security, and maintainability.

**Gemini reviewer**: Use `gemini` skill with model `gemini-3-pro-preview`, approval mode `yolo`, 300s timeout wrapper. Same focus areas as Codex.

Both reviewers should flag only actionable issues introduced by the changes under review, not pre-existing technical debt unless the change makes it significantly worse.

## Priority Levels: Judgment Criteria

Use these priority levels to communicate urgency and impact:

**P0 - Critical**: Issues that would cause security vulnerabilities, data loss, crashes, or production outages. These block deployment and require immediate fixes. Examples: SQL injection, unhandled exceptions in critical paths, race conditions in payment flows.

**P1 - High**: Logic errors and significant bugs that would cause incorrect behavior or major user-facing problems. These should be fixed before merge. Examples: off-by-one errors, incorrect validation logic, broken error handling.

**P2 - Medium**: Code quality issues that impact maintainability, readability, or future extensibility. Worth addressing but not blockers. Examples: duplicated logic, unclear naming, missing error context, suboptimal patterns.

**P3 - Low**: Style preferences, minor suggestions, and nitpicks. Consider the trade-off between value and review friction. Examples: formatting inconsistencies (if not auto-formatted), subjective naming preferences, optional optimizations.

## What Makes a Good Finding

A useful finding has:
- **Specific location**: File path and line range so the developer knows exactly where to look
- **Clear problem statement**: What's wrong and why it matters
- **Impact assessment**: How this affects correctness, performance, security, or maintainability
- **Confidence level**: How certain is the reviewer? (0.0-1.0 scale) — Lower confidence for judgment calls or inferred issues without full context

Each reviewer should structure findings as `### [TITLE] (P{0-3}, confidence: {0.0-1.0})` followed by file path, line range, and explanation. This format enables automated parsing and consolidation.

Each reviewer should conclude with an **Overall Verdict**: an assessment (Codex: "patch is correct/incorrect", Gemini: "APPROVE/REQUEST_CHANGES"), overall confidence score, and justification that synthesizes their individual findings.

## Consolidating the Reviews

After both reviewers complete, synthesize their findings into a unified report. This is not mechanical deduplication — it's judgment-driven synthesis.

**When findings overlap** (same file, similar line ranges, describing the same issue): Merge them into one finding, note that both reviewers flagged it (this is a consensus signal), combine their explanations to provide fuller context, and use the higher confidence score.

**When reviewers disagree** (one flags an issue, the other doesn't, or they assess severity differently): Surface both perspectives. These disagreements often reveal legitimate trade-offs or areas where human judgment is needed. Don't hide them.

**Sorting**: Organize findings by priority (P0 → P3), then by confidence within each priority level. This surfaces the most critical, high-confidence issues first.

## Edge Cases and Judgment Calls

**Empty diff**: If there are no changes to review, report: "No changes to review. Stage some changes or specify a commit range." Don't spawn reviewers unnecessarily.

**Large diffs** (>10k lines): Warn about potential token limit issues or suggest chunking the review by file/directory. Consider whether a full review is tractable or if the developer should split the change.

**Partial failures**: If one reviewer times out or errors, proceed with the other's findings and note the partial coverage. A single high-quality review is better than no review.

**Contradictory verdicts**: If Codex says "incorrect" and Gemini says "APPROVE", mark consensus as "MIXED" and highlight the disagreement prominently. This signals that human judgment is needed.

**Low-confidence findings**: If a finding has confidence <0.5, consider whether it's worth including. Sometimes it's valuable to surface uncertainty ("this might be a problem, but I'm not sure without more context"), but too many low-confidence findings create noise.

## Output: Consolidated Report Structure

Generate a consolidated report with:

**Header**: Scope (diff command used), date, reviewers (GPT-5.2-Codex xhigh, Gemini 3 Pro)

**Summary table**: Priority levels P0-P3 with counts and brief descriptions of what they mean

**Overall Verdict**: Both reviewers' assessments with confidence scores, plus synthesized consensus (APPROVE/REQUEST_CHANGES/MIXED). If there's meaningful disagreement, explain it.

**Findings sections**: Organized by priority (P0 Critical, P1 High, P2 Medium, P3 Low). Each finding shows:
- Title
- File path and line range
- Flagged by which reviewer(s) — note consensus when both flagged it
- Confidence score (use the higher score if merged)
- Merged explanation combining both perspectives

**Reviewer Disagreements**: List any findings where reviewers had significantly different assessments. Explain the nature of the disagreement and why it might exist.

**Footer**: "Generated by /sdlc:review using GPT-5.2-Codex and Gemini 3 Pro"

If there are P0 or P1 issues, highlight them prominently as requiring immediate attention. If no significant issues were found: "No significant issues found. Code looks good to proceed."

## Scope

$ARGUMENTS
