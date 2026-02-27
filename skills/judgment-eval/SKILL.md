---
name: judgment-eval
description: Evaluates agent judgment quality through scenario-based testing in-conversation. Use when the user wants to test, validate, or stress-test an agent, skill, or command definition — e.g. "test this agent", "evaluate this skill", "does this prompt handle edge cases", "check this agent's judgment", or after writing or modifying any agent/skill/command .md file.
---

# Judgment Evaluation Skill

## Priorities

```
Realism (scenarios must be plausible) > Diagnostic Value (reveals actual judgment gaps) > Coverage (test multiple dimensions)
```

**Reasoning**: Unrealistic scenarios produce false signals. Diagnostic value ensures we learn from failures. Coverage prevents overfitting to a single dimension.

## Goal

Generate scenario-based tests from an agent definition or system prompt, then guide interactive evaluation to identify judgment strengths, weaknesses, and prompt improvement opportunities.

## Constraints

**Interactive Evaluation Only**: This skill guides manual evaluation in-conversation. Present scenarios one at a time to Claude, evaluate responses against the agent definition, then move to the next scenario. Do NOT attempt automated execution or batch processing.

**Scenario Realism**: Every scenario must be plausible in actual usage. Avoid contrived corner cases that would never occur in practice.

**Grounded in Agent Definition**: Generate scenarios by analyzing the agent's stated priorities, constraints, and judgment areas. Test what the agent claims to value, not generic "good judgment."

**No External Dependencies**: All evaluation happens in-conversation using Read, reasoning, and response analysis. No external tools, APIs, or execution environments.

**Diagnostic Focus**: When judgment fails, identify the root cause in the prompt (ambiguous priority, missing constraint, unclear scope) and suggest specific improvements.

## Workflow

### 1. Intake

Accept agent definition or system prompt via `$ARGUMENTS`:
- File path: Read the file to extract the agent definition
- Pasted text: Parse directly

Extract:
- **Stated priorities**: What the agent claims to optimize for
- **Hard constraints**: Non-negotiable rules (e.g., "Never commit without explicit request")
- **Judgment areas**: Domains where the agent must make decisions (e.g., "when to ask vs proceed")
- **Scope boundaries**: What the agent is responsible for vs not

### 2. Analyze

Identify dimensions of judgment to test:
- **Priority conflicts**: Where two stated priorities might compete
- **Scope ambiguity**: Tasks that fall between defined responsibilities
- **Constraint edge cases**: Situations where constraints might contradict
- **Escalation points**: When the agent should stop vs proceed
- **Proportionality**: Whether response scale matches issue severity

### 3. Generate Scenarios

For each dimension, create 2-3 scenarios following patterns from `references/scenario-patterns.md`:

**Priority Conflicts**: Present situations where two declared priorities compete directly. Force the agent to choose or reconcile.

**Ambiguous Scope**: Tasks that fall into gray areas of the agent's defined responsibilities.

**Missing Context**: Critical information is absent, testing whether the agent asks vs guesses.

**Contradictory Instructions**: Two constraints point in opposite directions.

**Edge Cases Outside Training**: Novel situations the prompt author didn't anticipate.

**Escalation Judgment**: When to stop and ask vs proceed with best guess.

**Proportionality**: Does response scale match the issue's severity?

### 4. Interactive Evaluation

For each scenario:

1. **Present**: Show the scenario to the user. Ask them to present it to Claude using the agent definition as context.

2. **Capture Response**: Have the user share Claude's response.

3. **Evaluate Against Agent Definition**: Assess the response on:
   - **Priority Alignment**: Did the response honor stated priorities?
   - **Constraint Adherence**: Were hard constraints followed?
   - **Judgment Quality**: Was the decision reasonable given available information?
   - **Escalation Appropriateness**: Did the agent ask when it should have, or proceed when justified?

4. **Classify**: Tag the response as:
   - **Good Judgment**: Handled well with sound reasoning
   - **Surprising Judgment**: Unexpected but defensible
   - **Failed Judgment**: Violated stated priorities or constraints

5. **Move to Next**: Proceed to the next scenario.

### 5. Report

After all scenarios, summarize findings:

**Good Judgment**:
- Scenarios handled well
- What reasoning patterns worked
- Why the agent succeeded (which prompt elements enabled this)

**Surprising Judgment**:
- Unexpected but defensible responses
- What priorities the agent implicitly prioritized
- Whether this reveals a prompt gap or acceptable flexibility

**Failed Judgment**:
- Responses that violated stated priorities/constraints
- Root cause in the prompt (ambiguity, missing constraint, unclear priority)
- Pattern analysis (do failures cluster around a specific dimension?)

**Suggestions**:
- Specific prompt improvements based on failure patterns
- Priority clarifications needed
- Constraints to add
- Scope boundaries to sharpen

## Output

**Format**: Markdown report with sections:

```markdown
# Judgment Evaluation Report

**Agent**: [agent name or file path]
**Date**: [date]
**Scenarios Tested**: [count]

## Summary

[1-2 sentences on overall judgment quality]

## Good Judgment (X scenarios)

### Scenario: [name]
**Response**: [brief summary]
**Why it worked**: [reasoning about what prompt elements enabled this]

## Surprising Judgment (X scenarios)

### Scenario: [name]
**Response**: [brief summary]
**Analysis**: [why unexpected, whether defensible, what it reveals]

## Failed Judgment (X scenarios)

### Scenario: [name]
**Response**: [brief summary]
**Failure Mode**: [what priority/constraint was violated]
**Root Cause**: [ambiguity/gap in prompt]

## Patterns

[Analysis of failure clusters and success patterns]

## Suggested Improvements

1. **[Prompt Section]**: [Specific change with reasoning]
2. **[Constraint to Add]**: [Why this prevents observed failures]
3. **[Priority Clarification]**: [How to resolve observed conflicts]
```

## References

- `references/scenario-patterns.md` - Catalog of scenario types with templates and evaluation criteria

## Arguments

`$ARGUMENTS` accepts:
- **File path**: Path to agent definition (*.md file with frontmatter or system prompt)
- **Pasted text**: Agent definition text directly

If file path, Read the file. If pasted text, parse directly.

## Example Usage

```bash
/judgment-eval ~/.claude/plugins/sdlc-plugin/agents/task-implementer.md
```

Or with pasted text:
```bash
/judgment-eval """
You are a task implementer agent.

## Priorities
Spec compliance > Working code > Clean code

## Constraints
- ONLY implement what the task requires
- Ask when unsure using QUESTION/CONTEXT/OPTIONS
...
"""
```

## Notes

- **No automation**: This skill does NOT execute scenarios in a test harness. It guides interactive evaluation.
- **Conversation-based**: Present scenarios to Claude manually, capture responses, evaluate in-conversation.
- **Diagnostic, not pass/fail**: Goal is to identify prompt improvement opportunities, not to "grade" the agent.
- **Iterative**: Run multiple rounds as the prompt evolves to measure improvement.
