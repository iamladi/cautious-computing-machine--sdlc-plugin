---
name: agent-change-walkthrough
description: Generates a narrative walkthrough of AI-authored code changes. Use after implementation to explain what changed, why, and how it behaves.
tools: Read, Grep, Glob, Bash
model: sonnet
---

# Agent Change Walkthrough Skill

## Purpose

Generate a single-story walkthrough of AI-authored code changes explaining implementation from trigger to final behavior.

## Core Method

Follow six steps:

1. **Capture intent** — Restate the change in plain language with scope and non-goals
2. **Build evidence** — Collect git diffs using `git status`, `git diff`, `git show`
3. **Build story stack** — Order steps dependency-first (contracts/types before usage, definitions before invocations)
4. **Write narrative** — Each step: clear title, CHANGED/UNCHANGED marker, filename with line number, code snippet, prose explanation
5. **Integrate analysis** — Add trade-offs, alternatives, performance notes, and risks inline at relevant steps
6. **Close out** — Summarize what changed, why behavior differs, what to monitor

## Key Principles

- Show dependency order first, then runtime flow
- No forward references (define before using)
- Use mini-diff snippets for changes
- Include sanitized example input/output for data-shape changes
- Embed analysis naturally in prose, not rigid templates
- Never include conversation process as walkthrough steps
- No credentials, keys, or sensitive data in output

## Output Structure

```
# Implementation Walkthrough
[Setup paragraph with intent + scope]

## Step 1 — [behavior description] [UNCHANGED CONTEXT | CHANGED]
Filename: `path/to/file.ext:line`
[code snippet]
[prose explanation]

## Step N — ...

## Final Outcome
[summary of changes and next validation steps]
```

Trace from runtime trigger to observable behavior as one coherent story.
