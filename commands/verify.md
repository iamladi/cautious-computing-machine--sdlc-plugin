# Verify the plan implementation

## Priorities
Correctness > Completeness > Build Success > Code Quality

## Goal
Verify that the implementation matches the plan's intent and meets all success criteria. Check that code builds, validates, and aligns with the plan file before marking complete.

## Constraints
- Read the plan file completely to understand all requirements
- Check git diff origin/main...HEAD --stat for changed files summary
- Verify each phase matches plan expectations before proceeding
- Report mismatches using format: "Expected: [plan] / Found: [actual] / Why this matters: [explanation]"
- Run production build to catch build-time errors
- Run validation script if present in package.json
- Execute repo health checker agent for success criteria
- Stop immediately if build or validation fails
- Read all referenced files fully without limit/offset parameters
- Follow plan's intent while adapting to actual codebase context

## Verification Approach
For each phase: verify correctness (right solution, fulfills plan, simplest approach), then verify quality (build succeeds, validation passes, health checks pass, code review clean). If multiple phases requested, verify continuously but pause only after the last phase.

## Plan
$ARGUMENTS

## Report
After verification:
- Summarize completed work in concise bullet points
- Show files and lines changed with git diff --stat
- Flag any mismatches between plan and implementation
