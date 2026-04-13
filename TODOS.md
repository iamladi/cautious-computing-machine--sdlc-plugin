# TODOs

## Standalone coding-discipline skill
Why: If the embed-in-agents approach proves insufficient (agents skip checklist items), a standalone skill loaded via trigger words would provide stronger enforcement.
Context: The ai-coding-principles repo (luoling8192/ai-coding-principles) packages rules as a standalone skill. We chose embed-in-agents for minimality, but this is the fallback.
Dependencies: Evidence that the advisory checklist is being ignored by agents.

## Full DDIA reference skill for /plan
Why: Targeted DDIA probes in blindspot review cover common cases, but a full reference skill would enable deeper system design guidance during planning.
Context: The ai-coding-principles repo has a 400+ line DDIA distilled reference. We could install it directly or create our own adapted version.
Dependencies: User feedback that targeted probes are insufficient for data-intensive planning.

## Scenario-based enforcement verification
Why: Current manual test plan only verifies text presence, not whether agents actually catch violations (Codex finding #3).
Context: LLM behavior testing is non-deterministic. Need a skill evaluation framework with representative scenarios and pass/fail criteria.
Dependencies: Skill evaluation framework infrastructure.

## Blocking discipline gate for /implement
Why: If advisory checklist proves insufficient, a blocking gate (like the de-slop gate pattern) would provide stronger enforcement with "fix now or later?" prompt.
Context: Decided against for initial implementation to minimize disruption. De-slop gate at commands/implement.md:266-274 is the template.
Dependencies: Evidence that advisory approach has low compliance.
