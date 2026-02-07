---
name: tdd
description: TDD enforcement during implementation. Reads `tdd:` setting from CLAUDE.md. Modes - strict (human approval for escape), soft (warnings), off (disabled). Auto-invoked by /implement.
---

# TDD Enforcement Skill

## Priorities

Correctness > Test Coverage > Implementation Speed

## Goal

Enforce Test-Driven Development based on project configuration. Read `tdd:` setting from CLAUDE.md (default: off). Support three enforcement modes: strict (test required before implementation), soft (warnings only), off (no checks).

## Why TDD in Agent Workflows

TDD addresses a specific failure mode in agent-based development: **agents reliably implement happy-path code that breaks on edge cases**. Because each agent dispatch operates with fresh context, implicit requirements don't carry forward. The test becomes the durable specification — making expected behavior explicit before implementation.

Writing tests first prevents spec drift. When implementation comes first, it's easy to rationalize the behavior you built rather than the behavior you needed. The test defines the contract. The implementation fulfills it.

## Configuration

Read `tdd:` from CLAUDE.md:
```yaml
tdd: strict  # strict | soft | off
```

Check both `CLAUDE.md` and `.claude/CLAUDE.md`. Default: `off`.

## Modes

### Strict (`tdd: strict`)
Hard enforcement. Before implementation, verify test exists. If missing, STOP and present AskUserQuestion with options: (1) Write test first, (2) Prototype escape with justification. Log escapes for review.

**Reasoning**: Catching spec drift early is cheaper than debugging later. In agent workflows where context is fresh each dispatch, the test is the only durable specification. Strict mode creates a forcing function: define the contract before building the implementation.

**When to escape strict mode**: Markdown-only changes, configuration changes, prototyping exploratory code, or third-party integration where mocking is more complex than the change itself. Escapes should be deliberate, not habitual.

### Soft (`tdd: soft`)
Warning without blocking. Check for test, output warning if missing, continue implementation. Track untested items and summarize after completion.

**Reasoning**: Some changes genuinely don't need tests — documentation, configuration, trivial formatting. Soft mode creates a deliberate moment of judgment without blocking flow. The warning makes the decision conscious rather than automatic.

### Off (`tdd: off`)
No TDD checks. Standard implementation flow.

**Reasoning**: TDD isn't universally optimal. Some projects have different testing strategies (e.g., property-based testing, integration-first, manual QA). Off mode acknowledges that test-first discipline isn't the right fit for every context.

## Test Discovery

Search patterns (in order of precedence):
1. `__tests__/[filename].test.ts`
2. `[filename].test.ts` (adjacent)
3. `[filename].spec.ts` (adjacent)
4. `test/[filename].test.ts`
5. `tests/[filename].test.ts`

**Reasoning**: These patterns represent common testing conventions across JavaScript/TypeScript ecosystems. Checking all patterns ensures compatibility with Jest, Vitest, and other test runners without requiring project-specific configuration. Match function names, class names, or exported methods in test descriptions to verify the test actually covers the implementation target.

## Red-Green-Refactor Cycle

**Red**: Write test describing expected behavior first. Run it and verify it fails.
- **Why verify failure?** A passing test before implementation is a false positive — it doesn't actually test what you think. The red phase confirms the test is connected to the code under test.

**Green**: Write minimal implementation to pass test.
- **Why minimal?** Resist over-engineering at this stage. Shipping working code is the immediate goal. The test defines "done" — satisfy it, nothing more.

**Refactor**: Clean up with test safety net.
- **Why refactor separately?** The passing test ensures refactoring doesn't break behavior. You can restructure confidently because the test guards against regressions.

**Commit**: Test and implementation together as atomic unit.

## Arguments

$ARGUMENTS
