<!-- Gemini CLI Reference - Extracted from skills/gemini/SKILL.md -->
<!-- Used by: /gemini skill -->
<!-- Model IDs shown in examples are snapshots; the skill resolves current IDs via config/model-registry.md (kept fresh by /update-models). When an ID below no longer matches the registry, prefer the registry's role-to-ID mapping over re-editing examples. -->

## Quick Reference

Examples use concrete model IDs since `gemini` CLI requires `-m <id>` at invocation time — substitute the current role-to-ID mapping from `config/model-registry.md` if they've drifted. Every row paired with its registry role:

| Use case | Registry role | Approval mode | Key flags |
| --- | --- | --- | --- |
| Background code review | `gemini-flagship` | `yolo` ✅ | `-m gemini-3-pro-preview --approval-mode yolo` |
| Background analysis | `gemini-flagship` | `yolo` ✅ | `-m gemini-3-pro-preview --approval-mode yolo` |
| Background with timeout | `gemini-flagship` | `yolo` ✅ | `timeout 300 gemini -m gemini-3-pro-preview --approval-mode yolo` |
| Interactive code review | `gemini-flagship` | `default` | `-m gemini-3-pro-preview --approval-mode default` (interactive terminal only) |
| Code review with auto-edits | `gemini-flagship` | `auto_edit` | `-m gemini-3-pro-preview --approval-mode auto_edit` |
| Automated refactoring | `gemini-flagship` | `yolo` | `-m gemini-3-pro-preview --approval-mode yolo` |
| Speed-critical background | `gemini-fast` | `yolo` ✅ | `-m gemini-3-flash --approval-mode yolo` |
| Cost-optimized background | `gemini-fast` | `yolo` ✅ | `-m gemini-2.5-flash --approval-mode yolo` |
| Multi-directory analysis | — | `yolo` (if background) | `--include-directories <DIR1> --include-directories <DIR2>` |
| Interactive with prompt | — | `auto_edit` or `default` | `-i "prompt" --approval-mode <mode>` |

## Model roles (resolve via config/model-registry.md)

The gemini skill resolves registry roles at invocation time — role names are the stable surface; the model IDs below are fallback snapshots that drift. Run `/update-models` if the flagship or fast IDs feel stale.

| Role | Current ID (may be stale) | Best for | Context window |
| --- | --- | --- | --- |
| `gemini-flagship` ⭐ | `gemini-3-pro-preview` | Complex reasoning, coding, agentic tasks | 1M / 64k |
| `gemini-fast` | `gemini-3-flash` | Sub-second latency, speed-critical | 1M / 64k |
| — (legacy) | `gemini-2.5-pro` | Strong all-around, thinking mode | 1M / 65k |
| — (legacy) | `gemini-2.5-flash` | Cost-efficient, high-volume | 1M / 65k |
| — (legacy) | `gemini-2.5-flash-lite` | Fastest, minimal latency | 1M / 65k |

Legacy rows carry no role because the registry only resolves the active flagship/fast tier — legacy IDs stay accessible through the CLI but aren't part of the role-to-ID contract.

**Gemini 3 Advantages**: 35% higher accuracy in software engineering, state-of-the-art on SWE-bench (76.2%), GPQA Diamond (91.9%), and WebDev Arena (1487 Elo). Knowledge cutoff: January 2025.

**Coming Soon**: `gemini-3-deep-think` for ultra-complex reasoning with enhanced thinking capabilities.

## Common Use Cases

### Code Review (Background/Automated)
```bash
# For background execution (Claude Code, CI/CD, etc.)
gemini -m gemini-3-pro-preview --approval-mode yolo \
  "Perform a comprehensive code review focusing on:
   1. Security vulnerabilities
   2. Performance issues
   3. Code quality and maintainability
   4. Best practices violations"

# With timeout safety (5 minutes)
timeout 300 gemini -m gemini-3-pro-preview --approval-mode yolo \
  "Perform a comprehensive code review..."
```

### Plan Review (Background/Automated)
```bash
# For background execution
gemini -m gemini-3-pro-preview --approval-mode yolo \
  "Review this architectural plan for:
   1. Scalability concerns
   2. Missing components
   3. Integration challenges
   4. Alternative approaches"
```

### Big Context Analysis (Background/Automated)
```bash
# For background execution
gemini -m gemini-3-pro-preview --approval-mode yolo \
  "Analyze the entire codebase to understand:
   1. Overall architecture
   2. Key patterns and conventions
   3. Potential technical debt
   4. Refactoring opportunities"
```

### Interactive Code Review (Terminal Only)
```bash
# ONLY use default mode in interactive terminal
gemini -m gemini-3-pro-preview --approval-mode default \
  "Review the authentication flow for security issues"
```

## Troubleshooting Hung Gemini Processes

### Detection
```bash
# Check for hung processes
ps aux | grep -E "gemini.*gemini-3" | grep -v grep

# Look for these symptoms:
# - Process running 20+ minutes
# - CPU usage at 0%
# - Process state 'S' (sleeping)
# - No network connections
```

### Diagnosis
```bash
# Get detailed process info
ps -o pid,etime,pcpu,stat,command -p <PID>

# Check network activity
lsof -p <PID> 2>/dev/null | grep -E "(TCP|ESTABLISHED)" | wc -l
# If result is 0, process is hung
```

### Resolution
```bash
# Kill hung Gemini processes
pkill -9 -f "gemini.*gemini-3-pro-preview"

# Or kill specific PID
kill -9 <PID>

# Verify cleanup
ps aux | grep gemini | grep -v grep
```

### Prevention
- Use `--approval-mode yolo` for background/automated tasks — `default` hangs waiting for user input in non-interactive shells.
- Wrap with `timeout 300 gemini ...` as a safety net in case the process hangs on something else.
- Monitor the first run with `ps` to confirm it completes.

## Tips for Large Context Processing

1. **Be specific**: Provide clear, structured prompts for what to analyze
2. **Use include-directories**: Explicitly specify all relevant directories
3. **Choose the right model** (resolve current IDs via `config/model-registry.md`):
   - Use `gemini-flagship` for complex reasoning, coding tasks, and maximum analysis quality (recommended default)
   - Use `gemini-fast` for speed-critical tasks requiring sub-second response times
   - Use a legacy 2.5 tier (`gemini-2.5-flash`) only for cost-optimized high-volume batch processing where flagship/fast overspend
4. **Leverage Gemini 3's strengths**: 35% better at software engineering tasks, exceptional at agentic workflows and vibe coding
5. **Break down complex tasks**: Even with large context, structured analysis is more effective
6. **Save findings**: Ask Gemini to output structured reports that can be saved for reference
