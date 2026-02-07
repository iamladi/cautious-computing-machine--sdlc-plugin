# Implement the following plan

## Layer 1: Priorities

```
Correctness (spec compliance) > Progress (forward momentum) > Efficiency (minimal context use)
```

## Layer 2: Goal

Execute plan using **subagent-driven development**: dispatch fresh implementer agents per task, validate with two-stage review (spec-reviewer → code-quality-reviewer), track progress, update Issue checkboxes.

## Layer 3: Constraints

### Pre-flight
Rename session: `/rename "Implement: #$ARGUMENTS"` or `/rename "Implement: {plan-name}"`.

Read CLAUDE.md for `tdd:` (strict/soft/off). Pass to implementer agents.

Check branch: `git branch --show-current`. If main, SlashCommand(/p:generate_branch).

### Plan Input
- Issue (`/implement #123`): `gh issue view #123 --json body` → extract plan path → read
- File (`/implement plans/file.md`): Read frontmatter for Issue. No Issue → error "Run `/github:create-issue-from-plan` first"

Read plan completely, check Issue for progress, read all referenced files (no limit/offset). Extract tasks from phases.

### Subagent Workflow
You orchestrate; implementer agents execute. Per task:

1. **Dispatch implementer** (Task tool, `subagent_type: "implementer"`): task spec, TDD mode, context, files to reference
2. **Handle questions**: Answer from plan/context first, else AskUserQuestion
3. **Dispatch spec-reviewer** (`subagent_type: "spec-reviewer"`): original spec + implementation → verify nothing missing/extra, behavior matches
4. **Dispatch code-quality-reviewer** (`subagent_type: "code-quality-reviewer"`): changed files → check bugs/smells/security/anti-patterns
5. **Review loops**: Max 3 iterations. FAIL → re-dispatch implementer → re-review. After 3, escalate
6. **Mark complete**: Update todo after both reviews pass

Trivial tasks (single-line): skip subagents, implement directly.

### Progress
Create todo: phases (high-level), tasks (nested). Mark in_progress (dispatch) → completed (reviews pass).

After **phase**: `gh issue edit #123 --body "..."` to update checkboxes. Plan immutable; Issue tracks progress.

## Layer 4: Output

### Per Phase
Verify tasks complete, update Issue checkboxes, status update.

Continue if multiple phases, else pause.

### Final
- Summary (bullets)
- Review iterations if any
- `git diff --stat`
- "Run `/review` for thorough analysis"

### Errors
**Stuck**: Answer from context or report blockage.

**Review loop** (3 fails):
```
Review not converging after 3 attempts.
Last issues: [list]
Options: 1) Try once more, 2) Skip (not recommended), 3) Stop
```

**Spec mismatch**:
```
Phase [N]: Expected [plan], Found [actual], Why [explanation]. Stopping.
```

## Layer 5: References

Plan:
$ARGUMENTS
