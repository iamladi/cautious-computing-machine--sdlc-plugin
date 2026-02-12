---
name: tdd
description: TDD enforcement during implementation. Reads `tdd:` setting from CLAUDE.md. Modes - strict (human approval for escape), soft (warnings), off (disabled). Auto-invoked by /implement.
---

# TDD Enforcement Skill

## Priorities

Correctness > Test Coverage > Implementation Speed

## Goal

Enforce Test-Driven Development as a **process**, not just a presence check. Agents left unconstrained write all tests first, then all code (horizontal slicing). This produces tests coupled to implementation that break on refactor. The 4-phase workflow below enforces vertical TDD cycles where each test drives one slice of implementation.

## Configuration

Read `tdd:` from CLAUDE.md:
```yaml
tdd: strict  # strict | soft | off
```

Check both `CLAUDE.md` and `.claude/CLAUDE.md`. Default: `off`.

## Modes

### Strict (`tdd: strict`)
Full 4-phase workflow with blocking gates. Planning phase requires user confirmation via AskUserQuestion before coding. Each phase has explicit entry/exit criteria.

**Escape when**: Markdown-only changes, config changes, or when mocking exceeds the change's complexity. Present AskUserQuestion with: (1) Write test first, (2) Prototype escape with justification. Log escapes.

### Soft (`tdd: soft`)
Full 4-phase workflow guidance but **no blocking gates**. Planning phase generates and presents the plan but proceeds immediately. Warns on deviations (no test, horizontal slicing) but does not stop. Summarize untested items after completion.

### Off (`tdd: off`)
No TDD checks. Standard implementation flow.

## Anti-Pattern: Horizontal Slicing

```
WRONG (horizontal):               RIGHT (vertical):
┌──────────────────────┐           ┌──────────────────────┐
│ Write ALL tests      │           │ Test 1 → Impl 1      │
│ test1, test2, test3  │           │ ✓ GREEN               │
├──────────────────────┤           ├──────────────────────┤
│ Write ALL code       │           │ Test 2 → Impl 2      │
│ impl1, impl2, impl3 │           │ ✓ GREEN               │
├──────────────────────┤           ├──────────────────────┤
│ Hope they match      │           │ Test 3 → Impl 3      │
│ ✗ Tests are brittle  │           │ ✓ GREEN               │
└──────────────────────┘           └──────────────────────┘
```

Horizontal slicing fails because tests written without implementation are based on imagined APIs. They couple to guessed method signatures, mock internal modules, and break on any structural change.

## 4-Phase Workflow

### Phase 1: Planning

**Entry**: Task received with TDD mode strict or soft.

1. Identify the public interface changes needed
2. List behaviors to test, ordered by priority (core path first, edge cases later)
3. **Strict mode**: Present interface and behavior list via AskUserQuestion for user confirmation before proceeding
4. **Soft mode**: Present the plan, proceed immediately

Load reference: `Glob("**/tdd/references/interface-design.md", path: "~/.claude/plugins")`

**Exit**: Confirmed behavior list. Proceed to Tracer Bullet.

**Non-interactive**: If no user response within the current turn, proceed with best judgment and log skipped confirmation.

### Phase 2: Tracer Bullet

Prove one end-to-end path through the system.

1. Write ONE test for the highest-priority behavior
2. Verify it FAILS (RED) — a passing test before implementation is a false positive
3. Write minimal implementation to make it pass (GREEN)
4. Run per-cycle checklist (below)
5. **Strict mode**: Pause after tracer bullet passes. Present results via AskUserQuestion to confirm before incremental loop.

Load references: `Glob("**/tdd/references/mocking.md", path: "~/.claude/plugins")`, `Glob("**/tdd/references/test-quality.md", path: "~/.claude/plugins")`

**Exit**: One test passing, end-to-end path proven.

### Phase 3: Incremental Loop

For each remaining behavior from the plan:

1. Write ONE test (RED)
2. Write minimal code to pass (GREEN)
3. Run per-cycle checklist
4. Repeat

**Do NOT write the next test until the current cycle is GREEN and the checklist passes.**

### Phase 4: Refactor

Only enter when ALL tests are GREEN.

1. Look for refactoring candidates (duplication, long methods, shallow modules)
2. Make ONE structural change at a time
3. Run tests after each change — must stay GREEN
4. If tests break, revert the refactor

Load reference: `Glob("**/tdd/references/refactoring.md", path: "~/.claude/plugins")`

**Exit**: Clean code, all tests GREEN. Commit test and implementation together.

## Per-Cycle Checklist

After every RED-GREEN pair, verify:

- [ ] **Behavior, not implementation**: Test describes WHAT the system does, not HOW
- [ ] **Public interface only**: Test uses the same API as production callers
- [ ] **Survives refactor**: Would this test break if internals changed but behavior stayed the same?
- [ ] **Minimal code**: Implementation is the simplest thing that passes — no speculative features
- [ ] **No horizontal drift**: Did you write only ONE test before implementing? If you wrote multiple, STOP and revert to one.

## Pre-Existing RED State

If existing tests are already failing when you start: note them and proceed with new behavior only. Do not attempt to fix pre-existing failures unless that is the task.

## Test Discovery

Search patterns: `__tests__/[filename].test.ts`, `[filename].test.ts`, `[filename].spec.ts`, `test/[filename].test.ts`, `tests/[filename].test.ts`.

## Arguments

$ARGUMENTS
