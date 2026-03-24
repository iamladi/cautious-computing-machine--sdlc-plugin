# Multi-LLM Deep Research

## Session Naming

Before starting, rename this session:
- If `$ARGUMENTS` provided: `/rename "Deep Research: $ARGUMENTS"`
- Otherwise wait for topic, then `/rename "Deep Research: {topic}"`

## Priorities

Depth (multi-perspective) > Accuracy (consensus validation) > Concision

## Goal

Execute 4-phase multi-LLM research (Discovery → Independent Analysis → Cross-Pollination Refinement → Synthesis) on a codebase topic, producing a comprehensive document with LLM attribution markers showing which findings came from Claude, Gemini, and/or Codex.

## CRITICAL: Parse Flags and Route

BEFORE doing anything else, parse `$ARGUMENTS` for flags:
1. Check if `--swarm` appears as a standalone token (not inside quotes)
2. If found: set `SWARM_MODE=true`, remove all `--swarm` tokens from the argument string
3. The remaining text (trimmed) is the research topic
4. If the topic is empty after removing `--swarm`: prompt the user "Please provide a research question." and stop

## Constraints

### Phase 1: Discovery

If `SWARM_MODE=true`: skip directly to **Swarm Discovery** below. Do NOT execute Standard Discovery.
If `SWARM_MODE` is not set: skip directly to **Standard Discovery** below. Do NOT execute Swarm Discovery.

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

##### Step 4b: Web Research

Spawn `web-search-researcher` as a subagent (NOT a teammate) in parallel with the team. Use the Task tool WITHOUT the `team_name` parameter. Include its findings when writing `context.md` in Step 6 as a concise summary (max 500 words) to avoid exceeding Phase 2 LLM context budgets. If web search fails or returns no results, proceed with codebase-only findings.

##### Step 5: Wait for Completion

Wait for all 3 teammates to send "RESEARCH COMPLETE" messages. Timeout: 10 minutes from when each teammate was spawned (so max 10 minutes wall clock, not 30 cumulative). Also wait for the web-search-researcher subagent spawned in Step 4b.

- If all complete: proceed with all findings
- If any teammate times out: proceed with available findings, note which teammates timed out
- If web researcher is still running when teammates finish: wait up to 2 more minutes, then proceed without it. Web research is supplementary — it always runs but never blocks command completion.

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

#### Standard Discovery (Claude only)

- Read any user-mentioned files first
- Create `research/.deep-research-$(date +%Y%m%d-%H%M%S)/`
- Spawn one discovery agent using codebase-locator, codebase-analyzer, and codebase-pattern-finder
- Spawn `web-search-researcher` subagent in parallel with codebase discovery agents. If web search is still running when codebase discovery completes, wait up to 2 additional minutes before proceeding without it.
- Target <50K characters for CLI compatibility
- Merge web search findings into `context.md` as a concise summary (max 500 words) to avoid exceeding Phase 2 LLM context budgets. If web search fails or returns no results, proceed with codebase-only findings.
- Save to `context.md`

---

### Phase 2: Independent Analysis (3 LLMs in parallel)

#### Model Resolution

Before launching LLMs, load the model registry:
- `Glob(pattern: "**/sdlc/**/config/model-registry.md", path: "~/.claude/plugins")` → Read result
- Use `gemini-flagship` and `codex-flagship` from the registry in the commands below.

This phase is **unchanged** regardless of `--swarm` flag. It always reads from `context.md`.

Each LLM gets `context.md` embedded in its prompt plus enhanced instructions for independent, thorough research.

#### Analysis Prompt Guidelines

Each LLM's analysis prompt MUST include these instructions:
- **Breadth first, depth second**: Identify ALL subtopics and angles before deep-diving into any single area
- **"Use web search EXTENSIVELY — do NOT rely solely on your training data"**
- **Iterative research**: Continue researching until genuinely done, then append `<!-- RESEARCH_COMPLETE -->` as a completion signal
- **Gap identification**: On each continuation, explicitly identify what's MISSING from the analysis so far before adding new content

#### Concrete Invocations

Launch all three simultaneously:

- **Claude**: Task agent with `max_turns: 50` and `subagent_type: "general-purpose"`. Prompt includes: "When your research is genuinely complete — all subtopics covered, sources verified, gaps addressed — append `<!-- RESEARCH_COMPLETE -->` at the end of your output."
- **Gemini**: `timeout 600 gemini -m <gemini-flagship from registry> --approval-mode yolo` with the research prompt piped to stdin via Bash (background)
- **Codex**: `echo "<prompt>" | codex exec --skip-git-repo-check -m <codex-flagship from registry> --reasoning-effort xhigh --full-auto 2>/dev/null` via Bash (background)

Save outputs to `{llm}-analysis.md`. 10-minute timeout per external LLM. Graceful degradation: continue with successful analyses (minimum: Claude).

#### Fatal Error Detection

After launching Gemini and Codex in background, poll their output every 10 seconds. If logs contain fatal patterns matching `quota.*exhausted|rate.?limit|unauthorized|authentication failed|API key.*(invalid|expired)`, kill the agent proactively rather than waiting for the full timeout. Log the detected pattern and continue with remaining LLMs.

---

### Phase 3: Cross-Pollination Refinement (NEW)

After all Phase 2 analyses are saved, launch a refinement round where each surviving LLM reads ALL analyses (its own + peers') and produces a refined version.

#### Refinement Prompt

Each LLM gets a prompt with ALL `{llm}-analysis.md` files embedded, plus these instructions:

1. Read your own analysis — understand its strengths and weaknesses
2. Read peer analyses **with healthy skepticism** — look for missed angles, deeper coverage, weakly sourced claims, contradictions, unique sources
3. **Conduct NEW research** on avenues inspired by peer work, contradictions needing resolution, shared gaps
4. Write a refined version that is **strictly better** than the original

Critical rules included in the prompt:
- "Do NOT simply copy content from peer analyses"
- "Do NOT accept peer claims at face value — verify independently via web search"
- "Use peer findings as a SPRINGBOARD for NEW investigation"
- "Explore territory that NEITHER analysis adequately covered"
- "Maintain your unique perspective — don't homogenize"

#### Concrete Invocations

Same CLI patterns as Phase 2 (use the same resolved model IDs from the registry):
- **Claude**: Task agent with `max_turns: 50`, `subagent_type: "general-purpose"`
- **Gemini**: `timeout 600 gemini -m <gemini-flagship from registry> --approval-mode yolo` (background)
- **Codex**: `echo "<prompt>" | codex exec --skip-git-repo-check -m <codex-flagship from registry> --reasoning-effort xhigh --full-auto 2>/dev/null` (background)

Save to `{llm}-refined.md`. Same timeout and fatal error detection rules as Phase 2. If refinement fails for any LLM, fall back to its original `{llm}-analysis.md` for synthesis.

Only LLMs that produced a successful Phase 2 analysis participate in Phase 3.

---

### Phase 4: Synthesis

- Spawn research-synthesizer agent to merge refined reports (or originals if refinement failed)
- Synthesis organizes findings by **theme**, not by source LLM
- Use LLM attribution inline within themed sections: `[Consensus: 3/3]`, `[Consensus: 2/3]`, `[Claude]`, `[Gemini]`, `[Codex]`
- **If `SWARM_MODE` was active**: Also include team attribution alongside LLM attribution. In the synthesis document, note that Discovery used an agent team and which teammates contributed. Team attribution (`[Locator]`, `[Analyzer]`, `[Pattern Finder]`) appears in the Discovery findings sections; LLM attribution appears in the Analysis sections.
- Save to `research/research-{topic-kebab-case}-deep.md` with YAML frontmatter
- Add GitHub permalinks if applicable
- Report which LLMs contributed, which phases succeeded, and highlight consensus vs unique discoveries

**Storage structure:**
```
research/.deep-research-[timestamp]/
├── context.md              # Discovery output (from subagents OR team)
├── claude-analysis.md      # Phase 2: Claude independent analysis
├── gemini-analysis.md      # Phase 2: Gemini independent analysis
├── codex-analysis.md       # Phase 2: Codex independent analysis
├── claude-refined.md       # Phase 3: Claude cross-pollinated refinement
├── gemini-refined.md       # Phase 3: Gemini cross-pollinated refinement
└── codex-refined.md        # Phase 3: Codex cross-pollinated refinement
```

## References

Load documentarian constraints via:
- `Glob(pattern: "**/sdlc/**/references/documentarian-constraints.md", path: "~/.claude/plugins")` → Read result

Fallback if file not found: Document codebase as it exists. Do not suggest improvements, propose enhancements, or critique implementation.

## Topic

$ARGUMENTS
