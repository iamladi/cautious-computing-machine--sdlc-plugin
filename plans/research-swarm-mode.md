---
title: "Add --swarm flag to /research and /research-deep commands"
type: Feature
issue: null
research: []
status: Ready for Implementation
reviewed: true
reviewers: ["codex", "gemini"]
created: 2026-02-07
---

# PRD: Add --swarm flag to /research and /research-deep commands

## Metadata
- **Type**: Feature
- **Priority**: High
- **Severity**: N/A
- **Estimated Complexity**: 5
- **Created**: 2026-02-07
- **Status**: Ready for Implementation

## Overview

### Problem Statement
The `/research` and `/research-deep` commands currently use subagents (Task tool) for parallel work. Subagents report results back to the caller but cannot communicate with each other. For complex research topics — especially codebase exploration with competing hypotheses or cross-cutting concerns — agent teams (TeamCreate + teammates) offer real advantages: teammates can share findings, challenge each other's conclusions, and self-coordinate via a shared task list.

Claude Code recently shipped experimental agent teams support. The `/research` command should expose this capability via a `--swarm` flag so users can opt into team-based parallel research when the topic warrants it.

### Goals & Objectives
1. Add `--swarm` flag to `/research` that spawns an agent team instead of subagents
2. Add `--swarm` flag to `/research-deep` that spawns an agent team for the Discovery phase and optionally for Analysis
3. Maintain backward compatibility — default (no flag) behavior unchanged
4. Produce the same output format (research document in `research/`) regardless of mode — swarm attribution goes in body sections, not in YAML frontmatter schema, so downstream consumers (`/plan`, `/implement`) are unaffected

### Success Metrics
- **Primary Metric**: `/research "topic" --swarm` creates a team, spawns teammates, and produces a valid research document
- **Secondary Metrics**: Teammates communicate findings to each other; shared task list tracks progress; team cleans up after completion
- **Quality Gates**: Existing `/research` without `--swarm` works identically to today

## User Stories

### Story 1: Swarm research for codebase exploration
- **As a**: developer using Claude Code
- **I want**: to run `/research "how auth works" --swarm`
- **So that**: multiple Claude teammates explore different parts of the auth system simultaneously, share findings with each other, and produce a comprehensive research document
- **Acceptance Criteria**:
  - [ ] Team created with appropriate name
  - [ ] 3 teammates spawned: locator, analyzer, pattern-finder
  - [ ] Teammates communicate findings via SendMessage
  - [ ] Lead synthesizes and produces `research/research-*.md`
  - [ ] Team cleans up after completion

### Story 2: Swarm deep research with multi-LLM
- **As a**: developer using Claude Code
- **I want**: to run `/research-deep "topic" --swarm`
- **So that**: the Discovery phase uses a team of Claude teammates for parallel exploration, and the Analysis phase still runs Claude + Gemini + Codex
- **Acceptance Criteria**:
  - [ ] Phase 1 (Discovery) uses agent team instead of subagents
  - [ ] Phase 2 (Analysis) runs 3 LLMs as today (unchanged)
  - [ ] Phase 3 (Synthesis) merges all findings
  - [ ] Output includes team attribution alongside LLM attribution

### Story 3: Default mode unchanged
- **As a**: developer using Claude Code
- **I want**: to run `/research "topic"` without `--swarm`
- **So that**: the command works exactly as it does today with subagents
- **Acceptance Criteria**:
  - [ ] No team created
  - [ ] Subagents spawned as before
  - [ ] Output format identical

## Requirements

### Functional Requirements
1. **FR-1**: Parse `--swarm` flag from `$ARGUMENTS` in both research commands
   - Details: Extract flag before passing remaining args as the research topic
   - Priority: Must Have

2. **FR-2**: When `--swarm` is active in `/research`, create a team and spawn 3+ teammates
   - Details: Use TeamCreate, then Task tool with team_name to spawn teammates for locator, analyzer, and pattern-finder roles
   - Priority: Must Have

3. **FR-3**: When `--swarm` is active in `/research-deep`, use team for Discovery phase
   - Details: Phase 1 spawns teammates via agent team; Phases 2-3 unchanged
   - Priority: Must Have

4. **FR-4**: Team lead coordinates work via shared task list
   - Details: Create tasks for each research aspect, teammates self-claim and complete
   - Priority: Must Have

5. **FR-5**: Teammates communicate findings to each other via SendMessage
   - Details: When a teammate discovers something relevant to another's task, it shares via DM
   - Priority: Should Have

6. **FR-6**: Lead synthesizes findings and produces standard output document
   - Details: Same `research/research-*.md` format with YAML frontmatter
   - Priority: Must Have

7. **FR-7**: Team cleanup after research completes (including error paths)
   - Details: Shut down all teammates, then TeamDelete. Must attempt cleanup on ALL exit paths — not just happy path. If synthesis fails or a teammate errors, still clean up.
   - Priority: Must Have

8. **FR-8**: Feature flag validation before team creation
   - Details: Before calling TeamCreate, verify the tool is available. If not, output a clear error: "Swarm mode requires agent teams. Set CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 in settings.json or environment." Then fall back to subagent mode.
   - Priority: Must Have

9. **FR-9**: Unique team names with timestamp suffix
   - Details: Use `research-{topic-kebab}-{timestamp}` to prevent collisions from concurrent runs or interrupted sessions
   - Priority: Must Have

### Non-Functional Requirements
1. **NFR-1**: Token efficiency
   - Requirement: Swarm mode uses more tokens but should not be wastefully redundant
   - Target: Each teammate gets a focused scope to minimize context overlap
   - Measurement: No teammate duplicates another's work

2. **NFR-2**: Graceful degradation with timeout
   - Requirement: If a teammate fails or goes unresponsive, the lead continues with available findings after a timeout
   - Target: Research document produced even if 1 of 3 teammates fails; 10-minute max wait per teammate
   - Measurement: Output includes attribution showing which teammates contributed and which timed out

### Technical Requirements
- **Stack**: Markdown command files (no code changes needed — this is prompt engineering)
- **Dependencies**: Claude Code experimental agent teams feature (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
- **Architecture**: Command markdown files instruct the lead session on when/how to use TeamCreate, Task tool with team_name, SendMessage, TaskCreate/TaskUpdate, and TeamDelete
- **Data Model**: No data model changes
- **API Contracts**: No API changes — uses existing Claude Code tools

## Scope

### In Scope
- Modifying `commands/research.md` to support `--swarm` flag
- Modifying `commands/research-deep.md` to support `--swarm` flag
- Defining teammate roles and spawn prompts within the command markdown
- Team lifecycle: create → spawn → coordinate → synthesize → cleanup
- Updating `examples/research-examples.md` with swarm examples

### Out of Scope
- Creating new agent markdown files (teammates are spawned via Task tool with inline prompts)
- Modifying existing agents (codebase-locator, codebase-analyzer, etc.)
- Adding web research teammates (web-search-researcher stays as subagent)
- Split-pane / tmux display configuration
- Permission management beyond lead defaults

### Future Considerations
- `--swarm-size N` to control number of teammates
- Competing-hypotheses mode where teammates challenge each other's findings
- Persistent research teams that can be resumed across sessions

## Impact Analysis

### Affected Areas
- `commands/research.md` — adds swarm branch
- `commands/research-deep.md` — adds swarm branch for Discovery phase
- `examples/research-examples.md` — new examples

### Users Affected
- All users of `/research` and `/research-deep` commands (opt-in only via `--swarm`)

### System Impact
- **Performance**: Higher token usage when `--swarm` is active (multiple teammate sessions)
- **Security**: No change — teammates inherit lead permissions
- **Data Integrity**: No change — same output format

### Dependencies
- **Upstream**: Claude Code agent teams feature must be enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
- **Downstream**: Research output consumed by `/plan`, `/implement` commands — unchanged
- **External**: None

### Breaking Changes
- [x] **None** — `--swarm` is opt-in, default behavior unchanged

## Solution Design

### Approach

The solution is entirely prompt-based. The `/research` and `/research-deep` command markdown files will be modified to:

1. **Parse `--swarm`** from `$ARGUMENTS` at the start (standalone token, not inside quotes)
2. **Validate prerequisites**: Attempt TeamCreate — if tool unavailable, print error with env var instructions and fall back to subagent mode
3. **Branch on flag**: if `--swarm` and validation passes, use agent team workflow; else, use existing subagent workflow
4. **Agent team workflow** (for `/research --swarm`):
   - TeamCreate with name `research-{topic-kebab}-{YYYYMMDD-HHMMSS}` (unique per run)
   - TaskCreate for each research aspect (locate files, analyze implementation, find patterns)
   - Spawn 3 teammates via Task tool with `team_name` and `subagent_type: "general-purpose"`:
     - **Locator**: focuses on finding relevant files and directories
     - **Analyzer**: focuses on understanding implementation details
     - **Pattern Finder**: focuses on identifying patterns and conventions
   - Each teammate gets a detailed spawn prompt with: research question, specific role, instruction to send "RESEARCH COMPLETE" message when done
   - Teammates work through tasks, communicate findings via SendMessage
   - Lead waits for all 3 "RESEARCH COMPLETE" signals OR 10-minute timeout, then proceeds with available findings
   - If web research was explicitly requested, run web-search-researcher as a subagent (not a teammate) in parallel with team work
   - **Synthesis**: Lead collects all teammate findings and produces standard output
   - **Cleanup (always)**: Shutdown all teammates → TeamDelete. This runs on ALL exit paths including errors.
5. **Agent team workflow** (for `/research-deep --swarm`):
   - Same as step 4 for Phase 1 (Discovery), except:
   - Lead must write team findings to `context.md` file BEFORE starting Phase 2, so LLM analysis has access to raw data
   - Phase 2 (Analysis) unchanged — still runs Claude + Gemini + Codex using `context.md`
   - Phase 3 (Synthesis) merges team findings + LLM analyses
   - **Cleanup (always)**: Same as step 4

<!-- Addressed: Team name collisions (Consensus), Feature flag validation (Consensus), Completion protocol (Consensus), Cleanup on error paths (Codex), Context passing for deep research (Gemini), Web research subagent interaction (Codex) -->

### Alternatives Considered

1. **Alternative 1**: Create dedicated agent .md files for each teammate role
   - Pros: Reusable, testable in isolation
   - Cons: Agent .md files are for subagents (Task tool), not teammates; teammates are spawned with inline prompts via Task tool with team_name
   - Why rejected: Agent teams use Task tool spawning with team context, not standalone agent files

2. **Alternative 2**: Replace subagent approach entirely with teams
   - Pros: Simpler — one code path
   - Cons: Teams are experimental, use more tokens, require env var setup
   - Why rejected: Backward compatibility; teams aren't always better than subagents

3. **Alternative 3**: Create a separate `/research-swarm` command
   - Pros: Clean separation, no conditional logic in existing commands
   - Cons: Command proliferation, harder to maintain
   - Why rejected: Flag-based approach is cleaner and more discoverable

### Data Model Changes
None.

### API Changes
None.

### UI/UX Changes
New flag `--swarm` recognized in command arguments. No visual changes.

## Implementation Plan

### Phase 1: Modify `/research` command
**Complexity**: 5 | **Priority**: High

- [ ] Add `--swarm` flag parsing to `commands/research.md`
- [ ] Add feature flag validation: check TeamCreate availability, error with env var instructions if missing
- [ ] Add conditional branch: if `--swarm` and validated, execute team workflow; else existing flow
- [ ] Define team creation block: TeamCreate with unique timestamped name
- [ ] Define 3 teammate spawn prompts with focused roles, explicit "RESEARCH COMPLETE" signal instruction
- [ ] Add task creation for each research aspect
- [ ] Add completion protocol: wait for 3 completion signals OR 10-minute timeout
- [ ] Clarify web-search-researcher: runs as subagent alongside team if explicitly requested
- [ ] Add synthesis step: lead collects findings, produces standard output (same format, attribution in body not frontmatter)
- [ ] Add always-run cleanup block: shutdown teammates → TeamDelete (runs on success AND error)

### Phase 2: Modify `/research-deep` command
**Complexity**: 4 | **Priority**: High

- [ ] Add `--swarm` flag parsing to `commands/research-deep.md`
- [ ] Add feature flag validation (same as Phase 1)
- [ ] Modify Phase 1 (Discovery) to use team when `--swarm` active
- [ ] Add explicit step: Lead writes team Discovery findings to `context.md` before starting Phase 2
- [ ] Keep Phase 2 (Analysis) unchanged — reads from `context.md` as today
- [ ] Adjust Phase 3 (Synthesis) to include team attribution alongside LLM attribution
- [ ] Add always-run cleanup block

### Phase 3: Update examples and documentation
**Complexity**: 1 | **Priority**: Medium

- [ ] Add swarm examples to `examples/research-examples.md`
- [ ] Document `--swarm` flag usage and prerequisites (env var)

### Phase 4: Manual testing
**Complexity**: 2 | **Priority**: High

- [ ] Test `/research "topic"` without `--swarm` (regression)
- [ ] Test `/research "topic" --swarm` (new feature)
- [ ] Test `/research-deep "topic"` without `--swarm` (regression)
- [ ] Test `/research-deep "topic" --swarm` (new feature)
- [ ] Verify team cleanup after completion

## Relevant Files

### Existing Files
- `commands/research.md` — Main research command to modify
- `commands/research-deep.md` — Deep research command to modify
- `examples/research-examples.md` — Examples to update
- `agents/research-synthesizer.md` — Synthesizer agent (used by lead in both modes)
- `agents/codebase-locator.md` — Reference for locator role prompt
- `agents/codebase-analyzer.md` — Reference for analyzer role prompt
- `agents/codebase-pattern-finder.md` — Reference for pattern-finder role prompt
- `agents/web-search-researcher.md` — Web research agent (unchanged, subagent only)

### New Files
None.

### Test Files
None (markdown-based commands; tested manually).

## Testing Strategy

### Unit Tests
N/A — prompt-based changes, no code to unit test.

### Integration Tests
N/A — tested via manual invocation in Claude Code.

### E2E Tests
N/A.

### Manual Test Cases
1. **Test Case: /research without --swarm (regression)**
   - Steps: Run `/research "how does authentication work in this codebase"`
   - Expected: Subagents spawned, research document produced, no team created

2. **Test Case: /research with --swarm**
   - Steps: Run `/research "how does authentication work in this codebase" --swarm`
   - Expected: Team created, 3 teammates spawned, teammates communicate, research document produced, team cleaned up

3. **Test Case: /research-deep without --swarm (regression)**
   - Steps: Run `/research-deep "how does authentication work"`
   - Expected: 3-phase flow unchanged, research document produced

4. **Test Case: /research-deep with --swarm**
   - Steps: Run `/research-deep "how does authentication work" --swarm`
   - Expected: Phase 1 uses team, Phase 2 uses LLMs, Phase 3 synthesizes all, document produced

5. **Test Case: --swarm without agent teams enabled**
   - Steps: Unset `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`, run `/research "topic" --swarm`
   - Expected: Clear error message with env var instructions, falls back to subagent mode

6. **Test Case: Teammate timeout**
   - Steps: Run `/research "topic" --swarm` on a complex topic; observe if one teammate takes too long
   - Expected: Lead proceeds after timeout with available findings, document notes which teammates contributed

7. **Test Case: Team cleanup on interruption**
   - Steps: Run `/research "topic" --swarm`, observe team cleanup
   - Expected: All teammates shut down, TeamDelete called; if manual interruption, user can clean up with `tmux ls`

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Agent teams feature disabled by default | High | High | FR-8: Validate before TeamCreate, error with env var instructions, fall back to subagents |
| Team name collision from concurrent/interrupted runs | Medium | High | FR-9: Timestamp suffix ensures uniqueness |
| Teammates fail to signal completion | Medium | Medium | Completion protocol with 10-minute timeout; proceed with available findings |
| Team cleanup doesn't complete (error/interruption) | Medium | Medium | Always-run cleanup block on all exit paths; document manual cleanup via `tmux ls` |
| Teammates fail to communicate effectively | Medium | Medium | Detailed spawn prompts with explicit communication instructions |
| Token usage much higher than expected | Medium | Low | Each teammate has focused scope; document token cost tradeoff |

### Business Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Users confused by two modes | Low | Low | Clear documentation and examples |

### Mitigation Strategy
The `--swarm` flag is entirely opt-in with clear documentation. If agent teams are not enabled, the command should detect this and inform the user to set `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

## Rollback Strategy

### Rollback Steps
1. Revert changes to `commands/research.md`
2. Revert changes to `commands/research-deep.md`
3. Revert changes to `examples/research-examples.md`

### Rollback Conditions
- Agent teams feature becomes unstable or is removed from Claude Code
- Teammate coordination causes research quality to degrade vs subagent approach

## Validation Commands

```bash
# Validate plugin structure
cd /Users/iamladi/Projects/claude-code-plugins/sdlc-plugin && bun run validate

# Verify research.md has --swarm handling
grep -q "swarm" commands/research.md && echo "PASS: research.md has swarm" || echo "FAIL"

# Verify research-deep.md has --swarm handling
grep -q "swarm" commands/research-deep.md && echo "PASS: research-deep.md has swarm" || echo "FAIL"

# Manual: test /research "topic" (regression)
# Manual: test /research "topic" --swarm
# Manual: test /research-deep "topic" (regression)
# Manual: test /research-deep "topic" --swarm
```

## Acceptance Criteria

- [ ] `/research "topic"` without `--swarm` works identically to today
- [ ] `/research "topic" --swarm` creates agent team, spawns 3 teammates, produces research document
- [ ] `/research-deep "topic"` without `--swarm` works identically to today
- [ ] `/research-deep "topic" --swarm` uses team for Discovery, LLMs for Analysis, synthesizes all
- [ ] Teammates communicate findings to each other during swarm research
- [ ] Team is cleaned up (shutdown + delete) after research completes
- [ ] Output documents have same format/frontmatter as non-swarm mode
- [ ] Plugin validates successfully with `bun run validate`
- [ ] Examples updated in `examples/research-examples.md`

## Dependencies

### New Dependencies
None — uses built-in Claude Code agent team tools (TeamCreate, SendMessage, TaskCreate, etc.)

### Dependency Updates
None.

## Notes & Context

### Additional Context
- Agent teams are experimental in Claude Code. Users must set `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json or environment.
- Teammate spawning uses the Task tool with `team_name` parameter — this is how teammates join a team.
- The `subagent_type: "general-purpose"` gives teammates full tool access (Read, Write, Edit, Bash, Glob, Grep, etc.).
- Each teammate loads project CLAUDE.md and MCP servers automatically, but does NOT inherit the lead's conversation history.
- Source documentation: https://code.claude.com/docs/en/agent-teams

### Assumptions
- Agent teams feature API is stable enough for production use in a plugin
- TeamCreate, SendMessage, TaskCreate/TaskUpdate/TaskList, TeamDelete tools are available when the feature flag is set
- Teammates can use the same agents (codebase-locator, etc.) as subagents — they just need the right tools

### Constraints
- No new dependencies or code files — this is purely prompt engineering in markdown command files
- Must not break existing non-swarm behavior
- Team names must be unique; use topic-derived names with timestamp suffix

### Related Tasks/Issues
- None currently

### References
- Agent Teams documentation: https://code.claude.com/docs/en/agent-teams
- Subagents documentation: https://code.claude.com/docs/en/sub-agents

### Open Questions
- [x] How should --swarm interact with /research vs /research-deep? → Add to both commands
- [ ] Should we add `--swarm-size N` to control teammate count? → Deferred to future

## Blindspot Review

**Reviewers**: GPT-5.2-Codex (xhigh), Gemini 3 Pro
**Date**: 2026-02-07
**Plan Readiness**: Ready

### Addressed Concerns
- [Consensus] Team name collisions from concurrent/interrupted runs → FR-9: timestamp suffix for unique names
- [Consensus] Missing feature flag validation → FR-8: validate TeamCreate availability, error with instructions, fall back to subagents
- [Consensus] No timeout/completion protocol for teammates → NFR-2 updated with 10-minute timeout; Solution Design adds "RESEARCH COMPLETE" signal protocol
- [Codex] Cleanup only on happy path → FR-7 updated to always-run cleanup on ALL exit paths; Solution Design cleanup step marked as "always"
- [Codex] Web research subagent interaction undefined in swarm mode → Solution Design clarifies: web-search-researcher runs as subagent (not teammate) alongside team if explicitly requested
- [Gemini] Context passing: Phase 2 of deep research needs Phase 1 team findings → Solution Design adds explicit "write to context.md before Phase 2" step
- [Codex] Output format vs attribution conflict → Goal #4 clarified: attribution in body not frontmatter, downstream consumers unaffected
- [Codex, Low] Testing gaps for failure scenarios → 3 failure-mode test cases added (env var missing, timeout, interruption)
- [Codex] Phase sync in /research-deep → Phase 2 implementation updated with explicit "wait for team + write context.md" step

### Acknowledged but Deferred
- [Codex, Medium] Flag parsing edge cases (--swarm inside quotes, etc.) → Low real-world risk for prompt-based parsing; defer to future if users report issues
- [Gemini, Medium] Token cost warning/confirmation prompt → User explicitly opts in with --swarm; adding confirmation adds friction for power users; defer

### Dismissed
- [Codex, Medium] Unspecified dependency on TaskCreate/TaskUpdate availability → These are core Claude Code tools available in all sessions; no special gating needed beyond agent teams feature flag
