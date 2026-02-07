# Multi-LLM Deep Research

## Session Naming

Before starting, rename this session:
- If `$ARGUMENTS` provided: `/rename "Deep Research: $ARGUMENTS"`
- Otherwise wait for topic, then `/rename "Deep Research: {topic}"`

## Priorities

Depth (multi-perspective) > Accuracy (consensus validation) > Concision

## Goal

Execute 3-phase multi-LLM research (Discovery → Analysis → Synthesis) on a codebase topic, producing a comprehensive document with LLM attribution markers showing which findings came from Claude, Gemini, and/or Codex.

## Argument Parsing

Parse `$ARGUMENTS` for flags before processing:
1. Check if `--swarm` appears as a standalone token (not inside quotes)
2. If found: set `SWARM_MODE=true`, remove all `--swarm` tokens from the argument string
3. The remaining text (trimmed) is the research topic
4. If the topic is empty after removing `--swarm`: prompt the user "Please provide a research question." and stop

## Constraints

### Phase 1: Discovery

**If `SWARM_MODE=true`**: Use the **Swarm Discovery** workflow below.
**Otherwise**: Use the **Standard Discovery** workflow below.

#### Standard Discovery (Claude only)
- Read any user-mentioned files first
- Create `research/.deep-research-$(date +%Y%m%d-%H%M%S)/`
- Spawn one discovery agent using codebase-locator, codebase-analyzer, and codebase-pattern-finder
- Target <50K characters for CLI compatibility
- Save to `context.md`

#### Swarm Discovery (Agent Team)

**IMPORTANT: Steps 6 and 7 below are mandatory. If any step before Step 7 fails (including Step 6), you MUST still execute Step 7 (Cleanup Team) before proceeding to Phase 2 or reporting the error.**

##### Step 1: Create Team (validates prerequisites)

Create the agent team with a unique timestamped name. This also validates that agent teams are available:
- Team name: `research-deep-{topic-kebab}-{YYYYMMDD-HHMMSS}` (e.g., `research-deep-auth-flow-20260207-143052`)
- Call `TeamCreate` with this name and description: "Deep Research Discovery: {topic}"
- **If TeamCreate fails or the tool is unavailable**: Output this error message and execute the Standard Discovery workflow instead (topic is already parsed with `--swarm` removed):
  ```
  Swarm mode requires agent teams. Set CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 in settings.json or environment.
  Falling back to standard discovery mode.
  ```

##### Step 2: Create Working Directory

- Create `research/.deep-research-$(date +%Y%m%d-%H%M%S)/`
- Read any user-mentioned files FULLY (no limit/offset) before spawning teammates

##### Step 3: Create Research Tasks

Use `TaskCreate` to create tasks for the shared task list:
1. **Locate relevant files** — Find all files, directories, and components related to the research topic
2. **Analyze implementation details** — Trace data flow, understand how components interact, document with file:line refs
3. **Find patterns and conventions** — Identify reusable patterns, similar implementations, and coding conventions

##### Step 4: Spawn Teammates

Spawn 3 teammates via the `Task` tool with `team_name` parameter and `subagent_type: "general-purpose"`:

**Teammate 1: Locator**
```
You are a codebase locator on a deep research team investigating: "{topic}"

Your role: Find ALL files, directories, and components relevant to this topic.

Instructions:
1. Check TaskList for your assigned task
2. Use Glob and Grep to search with multiple naming patterns and extensions
3. Categorize findings: Implementation Files, Test Files, Configuration, Type Definitions, Documentation
4. Include directory counts ("Contains X files")
5. Share important discoveries with teammates via SendMessage — especially if you find files that the Analyzer or Pattern Finder should examine
6. When done, update your task via TaskUpdate (mark completed)
7. Send a message to the team lead: "RESEARCH COMPLETE"

Do NOT read file contents in depth — focus on locating and categorizing.
All findings must include full file paths.
```

**Teammate 2: Analyzer**
```
You are a codebase analyzer on a deep research team investigating: "{topic}"

Your role: Analyze implementation details, trace data flow, and document how components interact.

Instructions:
1. Check TaskList for your assigned task
2. Read files thoroughly before making statements
3. Trace actual code paths — don't assume
4. Include file:line references for ALL claims
5. Focus on "how" it works: entry points, core logic, data flow, error handling
6. Share important discoveries with teammates via SendMessage — especially patterns you notice (for Pattern Finder) or files that need locating (for Locator)
7. When done, update your task via TaskUpdate (mark completed)
8. Send a message to the team lead: "RESEARCH COMPLETE"

Document: Entry Points, Core Implementation, Data Flow, Key Patterns, Configuration, Error Handling.
```

**Teammate 3: Pattern Finder**
```
You are a codebase pattern finder on a deep research team investigating: "{topic}"

Your role: Find similar implementations, usage examples, and existing patterns that illuminate the topic.

Instructions:
1. Check TaskList for your assigned task
2. Show working code examples, not just snippets
3. Include file:line references for all code examples
4. Show multiple variations when they exist
5. Categorize: API patterns, Data patterns, Component patterns, Testing patterns
6. Share important discoveries with teammates via SendMessage — especially if you find patterns the Analyzer should trace or files the Locator missed
7. When done, update your task via TaskUpdate (mark completed)
8. Send a message to the team lead: "RESEARCH COMPLETE"

Include test patterns alongside implementation patterns where they exist.
```

##### Step 4b: Web Research (if applicable)

If the user's topic explicitly requests web research (e.g., "latest best practices for..." or "current industry standards for..."), spawn `web-search-researcher` as a subagent (NOT a teammate) in parallel with the team. Use the Task tool WITHOUT the `team_name` parameter. Include its findings when writing `context.md` in Step 6.

##### Step 5: Wait for Completion

Wait for all 3 teammates to send "RESEARCH COMPLETE" messages. Timeout: 10 minutes from when each teammate was spawned (so max 10 minutes wall clock, not 30 cumulative). Also wait for the web-search-researcher subagent if one was spawned in Step 4b.

- If all complete: proceed with all findings
- If any teammate times out: proceed with available findings, note which teammates timed out
- If web researcher is still running when teammates finish: wait up to 2 more minutes, then proceed without it

##### Step 6: Write context.md

**CRITICAL: This step must complete BEFORE starting Phase 2.** Phase 2 LLMs read from `context.md`.

Collect all teammate findings and write them to `context.md` in the working directory:
- Merge findings from all teammates into a single discovery document
- Target <50K characters for CLI compatibility (same as Standard Discovery)
- Include team attribution: `[Locator]`, `[Analyzer]`, `[Pattern Finder]` alongside findings
- All file:line references preserved

##### Step 7: Cleanup Team

**CRITICAL: Execute this step regardless of outcome. Whether Step 6 succeeded or failed — ALWAYS clean up before proceeding to Phase 2.**

1. Send shutdown requests to all teammates via `SendMessage` with `type: "shutdown_request"`
2. Wait briefly for shutdown confirmations
3. Call `TeamDelete` to remove the team and its task list

If cleanup itself fails, inform the user but continue to Phase 2: "Team cleanup incomplete. You may need to check for lingering team resources."

---

### Phase 2: Analysis (3 LLMs in parallel)

This phase is **unchanged** regardless of `--swarm` flag. It always reads from `context.md`.

- Embed `context.md` in analysis prompts
- Launch simultaneously: Claude (Task agent), Gemini CLI (background), Codex CLI (background)
- 10-minute timeout per external LLM
- Graceful degradation: continue with successful analyses (minimum: Claude)
- Save each to `{llm}-analysis.md`

### Phase 3: Synthesis

- Spawn research-synthesizer agent to merge analyses
- Use LLM attribution: `[Consensus: 3/3]`, `[Consensus: 2/3]`, `[Claude]`, `[Gemini]`, `[Codex]`
- **If `SWARM_MODE` was active**: Also include team attribution alongside LLM attribution. In the synthesis document, note that Discovery used an agent team and which teammates contributed. Team attribution (`[Locator]`, `[Analyzer]`, `[Pattern Finder]`) appears in the Discovery findings sections; LLM attribution appears in the Analysis sections.
- Save to `research/research-{topic-kebab-case}-deep.md` with YAML frontmatter
- Add GitHub permalinks if applicable
- Report which LLMs contributed and highlight consensus vs unique discoveries

**Storage structure:**
```
research/.deep-research-[timestamp]/
├── context.md          # Discovery output (from subagents OR team)
├── claude-analysis.md  # Claude's analysis
├── gemini-analysis.md  # Gemini's analysis
└── codex-analysis.md   # Codex's analysis
```

## References

Load documentarian constraints via:
- `Glob(pattern: "**/sdlc/**/references/documentarian-constraints.md", path: "~/.claude/plugins")` → Read result

Fallback if file not found: Document codebase as it exists. Do not suggest improvements, propose enhancements, or critique implementation.

## Topic

$ARGUMENTS
