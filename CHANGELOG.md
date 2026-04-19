# Changelog

All notable changes to the SDLC Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.30.0] - 2026-04-19

### Added
- `skills/domain-model/` — new skill that grills a plan's language against the target repo's `CONTEXT.md` and offers ADRs when architectural decisions meet the hard-to-reverse / surprising / real-trade-off bar. Includes `SKILL.md`, `CONTEXT-FORMAT.md`, and `ADR-FORMAT.md`. Writes files inline as decisions crystallise; stages without committing so `/sdlc:plan` step 6 can batch the commit.

### Changed
- `commands/plan.md` — added step 3.5 (domain-model interview) between research and draft. Intro now lists six checkpoints; step 6 commit list includes `CONTEXT.md` and `docs/adr/NNNN-*.md` produced during the interview. Plan draft blocks on unresolved terminology conflicts until addressed.

## [1.29.0] - 2026-04-18

### Added
- `OPUS_4_7_PROMPTING.md` — canonical workspace reference for writing prompts that get the best out of Claude Opus 4.7. Covers 12 principles (onboarding structure, explain-why, drop compensation phrases, find/filter split, etc.), the breaking-change checklist (removed `temperature`/`top_p`/`top_k`/`budget_tokens`/prefill), before/after examples, and primary source URLs. Referenced by system-prompt-clinic.

### Changed
- `commands/research-deep.md` rewritten for Opus 4.7 (283 → 163 lines). Collapsed Step 1-7 scaffolding into goal + cleanup invariant; flattened swarm/standard branching; stripped `CRITICAL`/`MUST`/`DO NOT` in favor of reasoned prose.
- `commands/implement.md` rewritten for Opus 4.7 (292 → 198 lines). Replaced subagent workflow step-list with role + success criteria; implementers trusted with TDD reference docs directly rather than pre-digested rule bullets.
- `commands/research.md` rewritten for Opus 4.7 (197 → 140 lines). Cleaned routing logic; replaced `YOUR ONLY JOB` caps-wall with reasoned scope paragraph.
- `commands/plan.md` rewritten for Opus 4.7 (151 → 106 lines). Compressed Constraints block; folded each rule's rationale into the relevant checkpoint.
- `skills/judgment-eval/SKILL.md` rewritten for Opus 4.7 (202 → 167 lines). Restructured as role + effort + scope; added find/filter discipline so 4.7 doesn't suppress surprising-but-defensible observations during evaluation.
- `skills/system-prompt-clinic/SKILL.md` rewritten for Opus 4.7 (188 → 167 lines). Aligned with `OPUS_4_7_PROMPTING.md` as canonical reference; added dedicated "Opus 4.7 alignment" section covering the breaking-change checklist.
- `agents/research-synthesizer.md` — "NEVER organize top-level sections by source LLM" rephrased with rationale (thematic > per-source for consensus surfacing).
- `references/blindspot-review-protocol.md` — softened `IMPORTANT`/`CRITICAL` gates with reason-attached prose.
- `skills/gemini/SKILL.md` + `gemini-cli-reference.md` — `NEVER`/`ALWAYS` on approval-mode replaced with reasoned hang-on-stdin explanation.

## [1.28.0] - 2026-04-13

### Added
- AI coding discipline rules in implementer agent self-review (silent fallbacks, boundary-only catch, lookup tables, debug log preservation)
- "No lookup tables" check in TDD per-cycle checklists (implementer + TDD skill)
- DDIA probes with relevance gate in blindspot review protocol (replication, partitioning, isolation, error boundaries)
- 2 new Tier 3 production failure probes (default value masking, hardcoded lookup tables)
- 3 new anti-pattern categories in code-quality-reviewer
- CI now runs type-checking and unit tests (previously only plugin validation)
- 109 new unit tests across 7 test files (release, validate-versions, validate-plugin, run-eval, cache, format)
- `test` script in package.json

### Changed
- Scoring rubric error handling examples updated to promote boundary-only catching at all 4 levels
- search-mcp: `startServer()` decomposed into `handleSearchRequest()` + orchestration
- search-mcp: exhaustive switch default in provider dispatch
- search-mcp/brave: `result_filter` from BraveOptions now applied to HTTP request
- search-mcp/brave: timeout configurable via `deps.timeoutMs` (was hardcoded 30s)
- eval: `runEval()` decomposed into `runCase()` + `generateReport()`
- x-search: `TwitterUser` interface replaces `any` in profile/format

### Fixed
- Eval harness now emits synthetic failed result on case execution errors (was silently passing)
- `formatProfileTelegram` shows "metrics unavailable" instead of fake zeros when `public_metrics` absent
- `thread()` catch typing improved from `any` to `unknown`
- `release.ts` JSON.parse guarded with try/catch
- Pre-existing type errors in resolve-models.test.ts and brave.test.ts

## [1.27.1] - 2026-04-10

### Changed
- Replace fatal error polling with Monitor tool in `research-deep` — per-LLM monitors tail output files for auth/quota errors immediately via `grep --line-buffered`

### Fixed
- Update all hardcoded Codex model references from `gpt-5.3-codex` to `gpt-5.4` in skill fallback tables, examples, and reference docs

## [1.27.0] - 2026-03-22

### Changed

- **`/review` rewritten as adversarial review with targeted failure probing** — based on "The Bug That Shipped" research (3,700+ trials) showing LLMs catch only 13% of production bugs in undirected review but 100% when asked targeted questions; three-phase architecture: context & probe generation, divergent perspective reviews (Codex as Failure Mode Analyst, Gemini as Production Environment Analyst), adversarial consolidation with cross-examination of clean verdicts
- **Anti-hallucination guards** — both reviewers must quote exact code lines, trace execution paths, and verify claims against actual implementation; "default to UNSAFE" posture replaces implicit "default to approve"
- **Report structure** — adds Contradictions (one model praised what the other flagged), Probes with Clean Verdicts, and What Was NOT Checked sections for full transparency

### Added

- **`references/production-failure-patterns.md`** — library of 12 production failure patterns (thundering herd, OOM, N+1, connection pool exhaustion, cron double-execution, cache stampede, etc.) organized by undirected catch rate tier with probe questions and diff trigger keywords

## [1.26.0] - 2026-02-28

### Added

- **`/implement` de-slop gate** — non-blocking check at end of every session; runs `uvx desloppify scan --path .`, reports strict score, and offers "Fix now or later?" before session ends; skips silently when desloppify unavailable

### Changed

- **TDD skill per-cycle checklist** — new "No type theater" gate: if a test could only fail as a type error the type system already catches it at compile time — delete the test
- **`test-quality.md` reference** — added "Test What the Type System Already Guarantees" bad-tests section with before/after examples covering `typeof` checks and shape assertions that duplicate TypeScript's static guarantees

## [1.25.1] - 2026-02-27

### Added

- **x-search wired into web-search-researcher** — when `X_BEARER_TOKEN` is set, x-search runs in parallel with `fast_deep_search` for library/framework/product queries; surfaces community discourse as a dedicated findings section
- **`Use when` triggers on all 4 previously undiscoverable skills** — `x-search`, `judgment-eval`, `constitution-compliance-review`, and `system-prompt-clinic` now have explicit trigger phrases so the model knows when to invoke them

### Changed

- **web-search-researcher agent** — added `Bash` tool to enable x-search CLI execution; added x-search strategy section

## [1.25.0] - 2026-02-27

### Added

- **Scope Challenge Checkpoint** — mandatory pre-interview step that assesses existing code overlap and minimum footprint before research begins; agent must explicitly choose SCOPE REDUCTION or PROCEED
- **What Already Exists summary** — after codebase exploration, classifies each relevant abstraction as REUSE / EXTEND / REPLACE with one-line justification before authoring Solution Design
- **Per-codepath risk assessment** — each new codepath in the Implementation Plan gets a structured one-liner: failure condition, symptom, and fallback
- **TODOS.md deferred tracking** — out-of-scope items from the plan are appended to `TODOS.md` with why/context/dependencies instead of being silently dropped

## [1.24.0] - 2026-02-27

### Added

- **Cross-pollination refinement phase** — new Phase 3 where each LLM reads all peer analyses with skepticism, conducts new research, and produces refined `*-refined.md` output (inspired by hamelsmu/research-council)
- **Iterative research with completion marker** — LLMs continue until self-signaling `<!-- RESEARCH_COMPLETE -->`, with explicit gap identification on each continuation
- **Fatal error detection** — polls external LLM output every 10s, proactively kills on quota/auth/rate-limit patterns instead of waiting for timeout
- **Theme-based synthesis** — synthesizer organizes findings by theme instead of by source LLM; new sections for Areas of Consensus, Areas of Disagreement, and Novel Insights from Cross-Pollination
- **New eval assertions** — `has-four-phases`, `has-cross-pollination`, `has-completion-marker`, `has-fatal-error-detection`, `has-refined-outputs`, `has-theme-based-synthesis`

### Changed

- **4-phase pipeline** — Discovery → Independent Analysis → Cross-Pollination Refinement → Synthesis (was 3-phase)
- **research-synthesizer agent** rewritten for theme-based organization with cross-pollination awareness

## [1.23.0] - 2026-02-15

### Changed

- **Renamed search MCP tool** from `search_web` to `fast_deep_search` — resolves name collision with Claude Code's built-in `WebSearch` that prevented Exa/Brave providers from being called
- **Renamed MCP server** from `search` to `fast_deep_search` in `.mcp.json` (underscores for consistent qualification; agent-context name: `mcp__fast_deep_search__fast_deep_search`)
- **Updated tool description** to clearly differentiate from built-in `WebSearch`: "Search via Exa, Brave, or Perplexity APIs. Provides deeper, more configurable results than built-in WebSearch."
- **web-search-researcher agent** now uses primary/fallback strategy — calls `fast_deep_search` first, falls back to `WebSearch` only on error or tool unavailability (previously called both in parallel)

### Breaking Changes

- MCP tool name changed: `search_web` → `fast_deep_search` (agent-context: `mcp__fast_deep_search__fast_deep_search`, full plugin-qualified: `mcp__plugin_sdlc_fast_deep_search__fast_deep_search`)

## [1.22.0] - 2026-02-14

### Changed

- **Swarm mode default** — `/research` now uses agent team (swarm) workflow by default; opt out with `--no-swarm` instead of opting in with `--swarm`

## [1.21.0] - 2026-02-14

### Changed

- **Mandatory web search** in `/research`, `/research-deep`, and `/plan` — web-search-researcher now always spawns in parallel with codebase subagents instead of only when explicitly requested
- **Parallel search strategy** in web-search-researcher agent — calls `mcp__search__search_web` and `WebSearch` in parallel instead of sequential Sonar-first flow
- **Graceful degradation** — all commands complete even when search APIs are unavailable; explicit partial and total failure handling in the agent

## [1.20.0] - 2026-02-14

### Added

- **Multi-provider search MCP server** — unified `search_web` tool supporting Exa, Brave, and Perplexity via OpenRouter
- **Provider adapters** with consistent error handling, timeout management, and response formatting
- **Provider parameter validation** — cross-provider param misuse returns clear errors
- **Automatic provider detection** from environment variables with priority cascade: Exa > Brave > Perplexity

### Fixed

- **Exa timeout memory leak** — `setTimeout` in `Promise.race` pattern now cleaned up via `finally` block
- **Redundant `clearTimeout`** in Perplexity SSE stream error handler

### Removed

- **Old `perplexity-mcp/`** directory replaced by new `search-mcp/` implementation

## [1.19.1] - 2026-02-12

### Changed

- **Default Codex model** upgraded from `gpt-5.1-codex` to `gpt-5.3-codex` (25% faster inference, better agentic coding)
- **Code review flagship** upgraded from `gpt-5.2-codex` to `gpt-5.3-codex` across `/review`, blindspot protocol, and PRD template
- **Model tables** updated with `gpt-5.3-codex` as ⭐⭐ flagship and `gpt-5.3-codex-spark` research preview (1000+ tokens/s via Cerebras)
- **All documentation** updated: README, examples, CLI reference, skill definition


## [1.19.0] - 2026-02-12

### Added

- **4-phase vertical TDD workflow** — Planning → Tracer Bullet → Incremental Loop → Refactor, replacing simple presence-check enforcement
- **Per-cycle checklist** — behavioral tests, public interface only, survives refactor, minimal code, no horizontal drift
- **TDD reference documents** — mocking policy (boundary-only), interface design (DI), test quality (behavioral), refactoring guidance
- **TDD reference injection** — `/implement` now injects key TDD excerpts into implementer subagent prompts when TDD mode is strict or soft

### Changed

- **`skills/tdd/SKILL.md`** — rewritten with anti-pattern documentation (horizontal vs vertical slicing) and explicit phase entry/exit criteria
- **`agents/implementer.md`** — vertical TDD workflow instructions with per-cycle checklist
- **`skills/test/references/test-patterns.md`** — mock example aligned with boundary-only policy

## [1.18.1] - 2026-02-10

### Fixed

- **`/research --swarm` routing** — replaced advisory "Argument Parsing" + "Mode Selection" with imperative "CRITICAL: Route Selection" gate; reordered Swarm Workflow before Standard Workflow to prevent top-to-bottom execution bias
- **`/research-deep --swarm` routing** — strengthened "CRITICAL: Parse Flags and Route" with imperative skip directives; reordered Swarm Discovery before Standard Discovery

## [1.18.0] - 2026-02-10

### Changed

- **Migrated Perplexity MCP server from direct API to OpenRouter** (#31)
  - Rewrote bundled 11,860-line `index.js` as clean ~285-line TypeScript `index.ts`
  - Routes through OpenRouter (`https://openrouter.ai/api/v1/chat/completions`) instead of Perplexity API directly
  - Runs directly with `bun` (no build step, no bundled JS)
  - SSE streaming parser with 120s timeout, error event handling, defensive citation/image accumulation
  - Citations parsed from top-level `response.citations` (OpenRouter/Sonar format)
  - Default model: `perplexity/sonar-pro` (configurable via `OPENROUTER_MODEL`)

### Breaking Changes

- **Tool renamed**: `perplexity_search_web` → `search_web` (full qualified: `mcp__perplexity__search_web`)
- **Environment variables**: `PERPLEXITY_API_KEY` → `OPENROUTER_API_KEY`, `PERPLEXITY_MODEL` → `OPENROUTER_MODEL`
- **Removed parameters**: `return_citations`, `return_images` (citations come automatically from Sonar)
- **Runtime**: MCP server now requires Bun instead of Node.js

## [1.17.0] - 2026-02-09

### Added

- **Default interview integration** for `/plan`, `/research`, and `/implement` commands
  - Interview runs automatically before main workflow — no manual `/interview` invocation required
  - `/plan`: Replaced conditional Ambiguity Detection Checkpoint with unconditional Interview Checkpoint
  - `/research`: Added Interview Checkpoint before Context Gathering (Standard) and Context Preparation (Swarm)
  - `/implement`: Added Interview Checkpoint after Plan Input, before Mode Selection — uses parsed plan content as topic, not raw file path
  - All three commands reference `skills/interview/SKILL.md` via Glob with conversation-context-only override
  - New `has-interview-checkpoint` structural eval assertions for plan, research, and implement

## [1.16.0] - 2026-02-09

### Added

- **`--swarm` flag for `/implement`** — parallel team implementation for independent tasks
  - Analyzes file overlap to identify independent task clusters
  - Spawns one teammate per independent task for parallel execution
  - Runtime file overlap detection with serialization fallback
  - Preserves spec-reviewer + code-quality-reviewer gates per task
  - Dependent tasks managed via shared task list with blockedBy relationships
  - Lead-only git protocol (teammates edit files, lead commits)
  - Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

## [1.15.0] - 2026-02-08

### Added
- `x-search` skill — search X/Twitter for real-time developer discourse, product feedback, community sentiment, and expert opinions
  - CLI tool with search, profile, thread, watchlist, and cache subcommands
  - Iterative research approach with thread following and linked content deep-dives
  - X search operator support for noise reduction and signal targeting

### Changed
- Rewrote `x-search/SKILL.md` for constitution alignment (4.6/10 → ~7.5/10) — replaced procedural CLI docs and 6-step research loop with reasoning-based principles

## [1.14.0] - 2026-02-07

### Added
- `constitution-compliance-review` skill — scoring rubric for Constitution alignment (5 dimensions, 1-10 scale)
- `system-prompt-clinic` skill — diagnoses and transforms prompts from rule-based to reasoning-based
- `judgment-eval` skill — evaluates agent judgment through edge-case scenarios

### Changed
- Rewrote `review.md` from rigid format prescription to judgment-driven multi-model synthesis
- Rewrote `research.md` from state-machine swarm workflow to coordination principles with convergence guardrails
- Rewrote `plan.md` from constraint bullet lists to reasoning-based checkpoints
- Rewrote `implementer.md` from checklist to dimension-based self-review with scope discipline reasoning
- Rewrote `tdd/SKILL.md` from state machine modes to concise principles with escape criteria
- Fixed hardcoded absolute path in system-prompt-clinic (P0)

## [1.13.0] - 2026-02-07

### Added
- **`--swarm` flag for `/research` and `/research-deep`** — opt-in agent team-based parallel research
  - Spawns 3 teammates (locator, analyzer, pattern-finder) that explore the codebase in parallel and communicate findings
  - `/research-deep --swarm` uses team for Discovery phase; Analysis (multi-LLM) and Synthesis unchanged
  - Feature flag validation with graceful fallback to subagent mode
  - Unique timestamped team names, 10-minute timeout, always-run cleanup
  - Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- Swarm mode examples in `examples/research-examples.md`

## [1.12.0] - 2026-02-07

### Changed
- **Declarative cleanup of all 22 prompt files** — 74% line reduction (4,530 → 1,166 lines)
  - Rewrote 7 commands, 6 skills, 9 agents from imperative to 5-layer declarative structure
  - Extracted 6 reference files (PRD template, blindspot protocol, documentarian constraints, test patterns, Gemini/Codex CLI refs)
  - Deduplicated shared documentarian constraints into single reference file
  - Removed casual language and urgency marker stacking

### Added
- **Eval harness** (`eval/`) — 157 structural assertions across all 22 prompts for regression testing
  - `bun run eval` for structural checks, `bun run eval:llm` for behavioral (API-based)
  - Baseline captured for future comparison

## [1.11.0] - 2026-01-25

### Added
- **Multi-LLM Blindspot Review** for `/plan` command
  - Phase 2: Codex and Gemini run in parallel as plan critics
  - Phase 3: Claude incorporates valid feedback into the plan
  - Critics look for missing edge cases, dependency gaps, risk underestimation, testing gaps
  - Consensus markers: `[Consensus]`, `[Codex]`, `[Gemini]` for attribution
  - New plan template section: `## Blindspot Review` with addressed/deferred/dismissed concerns
  - New frontmatter fields: `reviewed`, `reviewers`

## [1.10.0] - 2026-01-25

### Added
- **`/research-deep` command** - Parallel research with synthesis
  - Runs 3 independent research instances simultaneously
  - Instance 1 (Breadth): Finds all relevant files, casts wide net
  - Instance 2 (Depth): Deep analysis, traces data flow
  - Instance 3 (Patterns): Finds similar patterns, edge cases
  - Merges findings into comprehensive document with consensus tracking

- **`research-synthesizer` agent** - Merges parallel research reports
  - Identifies consensus findings (high confidence)
  - Preserves unique discoveries from each instance
  - Flags conflicts between reports
  - Coverage analysis with file reference deduplication

## [1.9.0] - 2026-01-25

### Added
- **Subagent-Driven Development** - `/implement` now dispatches fresh agents per task with two-stage review
  - **`implementer` agent** - Fresh-context task implementation, TDD-aware, self-reviews, commits changes
  - **`spec-reviewer` agent** - Verifies implementation matches spec exactly (nothing missing, nothing extra)
  - **`code-quality-reviewer` agent** - Quick sanity check for obvious bugs, code smells, security issues
  - Controller answers subagent questions from context, escalates to human if unsure
  - Review loops with max 3 iterations before escalating

- **`/tdd` skill** - TDD enforcement during implementation
  - `strict` mode: Test-first required with human escape hatch for prototyping
  - `soft` mode: Warnings for missing tests without blocking
  - `off` mode: No TDD checks (default)
  - Reads `tdd:` setting from project's CLAUDE.md

- **`/finish-branch` skill** - Post-merge cleanup workflow
  - Detects PR merge status
  - Switches to main, pulls latest
  - Runs test suite to verify
  - Removes worktree if exists
  - Safe cleanup with checks to prevent data loss

### Enhanced
- **`/implement` command** - Major update to subagent workflow
  - Pre-flight TDD mode check
  - Per-task agent dispatch (implementer → spec-reviewer → code-quality-reviewer)
  - Question handling: controller answers from context, escalates if unsure
  - Review loops with convergence limits
  - Issue checkbox updates per-phase
  - Backward compatible: trivial tasks can skip subagent overhead

### Philosophy
- Fresh context per task prevents drift from plan
- Two-stage review (spec + quality) catches issues early
- Controller orchestrates without context pollution

## [1.8.0] - 2026-01-10

### Added
- **`/test` skill** - Write, review, and convert tests following Kent C. Dodds principles
  - **Write mode** (default): Generate flat tests with setup functions for source files
  - **Review mode**: Scan test files for anti-patterns with specific fix suggestions
  - **Convert mode**: Transform nested tests to flat structure with disposables
  - Framework detection (Vitest, Bun test, recommends Vitest for Jest)
  - Templates for unit, integration, and API tests
  - Disposable fixtures with `using` keyword for automatic cleanup

- **`test-writer` agent** - Auto-spawns for test-related tasks
  - Enforces flat structure (max 1 describe level)
  - Composable setup() functions instead of beforeEach
  - Disposable fixtures with Symbol.asyncDispose
  - AHA principle (Avoid Hasty Abstractions)

### Enhanced
- **Testing philosophy** - Kent C. Dodds principles baked into tooling
  - No nested describes
  - No beforeEach for test data
  - No shared mutable state
  - Explicit over implicit

## [1.7.0] - 2026-01-07

### Improved
- **Question UX** - Better patterns for `/interview` and `/plan` commands
  - Mark recommended options with `(Recommended)` label
  - Include "Not sure - you decide" escape hatch for low-stakes decisions
  - Support compact response format: `1a 2b` or `defaults`
  - Expanded anti-patterns: don't ask what you can discover via code

## [1.6.0] - 2025-12-29

### Added
- **`/interview` skill** - Deep interviews about any topic using Opus model
  - Works on files (plans, code) or topics/ideas
  - Iterative questioning with AskUserQuestion
  - Non-obvious questions that dig deep
  - Updates files in-place or summarizes insights

- **Smart interview phase for `/plan`** - Asks questions only when genuinely ambiguous
  - Detects ambiguities before generating plan content
  - Asks focused questions about architecture, scope, tradeoffs
  - Skips obvious questions that can be inferred
  - References `/interview` for deeper follow-up

### Enhanced
- **`/plan` command** - Now includes "Phase 0: Ambiguity Detection" before planning
- **README** - Added interview skill documentation and usage examples

## [1.5.0] - 2025-12-29

### Added
- **`/review` command** - Parallel code review with GPT-5.2-Codex and Gemini 3 Pro
  - Reviews git diff (staged + unstaged changes by default)
  - Runs both reviewers concurrently for speed
  - Consolidates findings with deduplication
  - Priority-based organization (P0-P3)
  - Consensus flagging when both reviewers agree
  - Unified markdown report with overall verdict

- **GPT-5.2-Codex support** - New flagship model for code review
  - `gpt-5.2-codex` added to Codex skill model options
  - 79% SWE-bench Pro performance
  - Optimized for xhigh reasoning effort

- **`xhigh` reasoning effort** - Maximum quality setting for Codex
  - Best for code review, security analysis, architecture review
  - Requires `gpt-5.2-codex` model

### Enhanced
- **Codex skill** - Added Code Review Mode section with review command pattern and output format
- **README** - Documented new `/review` command with usage examples

## [1.4.0] - 2025-12-23

### Added
- Version synchronization enforcement across package.json, plugin.json, and CHANGELOG.md
- New `validate-versions.ts` script to check version consistency
- New `release.ts` script for atomic version bumps across all 3 files
- New npm scripts: `validate:versions`, `release:patch`, `release:minor`, `release:major`
- Self-reflection guidance during implementation (from 1.3.2)
- Session naming and ultrathink to SDLC commands (from 1.3.2)

### Changed
- CI workflow now triggers on all pushes (removed paths filter) to catch version mismatches
- `validate-plugin.ts` now checks version synchronization before other validations

### Fixed
- Version mismatch: CHANGELOG was behind (1.3.0 vs package.json/plugin.json 1.3.2)
- Gemini CLI hanging on interactive prompts (from 1.3.1)

## [1.3.0] - 2025-11-19

### Added
- **GPT-5.1 model support** - Updated Codex skill with latest OpenAI models
  - `gpt-5.1-codex` as new flagship default model
  - `gpt-5.1-codex-mini` for cost-efficient workflows (4x more usage at $0.25/$2.00)
  - `gpt-5.1-thinking` for ultra-complex reasoning tasks
  - 76.3% SWE-bench performance (vs 72.8% GPT-5)
  - 30% faster on average tasks with adaptive reasoning
  - Enhanced capabilities: better tool handling, reduced hallucinations, improved code quality
  - Context: 400K input / 128K output with 90% cache discount

### Changed
- **Default Codex model** set to `gpt-5.1-codex` (previously required user selection)
- Removed GPT-5 models, replaced with GPT-5.1 variants
- Updated all Codex skill examples and documentation to use GPT-5.1 models
- Simplified model selection: no longer asks user, defaults to gpt-5.1-codex

### Enhanced
- **Model selection guide** with detailed GPT-5.1 specs and benchmark comparisons
- **Examples documentation** updated with GPT-5.1 use cases and recommendations
- Added CLI version requirement (v0.57.0+) and configuration notes
- Expanded cost optimization guidance with codex-mini variant

## [1.2.0] - 2025-11-19

### Added
- **Gemini 3 model support** - Updated Gemini skill with latest Google AI models
  - `gemini-3-pro-preview` as new flagship default model
  - `gemini-3-flash` for sub-second latency tasks
  - 35% higher accuracy on software engineering benchmarks vs Gemini 2.5 Pro
  - State-of-the-art performance: 76.2% SWE-bench, 91.9% GPQA Diamond
  - Enhanced capabilities: vibe coding, agentic workflows, multimodal understanding
  - Knowledge cutoff: January 2025

### Changed
- **Default Gemini model** changed from `gemini-2.5-flash` to `gemini-3-pro-preview`
- Updated all Gemini skill examples and documentation to use Gemini 3 models
- Legacy Gemini 2.5 models still available for cost-optimized workflows

### Enhanced
- **Model selection guide** with detailed specs and benchmark comparisons
- **Quick reference table** updated with Gemini 3 use cases
- Added note about upcoming `gemini-3-deep-think` for ultra-complex reasoning
- CLI version requirement documented (v0.16.0+)

## [1.1.1] - 2024-11-16

### Added
- **Validation gate in `/verify`** - Catches plugin schema errors before PR creation
  - Automatically runs `bun run validate` (if exists in package.json)
  - Prevents CI failures from validation issues locally
  - Clear error messages with fix instructions

- **Auto-verification in `/submit`** - Quality gate before PR creation
  - `/submit` automatically runs `/verify` if not already done
  - Ensures no PRs are created with validation errors
  - User can skip if already verified in conversation context

- **Plugin validation checklist in plan template**
  - Phase 4 now includes plugin-specific validation tasks
  - Commands documented in README.md
  - Plugin.json schema valid
  - Validation script passes

### Enhanced
- **Documentation improvements**
  - New "Recommended Workflow" section with visualization
  - Plugin validation examples showing real error scenarios
  - Build validation examples for regular projects
  - Clear explanation of quality gates

### Benefits
- Catch issues locally before submitting to CI
- Prevents broken PRs from reaching GitHub
- Explicit validation requirements in planning
- Better developer experience with clear error messages

## [1.1.0] - 2024-11-16

### Added
- **GitHub Issue integration** - Plans now create GitHub Issues with implementation checklists
  - New workflow: `/plan` → `/github:create-issue-from-plan` → `/implement #issue` → `/submit`
  - Automatic Issue creation from plan Overview and Implementation Phases
  - Plan frontmatter linking with Issue numbers

- **Enhanced `/implement` command** - Supports both Issue numbers and plan file paths
  - Accept Issue number input: `/implement #123`
  - Accept plan file input: `/implement plans/feature.md`
  - Updates Issue checkboxes during implementation (not plan files)
  - Plan stays immutable as specification

- **Enhanced `/submit` command** - Expects Issues created before submission
  - Validates Issue number in plan frontmatter
  - Better error messaging for missing Issues
  - Passes Issue number to PR creation

- **Plan frontmatter metadata** - Structured YAML for traceability
  - `title` - Plan title
  - `type` - Bug|Feature|Chore|Refactor|Enhancement|Documentation
  - `issue` - GitHub Issue number (populated after creation)
  - `research` - Array of related research file paths
  - `status` - Draft|In Progress|Implemented
  - `created` - ISO date of plan creation

- **Comprehensive documentation** - Complete Plan → Issue → PR workflow
  - Visual workflow diagram
  - Phase-by-phase usage examples
  - Plan frontmatter reference guide
  - GitHub integration command documentation

### Changed
- Plan format now includes YAML frontmatter for metadata
- `/implement` no longer updates plan file checkboxes (moved to Issue)
- Progress tracking separated: Plan = spec, Issue = execution

### Benefits
- Single source of truth for implementation progress
- Cleaner git history (no checkpoint commits)
- Better team collaboration via GitHub Issues
- Full traceability chain: Research → Plan → Issue → PR → Code

## [1.0.1] - 2025-10-30

### Fixed
- Fixed directory typo: renamed `.cluade-plugin` to `.claude-plugin`
- Removed invalid `engines` field from plugin.json (not supported by Claude Code schema)

### Added
- GitHub Actions workflow for automated plugin schema validation
- Validation script using Zod for schema enforcement with proper field validation
- CI/CD pipeline to validate plugin.json on PRs and pushes

## [1.0.0] - 2025-10-30

### Added

#### Agents
- **codebase-analyzer** - Deep implementation analysis with precise file:line references
  - Traces data flow and control flow through code
  - Documents architectural patterns and design decisions
  - Maps API contracts between components
  - Provides surgical precision in code analysis

- **codebase-locator** - Fast component discovery and location
  - Finds files, functions, classes by name patterns
  - Searches configuration and dependencies
  - Quick navigation across large codebases

- **codebase-pattern-finder** - Pattern detection and architectural understanding
  - Identifies design patterns in use
  - Discovers architectural decisions
  - Finds common conventions and best practices
  - Maps integration points between systems

- **web-search-researcher** - Real-time web research capabilities
  - Performs context-aware research queries
  - Integrates with project knowledge
  - Provides up-to-date information

#### Commands
- **/plan** - Comprehensive PRD generation
  - Problem statement and goals definition
  - User stories with acceptance criteria
  - Functional and non-functional requirements
  - Implementation phases with complexity ratings
  - Testing strategy and validation commands
  - Risk assessment and rollback planning

- **/research** - AI-powered research with project context
  - Web search integration
  - Project-specific context awareness
  - Structured research output

- **/implement** - Guided implementation execution
  - Plan-based implementation
  - Step-by-step guidance
  - Progress tracking

- **/submit** - Work preparation for review
  - Code review readiness
  - Documentation verification
  - Quality checks

- **/verify** - Implementation validation
  - Acceptance criteria verification
  - Test execution
  - Regression checks

#### Skills
- **codex** - OpenAI Codex integration
  - Advanced code analysis
  - Automated refactoring
  - Multiple reasoning effort levels (high/medium/low)
  - Sandbox modes (read-only/workspace-write/danger-full-access)
  - Session resumption support

- **gemini** - Google Gemini integration
  - Alternative AI analysis capabilities
  - Extended model options

#### Integrations
- **Context7 MCP Server** - Library documentation access
  - Up-to-date documentation retrieval
  - Code examples and patterns
  - Library ID resolution

- **Perplexity MCP Server** - Advanced web search
  - Real-time information retrieval
  - Configurable model selection
  - Recency filtering (day/week/month/year)

#### Infrastructure
- Plugin manifest (`.claude-plugin/plugin.json`)
- MCP server configuration (`.mcp.json`)
- Hook logging system (`logs/`)
- Perplexity MCP server implementation (`utils/perplexity-mcp/`)

#### Documentation
- Comprehensive README.md
- Installation and setup guide
- Usage examples and patterns
- Troubleshooting guide
- Plugin structure documentation

### Configuration
- Environment variable support for API keys
- Customizable MCP server models
- Plugin root path resolution with `${CLAUDE_PLUGIN_ROOT}`

### Developer Experience
- Debug mode support
- Component registration verification
- Detailed error messages
- Hook execution logging

## [Unreleased]

### Planned Features
- Additional specialized agents for testing and deployment
- Enhanced hook system for lifecycle events
- More MCP server integrations
- Custom command templates
- Interactive plan refinement

---

## Version History

### Version Numbering
- **Major** (X.0.0): Breaking changes, major feature additions
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, minor improvements

### Release Notes Format
Each release includes:
- **Added**: New features and capabilities
- **Changed**: Changes to existing functionality
- **Deprecated**: Features marked for removal
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

For detailed changes and commit history, see the [Git log](https://github.com/iamladi/sdlc-plugin/commits/main).
