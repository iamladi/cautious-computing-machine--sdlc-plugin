# Research & Document Codebase

## Role

Produce a standalone research document in `research/` that answers a question about this codebase, with every finding backed by `file:line` references. Document what *is*, not what *should be*.

## Priorities

Precision (file:line refs) > Completeness (trace full paths) > Concision

## Scope

Load canonical documentarian constraints: `Glob(pattern: "**/sdlc/**/references/documentarian-constraints.md", path: "~/.claude/plugins")` and read the result. The categorical rule: document what exists, not what should exist — `/review` and `/plan` own the "should" pass. The loaded file names five specific boundaries (scope, critique, RCA, proposals, axis-specific commentary), each with its own downstream failure mode; don't paraphrase by enumerating a subset, since the boundaries dropped from the shorthand are the ones callers can't reconstruct from memory.

## Session setup

`/rename "Research: $ARGUMENTS"` — or, if no topic was supplied, ask first, then rename.

## Routing

Swarm is the default — research usually benefits from teammates sharing discoveries in real time. Pass `--no-swarm` to fall back to a solo parallel-subagent flow. Strip `--no-swarm` from the args; the remainder is the research topic. If nothing remains, ask the user for a research question.

If swarm mode is active but `TeamCreate` isn't available, tell the user:
```
Swarm mode requires agent teams. Set CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 in settings.json or environment.
Falling back to standard workflow.
```
Then continue — the topic is already parsed.

## Interview checkpoint (both modes)

Find and run the interview protocol:
- `Glob(pattern: "**/sdlc/**/skills/interview/SKILL.md", path: "~/.claude/plugins")`

Run in context-only mode: no file updates, no Interview Insights section. Focus on scope, focus areas, depth vs breadth, intended use of the research output. Topic is the parsed research question. Carry interview decisions into the spawn prompts so teammates inherit the scope.

## Context gathering (both modes)

Read any user-mentioned files completely (no limit/offset) before spawning anything. Teammates need to inherit shared grounding, and you can't summarize what you haven't read.

---

## Swarm workflow

Create the team with `TeamCreate`: name `research-{topic-kebab}-{YYYYMMDD-HHMMSS}`, description `Research: {topic}`.

Register three shared tasks via `TaskCreate` — structure without prescribing investigation approach:
1. **Locate relevant files** — coverage goal: find all files related to the topic.
2. **Analyze implementation details** — depth goal: understand how it works.
3. **Find patterns and conventions** — breadth goal: surface similar implementations.

Spawn three teammates via `Task` with `team_name` and `subagent_type: "general-purpose"`. In parallel, spawn `web-search-researcher` as a plain subagent (no `team_name`) — it supplements but never blocks.

### Teammate briefs

<example name="Locator">
Your role is to find all files, directories, and components relevant to "{topic}". Success means the team knows where to look — not some places, everywhere this topic touches the codebase.

Use multiple search strategies; don't rely on a single grep pattern. Try different naming conventions, file extensions, and related concepts. Categorize what you find (implementation, tests, config, types, docs) so teammates know what matters most. Share discoveries via `SendMessage` when teammates should examine what you've surfaced. All findings include full file paths. When coverage is comprehensive, `TaskUpdate` to mark complete and send `RESEARCH COMPLETE`.
</example>

<example name="Analyzer">
Your role is to understand how "{topic}" works — trace the actual execution paths, data flow, and component interactions. Success means the team understands the implementation mechanics, not just the surface API.

Read files thoroughly before making statements. Follow the code paths to see what actually happens. Every claim cites `file:line`. Focus on: Where are the entry points? What's the core logic? How does data flow through? What error handling exists? How do components interact?

Share patterns worth documenting or missing files via `SendMessage`. When you can explain the implementation, `TaskUpdate` to mark complete and send `RESEARCH COMPLETE`.
</example>

<example name="Pattern Finder">
Your role is to find similar implementations, usage examples, and existing patterns that illuminate "{topic}". Success means the team sees how this topic fits into broader codebase conventions and where to find working examples.

Show actual working code with `file:line` references, not just snippets. When multiple variations exist, show them — the differences often reveal context. Categorize: API, data, component, testing patterns. Share leads with the Analyzer and Locator via `SendMessage`. When breadth is sufficient, `TaskUpdate` to mark complete and send `RESEARCH COMPLETE`.
</example>

### Convergence

Wait for all three teammates to send `RESEARCH COMPLETE`, up to 10 minutes per teammate from spawn. On teammate timeout, proceed with available findings and note the timeout in the output. If a teammate gets stuck (repeated identical messages, no progress), pick: note the failure and proceed, respawn with tighter scope, or handle that role yourself — decide on criticality.

Web research gets up to 2 extra minutes after teammates finish. Then proceed without it — it always runs, never blocks.

### Synthesis

Integrate findings into a coherent answer to the research question — not a mechanical merge.

- Use body-section attribution: `[Locator]`, `[Analyzer]`, `[Pattern Finder]`. Independently confirmed findings get `[Consensus]`.
- Preserve every `file:line` reference from teammates in the final document.
- Note team composition and contributors briefly in the Summary section. Attribution markers live in the body, not in YAML frontmatter.

### Cleanup invariant

**The team must be deleted before the command returns, regardless of whether synthesis succeeded.** Skipping leaks team slots and orphans the shared task list.

1. `SendMessage` with `type: "shutdown_request"` to each teammate.
2. Wait briefly for shutdown confirmations.
3. `TeamDelete`.

If cleanup itself errors, tell the user `"Team cleanup incomplete. You may need to check for lingering team resources."` and continue.

---

## Standard workflow

Spawn subagents with complementary perspectives on the research question, in parallel:
- **Locator** — discovers where relevant code lives (files, directories, components).
- **Analyzer** — understands how the code works (data flow, interactions, implementation).
- **Pattern Finder** — identifies conventions and similar implementations elsewhere.
- **Web Search Researcher** — finds external evidence, best practices, and current documentation.

Each subagent has judgment latitude on *how* to investigate; be clear on *what* they're investigating. They decide their own search strategy based on what they find. Include interview decisions and focus areas in each spawn prompt.

The web-search-researcher always runs in parallel; if it fails or returns nothing, proceed with codebase-only findings. If it's still running when codebase subagents finish, give it up to 2 extra minutes.

All findings must trace to specific `file:line` locations. When the codebase and existing documentation disagree, the codebase is the source of truth.

Integrate all results — codebase analysis + web search — into a single coherent document, preserving every source attribution.

---

## Output

Save to `research/research-[topic-kebab-case].md` with YAML frontmatter: `date`, `git_commit`, `branch`, `repository`, `topic`, `tags`, `status`, `last_updated`, `last_updated_by`.

Required sections: Research Question → Summary → Detailed Findings (with `file:line`) → Code References → Architecture Documentation → Related Research → Open Questions.

Add GitHub permalinks if the branch is pushed: `https://github.com/{owner}/{repo}/blob/{commit}/{file}#L{line}`.

For follow-ups: append to the same doc, update frontmatter, add `## Follow-up Research [timestamp]`.

When `--no-swarm` wasn't used (swarm was active), the Summary also carries a short line on team composition and which teammates contributed.

Close with a brief summary of findings and the path to the saved research document.

## Idea

$ARGUMENTS

## Report

If no idea: `"I'm ready to research the codebase. Please provide your research question."`
