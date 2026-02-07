# Multi-LLM Deep Research

## Session Naming

Before starting, rename this session:
- If `$ARGUMENTS` provided: `/rename "Deep Research: $ARGUMENTS"`
- Otherwise wait for topic, then `/rename "Deep Research: {topic}"`

## Priorities

Depth (multi-perspective) > Accuracy (consensus validation) > Concision

## Goal

Execute 3-phase multi-LLM research (Discovery → Analysis → Synthesis) on a codebase topic, producing a comprehensive document with LLM attribution markers showing which findings came from Claude, Gemini, and/or Codex.

## Constraints

**Phase 1: Discovery (Claude only)**
- Read any user-mentioned files first
- Create `research/.deep-research-$(date +%Y%m%d-%H%M%S)/`
- Spawn one discovery agent using codebase-locator, codebase-analyzer, and codebase-pattern-finder
- Target <50K characters for CLI compatibility
- Save to `context.md`

**Phase 2: Analysis (3 LLMs in parallel)**
- Embed `context.md` in analysis prompts
- Launch simultaneously: Claude (Task agent), Gemini CLI (background), Codex CLI (background)
- 10-minute timeout per external LLM
- Graceful degradation: continue with successful analyses (minimum: Claude)
- Save each to `{llm}-analysis.md`

**Phase 3: Synthesis**
- Spawn research-synthesizer agent to merge analyses
- Use LLM attribution: `[Consensus: 3/3]`, `[Consensus: 2/3]`, `[Claude]`, `[Gemini]`, `[Codex]`
- Save to `research/research-{topic-kebab-case}-deep.md` with YAML frontmatter
- Add GitHub permalinks if applicable
- Report which LLMs contributed and highlight consensus vs unique discoveries

**Storage structure:**
```
research/.deep-research-[timestamp]/
├── context.md          # Discovery output
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
