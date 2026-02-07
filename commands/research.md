# Research & Document Codebase

## Session Naming

`/rename "Research: $ARGUMENTS"` (or infer from context)

## Priorities

Precision (file:line refs) > Completeness (trace full paths) > Concision

## Goal

Research and document the codebase to answer the given question. Produce a standalone research document in `research/` with findings backed by file:line references.

## Constraints

Read documentarian constraints (Glob `**/sdlc/**/references/documentarian-constraints.md`, path `/Users/iamladi/Projects/claude-code-plugins`). YOUR ONLY JOB IS TO DOCUMENT AND EXPLAIN THE CODEBASE AS IT EXISTS TODAY. DO NOT suggest improvements or changes unless explicitly requested. Document what IS, not what SHOULD BE.

### Argument Parsing

Parse `$ARGUMENTS` for flags before processing:
1. Check if `--swarm` appears as a standalone token (not inside quotes)
2. If found: set `SWARM_MODE=true`, remove all `--swarm` tokens from the argument string
3. The remaining text (trimmed) is the research topic
4. If the topic is empty after removing `--swarm`: prompt the user "Please provide a research question." and stop

### Mode Selection

**If `SWARM_MODE=true`**: Execute the **Swarm Workflow** below.
**Otherwise**: Execute the **Standard Workflow** below.

---

## Standard Workflow

The default research flow using subagents.

- Read user-mentioned files FULLY (no limit/offset) before spawning sub-agents
- Spawn parallel agents: codebase-locator, codebase-analyzer, codebase-pattern-finder
- Wait for ALL agents before synthesizing
- Web research only if explicitly requested (use web-search-researcher)
- All findings require file:line references
- Prioritize live codebase over existing docs

---

## Swarm Workflow

Agent team-based parallel research using Claude Code's experimental agent teams.

### Step 1: Create Team (validates prerequisites)

Create the agent team with a unique timestamped name. This also validates that agent teams are available:
- Team name: `research-{topic-kebab}-{YYYYMMDD-HHMMSS}` (e.g., `research-auth-flow-20260207-143052`)
- Call `TeamCreate` with this name and description: "Research: {topic}"
- **If TeamCreate fails or the tool is unavailable**: Output this error message and execute the Standard Workflow instead (topic is already parsed with `--swarm` removed):
  ```
  Swarm mode requires agent teams. Set CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 in settings.json or environment.
  Falling back to standard subagent mode.
  ```

### Step 2: Read Context

- Read user-mentioned files FULLY (no limit/offset) before spawning teammates
- Summarize the research question and any referenced files — this context will be embedded in teammate spawn prompts

### Step 3: Create Research Tasks

Use `TaskCreate` to create tasks for the shared task list:
1. **Locate relevant files** — Find all files, directories, and components related to the research topic
2. **Analyze implementation details** — Trace data flow, understand how components interact, document with file:line refs
3. **Find patterns and conventions** — Identify reusable patterns, similar implementations, and coding conventions

### Step 4: Spawn Teammates

Spawn 3 teammates via the `Task` tool with `team_name` parameter and `subagent_type: "general-purpose"`:

**Teammate 1: Locator**
```
You are a codebase locator on a research team investigating: "{topic}"

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
You are a codebase analyzer on a research team investigating: "{topic}"

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
You are a codebase pattern finder on a research team investigating: "{topic}"

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

### Step 5: Web Research (if requested)

If the user explicitly requested web research, spawn a `web-search-researcher` subagent (NOT a teammate) in parallel with the team work. This runs alongside the team, not as part of it.

### Step 6: Wait for Completion

Wait for all 3 teammates to send "RESEARCH COMPLETE" messages. Timeout: 10 minutes from when each teammate was spawned (so max 10 minutes wall clock, not 30 cumulative). Also wait for the web-search-researcher subagent if one was spawned in Step 5.

- If all complete: proceed with all findings
- If any teammate times out: proceed with available findings, note which teammates timed out in the output
- If web researcher is still running when teammates finish: wait up to 2 more minutes, then proceed without it

### Step 7: Synthesize Findings

As team lead, collect all teammate findings and produce the research document:
- Merge findings from all teammates (and web research if applicable)
- Use team attribution in body sections: `[Locator]`, `[Analyzer]`, `[Pattern Finder]`, `[Consensus]` for findings confirmed by multiple teammates
- Identify consensus findings (mentioned by 2+ teammates) vs unique discoveries
- All file:line references preserved from all sources
- Output format is identical to Standard Workflow (same frontmatter schema, same sections)

### Step 8: Cleanup (ALWAYS runs)

**CRITICAL: Execute this step regardless of outcome. Whether Step 7 succeeded, failed, or any earlier step errored — ALWAYS run cleanup before ending.**

1. Send shutdown requests to all teammates via `SendMessage` with `type: "shutdown_request"`
2. Wait briefly for shutdown confirmations
3. Call `TeamDelete` to remove the team and its task list

If cleanup itself fails, inform the user: "Team cleanup incomplete. You may need to check for lingering team resources."

---

## Output

Save to `research/research-[topic-kebab-case].md` with YAML frontmatter (date, git_commit, branch, repository, topic, tags, status, last_updated, last_updated_by).

Required sections: Research Question → Summary → Detailed Findings (with file:line) → Code References → Architecture Documentation → Related Research → Open Questions.

Add GitHub permalinks if on pushed branch: `https://github.com/{owner}/{repo}/blob/{commit}/{file}#L{line}`

For follow-ups: append to same doc, update frontmatter, add `## Follow-up Research [timestamp]`.

**Swarm mode additions**: When `--swarm` was used, add to the Summary section a brief note on team composition and which teammates contributed. Attribution markers go in body sections, NOT in YAML frontmatter.

## References

- `**/sdlc/**/references/documentarian-constraints.md` — Documentarian role boundaries

## Idea

$ARGUMENTS

## Report

If no idea: "I'm ready to research the codebase. Please provide your research question."

After completion: summary of findings, path to research document.
