# System Prompt Transformation Patterns

This document provides patterns for transforming rule-based system prompts into reasoning-based equivalents that align with Constitutional principles.

## Constitutional Foundation

From the Claude Constitution:
> "I want Claude to offer thoughtful, nuanced responses rather than oversimplified ones."
> "I want Claude to be intellectually humble about its knowledge."
> "I want Claude to use its best judgment when instructions are unclear or contradictory."

Reasoning-based prompts enable these behaviors by trusting the model's judgment while providing clear principles and context.

---

## When NOT to Transform

Some constraints are genuinely necessary and should remain as strict rules:

- **Safety constraints**: "Never execute code that deletes production data without confirmation"
- **Format contracts**: "Output must be valid JSON with these exact keys"
- **Tool boundaries**: "Use Read tool for files, not cat command"
- **Hard business rules**: "Prices must be positive integers"

These are not micromanagement—they enforce invariants that cannot be reasoned away.

---

## Pattern 1: Bare Rules → Rules with Reasoning

**Why this improves behavior**: Reasoning enables the model to handle edge cases by understanding intent rather than pattern-matching keywords.

**Constitution quote**: "I want Claude to use its best judgment when instructions are unclear or contradictory."

### Before (Rule-based)
```
Never use emojis.
Never apologize.
Always use TypeScript.
```

### After (Reasoning-based)
```
Avoid emojis unless the user explicitly requests them, as they can feel unprofessional in technical contexts.

Skip unnecessary apologies ("Sorry, but...") to maintain concision. Acknowledge genuine errors when you make them.

Default to TypeScript for type safety and maintainability. Use Python only when explicitly approved or when the task inherently requires it (data science, ML).
```

**What changed**: Each rule now explains WHY, which helps the model apply the principle in novel situations (e.g., "Should I use an emoji in a commit message if the repo culture uses them?" → the reasoning helps answer this).

---

## Pattern 2: Step-by-Step Procedures → Outcome-Driven Workflows

**Why this improves behavior**: Rigid sequences break when context changes. Outcome-driven workflows let the model adapt the path to the goal.

**Constitution quote**: "I want Claude to offer thoughtful, nuanced responses rather than oversimplified ones."

### Before (Rule-based)
```
When creating a commit:
1. Run git status
2. Run git diff
3. Run git log
4. Add files with git add
5. Create commit with git commit
6. Run git status again
```

### After (Reasoning-based)
```
When creating a commit, understand the change context before committing:
- Check what's staged and unstaged (git status, git diff)
- Review recent commit style (git log) to match conventions
- Stage specific files by name (avoid `git add .` which can accidentally include secrets)
- Draft a message that explains WHY, not just WHAT
- Verify success after committing

Adapt the sequence if context differs (e.g., if all files are already staged, skip the add step).
```

**What changed**: The workflow now has checkpoints with PURPOSE ("understand change context") instead of blind commands. The model can skip redundant steps or reorder when appropriate.

---

## Pattern 3: Rigid Templates → Judgment Criteria

**Why this improves behavior**: Templates encourage fill-in-the-blank thinking. Criteria encourage evaluation and adaptation.

**Constitution quote**: "I want Claude to be intellectually humble about its knowledge."

### Before (Rule-based)
```
Always format responses as:

## Summary
[3 bullet points]

## Details
[Detailed explanation]

## Next Steps
[Numbered list]
```

### After (Reasoning-based)
```
Structure responses to match the complexity and context of the question:

- **For simple questions**: Direct answer, no ceremony
- **For complex tasks**: Summary → Details → Next Steps (if action is needed)
- **For exploratory questions**: Present findings and tradeoffs

Good responses are:
- Appropriately detailed (not under- or over-explained)
- Scannable (headings, lists, code blocks where they help)
- Actionable (if the user needs to do something, make it clear what)

Match the user's communication style in formality and length.
```

**What changed**: Instead of a rigid template, the model now has judgment criteria ("appropriately detailed", "scannable", "actionable") and examples of when to use different structures.

---

## Pattern 4: Exhaustive Enumeration → Principles with Examples

**Why this improves behavior**: Long lists become stale and brittle. Principles with examples enable generalization.

**Constitution quote**: "I want Claude to use its best judgment when instructions are unclear or contradictory."

### Before (Rule-based)
```
Use the Grep tool for these commands:
- grep
- rg
- ripgrep
- ack
- ag
- git grep
- findstr
- sift

Use the Read tool for these commands:
- cat
- head
- tail
- more
- less
- bat
- type
```

### After (Reasoning-based)
```
Prefer specialized tools over Bash for common operations:
- **Content search**: Use Grep tool (not grep, rg, ag, etc.)
- **File reading**: Use Read tool (not cat, head, tail, etc.)
- **File finding**: Use Glob tool (not find, ls)

These tools are optimized for permissions, output formatting, and error handling.

Use Bash when the operation genuinely requires shell features (piping, process management, environment variables).
```

**What changed**: The principle ("prefer specialized tools") is clear, with categories and reasoning. The model can now correctly classify commands not in the original list (e.g., "Should I use `bat` or Read?" → Read, because it's file reading).

---

## Pattern 5: Micromanagement → Trust Statements

**Why this improves behavior**: Over-specification creates prompt bloat and prevents the model from using its strengths.

**Constitution quote**: "I want Claude to use its best judgment when instructions are unclear or contradictory."

### Before (Rule-based)
```
When writing code:
- Use 2 spaces for indentation
- Always use const instead of let unless reassignment is needed
- Always use arrow functions instead of function keyword
- Always use template literals instead of string concatenation
- Always use === instead of ==
- Always add trailing commas in multi-line arrays and objects
```

### After (Reasoning-based)
```
Follow the existing code style in the file. If it's a new file, use modern JavaScript conventions:
- Const by default, let when needed, avoid var
- Strict equality (===) to prevent type coercion bugs
- Template literals for readability when interpolating

Match the indentation, formatting, and naming patterns you observe. For edge cases (e.g., arrow functions vs function keyword), prefer the style that improves clarity in that specific context.
```

**What changed**: Instead of 6 micro-rules, we have 2-3 principles and a trust statement ("match existing style", "prefer clarity"). The model can now handle style decisions not covered by the original list.

---

## Pattern 6: Missing Edge Case Handling → Principle-Based Guidance

**Why this improves behavior**: Rule-based prompts fail silently on novel situations. Principles generalize.

**Constitution quote**: "I want Claude to use its best judgment when instructions are unclear or contradictory."

### Before (Rule-based)
```
When the user asks you to create a pull request:
1. Run git status
2. Run git diff
3. Push to remote
4. Run gh pr create
```

### After (Reasoning-based)
```
When the user asks you to create a pull request, understand the full context:
- What changes are included (status, diff, log from branch point)
- Whether the branch is pushed and tracking a remote
- The commit history since diverging from the base branch

Draft a PR title and description that reflect ALL commits, not just the latest one.

If you encounter unexpected state (e.g., no remote, conflicting branches, nothing to commit), explain the situation and ask how to proceed rather than failing silently.
```

**What changed**: The "After" version handles edge cases not mentioned in the original (no remote, conflicting state, multiple commits). The principle ("understand full context", "explain unexpected state") generalizes to cases the prompt author didn't anticipate.

---

## Scoring Dimensions

Use these to evaluate whether a section is rule-based or reasoning-based:

| Dimension | Rule-Based (0-2) | Hybrid (3-4) | Reasoning-Based (5) |
|-----------|------------------|--------------|---------------------|
| **Constraint Style** | "Never", "Always", "Must" without explanation | Rules with brief reasoning | Principles with context |
| **Workflow Style** | Numbered steps, rigid sequence | Checkpoints with some flexibility | Outcome-driven with adaptation |
| **Format Style** | Rigid templates, fill-in-the-blank | Templates with escape hatches | Judgment criteria, examples |
| **Trust Level** | Prescribes every detail | Trusts on some dimensions | Trusts judgment, provides principles |
| **Edge Case Handling** | Fails silently on novel cases | Handles some anticipated edges | Principles that generalize |

**How to use**: Score each section 0-5 on each dimension. Sections averaging < 3 need transformation. Sections averaging > 4 are already reasoning-based.

---

## Transformation Anti-Patterns

Avoid these when transforming:

### Anti-Pattern 1: Bloating the Prompt
**Bad**: Turning "Use TypeScript" into 3 paragraphs about type safety philosophy.
**Good**: "Default to TypeScript for type safety and maintainability. Use Python only when explicitly approved."

### Anti-Pattern 2: Removing Necessary Constraints
**Bad**: Turning "Output must be valid JSON" into "Output should generally be JSON-like."
**Good**: Keep it. Format contracts are not micromanagement.

### Anti-Pattern 3: Vague Principles
**Bad**: "Use good judgment about tool selection."
**Good**: "Prefer specialized tools (Grep, Read, Glob) over Bash for common operations. Use Bash when you need shell features like piping."

### Anti-Pattern 4: Losing Actionability
**Bad**: Turning a clear checklist into abstract philosophy.
**Good**: Preserve the actionable steps, but add the WHY and flexibility for adaptation.

---

## Quick Reference

| If you see... | Transform to... |
|---------------|-----------------|
| "Never X" | "Avoid X because Y, except when Z" |
| Numbered steps | Outcome + checkpoints + adaptation note |
| Fill-in-the-blank template | Judgment criteria + examples |
| Long enumerated list | Principle + 2-3 examples |
| Prescriptive micro-rules | Trust statement + key principles |
| No edge case handling | Generalization principle |
