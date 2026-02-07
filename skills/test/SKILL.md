---
name: test
description: Write or review tests following Kent C. Dodds testing principles - flat structure, composable setup, disposable fixtures. Use when the user asks to write tests, review tests, or convert legacy tests.
argument-hint: [file] | review [path] | convert [file]
model: sonnet
---

# Test Writer Skill

## Priorities

Correctness > Simplicity > Readability > Concision

## Goal

Write and review tests that are maintainable, isolated, and follow modern testing principles. Apply flat structure with no nested describe blocks, composable setup functions instead of beforeEach, disposable fixtures for automatic cleanup, and AHA testing principles (avoid hasty abstractions, prefer duplication over wrong abstraction).

## Constraints

- Flat structure: No nested describe blocks (max 1 level for grouping)
- Composable setup functions: Return objects, never mutate shared variables
- Disposable fixtures: Use `using` keyword with Symbol.dispose for automatic cleanup
- AHA testing: Prefer explicit tests over test generators, duplication over abstraction
- Descriptive test names: Describe behavior, not implementation
- Fresh state: Each test creates its own setup, no shared mutable state
- Framework-agnostic: Detect vitest/bun/jest from package.json

## Modes

**Write** (default): Generate tests for a source file. Read the source, identify exports, analyze edge cases, write test file with setup functions and disposable fixtures.

**Review**: Analyze existing tests for anti-patterns. Flag nested describes, beforeEach with variable assignment, missing cleanup, over-abstraction, shared mutable state. Report findings with specific fixes.

**Convert**: Transform legacy tests to modern patterns. Flatten describes, convert beforeEach to setup functions, add disposables for resources.

## Framework Detection

Read package.json to determine framework:
- `vitest` → Use Vitest patterns (import from 'vitest')
- `bun` with "test" script → Use Bun patterns (import from 'bun:test')
- `jest` → Recommend Vitest migration, use Vitest patterns

## Mode Detection

Parse `$ARGUMENTS` to determine mode:
- First arg is `review` → Review mode
- First arg is `convert` → Convert mode
- Path to source file → Write mode (default)
- No args → Ask what to test

## References

Load test patterns and code examples via:
- `Glob(pattern: "**/sdlc/**/skills/test/references/test-patterns.md", path: "~/.claude/plugins")` → Read result

Reference file contains:
- Setup function patterns
- Disposable fixture patterns
- Test naming conventions
- Anti-patterns to detect
- Transformation rules for Convert mode

## Write Mode Process

1. Read source file completely
2. Identify exports (functions, classes, constants)
3. Analyze inputs, outputs, edge cases, errors, dependencies
4. Generate test file with setup functions section and tests section
5. Use disposable fixtures for resources (servers, databases, files)

## Review Mode Process

1. Find test files matching `*.test.ts`, `*.spec.ts`, `*.test.tsx`, `*.spec.tsx`
2. Analyze for anti-patterns: nested describes >1 level, beforeEach with variable assignment, missing cleanup, over-abstraction, shared mutable state
3. Report findings with severity, line numbers, current code, and specific fixes

## Convert Mode Process

1. Read test file completely
2. Parse structure: identifies describes, hooks, variable declarations
3. Transform: flatten describes, convert beforeEach to setup functions, add disposables
4. Write converted file or show diff

## Arguments

$ARGUMENTS
