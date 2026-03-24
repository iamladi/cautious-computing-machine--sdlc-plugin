---
name: gemini
description: Use when the user asks to run Gemini CLI for code review, plan review, or big context (>200k) processing. Ideal for comprehensive analysis requiring large context windows. Resolves the latest flagship model from the model registry.
---

# Gemini Skill

## Priorities

Approval mode correctness > Model selection > Background execution safety

## Model Registry

Load current models before executing — this overrides any model names in the tables below:
- `Glob(pattern: "**/sdlc/**/config/model-registry.md", path: "~/.claude/plugins")` → Read result
- Use `gemini-flagship` as the default model. Offer user `gemini-fast` for speed-critical tasks.
- If registry load fails, fall back to the tables below.

## Goal

Execute Gemini CLI for comprehensive code review, plan analysis, or large-context processing tasks. Ask user for model selection via AskUserQuestion. Choose approval mode based on execution context (yolo for background, default for interactive terminal only). Load CLI reference for detailed command patterns, troubleshooting, and use cases.

## Constraints

- NEVER use `--approval-mode default` in background or non-interactive shells (Claude Code tool calls). It hangs indefinitely waiting for user input.
- ALWAYS use `--approval-mode yolo` for automated/background tasks or wrap with timeout: `timeout 300 gemini ...`
- Ask user for model selection via AskUserQuestion before running commands.
- After Gemini completes, inform user they can start a new session for follow-up analysis.

## Model Selection (fallback — prefer registry)

Ask user which model to use via AskUserQuestion:

| Model | Best for | Context window | Key features |
| --- | --- | --- | --- |
| `gemini-3-pro-preview` | Flagship: Complex reasoning, coding, agentic tasks | 1M input / 64k output | Vibe coding, 76.2% SWE-bench, $2-4/M input |
| `gemini-3-flash` | Sub-second latency, speed-critical applications | 1M input / 64k output | Distilled from 3 Pro, TPU-optimized |
| `gemini-2.5-pro` | Legacy: Strong all-around performance | 1M input / 65k output | Thinking mode, mature stability |
| `gemini-2.5-flash` | Legacy: Cost-efficient, high-volume tasks | 1M input / 65k output | Best price ($0.15/M), thinking mode |
| `gemini-2.5-flash-lite` | Legacy: Fastest processing, high throughput | 1M input / 65k output | Maximum speed, minimal latency |

These model names may be outdated. Always prefer model-registry.md values when available.

## References

Load CLI reference for detailed command patterns, troubleshooting hung processes, and common use cases:

- `Glob(pattern: "**/sdlc/**/skills/gemini/references/gemini-cli-reference.md", path: "~/.claude/plugins")` → Read result

## Arguments

$ARGUMENTS
