---
name: constitution-compliance-review
description: Evaluate plugin commands, agents, and skills against Anthropic Constitution principles. Score alignment on reasoning-based vs rule-based instruction spectrum, identify improvement opportunities. Use when the user wants to audit, score, or review the quality of a command, agent, or skill — e.g. "review this skill", "audit this command", "is this agent well-written", "score this against constitutional principles", or "check this for rule-based patterns".
argument-hint: [file path to .md command/agent/skill]
---

# Constitution Compliance Review Skill

## Priorities

```
Clarity > Accuracy > Actionability
```

Clarity matters most because a confusing score helps no one. Accuracy ensures the score reflects actual alignment. Actionability means every finding should suggest concrete improvements.

## Goal

Evaluate plugin files (commands, agents, skills) against the Anthropic Constitution's principle of reasoning-based over rule-based instructions. Produce a structured report with an overall alignment score (1-10), section-by-section breakdown, and specific transformation suggestions.

This skill helps plugin authors understand where their prompts fall on the rule/reasoning spectrum and how to improve them.

## What Qualifies as Alignment

The Constitution establishes that Claude performs better with judgment criteria and reasoning than with rigid rules. Alignment means:

**High alignment (7-10/10):**
- Explains *why* constraints exist, not just *what* they are
- Provides judgment criteria for edge cases rather than exhaustive if/then rules
- Describes desired outcomes and checkpoints rather than step-by-step procedures
- Trusts the agent to use its intelligence for format and style choices
- Uses rules sparingly, only where error costs are severe or predictability is critical

**Mixed alignment (4-6/10):**
- Some reasoning provided, but mixed with rigid procedures
- Rules exist with partial explanations
- Judgment criteria present but undermined by conflicting rigid templates
- Over-specifies formatting or process details

**Low alignment (1-3/10):**
- Mostly or entirely rule-based instructions
- Step-by-step procedures without reasoning
- Rigid templates without flexibility
- Rules without explanation of their purpose
- Excessive enumeration of cases the agent could handle with judgment

## How to Conduct a Review

Accept a file path as input. If no path provided, ask the user which file to review.

1. **Read the file** using the Read tool
2. **Analyze section by section**:
   - Identify the purpose of each section
   - Classify each as reasoning-based, rule-based, or hybrid
   - Note specific patterns (explained constraints, rigid procedures, judgment criteria, etc.)
3. **Score on the 1-10 scale** using the rubric in references/scoring-rubric.md
4. **Identify specific transformation opportunities**:
   - Quote the rule-heavy sections
   - Explain why they're rule-based
   - Suggest reasoning-based alternatives
5. **Output the structured report**

Use your judgment about how granular to get. For a small file, review every section. For a large file, focus on the most impactful sections.

## When to Apply Strict vs Lenient Scoring

**Be strict when:**
- The file is a high-frequency command (commit, review, research) that shapes user experience
- Rule-based patterns dominate the file
- The consequences of brittleness are high (safety checks, git operations, destructive commands)

**Be lenient when:**
- The file includes some rules but provides reasoning for them
- The domain genuinely requires predictability (security, error handling)
- The author is clearly trying to balance judgment and structure

The goal is improvement, not perfection. A score of 7/10 is excellent. A score of 9/10 is exceptional.

## Output Format

Structure your review as follows:

### Overall Assessment
- **Alignment Score**: [1-10]/10
- **Classification**: [Reasoning-based / Mixed / Rule-based]
- **Summary**: [1-2 sentence assessment]

### Section-by-Section Breakdown

For each major section:
- **Section**: [Section name or quote]
- **Score**: [1-10]/10
- **Pattern**: [Reasoning-based / Rule-based / Hybrid]
- **Reasoning**: [Why this score? What patterns did you observe?]

### Transformation Suggestions

For each rule-heavy section identified:

**Current (rule-based):**
```markdown
[Quote the actual text]
```

**Why this is rule-based:** [Explanation]

**Suggested (reasoning-based):**
```markdown
[Rewritten version with reasoning]
```

**Why this is better:** [Explanation of the improvement]

### Strengths

What is this file doing well? Quote specific examples of reasoning-based instruction.

### Final Recommendation

Should this file be rewritten? If so, what sections are highest priority?

## References

- `references/scoring-rubric.md` — 1-10 alignment scale with examples at each level
- Anthropic Constitution (January 2026) — "We generally favor cultivating good values and judgment over strict rules and decision procedures" (p. 5)

## Arguments

$ARGUMENTS
