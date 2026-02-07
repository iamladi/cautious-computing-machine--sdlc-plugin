# Implement the following plan

## Priorities

Correctness (spec compliance) > Progress (forward momentum) > Efficiency (minimal context use)

## Goal

Execute plan using **subagent-driven development**: dispatch fresh implementer agents per task, validate with two-stage review (spec-reviewer → code-quality-reviewer), progress tracking via todo list, update Issue checkboxes.

## Constraints

### Pre-flight
Rename session: `/rename "Implement: #$ARGUMENTS"` or `/rename "Implement: {plan-name}"`.

Check TDD Mode: Read CLAUDE.md for `tdd:` (strict/soft/off). Pass to implementer agents.

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
6. **Mark complete**: Update todo list after both reviews pass

Trivial tasks (single-line): skip subagents, implement directly.

### Progress Tracking
Create todo list: phases (high-level), tasks (nested). Mark in_progress (dispatch) → completed (reviews pass).

After **phase**: `gh issue edit #123 --body "..."` to update checkboxes. Plan immutable; Issue tracks progress.

## Output

### Per Phase
Verify tasks complete, update Issue checkboxes, status update. Continue if multiple phases, else pause.

### Final
- Summary (bullets)
- Review iterations if any
- `git diff --stat`
- "Run `/review` for thorough analysis"

## Error Handling

**Stuck**: Answer from context or report blockage.

**Review loop not converging** (3 fails): Report last issues, offer options (try once more / skip / stop).

**Spec mismatch**: Report expected vs found vs why, then stop.

## Plan
$ARGUMENTS
