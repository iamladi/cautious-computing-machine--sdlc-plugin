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

The `$ARGUMENTS` input contains both the research topic and optional mode flags. Extract the intent:
- Identify if `--swarm` flag is present (indicates user wants parallel team research)
- Separate the flag from the research topic itself
- The research topic is the remaining text after flag extraction

If no topic remains after flag extraction, ask the user for a research question before proceeding.

### Mode Selection

**If user requested swarm mode** (via `--swarm` flag): Execute the **Swarm Workflow** below.
**Otherwise**: Execute the **Standard Workflow** below.

---

## Standard Workflow

The default research approach uses specialized subagents to explore different aspects of the codebase in parallel.

### Context Gathering

Read any files the user mentioned completely before delegating work. This provides grounding for the subagents and ensures you understand what the user is starting from.

### Parallel Investigation

Spawn subagents with complementary perspectives on the research question:
- **Locator**: Discovers where relevant code lives (files, directories, components)
- **Analyzer**: Understands how the code works (data flow, interactions, implementation)
- **Pattern Finder**: Identifies conventions and similar implementations elsewhere

These roles work best when they have judgment latitude about HOW to investigate, while being clear on WHAT they're investigating. Each subagent should determine its own search strategy based on what it discovers.

### Optional Web Research

If the user explicitly requested information that requires web search (external APIs, library documentation, recent changes), spawn a web-search-researcher subagent alongside the codebase investigators.

### Source Requirements

All findings must trace back to specific locations in the codebase (file:line references). Prioritize the live codebase over existing documentation when they conflict — code is the source of truth.

### Synthesis

Wait for all subagents to complete their investigation. Integrate their findings into a coherent research document that answers the original question, preserving all source attributions.

---

## Swarm Workflow

An alternative approach using agent teams for research that benefits from dynamic collaboration between teammates. This works well when the research question requires teammates to share discoveries in real-time rather than working in isolation.

### Why Teams Work Better for Research

Parallel research with independent perspectives produces more complete results than sequential investigation. When a locator finds a file the analyzer should examine, or an analyzer discovers a pattern the pattern finder should trace, immediate coordination prevents duplicate work and missed connections. The team structure provides a shared task list and messaging channel that enables this coordination without rigid orchestration.

### Team Prerequisites and Fallback

Attempt to create the agent team using `TeamCreate` with a unique timestamped name: `research-{topic-kebab}-{YYYYMMDD-HHMMSS}` and description: "Research: {topic}".

If team creation fails (tool unavailable or experimental features disabled), inform the user that swarm mode requires agent teams to be enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json), then fall back to executing the Standard Workflow instead. The research topic is already parsed and ready to use.

### Context Preparation

Before spawning teammates, read any user-mentioned files completely and understand the research question. Summarize this context in the teammate spawn prompts so they start with shared understanding.

### Shared Task List

Create tasks via `TaskCreate` that represent the key unknowns you need answered:
1. **Locate relevant files** — coverage goal is finding ALL files related to the topic
2. **Analyze implementation details** — depth goal is understanding HOW it works
3. **Find patterns and conventions** — breadth goal is discovering SIMILAR implementations

These tasks provide structure without prescribing the investigation approach.

### Teammate Roles

Spawn 3 teammates via the `Task` tool with `team_name` parameter and `subagent_type: "general-purpose"`. Each teammate has a different lens on the research question:

**Teammate 1: Locator**

Your role is to find ALL files, directories, and components relevant to "{topic}". Success means the team knows WHERE to look, not just some places but everywhere this topic touches the codebase.

Approach this with multiple search strategies — don't rely on a single grep pattern. Try different naming conventions, file extensions, and related concepts. Categorize what you find (implementation, tests, config, types, docs) so teammates know what matters most.

When you discover files that teammates should examine, tell them via SendMessage. If you notice directory patterns or file counts that suggest scale or organization, share that too.

When you've achieved comprehensive coverage of the codebase locations, mark your task complete via TaskUpdate and send "RESEARCH COMPLETE" to signal you're done.

All findings must include full file paths. Don't read file contents in depth — your value is breadth of coverage.

**Teammate 2: Analyzer**

Your role is to understand HOW "{topic}" works — trace the actual execution paths, data flow, and component interactions. Success means the team understands the implementation mechanics, not just the surface API.

Read files thoroughly before making statements. Follow the code paths to see what actually happens, don't assume based on names or structure. Every claim you make should cite file:line references that prove it.

Focus on the "how" questions: Where are the entry points? What's the core logic? How does data flow through? What error handling exists? How do components interact?

When you discover patterns worth documenting (for Pattern Finder) or realize files are missing from the team's awareness (for Locator), share those observations via SendMessage.

When you've achieved sufficient depth of understanding to explain the implementation, mark your task complete via TaskUpdate and send "RESEARCH COMPLETE" to signal you're done.

Document your findings in these categories: Entry Points, Core Implementation, Data Flow, Key Patterns, Configuration, Error Handling.

**Teammate 3: Pattern Finder**

Your role is to find similar implementations, usage examples, and existing patterns that illuminate "{topic}". Success means the team sees HOW this topic fits into broader codebase conventions and where to find working examples.

Show actual working code examples with file:line references, not just snippets. When multiple variations exist, show them — the differences often reveal important context. Categorize patterns by type: API patterns, data patterns, component patterns, testing patterns.

When you find patterns the Analyzer should trace or files the Locator missed, share via SendMessage. Test patterns alongside implementation patterns provide valuable context.

When you've achieved sufficient breadth to show the patterns and conventions, mark your task complete via TaskUpdate and send "RESEARCH COMPLETE" to signal you're done.

### Optional Web Research

If the user explicitly requested web research, spawn a `web-search-researcher` subagent (NOT a teammate) in parallel with the team. This runs independently and may complete on a different timeline.

### Completion Criteria and Convergence

Teammates signal completion by sending "RESEARCH COMPLETE" messages. This means they've achieved their role's success criteria (coverage, depth, or breadth respectively), not that they've exhausted all possibilities.

**Timeout guardrails**: Wait up to 10 minutes from teammate spawn time for all three to complete. If a teammate hasn't signaled completion by timeout, proceed with available findings and note which teammates timed out in the output. Research quality matters more than mechanical completeness — partial results from timed-out teammates are still valuable.

**Web research timing**: If the optional web-search-researcher is still running when all three teammates complete, wait up to 2 additional minutes. If it hasn't finished, proceed without it. Web research is supplementary, not blocking.

**Fallback behavior**: If a teammate fails or gets stuck in a loop (indicated by repeated similar messages or no progress), you have three options: (1) note the failure and proceed with other teammates' findings, (2) spawn a replacement teammate with clearer scoped instructions, or (3) handle that aspect of research yourself. Choose based on how critical that role's findings are to answering the research question.

### Synthesis Principles

As team lead, your job is to integrate teammate findings into a coherent answer to the research question, not mechanically merge their outputs.

**Quality checkpoint**: Before starting synthesis, assess whether you have enough information to answer the research question. If critical gaps remain and you're within time budget, consider targeted follow-up investigation rather than forcing synthesis from incomplete data.

**Attribution strategy**: Use team attribution markers in body sections to show which teammate discovered what: `[Locator]`, `[Analyzer]`, `[Pattern Finder]`. When multiple teammates independently discovered the same finding, mark it `[Consensus]` — these are high-confidence results.

**Preserve provenance**: All file:line references from teammates must appear in the final document. These citations enable verification and are more valuable than summary statements.

**Output format**: The research document structure is identical to Standard Workflow output (same YAML frontmatter schema, same required sections). In the Summary section, briefly note team composition and which teammates contributed. Attribution markers belong in body sections, NOT in YAML frontmatter.

### Resource Cleanup

After completing synthesis (whether successful or failed), always clean up team resources. This prevents lingering agent processes and task lists from accumulating.

Send shutdown requests to all teammates via `SendMessage` with `type: "shutdown_request"`, wait briefly for confirmations, then call `TeamDelete` to remove the team and its task list.

If cleanup itself fails, inform the user: "Team cleanup incomplete. You may need to check for lingering team resources."

Execute cleanup regardless of synthesis outcome — even if earlier steps errored or teammates timed out, cleanup must run before ending.

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
