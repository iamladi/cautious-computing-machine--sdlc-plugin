# Implement the following plan

## Role

You orchestrate subagent-driven implementation of a plan: dispatch fresh `implementer` agents per task, gate each task through `spec-reviewer` then `code-quality-reviewer`, keep the todo list synced with GitHub Issue checkboxes, and make atomic commits per task. Implementers execute — you coordinate.

## Priorities

Correctness (spec compliance) > Progress (forward momentum) > Efficiency (minimal context use)

## Pre-flight

- `/rename "Implement: #$ARGUMENTS"` (issue number) or `/rename "Implement: {plan-name}"`.
- Read CLAUDE.md for `tdd:` mode (`strict` / `soft` / `off`) — pass this to every implementer.
- `git branch --show-current`. If on main, run `SlashCommand(/p:generate_branch)`.

## Input parsing

`$ARGUMENTS` carries a plan reference and optional flags. Strip `--swarm` if present (it selects the swarm branch below). The remainder is either an issue number (`#123`) or a plan file path.

- **Issue**: `gh issue view #123 --json body` → extract the plan path from the body → read the file fully.
- **File**: read the plan's frontmatter for an associated Issue. If none, stop with `Run /github:create-issue-from-plan first` — the Issue is how we track progress.

Read the plan without offset/limit, then read every file it references the same way, then check the Issue for existing checkbox state. Extract tasks phase-by-phase.

## Interview checkpoint

Find and read the interview protocol:
- `Glob(pattern: "**/sdlc/**/skills/interview/SKILL.md", path: "~/.claude/plugins")`

Run it in context-only mode (no file updates, no Interview Insights section). Focus on task ordering, testing approach, code-style choices, and open decisions in the plan. The topic is the plan's goals and requirements.

## Routing

Default is the standard flow: tasks run sequentially, one implementer at a time. `--swarm` switches to parallel teammates where the plan has independent tasks that don't touch the same files.

If swarm mode is requested but `TeamCreate` isn't available:
```
Swarm mode requires agent teams. Set CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 in settings.json or environment.
Falling back to standard workflow.
```
Then continue with the plan already parsed.

---

## Standard workflow

Per task:

1. **Dispatch implementer** (`Task` tool, `subagent_type: "implementer"`) with: task spec, TDD mode, plan context, files to reference. When `tdd` is `strict` or `soft`, also pass the TDD reference docs — `Glob("**/tdd/references/*.md", path: "~/.claude/plugins")` and include the full file paths in the dispatch prompt. The implementer is trusted to apply `mocking.md`, `test-quality.md`, and `interface-design.md`; don't pre-digest them into rule bullets.
2. **Answer questions** from plan/context first; escalate to `AskUserQuestion` only when the plan truly doesn't answer.
3. **Dispatch `spec-reviewer`**: original spec + implementation → verify nothing missing, nothing extra, behavior matches.
4. **Dispatch `code-quality-reviewer`**: changed files → bugs, smells, security, anti-patterns.
5. **Review loop**: up to 3 iterations. On FAIL, re-dispatch the implementer with the review notes, then re-review. After 3 rounds without convergence, escalate to the user with the last issues and three options (try once more / skip / stop).
6. **Mark complete** in the todo list after both reviews pass.

Trivial single-line tasks: implement directly, skip the subagents.

Track progress as: phases (high-level) with tasks nested under them. Flip each task `pending` → `in_progress` on dispatch and `in_progress` → `completed` after reviews pass. At the end of every *phase*, sync checkboxes to GitHub via `gh issue edit #123 --body "..."` — the plan is immutable, the Issue carries progress.

---

## Swarm workflow

Parallelizes independent tasks while preserving the same review gates.

### Task clustering

After extracting tasks from the plan:

- Pull `Files touched` / `Relevant Files` / `Implementation Details` metadata from the plan. Where missing, estimate from the task description before spawning.
- Tasks that touch disjoint files can run in parallel. Tasks with any file overlap must serialize.
- Honor explicit dependencies (`Task B depends on Task A's interface`) — those serialize too.

Example: Task 1 touches `src/auth.ts`, Task 2 touches `src/profile.ts` → parallel. Task 3 also touches `src/auth.ts` → serializes after Task 1.

### Team setup

Create the team with `TeamCreate`: name `implement-{plan-kebab}-{YYYYMMDD-HHMMSS}`, description `Implement: {plan name or issue #}`. Populate the shared task list via `TaskCreate`, including `blockedBy` for dependent tasks (they won't be claimed until blockers finish).

### Teammate dispatch

Spawn one teammate per independent task via `Task` with `team_name` and `subagent_type: "general-purpose"`. The spawn prompt is self-contained — conversation context isn't visible to teammates, so embed everything as literal text.

<example name="Teammate spawn prompt">
You are implementing one task as part of an implementation team.

TASK SPEC:
{literal copy of task description from plan, including acceptance criteria}

TDD MODE: {strict|soft|off}
{If strict: "Write the test before the implementation. Follow Red-Green-Refactor."}
{If soft: "If no test exists, warn and proceed."}
{If off: "No test requirement."}

FILES TO MODIFY:
{list of files this task touches}

RELEVANT FILE CONTENTS:
{current contents of files to modify plus interfaces/types they depend on}

DEPENDENCIES / INTERFACES:
{any shared APIs, types, or contracts discovered by other teammates or from the plan}

Constraints:
- Edit only your assigned files. The lead coordinates commits and reviews; editing outside your scope creates conflicts with concurrent teammates.
- Don't run git, build, or test commands — teammates are editing concurrently and those operations would interfere.
- Read files completely (no limit/offset).
- If blocked, send `BLOCKED: {reason}` via `SendMessage` — the lead has full plan context and can answer or escalate.
- If you discover file overlap at runtime (a `SendMessage` from another teammate or a conflict), send `FILE OVERLAP DETECTED: {file path}. My task touches this file but {other teammate's task} also modifies it. Lead should serialize these tasks.`
- When you create or modify a public API, interface, or type another teammate might depend on, send `INTERFACE UPDATE: {description with file:line}. May affect other tasks.`

When implementation is complete, self-review every dimension the reviewer pair will check — these mirror `agents/implementer.md`'s canonical Self-review-before-commit list, and finding a miss yourself is one loop cycle cheaper than finding it through reviewers:

- Spec compliance — every requirement maps to a change. Missing requirements are `spec-reviewer`'s primary check and the highest-cost failure mode.
- Scope discipline — every change maps back to a requirement. Extra code passes tests, ships, and surfaces later as untested surface area; `spec-reviewer` flags this as Extra Implementation.
- Basic health — compiles and runs. `code-quality-reviewer`'s first gate.
- Test validity (if TDD) — the test passes, exercises the new behavior, and would fail if the behavior regressed.
- No silent fallbacks — `??` / `||` on required data masks upstream bugs; one of `code-quality-reviewer`'s named anti-patterns. Defaults are fine for optional config; required fields throw.
- Error propagation — try/catch only at system boundaries (API handlers, queue consumers, cron entrypoints). Catching inside business logic and returning `null` swallows errors and trips the swallowed-errors check.
- No lookup tables — algorithmic logic for all inputs, not hardcoded `if` branches matching test inputs. Lookup tables pass the suite without implementing the behavior.
- Debug log preservation — diagnostic logs added during investigation stay untouched; removing them in the same commit conflates concerns and breaks `git blame` for the next debugger.

If self-review fails, fix and re-review. When all checks pass, send `TASK COMPLETE: {task name}` via `SendMessage` and wait for `shutdown_request` from the lead.
</example>

### Lead orchestration

You run the team:

- **Launch independents in parallel.** Track which teammate owns which task.
- **File-overlap escalation.** On `FILE OVERLAP DETECTED`, send `shutdown_request` to the newer teammate, wait for the earlier task to finish, then respawn the shut-down task.
- **Interface broadcast.** On `INTERFACE UPDATE`, forward via `SendMessage` to teammates whose tasks plausibly depend on the API.
- **Questions.** Answer `BLOCKED` messages from plan/context, or escalate via `AskUserQuestion` and relay back.
- **Per-task commit + review.** When a teammate signals `TASK COMPLETE`:
  1. Sanity-check their changes (compiles, no obvious typos).
  2. Stage only the files they modified: `git add {files}`.
  3. Atomic conventional commit:
     ```bash
     git commit -m "$(cat <<'EOF'
     feat: {task description}

     Implements task from {plan reference}
     EOF
     )"
     ```
  4. Dispatch `spec-reviewer` and `code-quality-reviewer` with the same 3-iteration loop as the standard workflow.
  5. On both-pass: `TaskUpdate` the shared task list, `gh issue edit` the checkbox.
- **Unblock dependents.** After a task completes reviews, scan the task list for items that were `blockedBy` it. Spawn teammates for any now-ready task.

Teammate timeout is 10 minutes per teammate from spawn. On timeout, send `shutdown_request`, proceed with whatever's done, and note the timeout in the final output. If a teammate gets stuck (repeated identical messages, no progress), pick: handle it yourself via the standard flow, respawn with tighter scope, or escalate — choose on criticality.

### Cleanup invariant

**The team must be deleted before the command returns, regardless of whether tasks succeeded, failed, or timed out.** Skipping leaks team slots and orphans the shared task list.

1. `SendMessage` with `type: "shutdown_request"` to each teammate.
2. Wait briefly for shutdown confirmations.
3. `TeamDelete`.

If cleanup itself errors, tell the user `"Team cleanup incomplete. You may need to check for lingering team resources."` and continue to the Output section — the user still gets the summary.

---

## Output

**Per phase:** verify all tasks in the phase passed reviews, update Issue checkboxes, print a status update. Continue to the next phase automatically; if it was the final phase, pause for the wrap-up below.

**Final wrap-up:**
- Summary (bullets).
- Review iterations used, if any.
- `git diff --stat`.
- `"Run /review for thorough analysis"`.

**Change walkthrough.** Find and run the walkthrough skill:
- `Glob(pattern: "**/sdlc/**/skills/agent-change-walkthrough/SKILL.md", path: "~/.claude/plugins")`

Run it across every task completed in this session. The topic is the full diff: `git diff HEAD~{n}` where `n` is the number of commits made this session (or `git diff {base-branch}...HEAD` where tracking is available).

**De-slop gate** — non-blocking:
1. `uvx desloppify scan --path .` — capture the strict score.
2. Include the score in the summary.
3. If issues found, summarize briefly and ask `"Fix slop now or later?"`:
   - **Now** — invoke the de-slop skill's iterative fix loop (`uvx desloppify next` → fix → repeat until clean), then re-scan to confirm the score improved.
   - **Later** — note it in the summary and end.
4. If `desloppify` isn't installed (command fails), skip silently.

**Swarm mode additions.** When `--swarm` was used, also report:
- Tasks parallelized vs serialized.
- Runtime file-overlap escalations resolved.
- Teammate timeout / failure counts.
- Wall-clock time vs estimated sequential time (if measurable).

## Error handling

- **Teammate stuck.** Answer from context or report the blockage to the user.
- **Review loop won't converge after 3 rounds.** Report the last issues and offer: try once more / skip / stop.
- **Spec mismatch.** Report expected vs found vs why, then stop.

## Plan

$ARGUMENTS
