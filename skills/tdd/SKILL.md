---
name: tdd
description: TDD enforcement during implementation. Reads `tdd:` setting from CLAUDE.md. Modes - strict (human approval for escape), soft (warnings), off (disabled). Auto-invoked by /implement.
---

# TDD Enforcement Skill

## Role

You enforce test-driven development as a *process*, not a presence check. Agents left unconstrained write all tests first, then all code — horizontal slicing. Horizontal tests are written against imagined APIs, so they couple to guessed signatures, mock internal modules, and shatter on refactor. This skill forces vertical cycles (one test → one slice of code → green → next test) so each test lands on an API the implementation actually has.

This operationalizes *Goal-Driven Execution* (principle 4 of the `karpathy-principles` skill in primitives-plugin): a failing test is the verifiable definition of "not done"; a passing test is the verifiable definition of "done for this slice." Without it, "done" drifts.

## Priorities

```
Correctness > Test Coverage > Implementation Speed
```

## Success

- Every behavior change has at least one test that would fail without it — the test *drives* the implementation, not the other way around.
- Tests call the same public interface production callers use, so internal refactors don't cascade into test rewrites.
- No horizontal batch — test and implementation ship together, one cycle at a time.
- In strict mode, no coding happens before the user has confirmed the behavior list.

## Configuration

Read `tdd:` from `CLAUDE.md` or `.claude/CLAUDE.md`:

```yaml
tdd: strict   # blocking gates, AskUserQuestion for plan + escape
tdd: soft     # full guidance, warns on deviation but doesn't block
tdd: off      # standard implementation, no TDD checks
```

Default when unset: `off`.

## The horizontal-slicing trap

```
WRONG (horizontal):               RIGHT (vertical):
┌──────────────────────┐           ┌──────────────────────┐
│ Write ALL tests      │           │ Test 1 → Impl 1      │
│ test1, test2, test3  │           │ ✓ GREEN              │
├──────────────────────┤           ├──────────────────────┤
│ Write ALL code       │           │ Test 2 → Impl 2      │
│ impl1, impl2, impl3  │           │ ✓ GREEN              │
├──────────────────────┤           ├──────────────────────┤
│ Hope they match      │           │ Test 3 → Impl 3      │
│ ✗ Tests are brittle  │           │ ✓ GREEN              │
└──────────────────────┘           └──────────────────────┘
```

A test written without its implementation encodes what you *imagined* the API would look like. Once the real code exists, the API shifts, the test breaks, and it gets rewritten to match — at which point it no longer protects against regression, it only documents the final shape. Vertical cycles dodge this by only writing a test for code you are about to write next.

## Phases

The four-phase sequence is load-bearing: skipping phases is what horizontal slicing looks like from the inside. Each phase exits into the next only when its invariant holds.

### 1. Planning

Identify the public interface change and list the behaviors to test, ordered core-path-first. Edge cases come after the happy path is proven — sequencing edge cases first produces scaffolding tests for code that never ships.

- **Strict**: present the interface and behavior list via `AskUserQuestion` and wait. If the current turn is non-interactive and no response arrives, proceed with best judgment and log the skipped confirmation so the escape is auditable.
- **Soft**: present the plan, proceed.

Reference: `Glob("**/tdd/references/interface-design.md", path: "~/.claude/plugins")`.

### 2. Tracer bullet

Prove one end-to-end path with red-green-refactor before generalizing:

- Write one test for the highest-priority behavior. Run it. Confirm it fails — a test that passes before its implementation exists is a false positive, meaning it's testing something that was already true.
- Write the minimal implementation that turns it green. "Minimal" means no speculative fields and no pre-built helpers for tests you haven't written yet.
- Run the per-cycle checklist (below).
- **Strict**: pause here and call `AskUserQuestion` to confirm before continuing into the loop. The tracer bullet is where API shape becomes real, and it's the cheapest point to correct course.

References: `Glob("**/tdd/references/mocking.md", path: "~/.claude/plugins")`, `Glob("**/tdd/references/test-quality.md", path: "~/.claude/plugins")`.

### 3. Incremental loop

For each remaining behavior: one test (red) → minimal code (green) → checklist → next. Don't start the next cycle until the current one is green and the checklist passes. A second red test layered on top means you can't tell which implementation change is responding to which test, and you've re-entered horizontal slicing through the back door.

### 4. Refactor

Enter only when every test is green. Make one structural change at a time, re-run tests after each; if tests break, revert rather than chasing the break. The refactor phase removes duplication or flattens shallow modules — it does not add features. Feature work goes back to phase 3.

Reference: `Glob("**/tdd/references/refactoring.md", path: "~/.claude/plugins")`.

Commit test and implementation together when the phase exits. Splitting them hides the TDD trail from future reviewers and makes bisect harder.

## Per-cycle checklist

Run after every red-green pair. Each item exists because failing it produces a specific class of broken test.

- **Behavior, not implementation** — the test describes *what* the system does. Referencing a private method name or internal state couples the test to refactor-sensitive surface, destroying its regression value.
- **Public interface only** — the test calls the same API production code calls. Tests that reach past the public surface are coupled to internals you'll want to rearrange.
- **Survives refactor** — ask: if internals change but external behavior stays, does this test still pass? If no, the test is over-specified.
- **Minimal implementation** — the code is the simplest thing that turns the test green. Speculative features aren't covered by a test, so they shape future APIs without justification.
- **No lookup tables** — the implementation computes results, not hardcodes them against the test inputs. If swapping the test's input values would break the code, you've written a lookup table; rewrite with real logic.
- **No horizontal drift** — did you write exactly one test before implementing? Two means you've slipped. Revert the extra test, finish the current cycle, then add the next one.
- **No type theater** — the test verifies something the type system doesn't already guarantee. If the only way it could fail is a compile error, delete it.

## Edge cases

- **Pre-existing red state.** If tests are already failing when you start, note them and scope your work to the new behavior. Fixing pre-existing failures mid-implementation mixes the diff and makes the TDD signal unreadable — it becomes a separate task.
- **Strict-mode escapes.** Markdown-only changes, config-only changes, or cases where mocking would exceed the change's complexity don't need the full cycle. In strict mode, present the escape via `AskUserQuestion` with two options: (1) write the test anyway, (2) prototype with justification. Log the escape either way — an escape trail makes "we shipped untested X" auditable.
- **Test discovery.** Look in these locations for an existing test file to extend before creating a new one: `__tests__/<file>.test.ts`, `<file>.test.ts`, `<file>.spec.ts`, `test/<file>.test.ts`, `tests/<file>.test.ts`. Extending a file keeps related tests colocated; a new sibling file fragments discovery.

## Arguments

$ARGUMENTS
