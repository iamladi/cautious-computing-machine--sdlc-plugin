# Research & Document Codebase

## Session Naming

`/rename "Research: $ARGUMENTS"` (or infer from context)

## Priorities

Precision (file:line refs) > Completeness (trace full paths) > Concision

## Goal

Research and document the codebase to answer the given question. Produce a standalone research document in `research/` with findings backed by file:line references.

## Constraints

Read documentarian constraints (Glob `**/sdlc/**/references/documentarian-constraints.md`, path `/Users/iamladi/Projects/claude-code-plugins`). YOUR ONLY JOB IS TO DOCUMENT AND EXPLAIN THE CODEBASE AS IT EXISTS TODAY. DO NOT suggest improvements or changes unless explicitly requested. Document what IS, not what SHOULD BE.

### CRITICAL: Route Selection

BEFORE taking any other action, check `$ARGUMENTS` for the `--swarm` flag:

1. If `--swarm` IS present: remove it from the arguments (the remaining text is the research topic), then skip directly to **Swarm Workflow**. Do NOT execute any Standard Workflow steps.
2. If `--swarm` is NOT present: the full `$ARGUMENTS` is the research topic, skip directly to **Standard Workflow**. Do NOT execute any Swarm Workflow steps.

If no research topic remains after processing, ask the user for a research question before proceeding.

---

## Swarm Workflow

An alternative approach using agent teams for research that benefits from dynamic collaboration between teammates. This works well when the research question requires teammates to share discoveries in real-time rather than working in isolation.

### Team Prerequisites and Fallback

Attempt to create the agent team using `TeamCreate` with a unique timestamped name: `research-{topic-kebab}-{YYYYMMDD-HHMMSS}` and description: "Research: {topic}".

If team creation fails (tool unavailable or experimental features disabled), inform the user that swarm mode requires agent teams to be enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json), then fall back to executing the Standard Workflow instead. The research topic is already parsed and ready to use.

### Interview Checkpoint

Find and read the interview protocol using Glob:
- Pattern: `**/sdlc/**/skills/interview/SKILL.md`
- Search path: `~/.claude/plugins`

Execute the interview protocol with these overrides:
- Output to conversation context only — do not update files or write an Interview Insights section
- Focus on: research scope, focus areas, depth vs breadth, intended use of research output
- The topic for the interview is: the research topic as parsed from $ARGUMENTS

### Context Preparation

Before spawning teammates, read any user-mentioned files completely and understand the research question. Summarize this context in the teammate spawn prompts so they start with shared understanding.

Include interview decisions and focus areas when summarizing context in the teammate spawn prompts.

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

When you discover files that teammates should examine, tell them via SendMessage. When you've achieved comprehensive coverage, mark your task complete via TaskUpdate and send "RESEARCH COMPLETE". All findings must include full file paths.

**Teammate 2: Analyzer**

Your role is to understand HOW "{topic}" works — trace the actual execution paths, data flow, and component interactions. Success means the team understands the implementation mechanics, not just the surface API.

Read files thoroughly before making statements. Follow the code paths to see what actually happens. Every claim you make should cite file:line references that prove it.

Focus on the "how" questions: Where are the entry points? What's the core logic? How does data flow through? What error handling exists? How do components interact?

When you discover patterns worth documenting or realize files are missing from the team's awareness, share via SendMessage. When you've achieved sufficient depth to explain the implementation, mark your task complete via TaskUpdate and send "RESEARCH COMPLETE".

**Teammate 3: Pattern Finder**

Your role is to find similar implementations, usage examples, and existing patterns that illuminate "{topic}". Success means the team sees HOW this topic fits into broader codebase conventions and where to find working examples.

Show actual working code examples with file:line references, not just snippets. When multiple variations exist, show them — the differences often reveal important context. Categorize patterns by type: API patterns, data patterns, component patterns, testing patterns.

When you find patterns the Analyzer should trace or files the Locator missed, share via SendMessage. When you've achieved sufficient breadth to show the patterns and conventions, mark your task complete via TaskUpdate and send "RESEARCH COMPLETE".

### Mandatory Web Research

Spawn a `web-search-researcher` subagent (NOT a teammate) in parallel with the team. This runs independently and may complete on a different timeline. Web search always runs to provide external evidence alongside codebase findings. If web search fails or returns no results, proceed with codebase-only findings.

### Completion Criteria and Convergence

Teammates signal completion by sending "RESEARCH COMPLETE" messages. Wait up to 10 minutes from teammate spawn time for all three to complete. If a teammate hasn't signaled completion by timeout, proceed with available findings and note which teammates timed out in the output.

**Web research timing**: If the web-search-researcher is still running when all three teammates complete, wait up to 2 additional minutes. If it hasn't finished, proceed without it. Web research is supplementary — it always runs but never blocks command completion.

**Fallback behavior**: If a teammate fails or gets stuck in a loop (indicated by repeated similar messages or no progress), you have three options: (1) note the failure and proceed with other teammates' findings, (2) spawn a replacement teammate with clearer scoped instructions, or (3) handle that aspect of research yourself. Choose based on how critical that role's findings are to answering the research question.

### Synthesis Principles

As team lead, your job is to integrate teammate findings into a coherent answer to the research question, not mechanically merge their outputs.

**Attribution strategy**: Use team attribution markers in body sections: `[Locator]`, `[Analyzer]`, `[Pattern Finder]`. Mark independently confirmed findings `[Consensus]`.

**Preserve provenance**: All file:line references from teammates must appear in the final document.

**Output format**: The research document structure is identical to Standard Workflow output (same YAML frontmatter schema, same required sections). In the Summary section, briefly note team composition and which teammates contributed. Attribution markers belong in body sections, NOT in YAML frontmatter.

### Resource Cleanup

After completing synthesis (whether successful or failed), always clean up team resources. This prevents lingering agent processes and task lists from accumulating.

Send shutdown requests to all teammates via `SendMessage` with `type: "shutdown_request"`, wait briefly for confirmations, then call `TeamDelete` to remove the team and its task list.

If cleanup itself fails, inform the user: "Team cleanup incomplete. You may need to check for lingering team resources."

Execute cleanup regardless of synthesis outcome — even if earlier steps errored or teammates timed out, cleanup must run before ending.

---

## Standard Workflow

The default research approach uses specialized subagents to explore different aspects of the codebase in parallel.

### Interview Checkpoint

Find and read the interview protocol using Glob:
- Pattern: `**/sdlc/**/skills/interview/SKILL.md`
- Search path: `~/.claude/plugins`

Execute the interview protocol with these overrides:
- Output to conversation context only — do not update files or write an Interview Insights section
- Focus on: research scope, focus areas, depth vs breadth, intended use of research output
- The topic for the interview is: the research topic as parsed from $ARGUMENTS

### Context Gathering

Read any files the user mentioned completely before delegating work. This provides grounding for the subagents and ensures you understand what the user is starting from.

Include interview decisions and focus areas when summarizing context for subagent prompts.

### Parallel Investigation

Spawn subagents with complementary perspectives on the research question:
- **Locator**: Discovers where relevant code lives (files, directories, components)
- **Analyzer**: Understands how the code works (data flow, interactions, implementation)
- **Pattern Finder**: Identifies conventions and similar implementations elsewhere
- **Web Search Researcher**: Finds external evidence, best practices, and current documentation from web sources

These roles work best when they have judgment latitude about HOW to investigate, while being clear on WHAT they're investigating. Each subagent should determine its own search strategy based on what it discovers.

The web-search-researcher always runs in parallel with codebase subagents. If web search fails or returns no results, the command proceeds with codebase-only findings.

### Source Requirements

All findings must trace back to specific locations in the codebase (file:line references). Prioritize the live codebase over existing documentation when they conflict — code is the source of truth.

### Synthesis

Wait for all subagents to complete their investigation (including web-search-researcher). If web search is still running when codebase subagents finish, wait up to 2 additional minutes before proceeding without it. Integrate all findings — codebase analysis and web search results — into a coherent research document that answers the original question, preserving all source attributions.

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
