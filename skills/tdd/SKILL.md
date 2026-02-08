---
name: tdd
description: TDD enforcement during implementation. Reads `tdd:` setting from CLAUDE.md. Modes - strict (human approval for escape), soft (warnings), off (disabled). Auto-invoked by /implement.
---

# TDD Enforcement Skill

## Priorities

Correctness > Test Coverage > Implementation Speed

## Goal

Enforce Test-Driven Development based on project configuration. Agents reliably implement happy-path code that breaks on edge cases — TDD makes the test the durable specification across fresh-context dispatches.

## Configuration

Read `tdd:` from CLAUDE.md:
```yaml
tdd: strict  # strict | soft | off
```

Check both `CLAUDE.md` and `.claude/CLAUDE.md`. Default: `off`.

## Modes

### Strict (`tdd: strict`)
Hard enforcement. Before implementation, verify test exists. If missing, STOP and present AskUserQuestion with options: (1) Write test first, (2) Prototype escape with justification. Log escapes for review.

**Escape when**: Markdown-only changes, config changes, or when mocking exceeds the change's complexity.

### Soft (`tdd: soft`)
Warning without blocking. Check for test, warn if missing, continue. Summarize untested items after completion.

### Off (`tdd: off`)
No TDD checks. Standard implementation flow.

## Test Discovery

Search patterns: `__tests__/[filename].test.ts`, `[filename].test.ts`, `[filename].spec.ts`, `test/[filename].test.ts`, `tests/[filename].test.ts`.

## Red-Green-Refactor Cycle

**Red**: Write test describing expected behavior first and verify it fails — a passing test before implementation is a false positive.

**Green**: Write minimal implementation to pass test — the test defines "done", satisfy it, nothing more.

**Refactor**: Clean up with test safety net — the passing test ensures refactoring doesn't break behavior.

**Commit**: Test and implementation together as atomic unit.

## Arguments

$ARGUMENTS
