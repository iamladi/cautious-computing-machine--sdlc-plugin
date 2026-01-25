# Deep Research with Parallel Synthesis

Run 3 independent research instances on the same topic, then merge their findings into one comprehensive document. This approach uncovers more ground by letting each instance take different search paths.

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
I'm ready to run deep parallel research. Please provide your research question, and I'll spawn 3 independent research instances to thoroughly explore it from multiple angles.
```

Then wait for the user's research query.

### Steps to follow after receiving the research query:

1. **Read any directly mentioned files first:**
   - If the user mentions specific files, read them FULLY first
   - This ensures you have context before spawning research instances

2. **Create the research tracking structure:**
   - Create a temp directory for this research session: `research/.deep-research-[timestamp]/`
   - This will hold the 3 individual research reports before synthesis

3. **Spawn 3 parallel research agents:**

   Launch exactly 3 Task agents simultaneously, each running an independent research flow. Each agent should:
   - Have a slightly different research emphasis to maximize coverage
   - Use the existing research agents (codebase-locator, codebase-analyzer, codebase-pattern-finder, web-search-researcher)
   - Save their findings to the temp directory as `instance-1.md`, `instance-2.md`, `instance-3.md`

   **Instance 1 - Breadth Focus:**
   - Emphasize finding all relevant files and locations
   - Cast a wide net across the codebase
   - Prioritize discovering all entry points and related components

   **Instance 2 - Depth Focus:**
   - Emphasize deep analysis of core components
   - Trace data flow and implementation details thoroughly
   - Focus on understanding how things work internally

   **Instance 3 - Pattern Focus:**
   - Emphasize finding similar patterns and examples elsewhere in the codebase
   - Look for related implementations and analogous code
   - Search for edge cases and alternative code paths

   **Agent Prompt Template:**
   ```
   You are Research Instance [N] investigating: "[RESEARCH QUESTION]"

   Your focus: [BREADTH/DEPTH/PATTERNS as described above]

   Instructions:
   1. Use codebase-locator to find relevant files (emphasize [your focus])
   2. Use codebase-analyzer to understand how code works
   3. Use codebase-pattern-finder if looking for similar implementations
   4. Document ALL file:line references you discover
   5. Save your complete findings (in markdown) as your final output

   Remember: You are a documentarian. Describe what exists, don't suggest improvements.

   Research the following: [RESEARCH QUESTION]
   ```

4. **Wait for ALL 3 instances to complete:**
   - Do NOT proceed until all 3 have finished
   - Each will return their findings

5. **Save individual instance reports:**
   - Write each instance's findings to the temp directory
   - `research/.deep-research-[timestamp]/instance-1.md`
   - `research/.deep-research-[timestamp]/instance-2.md`
   - `research/.deep-research-[timestamp]/instance-3.md`

6. **Spawn the synthesis agent:**
   - Use the **research-synthesizer** agent
   - Pass it the paths to all 3 instance reports
   - It will merge them into one comprehensive document

   **Synthesis Prompt:**
   ```
   Merge these 3 research reports into one comprehensive document:
   - research/.deep-research-[timestamp]/instance-1.md
   - research/.deep-research-[timestamp]/instance-2.md
   - research/.deep-research-[timestamp]/instance-3.md

   Research topic: [RESEARCH QUESTION]

   Create a synthesis that:
   - Identifies findings that appeared in multiple reports (consensus)
   - Preserves unique discoveries from each instance
   - Combines all file:line references
   - Notes any conflicts between reports
   ```

7. **Save the final synthesized document:**
   - Save to `research/research-[topic-kebab-case]-deep.md`
   - Include YAML frontmatter with:
     - `synthesis_method: parallel-3-instance`
     - `synthesis_sources: 3`
   - Clean up the temp directory (optional, or keep for reference)

8. **Add GitHub permalinks (if applicable):**
   - Same as regular research command
   - Generate permalinks for all file references

9. **Report completion:**
   - Summarize what was found
   - Note the coverage improvement from using 3 instances
   - Provide the path to the final research document

## Topic
$ARGUMENTS

## Important Notes

- **Parallel execution is key** - spawn all 3 instances at once, don't run them sequentially
- **Different emphases matter** - each instance having a different focus ensures diverse coverage
- **Synthesis is crucial** - the research-synthesizer agent does the heavy lifting of merging
- **All findings preserved** - no file:line reference should be lost in synthesis
- **Consensus = confidence** - findings from multiple instances are more reliable
- **Unique discoveries = value** - the whole point is to find things single runs miss
- **No improvements** - all agents are documentarians, not critics
