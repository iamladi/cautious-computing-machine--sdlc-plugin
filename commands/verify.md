# Verify the plan implementation

## Priorities
Correctness > Completeness > Build Success > Code Quality

## Goal
Verify that the implementation matches the plan's intent and meets all success criteria. Check that code builds, validates, and aligns with the plan file before marking complete.

## Constraints

- Read the plan file completely to understand all requirements — partial reads miss edge cases and success criteria that the plan spent design effort on.
- Check `git diff origin/main...HEAD --stat` for a changed-files summary — tells you the blast radius before diving into per-file verification.
- Verify each phase matches plan expectations before proceeding — a silent mismatch in an early phase cascades into every later phase that builds on it.
- Report mismatches using format: `Expected: [plan] / Found: [actual] / Why this matters: [explanation]` — the three-part format forces you to think through whether the mismatch is load-bearing or incidental.
- Run the production build — catches build-time errors that dev mode hides (minification, tree-shaking, env-var resolution).
- Run the validation script if present in `package.json` — the project's own definition of "valid" beats guessing.
- Execute the repo health-checker agent for success criteria — a specialized agent with a narrower prompt catches what the generalist misses.
- Stop immediately if build or validation fails — continuing verification on broken code produces noisy findings that distract from the real failure.
- Read all referenced files fully without `limit`/`offset` parameters — partial reads are a known source of phantom bugs ("the code is missing X" when X is below the read window).
- Follow the plan's intent while adapting to actual codebase context — the plan is a hypothesis; reality may have moved since planning, and rigid conformance to a stale plan misses the point.

## Verification Approach
For each phase: verify correctness (right solution, fulfills plan, simplest approach), then verify quality (build succeeds, validation passes, health checks pass, code review clean). If multiple phases requested, verify continuously but pause only after the last phase.

## Plan
$ARGUMENTS

## Report
After verification:
- Summarize completed work in concise bullet points
- Show files and lines changed with git diff --stat
- Flag any mismatches between plan and implementation
