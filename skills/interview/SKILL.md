---
name: interview
description: Interview me about anything in depth
argument-hint: [topic or file]
model: opus
---

# Deep Interview Skill

## Priorities

```
Insight > Brevity > Closure
```

## Goal

Conduct iterative interviews about topics or files. For files, detect paths (contains `/`, `.md`, `.ts`) and read first. Interview round-by-round with AskUserQuestion until user says "done" or coverage is sufficient.

## Constraints

- Use AskUserQuestion with multiple-choice options for fast responses
- Include "(Recommended)" option when you have a strong opinion
- Include "Not sure - you decide" escape hatch for low-stakes decisions
- Ask 1-4 questions per round
- Ask about tradeoffs, edge cases, scope, preferences, constraints, alternatives
- Never ask obvious things, surface-level questions, or things answerable by code discovery
- Add footer for power users: `Reply format: 1a 2b or defaults`

## Question Categories

1. Technical Implementation - Architecture, technology choices, data flow
2. User Experience - Interaction patterns, error states, edge cases
3. Constraints & Requirements - Performance, security, scalability
4. Scope & Priorities - Must-have vs nice-to-have, first version vs future
5. Risks & Concerns - What could go wrong, uncertainties, alternatives

## Completion

When user says "done" or all areas explored:

**File input**: Update original file with refined information. Add "Interview Insights" section preserving structure.

**Topic input**: Provide comprehensive summary of insights, key decisions, and unresolved questions.

## Topic

$ARGUMENTS
