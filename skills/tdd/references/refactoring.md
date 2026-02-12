# Refactoring in TDD

## Golden Rule

**Never refactor while RED.** All tests must pass before you change structure. Refactoring means changing design without changing behavior — a failing test means behavior is undefined.

## When to Refactor

Refactor after a GREEN cycle when you notice any of these candidates:

### 1. Duplication

Same logic in two or more places. Extract to a shared function or module.

```
Signal: Copy-pasted code blocks, similar conditionals in multiple functions
Action: Extract common logic into a named function
```

### 2. Long Methods

A function doing more than one thing. Extract steps into named functions.

```
Signal: Function > 20 lines, multiple levels of indentation, comments explaining sections
Action: Extract each section into a function named after what it does
```

### 3. Shallow Modules

Class or module with large surface area but thin implementation. Consolidate the interface.

```
Signal: Many public methods that each do very little, lots of getters/setters
Action: Reduce public API to what callers actually need
```

### 4. Feature Envy

A function that uses more data from another module than its own. Move it closer to the data.

```
Signal: Function accesses 3+ properties of another object, chains of property access
Action: Move the function to the module whose data it primarily uses
```

### 5. Primitive Obsession

Using primitive types (strings, numbers) where a domain type would be clearer.

```
Signal: String parameters named "email", "url", "currency", validation scattered across callers
Action: Create a value object (e.g., Email, URL, Money) that validates on construction
```

### 6. Code Revealed as Problematic

Existing code that wasn't obviously bad until the new feature exposed its weakness.

```
Signal: New feature requires awkward workarounds, existing abstraction doesn't fit
Action: Refactor the existing code to accommodate the new pattern cleanly
```

## Process

1. Confirm all tests are GREEN
2. Make ONE structural change
3. Run tests — they must stay GREEN
4. If tests break, revert the refactor (behavior changed, not just structure)
5. Repeat from step 2 for the next change

Small steps. Each refactor is independently revertible.

## See Also

- `references/test-quality.md` — tests that survive refactors
