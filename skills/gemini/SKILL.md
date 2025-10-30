---
name: gemini
description: Use when the user asks to run Gemini CLI for code review, plan review, or big context (>200k) processing. Ideal for comprehensive analysis requiring large context windows.
---

# Gemini Skill Guide

## When to Use Gemini
- **Code Review**: Comprehensive code reviews across multiple files
- **Plan Review**: Analyzing architectural plans, technical specifications, or project roadmaps
- **Big Context Processing**: Tasks requiring >200k tokens of context (entire codebases, documentation sets)
- **Multi-file Analysis**: Understanding relationships and patterns across many files

## Running a Task

1. Ask the user (via `AskUserQuestion`) which model to use in a **single prompt**. Latest models (all support thinking):
   - `gemini-2.5-pro` (state-of-the-art, best for complex reasoning in code/math/STEM)
   - `gemini-2.5-flash` (best price-performance, recommended for most tasks)
   - `gemini-2.5-flash-lite` (fastest, most cost-efficient, high throughput)

2. Select the approval mode based on the task:
   - `default`: Prompt for approval (safest, for read-only analysis)
   - `auto_edit`: Auto-approve edit tools only (for code reviews with suggestions)
   - `yolo`: Auto-approve all tools (for trusted automated changes)

3. Assemble the command with appropriate options:
   - `-m, --model <MODEL>` - Model selection
   - `--approval-mode <default|auto_edit|yolo>` - Control tool approval
   - `-y, --yolo` - Alternative to `--approval-mode yolo`
   - `-i, --prompt-interactive "prompt"` - Execute prompt and continue interactively
   - `--include-directories <DIR>` - Additional directories to include in workspace
   - `-s, --sandbox` - Run in sandbox mode for isolation

4. **Default to `--approval-mode default`** for read-only analysis tasks unless edits are necessary.

5. Run the command and capture the output. For non-interactive mode, use positional arguments:
   ```bash
   gemini -m gemini-2.5-flash --approval-mode default "Review this codebase for security issues"
   ```

6. For interactive sessions with an initial prompt:
   ```bash
   gemini -m gemini-2.5-flash -i "Review the authentication system" --approval-mode auto_edit
   ```

7. **After Gemini completes**, inform the user: "The Gemini analysis is complete. You can start a new Gemini session for follow-up analysis or continue exploring the findings."

### Quick Reference

| Use case | Approval mode | Key flags |
| --- | --- | --- |
| Code review (read-only) | `default` | `-m gemini-2.5-flash --approval-mode default` |
| Code review with suggestions | `auto_edit` | `-m gemini-2.5-flash --approval-mode auto_edit` |
| Big context analysis | `default` | `-m gemini-2.5-pro --approval-mode default` |
| Plan/architecture review | `default` | `-m gemini-2.5-pro --approval-mode default` |
| Automated refactoring | `yolo` or `-y` | `-m gemini-2.5-flash --approval-mode yolo` |
| High-throughput tasks | `default` | `-m gemini-2.5-flash-lite --approval-mode default` |
| Multi-directory analysis | Depends on task | `--include-directories <DIR1> --include-directories <DIR2>` |
| Interactive with initial prompt | Match task needs | `-i "prompt" --approval-mode <mode>` |

### Model Selection Guide

| Model | Best for | Context window |
| --- | --- | --- |
| `gemini-2.5-pro` | State-of-the-art reasoning, complex code/math/STEM problems | 1M input / 65k output |
| `gemini-2.5-flash` | Best price-performance, large-scale processing, agentic tasks | 1M input / 65k output |
| `gemini-2.5-flash-lite` | Fastest & most cost-efficient, high throughput | 1M input / 65k output |

**All Gemini 2.5 models support thinking capabilities** for enhanced reasoning and accuracy.

## Common Use Cases

### Code Review
```bash
gemini -m gemini-2.5-flash --approval-mode default \
  "Perform a comprehensive code review focusing on:
   1. Security vulnerabilities
   2. Performance issues
   3. Code quality and maintainability
   4. Best practices violations"
```

### Plan Review
```bash
gemini -m gemini-2.5-pro --approval-mode default \
  "Review this architectural plan for:
   1. Scalability concerns
   2. Missing components
   3. Integration challenges
   4. Alternative approaches"
```

### Big Context Analysis
```bash
gemini -m gemini-2.5-pro --approval-mode default \
  "Analyze the entire codebase to understand:
   1. Overall architecture
   2. Key patterns and conventions
   3. Potential technical debt
   4. Refactoring opportunities"
```

## Following Up

- Gemini CLI sessions are typically one-shot or interactive. Unlike Codex, there's no built-in resume functionality.
- For follow-up analysis, start a new Gemini session with context from previous findings.
- When proposing follow-up actions, restate the chosen model and approval mode.
- Use `AskUserQuestion` after each Gemini command to confirm next steps or gather clarifications.

## Error Handling

- Stop and report failures whenever `gemini --version` or a Gemini command exits non-zero.
- Request direction before retrying failed commands.
- Before using high-impact flags (`--approval-mode yolo`, `-y`, `--sandbox`), ask the user for permission using `AskUserQuestion` unless already granted.
- When output includes warnings or partial results, summarize them and ask how to adjust using `AskUserQuestion`.

## Tips for Large Context Processing

1. **Be specific**: Provide clear, structured prompts for what to analyze
2. **Use include-directories**: Explicitly specify all relevant directories
3. **Choose the right model**:
   - Use `gemini-2.5-pro` for complex reasoning and maximum analysis depth
   - Use `gemini-2.5-flash` for most code reviews (best price-performance)
   - Use `gemini-2.5-flash-lite` for high-volume, fast processing
4. **Leverage thinking capabilities**: All 2.5 models have built-in thinking for better reasoning
5. **Break down complex tasks**: Even with large context, structured analysis is more effective
6. **Save findings**: Ask Gemini to output structured reports that can be saved for reference
