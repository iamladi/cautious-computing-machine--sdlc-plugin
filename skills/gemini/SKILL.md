---
name: gemini
description: Use when the user asks to run Gemini CLI for code review, plan review, or big context (>200k) processing. Ideal for comprehensive analysis requiring large context windows. Resolves the latest flagship model from the model registry.
---

# Gemini Skill

## Role

Run Gemini CLI as a delegated reasoning engine for code review, plan review, and large-context analysis (>200k tokens). Gemini has its own model selection and its own approval model — your job is to invoke it correctly for the execution context, surface its results, and keep the user in control of any side-effecting operation.

## Success looks like

- Approval mode matches the execution context: `yolo` when Claude Code invokes Gemini as a background tool call, `default` only in an interactive human terminal, `auto_edit` when the user explicitly wants Gemini to apply edits without confirmation.
- Model matches task shape — flagship for review and analysis, fast for speed-critical or high-volume work. The user picked it; you didn't pick silently.
- The output you return to the user is Gemini's output, not a paraphrase. Trust the tool.
- The user knows they can start a fresh Gemini session to follow up, since the CLI is stateless between invocations.

## Model selection

Resolve the registry first, since model IDs shift:
- `Glob(pattern: "**/sdlc/**/config/model-registry.md", path: "~/.claude/plugins")` then Read
- Default to `gemini-flagship`. Offer `gemini-fast` when the user flags speed or cost as the constraint.
- Ask via `AskUserQuestion` before invoking — don't pick silently, since flagship and fast have very different cost/quality tradeoffs and the user owns that call.

If the registry load fails, fall back to the table below. Treat the names as possibly stale and say so when reporting.

| Model | Best for | Context | Notes |
| --- | --- | --- | --- |
| `gemini-3-pro-preview` | Flagship — complex reasoning, coding, agentic tasks | 1M / 64k | 76.2% SWE-bench |
| `gemini-3-flash` | Sub-second latency, speed-critical | 1M / 64k | Distilled from 3 Pro |
| `gemini-2.5-pro` | Legacy — strong all-around | 1M / 65k | Thinking mode |
| `gemini-2.5-flash` | Legacy — cost-efficient, high-volume | 1M / 65k | Cheapest tier |
| `gemini-2.5-flash-lite` | Legacy — fastest, high throughput | 1M / 65k | Minimal latency |

## Invocation shape

Approval mode is the load-bearing flag — the failure mode is silent and expensive, so the reasoning needs to be inline:

- `--approval-mode yolo` for anything Claude Code runs as a tool call. The invocation happens in a non-interactive shell; `default` waits for a stdin confirmation that will never arrive and the process hangs indefinitely, burning wall-clock until something notices. This is the correct mode for every background invocation in this workspace.
- `--approval-mode default` only in an interactive human terminal where a person can actually type `y`. If you're unsure whether the shell is interactive, assume it isn't.
- `--approval-mode auto_edit` when the user explicitly wants Gemini to apply edits without per-change confirmation. Treat as a blast-radius change — name it to the user before using.

Wrap with `timeout 300 gemini ...` as a safety net when the task has any chance of hanging on network, rate-limit, or a pathological input. The timeout is cheap insurance; a hung Gemini process can sit at 0% CPU for hours.

Use `--include-directories <DIR>` (repeatable) when the analysis needs files outside the current working directory. Don't rely on Gemini discovering them.

## Operating notes

- `yolo` and `auto_edit` are the two modes that change blast radius materially. `yolo` lets Gemini run any tool without confirmation within its sandbox; `auto_edit` lets it write files. Don't add either to a command without naming it to the user first.
- After Gemini completes, tell the user once: "Gemini sessions don't persist — start a new one for follow-up analysis." This is the discoverability hook; the CLI doesn't surface it.
- If a Gemini process appears hung (long runtime, 0% CPU, no network), reference `references/gemini-cli-reference.md` for the detection/diagnosis/kill pattern — don't guess. Surface the exit code and any stderr rather than silently retrying.

## References

CLI flag reference, approval-mode matrix, and troubleshooting for hung processes live in `references/gemini-cli-reference.md`. Load when you need flag details — don't paraphrase, the examples are the contract:
- `Glob(pattern: "**/sdlc/**/skills/gemini/references/gemini-cli-reference.md", path: "~/.claude/plugins")` → Read

## Arguments

$ARGUMENTS
