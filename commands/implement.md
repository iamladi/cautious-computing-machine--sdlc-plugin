# Implement the following plan

Execute the plan using **subagent-driven development**: dispatch fresh agents per task with two-stage review (spec compliance + code quality).

## Session Naming

Before starting, rename this session for clarity:
- If `$ARGUMENTS` is an issue number: `/rename "Implement: #$ARGUMENTS"`
- If `$ARGUMENTS` is a plan file: `/rename "Implement: {plan-name}"`
- Otherwise infer from current branch or plan context

## Instructions

### 1. Pre-Flight Checks

#### Check TDD Mode
Read the project's CLAUDE.md and extract the `tdd:` setting:
- `strict`: Test-first required, human escape hatch for prototyping
- `soft`: Warnings for missing tests, no blocking
- `off` (default): No TDD enforcement

Store this for passing to implementer agents.

#### Check Branch
Run `git branch --show-current` to verify we're not on main.
If on main, use SlashCommand(/p:generate_branch) to create a work branch.

### 2. Read and Parse the Plan

**Input formats:**
- **Issue number**: `/implement #123` - Fetch plan path from Issue
- **Plan file**: `/implement plans/file.md` - Read directly

**Process:**
1. If Issue number: `gh issue view #123 --json body,number,title`
   - Extract plan file path from Issue body
   - Read plan file
2. If plan file: Read frontmatter for Issue number
   - If no Issue: error "Run `/github:create-issue-from-plan` first"
   - Fetch Issue for progress state

**When reading plan:**
- Read completely, understand full spec
- Check Issue body for existing checkmarks (progress)
- Read all files mentioned in plan (fully, no limit/offset)
- **Extract tasks**: Parse Implementation Plan phases and their checkbox items
- Ultrathink: how do the pieces connect?

### 3. Subagent-Driven Implementation

For each **task** in the plan (checkbox items within phases):

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTROLLER (YOU)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  For each task:                                             │
│                                                             │
│  1. Dispatch IMPLEMENTER agent                              │
│     └─→ Fresh context, TDD-aware, implements task           │
│     └─→ Can ask questions → controller answers              │
│     └─→ Self-reviews, commits changes                       │
│                                                             │
│  2. Dispatch SPEC-REVIEWER agent                            │
│     └─→ Verifies: nothing missing, nothing extra            │
│     └─→ Returns: PASS or list of issues                     │
│     └─→ If FAIL: implementer fixes → re-review (max 3)      │
│                                                             │
│  3. Dispatch CODE-QUALITY-REVIEWER agent                    │
│     └─→ Quick sanity check for obvious issues               │
│     └─→ Returns: PASS or list of obvious issues             │
│     └─→ If FAIL: implementer fixes → re-review (max 3)      │
│                                                             │
│  4. Mark task complete in todo list                         │
│                                                             │
│  After phase complete:                                      │
│  → Update Issue checkboxes via GitHub API                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Dispatching Implementer Agent

Use the Task tool with `subagent_type: "implementer"`:

```markdown
## Task
[Task description from plan]

## Spec
[Detailed requirements - copy relevant section from plan]

## TDD Mode
[strict|soft|off]

## Context
[Relevant patterns, files to follow, codebase conventions]

## Files to Reference
[List key files the implementer should read]
```

#### Handling Implementer Questions

When implementer asks a question:
1. **Try to answer from context first**
   - Check the plan, related files, codebase patterns
   - If confident: provide answer
2. **If unsure: escalate to human**
   - Use `AskUserQuestion` to get clarification
   - Pass answer back to implementer (may need to re-dispatch)

#### Dispatching Spec Reviewer

After implementer completes, use Task tool with `subagent_type: "spec-reviewer"`:

```markdown
## Task Spec
[Original task requirements]

## Implementation
[Files changed by implementer]

## Review
Verify implementation matches spec exactly:
- Nothing missing
- Nothing extra
- Behavior as specified
```

**Review Loop (max 3 iterations):**
1. If PASS: proceed to code quality review
2. If FAIL: dispatch implementer to fix issues, then re-review
3. After 3 failures: escalate to human

#### Dispatching Code Quality Reviewer

After spec review passes, use Task tool with `subagent_type: "code-quality-reviewer"`:

```markdown
## Changed Files
[List of files from implementation]

## Quick Review
Check for obvious issues only:
- Clear bugs
- Code smells
- Security red flags
- Anti-patterns
```

**Review Loop (max 3 iterations):**
Same pattern as spec review.

### 4. Progress Tracking

#### Todo List
Create and maintain a todo list for tracking:
- Each phase as a high-level item
- Each task within phases
- Mark in_progress when dispatching implementer
- Mark completed after both reviews pass

#### Issue Updates
After completing a **phase** (not each task):
- Update Issue body with checkmarks: `gh issue edit #123 --body "..."`
- Plan file stays immutable (it's the spec)
- Issue tracks progress

### 5. Phase Completion

After each phase:
- Verify all tasks in phase complete
- Update Issue checkboxes for the phase
- Brief status update to user

If multiple phases requested: continue to next phase.
Otherwise: pause for user confirmation.

### 6. Final Steps

After all requested work complete:
- Summary of what was implemented
- Recommend: "Run `/review` for thorough code analysis before submission"
- Report files changed with `git diff --stat`

## Controller Responsibilities

As the controller, you:

1. **Orchestrate** - Dispatch agents, manage flow
2. **Provide Context** - Give agents what they need
3. **Answer Questions** - From plan knowledge first, then human
4. **Track Progress** - Todos and Issue updates
5. **Enforce Limits** - Max 3 review iterations
6. **Escalate** - When review loops don't converge

## Error Handling

### Implementer Gets Stuck
- If asking questions: try to answer from context
- If blocked: report clearly, ask human for guidance

### Review Loop Doesn't Converge
After 3 iterations without PASS:
```
Review loop not converging after 3 attempts.

Last issues:
[list from reviewer]

Options:
1. Try one more fix attempt
2. Skip this review and proceed (not recommended)
3. Stop and address manually
```

### Spec Mismatch Found
If the plan can't be followed as written:
```
Issue in Phase [N]:
Expected: [what plan says]
Found: [actual situation]
Why this matters: [explanation]

Stopping for guidance.
```

## Backward Compatibility

The new workflow is the default. For simple tasks where subagent overhead isn't worth it:
- Very small changes (single line fixes)
- Controller can implement directly without dispatching

Use judgment: if the task is trivial, just do it. Subagents are for non-trivial tasks.

## Plan
$ARGUMENTS

## Report
- Summarize work done in concise bullet points
- Note any review iterations needed
- Report files and lines changed with `git diff --stat`
