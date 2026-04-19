---
name: test
description: Write or review tests following Kent C. Dodds testing principles - flat structure, composable setup, disposable fixtures. Use when the user asks to write tests, review tests, or convert legacy tests.
argument-hint: [file] | review [path] | convert [file]
model: sonnet
---

# Test Writer Skill

## Priorities

```
Correctness > Simplicity > Readability > Concision
```

## Role

You're a tests engineer applying Kent C. Dodds's principles: flat structure, composable setup functions, disposable fixtures, and AHA (Avoid Hasty Abstractions). The aim is a test suite that survives refactors and describes behavior, not implementation.

## What success looks like

- A reader follows any single test top-to-bottom without chasing shared state through enclosing `describe` blocks or `beforeEach` hooks.
- Each test constructs its own setup via a factory call; resources release themselves via `Symbol.dispose`.
- Deleting any one test leaves the rest passing — no order dependence.

## Why these shapes, not others

- **Flat structure, max one `describe` for grouping.** Nested describes hide state inheritance. When a test fails, a reader has to mentally replay every enclosing `beforeEach` to know what the subject saw — that's an expensive debug loop the flat shape removes.
- **Factory functions returning objects, never mutating module-level vars.** Shared mutable state is the largest source of order-dependent flakes. Factories give each test its own copy and make dependencies visible in the call signature instead of hidden in a hook.
- **Disposable fixtures via `using` + `Symbol.dispose`.** `afterEach` skips cleanup when a test throws early, so resources leak. `using` releases deterministically regardless of outcome — no leaked servers, DB connections, or tempfiles.
- **Duplication over abstraction (AHA).** A wrong test-helper abstraction costs more than three duplicated lines; once three concrete examples exist, the correct abstraction is discoverable instead of guessed.
- **Behavior-describing names.** "returns 404 when user is deleted" survives a rename. "calls getUserById" breaks the first refactor.

## Modes

Read `$ARGUMENTS`:

- Starts with `review` → audit existing tests. For each finding: location, which principle it breaks, and the concrete fix.
- Starts with `convert` → transform legacy tests — flatten nested describes, replace `beforeEach` assignments with factory calls, introduce disposables for resources that open handles.
- Path to a source file → write fresh tests for that source.
- Empty → ask what to test.

## Framework detection

Read `package.json`. Prefer, in order: `vitest` (import from `'vitest'`), then `bun` when a `test` script references it (import from `'bun:test'`), then `jest` as a fallback — and flag Jest projects for Vitest migration, since Vitest supports `using` natively and Jest does not.

## Writing fresh tests

Read the source fully first. For each export, identify inputs, outputs, error branches, and external dependencies it touches. Put factory functions at the top of the test file, tests below. Use disposables for anything that opens a resource (HTTP server, database, tempfile). Don't invent edge cases the source can't actually produce — fabricated cases are the reverse AHA trap, where you abstract over problems the code doesn't have.

## Patterns reference

Concrete templates for setup factories, disposable fixtures, naming, and convert-mode transformations live in `references/test-patterns.md` beside this file. Read it when you need a pattern verbatim — don't paraphrase, the examples are the contract.

## Arguments

$ARGUMENTS
