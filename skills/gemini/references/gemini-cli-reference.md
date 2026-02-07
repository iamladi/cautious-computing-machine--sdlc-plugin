<!-- Gemini CLI Reference - Extracted from skills/gemini/SKILL.md -->
<!-- Used by: /gemini skill -->

## Quick Reference

| Use case | Approval mode | Key flags |
| --- | --- | --- |
| Background code review | `yolo` ✅ | `-m gemini-3-pro-preview --approval-mode yolo` |
| Background analysis | `yolo` ✅ | `-m gemini-3-pro-preview --approval-mode yolo` |
| Background with timeout | `yolo` ✅ | `timeout 300 gemini -m gemini-3-pro-preview --approval-mode yolo` |
| Interactive code review | `default` | `-m gemini-3-pro-preview --approval-mode default` (interactive terminal only) |
| Code review with auto-edits | `auto_edit` | `-m gemini-3-pro-preview --approval-mode auto_edit` |
| Automated refactoring | `yolo` | `-m gemini-3-pro-preview --approval-mode yolo` |
| Speed-critical background | `yolo` ✅ | `-m gemini-3-flash --approval-mode yolo` |
| Cost-optimized background | `yolo` ✅ | `-m gemini-2.5-flash --approval-mode yolo` |
| Multi-directory analysis | `yolo` (if background) | `--include-directories <DIR1> --include-directories <DIR2>` |
| Interactive with prompt | `auto_edit` or `default` | `-i "prompt" --approval-mode <mode>` |

## Model Selection Guide

| Model | Best for | Context window | Key features |
| --- | --- | --- | --- |
| `gemini-3-pro-preview` ⭐ | **Flagship model**: Complex reasoning, coding, agentic tasks | 1M input / 64k output | Vibe coding, 76.2% SWE-bench, $2-4/M input |
| `gemini-3-flash` | Sub-second latency, speed-critical applications | 1M input / 64k output | Distilled from 3 Pro, TPU-optimized |
| `gemini-2.5-pro` | Legacy: Strong all-around performance | 1M input / 65k output | Thinking mode, mature stability |
| `gemini-2.5-flash` | Legacy: Cost-efficient, high-volume tasks | 1M input / 65k output | Best price ($0.15/M), thinking mode |
| `gemini-2.5-flash-lite` | Legacy: Fastest processing, high throughput | 1M input / 65k output | Maximum speed, minimal latency |

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
- **ALWAYS use `--approval-mode yolo` for background/automated tasks**
- Add timeout wrapper for safety: `timeout 300 gemini ...`
- Never use `--approval-mode default` in non-interactive shells
- Monitor first run with `ps` to ensure process completes

## Tips for Large Context Processing

1. **Be specific**: Provide clear, structured prompts for what to analyze
2. **Use include-directories**: Explicitly specify all relevant directories
3. **Choose the right model**:
   - Use `gemini-3-pro-preview` for complex reasoning, coding tasks, and maximum analysis quality (recommended default)
   - Use `gemini-3-flash` for speed-critical tasks requiring sub-second response times
   - Use `gemini-2.5-flash` for cost-optimized high-volume processing
4. **Leverage Gemini 3's strengths**: 35% better at software engineering tasks, exceptional at agentic workflows and vibe coding
5. **Break down complex tasks**: Even with large context, structured analysis is more effective
6. **Save findings**: Ask Gemini to output structured reports that can be saved for reference
