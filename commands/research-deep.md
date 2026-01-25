# Multi-LLM Deep Research

Run a 3-phase research approach using multiple LLMs (Claude, Gemini, Codex) for diverse analysis perspectives, then synthesize findings with attribution.

## Session Naming

Before starting, rename this session for clarity:
- If `$ARGUMENTS` provided: `/rename "Deep Research: $ARGUMENTS"`
- Otherwise wait for the research topic, then run `/rename "Deep Research: {topic}"`

## CRITICAL: YOUR ONLY JOB IS TO DOCUMENT AND EXPLAIN THE CODEBASE AS IT EXISTS TODAY
- DO NOT suggest improvements or changes unless explicitly asked
- DO NOT propose future enhancements
- DO NOT critique the implementation
- ONLY describe what exists, where it exists, how it works

## Instructions

When this command is invoked, and the `Topic` section below is empty, respond with:
```
I'm ready to run multi-LLM deep research. Please provide your research question, and I'll gather context with Claude, then analyze it with Claude + Gemini + Codex in parallel for diverse perspectives.
```

Then wait for the user's research query.

### Phase 1: Discovery (Claude Only)

**Why Claude only:** Gemini and Codex CLI tools can't read local files - they need context embedded in the prompt.

1. **Read any directly mentioned files first:**
   - If the user mentions specific files, read them FULLY first
   - This ensures you have context before spawning the discovery agent

2. **Create the research directory:**
   ```bash
   mkdir -p research/.deep-research-$(date +%Y%m%d-%H%M%S)
   ```
   Store the timestamp path for later steps.

3. **Spawn a single Discovery agent:**

   Use the Task tool with a general-purpose agent that leverages:
   - `codebase-locator` to find ALL relevant files
   - `codebase-analyzer` to understand how code works
   - `codebase-pattern-finder` to find similar implementations

   **Discovery Agent Prompt:**
   ```
   You are a codebase discovery agent. Your job is to find and extract ALL relevant context for the research question: "[RESEARCH QUESTION]"

   ## Your Task

   1. Use codebase-locator to find ALL files related to this topic
   2. Use codebase-analyzer to understand key components
   3. Use codebase-pattern-finder for related patterns

   ## Output Format

   Create a context document with this structure:

   ### Context Summary
   Brief overview of what you found and the scope of the research.

   ### Core Files (Full Snippets)
   For the 3-5 most important files, include:
   - File path
   - Key code snippets (the actual code, not just descriptions)
   - Brief explanation of what each snippet does

   ### Related Files (Key Functions)
   For 5-10 related files, include:
   - File path
   - Function/class names and signatures
   - One-liner description

   ### Test Files (Paths Only)
   - Just list paths to relevant test files

   ### Architecture Notes
   - Data flow
   - Key relationships between components
   - Entry points

   ## CRITICAL CONSTRAINTS
   - Target <50K characters total (CLI-friendly for external LLMs)
   - Prioritize code snippets over descriptions
   - Include actual code, not just explanations
   - Be comprehensive but concise
   - You are a documentarian - describe what exists, don't suggest improvements
   ```

4. **Save discovery output:**
   - Write the discovery agent's output to `research/.deep-research-[timestamp]/context.md`

### Phase 2: Analysis (3 LLMs in Parallel)

Read the `context.md` content and embed it in prompts for each LLM.

**Analysis Prompt Template (used by all 3):**
```
You are analyzing a codebase to answer: "[RESEARCH QUESTION]"

## Codebase Context

[CONTENT OF context.md EMBEDDED HERE]

## Your Analysis Task

Based on the context above, provide a comprehensive analysis:

1. **Direct Answer**: Answer the research question based on the code
2. **Key Components**: List the main files and their roles
3. **Implementation Details**: How does this actually work?
4. **Data Flow**: How does data move through the system?
5. **Patterns Used**: What design patterns or conventions are evident?
6. **Edge Cases**: What edge cases or special handling exists?
7. **Dependencies**: What does this depend on? What depends on it?

## Output Format

Use markdown with clear headings. Include file:line references where applicable.
Be thorough but focused. You are documenting, not critiquing.
```

**Launch all 3 analyses in parallel using the Task tool and Bash:**

1. **Claude Analysis (Task agent):**
   ```
   Task(subagent_type="general-purpose", run_in_background=true):
   "[Analysis prompt with context.md content]"
   Save output to: claude-analysis.md
   ```

2. **Gemini Analysis (Bash, background):**
   ```bash
   echo "[ANALYSIS_PROMPT_WITH_CONTEXT]" | timeout 600 gemini -m gemini-3-pro-preview \
     --approval-mode yolo > research/.deep-research-[timestamp]/gemini-analysis.md 2>/dev/null
   ```

3. **Codex Analysis (Bash, background):**
   ```bash
   echo "[ANALYSIS_PROMPT_WITH_CONTEXT]" | timeout 600 codex exec --skip-git-repo-check \
     -m gpt-5.2-codex --config model_reasoning_effort="xhigh" \
     --sandbox read-only > research/.deep-research-[timestamp]/codex-analysis.md 2>/dev/null
   ```

**IMPORTANT:** Launch all 3 in the same message using multiple tool calls (Task + 2 Bash with run_in_background=true).

### Phase 3: Wait and Collect Results

1. **Wait for all 3 analyses to complete:**
   - Check background task outputs
   - 10-minute timeout per external LLM

2. **Handle failures gracefully:**
   - If Gemini fails: Log it, continue with Claude + Codex
   - If Codex fails: Log it, continue with Claude + Gemini
   - If both external LLMs fail: Continue with Claude-only analysis
   - Minimum requirement: At least Claude analysis must succeed

3. **Verify analysis files exist:**
   - Check each file has content (not empty)
   - Note which LLMs contributed in the synthesis step

### Phase 4: Synthesis

1. **Spawn the research-synthesizer agent:**

   **Synthesis Prompt:**
   ```
   Merge these multi-LLM research reports into one comprehensive document:
   - research/.deep-research-[timestamp]/claude-analysis.md (Claude)
   - research/.deep-research-[timestamp]/gemini-analysis.md (Gemini)
   - research/.deep-research-[timestamp]/codex-analysis.md (Codex)

   Original context: research/.deep-research-[timestamp]/context.md
   Research topic: [RESEARCH QUESTION]

   IMPORTANT: Use LLM attribution in your synthesis:
   - [Consensus: 3/3] for findings all 3 LLMs identified
   - [Consensus: 2/3] for findings 2 LLMs agreed on
   - [Claude] for Claude-unique findings
   - [Gemini] for Gemini-unique findings
   - [Codex] for Codex-unique findings

   The value of multi-LLM is diverse perspectives - highlight where they agree AND where they found unique insights.
   ```

2. **Save the final document:**
   - Save to `research/research-[topic-kebab-case]-deep.md`
   - Include YAML frontmatter with:
     - `synthesis_method: multi-llm`
     - `llms_used: [list which LLMs contributed]`
     - `synthesis_sources: [number of successful analyses]`

3. **Add GitHub permalinks (if applicable):**
   - Generate permalinks for all file references

4. **Report completion:**
   - Summarize key findings
   - Note which LLMs contributed
   - Highlight consensus vs unique discoveries
   - Provide path to final research document

## Storage Structure

```
research/.deep-research-[timestamp]/
├── context.md          # Phase 1: Discovery output
├── claude-analysis.md  # Phase 2: Claude's analysis
├── gemini-analysis.md  # Phase 2: Gemini's analysis
└── codex-analysis.md   # Phase 2: Codex's analysis
```

## Topic
$ARGUMENTS

## Important Notes

- **Multi-LLM diversity** - Different models notice different things
- **Single discovery phase** - One Claude agent gathers all context (external LLMs can't read files)
- **Context size limit** - Discovery targets <50K chars for CLI compatibility
- **Parallel analysis** - All 3 LLMs run simultaneously
- **Graceful degradation** - Synthesis works with 1-3 LLMs
- **LLM attribution** - Final document shows which LLM found what
- **Consensus = confidence** - Findings from multiple LLMs are more reliable
- **Unique discoveries = value** - Each LLM may catch what others miss
- **No improvements** - All analysis is documentation, not critique
