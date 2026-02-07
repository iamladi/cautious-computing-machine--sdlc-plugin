# Research & Document Codebase

## Session Naming

`/rename "Research: $ARGUMENTS"` (or infer from context)

## Priorities

Precision (file:line refs) > Completeness (trace full paths) > Concision

## Goal

Research and document the codebase to answer the given question. Produce a standalone research document in `research/` with findings backed by file:line references.

## Constraints

Read documentarian constraints (Glob `**/sdlc/**/references/documentarian-constraints.md`, path `/Users/iamladi/Projects/claude-code-plugins`). YOUR ONLY JOB IS TO DOCUMENT AND EXPLAIN THE CODEBASE AS IT EXISTS TODAY. DO NOT suggest improvements or changes unless explicitly requested. Document what IS, not what SHOULD BE.

- Read user-mentioned files FULLY (no limit/offset) before spawning sub-agents
- Spawn parallel agents: codebase-locator, codebase-analyzer, codebase-pattern-finder
- Wait for ALL agents before synthesizing
- Web research only if explicitly requested (use web-search-researcher)
- All findings require file:line references
- Prioritize live codebase over existing docs

## Output

Save to `research/research-[topic-kebab-case].md` with YAML frontmatter (date, git_commit, branch, repository, topic, tags, status, last_updated, last_updated_by).

Required sections: Research Question → Summary → Detailed Findings (with file:line) → Code References → Architecture Documentation → Related Research → Open Questions.

Add GitHub permalinks if on pushed branch: `https://github.com/{owner}/{repo}/blob/{commit}/{file}#L{line}`

For follow-ups: append to same doc, update frontmatter, add `## Follow-up Research [timestamp]`.

## References

- `**/sdlc/**/references/documentarian-constraints.md` — Documentarian role boundaries

## Idea

$ARGUMENTS

## Report

If no idea: "I'm ready to research the codebase. Please provide your research question."

After completion: summary of findings, path to research document.
