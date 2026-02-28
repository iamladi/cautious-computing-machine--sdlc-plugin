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

The `$ARGUMENTS` input contains both the plan reference (issue number or file path) and optional mode flags. Extract the intent:
- Identify if `--swarm` flag is present (indicates user wants parallel team implementation)
- Separate the flag from the plan reference itself
- The plan reference is the remaining text after flag extraction

Parse the plan reference:
- Issue (`/implement #123` or `/implement #123 --swarm`): `gh issue view #123 --json body` → extract plan path → read
- File (`/implement plans/file.md` or `/implement plans/file.md --swarm`): Read frontmatter for Issue. No Issue → error "Run `/github:create-issue-from-plan` first"

Read plan completely, check Issue for progress, read all referenced files (no limit/offset). Extract tasks from phases.

### Interview Checkpoint

Find and read the interview protocol using Glob:
- Pattern: `**/sdlc/**/skills/interview/SKILL.md`
- Search path: `~/.claude/plugins`

Execute the interview protocol with these overrides:
- Output to conversation context only — do not update files or write an Interview Insights section
- Focus on: task ordering preferences, testing approach, code style choices, areas where the plan leaves decisions open
- The topic for the interview is the plan's goals and requirements as parsed in the Plan Input step above

### Mode Selection

**If user requested swarm mode** (via `--swarm` flag): Execute the **Swarm Workflow** below.
**Otherwise**: Execute the **Standard Workflow** below.

---

## Standard Workflow

The default implementation approach uses sequential subagent-driven development with review gates.

### Subagent Workflow
You orchestrate; implementer agents execute. Per task:

1. **Dispatch implementer** (Task tool, `subagent_type: "implementer"`): task spec, TDD mode, context, files to reference. **When TDD mode is strict or soft**: Before dispatching, read TDD reference files via `Glob("**/tdd/references/*.md", path: "~/.claude/plugins")` and inject key excerpts into the implementer's Task prompt:
   - From `mocking.md`: boundary-only rule, system boundary definition, legacy compatibility clause
   - From `test-quality.md`: behavioral test criteria (WHAT not HOW, public interface, survives refactor)
   - From `interface-design.md`: DI principle (accept dependencies, don't create them)
   - Inject as literal text under a `TDD GUIDANCE:` section in the prompt. Do NOT include full files — extract the rules and one example each.
2. **Handle questions**: Answer from plan/context first, else AskUserQuestion
3. **Dispatch spec-reviewer** (`subagent_type: "spec-reviewer"`): original spec + implementation → verify nothing missing/extra, behavior matches
4. **Dispatch code-quality-reviewer** (`subagent_type: "code-quality-reviewer"`): changed files → check bugs/smells/security/anti-patterns
5. **Review loops**: Max 3 iterations. FAIL → re-dispatch implementer → re-review. After 3, escalate
6. **Mark complete**: Update todo list after both reviews pass

Trivial tasks (single-line): skip subagents, implement directly.

### Progress Tracking
Create todo list: phases (high-level), tasks (nested). Mark in_progress (dispatch) → completed (reviews pass).

After **phase**: `gh issue edit #123 --body "..."` to update checkboxes. Plan immutable; Issue tracks progress.

---

## Swarm Workflow

An alternative approach using agent teams for implementation that parallelizes independent tasks while preserving review gates. This works well when the plan has multiple independent tasks that don't touch the same files.

### Pre-flight (Same as Standard)

Pre-flight checks are identical to Standard Workflow:
- Rename session: `/rename "Implement: #$ARGUMENTS"` or `/rename "Implement: {plan-name}"`
- Check TDD Mode from CLAUDE.md (`tdd:` strict/soft/off)
- Check branch: `git branch --show-current`. If main, SlashCommand(/p:generate_branch)
- Parse plan reference and read plan completely
- Check Issue for progress
- Read all referenced files (no limit/offset)
- Extract tasks from phases

### Task Analysis and Clustering

After extracting tasks from plan, analyze for parallelization:

1. **Determine file overlap**: Use plan's "Files touched", "Relevant Files", or "Implementation Details" metadata to identify which files each task modifies
2. **Estimate if missing**: If a task doesn't list files, examine the task description to estimate which files will be modified before spawning teammates
3. **Identify independent clusters**: Tasks with no file overlap can run in parallel. Tasks that touch the same files must run sequentially.
4. **Dependency analysis**: Check for explicit dependencies (e.g., "Task B depends on Task A's interface"). Dependent tasks must run sequentially.

**Example**: If Task 1 touches `src/auth.ts` and Task 2 touches `src/profile.ts`, they can run in parallel. If Task 3 also touches `src/auth.ts`, it must run sequentially after Task 1.

### Team Prerequisites and Fallback

Attempt to create the agent team using `TeamCreate` with a unique timestamped name: `implement-{plan-kebab}-{YYYYMMDD-HHMMSS}` and description: "Implement: {plan name or issue #}".

If team creation fails (tool unavailable or experimental features disabled), inform the user that swarm mode requires agent teams to be enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json), then fall back to executing the Standard Workflow instead. The plan is already parsed and ready to use.

### Shared Task List

Create tasks via `TaskCreate` for all implementation tasks from the plan. Each task should include:
- Task name/description from plan
- Files to modify (from analysis above)
- Status: `pending`, `in_progress`, `completed`
- `blockedBy`: Array of task IDs if dependent on other tasks

Tasks marked `blockedBy` will not be claimed until blocking tasks complete. Independent tasks can be claimed immediately.

### Teammate Spawn Protocol

Spawn one teammate per independent task (tasks with no file overlap and no dependencies). Use the `Task` tool with `team_name` parameter and `subagent_type: "general-purpose"`.

Each teammate prompt MUST include as string literals (NOT references to conversation):

**Required Context in Each Spawn Prompt**:
```
You are implementing one task as part of an implementation team.

TASK SPEC:
{literal copy of task description from plan, including acceptance criteria}

TDD MODE: {strict|soft|off}
{If strict: "You MUST have a test before implementing. Follow Red-Green-Refactor."}
{If soft: "Warn if no test exists, but proceed with implementation."}
{If off: "No test requirement."}

FILES TO MODIFY:
{list of files this task touches, from plan or estimation}

RELEVANT FILE CONTENTS:
{read and include current contents of files to modify, plus any interfaces/types they depend on}

DEPENDENCIES/INTERFACES:
{any shared APIs, types, or contracts discovered by other teammates or from plan}

YOUR CONSTRAINTS:
- Edit only your assigned files — the lead coordinates commits and reviews to maintain atomic task boundaries. Editing other files would create merge conflicts with concurrent teammates.
- Don't run git, build, or test commands — other teammates are editing concurrently, and these operations would cause conflicts or interference.
- If blocked or uncertain, send "BLOCKED: {reason}" via SendMessage — the lead has full plan context and can answer or escalate to the user.
- Read files completely without limit/offset so you have full context for accurate implementation.
- If you discover file overlap at runtime that wasn't detected during analysis, signal lead immediately via SendMessage.

RUNTIME FILE OVERLAP DETECTION:
If you discover that a file you need to modify is being touched by another teammate (indicated by SendMessage from that teammate or conflicts), send:
"FILE OVERLAP DETECTED: {file path}. My task touches this file but {other teammate's task} also modifies it. Lead should serialize these tasks."

API/INTERFACE SHARING:
When you create or modify a public API, interface, or type that other teammates might depend on, share immediately via SendMessage:
"INTERFACE UPDATE: {description of API/type change with file:line reference}. This may affect other tasks."

COMPLETION PROTOCOL:
When implementation is complete:
1. Self-review across these dimensions (this is CRITICAL):
   - **Spec compliance**: Does implementation match every requirement in task spec?
   - **Scope discipline**: Is there ANY code not explicitly specified? Extra code = untested surface area.
   - **Basic health**: Does it compile/run without errors?
   - **Test validity** (if TDD mode): Does the test pass? If it fails, implementation is incomplete.
   - **Clarity**: Are there obvious bugs or typos?

2. If self-review fails: Fix issues and re-review. Do NOT signal completion until all checks pass.

3. When all checks pass:
   - Send "TASK COMPLETE: {task name}" via SendMessage
   - Wait for shutdown_request from lead

If blocked or uncertain, send "BLOCKED: {reason}" via SendMessage. Lead will answer from plan/context or escalate to user.
```

### Lead Orchestration

As team lead, you coordinate teammates and handle commits + review gates:

**Spawn independent tasks in parallel**: Launch teammates for all tasks that can run concurrently (no file overlap, no dependencies). Track which teammates are working on which tasks.

**Handle runtime file overlap**: If a teammate signals "FILE OVERLAP DETECTED", immediately serialize those tasks. Send shutdown_request to the newer teammate, wait for it to complete, then re-spawn it after the earlier task completes.

**Handle API/interface updates**: When a teammate shares "INTERFACE UPDATE", broadcast to other relevant teammates via SendMessage so they can incorporate the change.

**Answer questions**: When a teammate sends "BLOCKED", answer from plan/context if possible. If not, use AskUserQuestion to escalate to user, then relay answer to teammate.

**Stage and commit per task**: When a teammate signals "TASK COMPLETE":
1. Review their changed files for basic sanity (compiles, no obvious typos)
2. Stage the files they modified: `git add {specific files}`
3. Create atomic commit using conventional commit format:
   ```bash
   git commit -m "$(cat <<'EOF'
   feat: {task description}

   Implements task from {plan reference}
   EOF
   )"
   ```
4. Proceed to review gates (below)

**Review gates per task** (preserving existing two-stage review):
1. **Dispatch spec-reviewer** (`subagent_type: "spec-reviewer"`): original task spec + implementation → verify nothing missing/extra, behavior matches
2. **Dispatch code-quality-reviewer** (`subagent_type: "code-quality-reviewer"`): changed files → check bugs/smells/security/anti-patterns
3. **Review loops**: Max 3 iterations. If FAIL → re-dispatch implementer teammate with fixes → re-review. After 3 iterations, escalate to user.
4. **Mark complete**: After both reviews pass, update shared task list via TaskUpdate, update Issue checkboxes via `gh issue edit`

**Launch dependent tasks**: When a blocking task completes (passes reviews), check the task list for tasks that were `blockedBy` the completed task. If all blocking tasks are done, spawn a new teammate for the newly-unblocked task.

### Progress Tracking

Maintain the same todo list structure as Standard Workflow: phases (high-level), tasks (nested). Mark:
- `pending` → `in_progress` (teammate spawned)
- `in_progress` → `completed` (reviews pass)

After **phase** completes: `gh issue edit #123 --body "..."` to update checkboxes. Plan immutable; Issue tracks progress.

Display periodic status updates showing which tasks are in progress, which are blocked, and which are complete.

### Completion Protocol

Wait for all teammates to signal completion by sending "TASK COMPLETE" messages. Timeout: 10 minutes per teammate from spawn time.

**If timeout occurs**: Send shutdown_request to timed-out teammate, proceed with available work, note timeout in final output.

**Fallback behavior**: If a teammate fails or gets stuck (repeated similar messages, no progress), you have three options:
1. Note the failure, send shutdown_request, and handle that task yourself using Standard Workflow subagent approach
2. Spawn a replacement teammate with clearer scoped instructions
3. Escalate to user if critical

Choose based on how critical that task is and whether the blockage is resolvable.

### Resource Cleanup

After all tasks complete (or timeout), always clean up team resources:

Send shutdown requests to all teammates via `SendMessage` with `type: "shutdown_request"`, wait briefly for confirmations, then call `TeamDelete` to remove the team and its task list.

If cleanup itself fails, inform the user: "Team cleanup incomplete. You may need to check for lingering team resources."

Execute cleanup regardless of outcome—even if earlier steps errored or teammates timed out, cleanup must run before ending.

---

## Output

### Per Phase
Verify tasks complete, update Issue checkboxes, status update. Continue if multiple phases, else pause.

### Final
- Summary (bullets)
- Review iterations if any
- `git diff --stat`
- "Run `/review` for thorough analysis"

**Change walkthrough**: Find and read the walkthrough skill:
- Pattern: `**/sdlc/**/skills/agent-change-walkthrough/SKILL.md`
- Search path: `~/.claude/plugins`

Execute the walkthrough protocol across all tasks completed in this session. The topic is the full set of changes made: use `git diff HEAD~{n}` where `n` is the number of commits made this session (or `git diff {base-branch}...HEAD` if branch tracking is available).

**De-slop gate**: Run a lightweight check for AI artifacts introduced during implementation:

1. `uvx desloppify scan --path .` — capture the strict score
2. Report the score in the summary
3. If issues found, present a brief summary and ask: "Fix slop now or later?"
   - "Now": invoke the de-slop skill's iterative fix loop (`uvx desloppify next` → fix → repeat until clean), then re-scan to confirm score improved
   - "Later": record a note in the summary and end session
4. If `desloppify` is unavailable (command fails), skip this step silently

This gate is non-blocking — it never prevents session completion.

**Swarm mode additions**: When `--swarm` was used, include:
- Number of tasks parallelized vs serialized
- Any runtime file overlaps detected and resolved
- Teammate timeout/failure counts if any
- Total wall-clock time vs estimated sequential time (if measurable)

## Error Handling

**Stuck**: Answer from context or report blockage.

**Review loop not converging** (3 fails): Report last issues, offer options (try once more / skip / stop).

**Spec mismatch**: Report expected vs found vs why, then stop.

## Plan
$ARGUMENTS
