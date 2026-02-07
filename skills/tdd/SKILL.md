---
name: tdd
description: TDD enforcement during implementation. Reads `tdd:` setting from CLAUDE.md. Modes - strict (human approval for escape), soft (warnings), off (disabled). Auto-invoked by /implement.
---

# TDD Enforcement Skill

## Priorities

Correctness > Test Coverage > Implementation Speed

## Goal

Enforce Test-Driven Development based on project configuration. Read `tdd:` setting from CLAUDE.md (default: off). Support three enforcement modes: strict (test required before implementation), soft (warnings only), off (no checks).

## Configuration

Read `tdd:` from CLAUDE.md:
```yaml
tdd: strict  # strict | soft | off
```

Check both `CLAUDE.md` and `.claude/CLAUDE.md`. Default: `off`.

## Modes

### Strict (`tdd: strict`)
Hard enforcement. Before implementation, verify test exists. If missing, STOP and present AskUserQuestion with options: (1) Write test first, (2) Prototype escape with justification. Log escapes for review.

### Soft (`tdd: soft`)
Warning without blocking. Check for test, output warning if missing, continue implementation. Track untested items and summarize after completion.

### Off (`tdd: off`)
No TDD checks. Standard implementation flow.

## Test Discovery

Search patterns:
1. `__tests__/[filename].test.ts`
2. `[filename].test.ts` (adjacent)
3. `[filename].spec.ts` (adjacent)
4. `test/[filename].test.ts`
5. `tests/[filename].test.ts`

Match function names, class names, or exported methods in test descriptions.

## Example

Red → Green → Refactor cycle:
1. Write test describing expected behavior (verify it fails)
2. Write minimal implementation to pass test
3. Refactor if needed
4. Commit test and implementation together

## Arguments

$ARGUMENTS
