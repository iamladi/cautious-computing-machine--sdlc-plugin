# SDLC Plugin for Claude Code

A comprehensive Claude Code plugin that enhances your software development lifecycle with specialized agents, commands, and integrations.

## Features

### 🤖 Specialized Agents

- **codebase-analyzer** - Deep implementation analysis with precise file:line references
- **codebase-locator** - Fast component location and discovery across your codebase
- **codebase-pattern-finder** - Pattern detection and architectural understanding
- **web-search-researcher** - Real-time research capabilities via web search
- **implementer** - Fresh-context task implementer for subagent workflow (TDD-aware, self-reviews)
- **spec-reviewer** - Verifies implementation matches spec exactly (nothing missing, nothing extra)
- **code-quality-reviewer** - Quick sanity check for obvious bugs and code smells
- **test-writer** - Dispatched delegate paired with the `test` skill; writes tests following Kent C. Dodds shape rules (flat structure, factories, disposables)
- **research-synthesizer** - Merges multiple research reports into comprehensive document with theme-based synthesis; surfaces consensus findings, disagreements, and novel insights from cross-pollination

### ⚡ Commands

- **/plan** - Generate detailed implementation plans with phases, complexity analysis, and validation steps
- **/research** - AI-powered research with project context
- **/research-deep** - Parallel research with 3 instances and synthesis for comprehensive coverage
- **/implement** - Execute implementation based on generated plans
- **/review** - Parallel code review with Codex and Gemini (models resolved from `config/model-registry.md`), consolidated findings
- **/submit** - Prepare and submit work for review
- **/verify** - Validate implementation against acceptance criteria

### 🎯 Skills

- **codex** - OpenAI Codex integration for code analysis, review, refactoring, and automated editing (model auto-resolved from registry)
- **gemini** - Google Gemini integration for code review, plan analysis, and big context (>200k) processing (model auto-resolved from registry)
- **update-models** - Re-resolve the model registry by querying OpenAI, Google AI, and Oracle CLI for latest models
- **interview** - Deep interviews about any topic with iterative questioning (uses Opus)
- **tdd** - TDD enforcement during implementation (strict/soft/off modes via CLAUDE.md)
- **test** - Write or review tests following Kent C. Dodds principles (flat structure, composable setup, disposable fixtures); paired with the `test-writer` agent
- **domain-model** - Grill plan language against the target repo's `CONTEXT.md`; surface vocabulary conflicts, lazily create `CONTEXT.md`, and offer ADRs when architectural decisions meet the 3-criteria bar
- **finish-branch** - Post-merge cleanup: switches to main, pulls, runs tests, removes worktree
- **agent-change-walkthrough** - Narrative walkthrough of AI-authored code changes after implementation; explains what changed, why, and how it behaves
- **x-search** - Search X/Twitter for real-time developer discourse, product feedback, community sentiment, and expert opinions
- **judgment-eval** - Evaluates agent judgment quality through scenario-based testing in-conversation
- **constitution-compliance-review** - Scores plugin commands, agents, and skills against Anthropic Constitutional AI principles; identifies rule-based vs reasoning-based spectrum improvements
- **system-prompt-clinic** - Interactive diagnostic that transforms rule-based system prompts to reasoning-based using Constitutional AI principles

### 🔌 Integrations

- **Context7** - Up-to-date library documentation and code examples
- **Perplexity Sonar (via OpenRouter)** - Advanced web search and research capabilities

## Installation

### Prerequisites

- [Claude Code CLI](https://docs.claude.com/en/docs/claude-code)
- Node.js 18+ (for MCP servers)
- Bun (recommended) or npm

### Install Plugin

```bash
# Clone or download the plugin
git clone <repository-url> sdlc-plugin

# Navigate to your Claude Code plugins directory
cd ~/.claude/plugins

# Copy or symlink the plugin
ln -s /path/to/sdlc-plugin sdlc-plugin

# Verify installation
claude --debug
```

### Environment Setup

Create a `.env` file or set environment variables:

```bash
# Required for Perplexity Sonar integration (via OpenRouter)
export OPENROUTER_API_KEY="your-api-key"
export OPENROUTER_MODEL="perplexity/sonar-pro"  # or any OpenRouter model
```

## Usage

### Complete Workflow: Research → Plan → Issue → Implementation → PR

This plugin implements a comprehensive SDLC workflow with proper separation of concerns:

```
Research (Documentation)      → Plan (Specification)     → Issue (Execution)     → Code (Implementation)
research/*.md (committed)       plans/*.md (committed)     #123 (GitHub)          Branch + PR
```

#### 1. Research Phase

```bash
/research "How does Next.js handle server-side rendering?"
```

Creates: `research/[topic].md` (committed to git)

- Gathers current state knowledge
- Documents existing patterns and architecture
- Becomes permanent knowledge base for the project
- Referenced from plans when relevant

#### 2. Planning Phase

```bash
/plan "Add user authentication with OAuth2"
```

Creates: `plans/[feature].md` with YAML frontmatter

Generates comprehensive PRD including:
- Problem statement and goals
- User stories with acceptance criteria
- Functional and non-functional requirements
- **5 Implementation phases** with complexity ratings
- Testing strategy and validation commands
- Risk assessment and rollback plan
- Links to related research files (in frontmatter)

**Scope guardrails built in:**
- **Scope Challenge Checkpoint** — assesses existing code overlap before research; explicitly chooses SCOPE REDUCTION or PROCEED
- **What Already Exists summary** — classifies relevant abstractions as REUSE / EXTEND / REPLACE before solution design
- **Per-codepath risk assessment** — each new codepath gets a one-liner: failure condition, symptom, fallback
- **TODOS.md deferred tracking** — out-of-scope items appended to `TODOS.md` with why/context/dependencies

**What happens next:**
```bash
/github:create-issue-from-plan plans/oauth-authentication.md
```

Creates: GitHub Issue #123 with implementation checklist
Updates: Plan frontmatter with `issue: 123`

#### 3. Implementation Phase

```bash
/implement #123          # Using Issue number
# OR
/implement plans/oauth-authentication.md  # Using plan file
```

**Key differences from old workflow:**
- Plan file is **immutable spec** (never modified during implementation)
- Issue **tracks progress** via checkboxes updated during work
- Use `gh issue edit` to update Issue body with progress
- Reference plan for requirements, reference Issue for progress

#### 4. Submission Phase

```bash
/submit plans/oauth-authentication.md
```

- Verifies implementation against plan requirements
- Extracts Issue number from plan frontmatter
- Commits changes with conventional commits
- Creates PR via:

```bash
/github:create-pr #123 plans/oauth-authentication.md
```

PR automatically includes:
- Title: `feat: #123 - Add OAuth2 authentication`
- Summary from plan Overview
- Link to plan file + research files
- Review focus highlighting key decisions
- Closes #123 reference

### Commands

#### Planning

```bash
/plan "Add user authentication with OAuth2"
```

Generates a comprehensive PRD with phases, complexity analysis, and validation steps.

#### Research

```bash
/research "How does authentication work in our API?"
```

Performs AI-powered research using project context and web search.

#### Deep Research (Parallel with Synthesis)

```bash
/research-deep "How does the authentication system work?"
```

Runs a **4-phase pipeline** for thorough coverage of complex codebases:

1. **Discovery** — 3 parallel agents (Breadth, Depth, Patterns) do independent analysis
2. **Independent Analysis** — each agent self-signals completion with `<!-- RESEARCH_COMPLETE -->`
3. **Cross-Pollination Refinement** — each agent reads peer analyses with skepticism, conducts follow-up research, and produces a refined `*-refined.md` output
4. **Synthesis** — theme-based consolidation with sections for Areas of Consensus, Areas of Disagreement, and Novel Insights from Cross-Pollination

Also includes fatal error detection: polls LLM output every 10s and proactively kills on quota/auth/rate-limit patterns.

Use when a single research run might miss important aspects of complex codebases.

#### Implementation

```bash
/implement #123
```

OR

```bash
/implement plans/oauth-authentication.md
```

Executes the implementation plan with guided steps. Updates GitHub Issue checkboxes during work.

#### Code Review

```bash
/review                      # Review current changes (staged + unstaged)
/review origin/main...HEAD   # Review all commits on branch
```

Runs parallel code reviews with Codex (at `xhigh` reasoning) and Gemini — models resolved from `config/model-registry.md` (currently `codex-flagship` and `gemini-flagship`) so upgrades don't require a README edit:
- Analyzes git diff for correctness, performance, security, maintainability
- Deduplicates findings when both reviewers flag the same issue
- Prioritizes by severity (P0-P3)
- Consolidates into unified markdown report with overall verdict

#### Verification

```bash
/verify plans/oauth-authentication.md
```

Comprehensive validation before submission:
- Compares implementation to plan requirements
- Runs production build
- **Runs `bun run validate` (if exists)** - Catches plugin schema errors, missing README docs, etc.
- Launches app and runs health checks
- Executes code review with Codex and Gemini
- Reports all issues that need fixing before submission

#### Submission

```bash
/submit plans/oauth-authentication.md
```

Prepares and submits PR:
- **Automatically runs `/verify` if not already done** - Quality gate before PR
- Validates Issue exists and is linked
- Creates commits and PR
- Returns PR URL

### Recommended Workflow

```
/research          # Understand current implementation
    ↓
/plan              # Create comprehensive plan
    ↓
/implement #123    # Execute the plan
    ↓
/verify            # Validate before submission (build, tests, validation, code review)
    ↓
/submit            # Create PR (auto-runs /verify if needed)
    ↓
GitHub             # Review and merge
```

**Key feature:** `/submit` automatically runs `/verify` if you haven't already, ensuring no PRs are created with validation errors.

### Validation Examples

#### Plugin Validation

When working on plugins, `/verify` will catch issues like:

```bash
$ /verify plans/add-new-command.md

✅ Production build passed
🔍 Running plugin validation...
❌ Validation failed:
   - Commands exist but not documented in README.md:
     - /my-new-command

Fix: Add command documentation to README.md

[Verification stops here - fix issues before running /submit]
```

#### Build Validation

For regular projects:

```bash
$ /verify plans/refactor-auth.md

✅ Production build passed
✅ Plugin validation skipped (not a plugin)
✅ App launched successfully
✅ Health checks passed
✅ Code review passed

All validations passed! Ready for submission.
```

### Plan Frontmatter Reference

Every plan file includes YAML frontmatter for metadata and linking:

```yaml
---
title: "Add OAuth2 Authentication"
type: Feature
issue: null              # Set to Issue #123 after creating Issue
research:               # Links to research files
  - research/auth-flow.md
  - research/api-architecture.md
status: Draft           # Draft | In Progress | Implemented
created: 2024-11-16
---
```

**Fields:**
- `title`: Plan title (matches document heading)
- `type`: Bug | Feature | Chore | Refactor | Enhancement | Documentation
- `issue`: GitHub Issue number (populated by `/github:create-issue-from-plan`)
- `research`: List of related research file paths
- `status`: Current status of the plan
- `created`: ISO date when plan was created

### GitHub Integration Commands

#### Create Issue from Plan

```bash
/github:create-issue-from-plan plans/oauth-authentication.md
```

Converts plan into GitHub Issue:
- Creates Issue with plan Overview as summary
- Extracts Implementation Phases as checklist items
- Adds Validation Commands section
- Links related research files
- Updates plan frontmatter with Issue number
- Returns Issue URL

#### Create PR with Plan Reference

```bash
/github:create-pr #123 plans/oauth-authentication.md
```

Creates PR with proper documentation:
- Extracts plan type for PR label
- Links issue with `Closes #123`
- Includes plan file + research links
- Summarizes key decisions from Implementation Plan
- References testing and validation criteria

### Agents

Agents are automatically invoked by Claude based on context, but you can also call them explicitly:

```bash
# Analyze specific implementation
"Use codebase-analyzer to understand how authentication works"

# Find components
"Use codebase-locator to find all API route handlers"

# Discover patterns
"Use codebase-pattern-finder to identify data validation patterns"
```

### Skills

Skills are invoked when you reference their capabilities:

```bash
# Codex
"Use codex to refactor this module with high reasoning effort"

# Gemini
"Use gemini to analyze this architecture"

# Interview
/interview plans/my-feature.md           # Interview about a plan file
/interview "authentication system"       # Interview about a concept
/interview src/auth/login.ts             # Interview about existing code
```

## Configuration

### Plugin Manifest

Located at `.claude-plugin/plugin.json`:

```json
{
  "name": "sdlc-plugin",
  "description": "Contains tools for software development lifecycle",
  "version": "1.0.0",
  "author": {
    "name": "Ladislav Martincik",
    "url": "https://github.com/iamladi"
  },
  "license": "MIT"
}
```

### MCP Servers

Configure in `.mcp.json`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "fast_deep_search": {
      "command": "bun",
      "args": ["${CLAUDE_PLUGIN_ROOT}/utils/search-mcp/index.ts"],
      "env": {
        "OPENROUTER_API_KEY": "${OPENROUTER_API_KEY}",
        "OPENROUTER_MODEL": "${OPENROUTER_MODEL:-perplexity/sonar-pro}",
        "EXA_API_KEY": "${EXA_API_KEY}",
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

## Structure

```
sdlc-plugin/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── agents/
│   ├── codebase-analyzer.md
│   ├── codebase-locator.md
│   ├── codebase-pattern-finder.md
│   ├── code-quality-reviewer.md  # Quick quality sanity check
│   ├── implementer.md            # Fresh-context task implementer
│   ├── research-synthesizer.md   # Merge gate for parallel research
│   ├── spec-reviewer.md          # Spec compliance reviewer
│   ├── test-writer.md
│   └── web-search-researcher.md
├── commands/
│   ├── plan.md
│   ├── research.md
│   ├── research-deep.md     # Parallel research + synthesis
│   ├── implement.md         # Subagent-driven workflow
│   ├── review.md
│   ├── submit.md
│   └── verify.md
├── skills/
│   ├── agent-change-walkthrough/SKILL.md  # Narrative walkthrough of AI code changes
│   ├── codex/SKILL.md
│   ├── constitution-compliance-review/SKILL.md
│   ├── domain-model/SKILL.md    # CONTEXT.md alignment + ADR gate
│   ├── finish-branch/SKILL.md   # Post-merge cleanup
│   ├── gemini/SKILL.md
│   ├── interview/SKILL.md
│   ├── judgment-eval/SKILL.md
│   ├── system-prompt-clinic/SKILL.md
│   ├── tdd/SKILL.md             # TDD enforcement
│   ├── test/SKILL.md
│   ├── update-models/SKILL.md   # Refresh model-registry.md
│   └── x-search/SKILL.md
├── utils/
│   └── search-mcp/
│       ├── index.ts         # Multi-provider search MCP server
│       ├── types.ts         # Shared types and helpers
│       ├── format.ts        # Response formatter
│       └── providers/
│           ├── perplexity.ts # Perplexity/OpenRouter adapter
│           ├── exa.ts       # Exa search adapter
│           └── brave.ts     # Brave Search adapter
├── logs/                    # Hook execution logs
├── .mcp.json               # MCP server configuration
├── README.md
└── CHANGELOG.md
```

## Agent Details

### codebase-analyzer

Analyzes implementation details with surgical precision:

- Traces data flow and control flow
- Documents key logic with file:line references
- Identifies architectural patterns
- Maps API contracts between components

**Example:**
```
Use codebase-analyzer to understand how webhook validation works
```

### codebase-locator

Fast component discovery:

- Finds files, functions, and classes
- Searches by name patterns
- Locates configuration and dependencies

**Example:**
```
Use codebase-locator to find all authentication middleware
```

### codebase-pattern-finder

Pattern and architecture analysis:

- Identifies design patterns in use
- Discovers architectural decisions
- Finds common conventions
- Maps integration points

**Example:**
```
Use codebase-pattern-finder to identify repository patterns
```

### implementer

Subagent for implementing individual tasks from a plan:

- Operates with fresh context per task
- TDD-aware (respects project's tdd: setting)
- Self-reviews before handoff
- Commits atomic changes
- Can ask questions when unclear

**Invoked by:** `/implement` controller, not directly

### spec-reviewer

Verifies implementation matches specification exactly:

- Nothing missing from spec
- Nothing extra beyond spec
- Returns PASS or list of issues
- Binary verdict for clean feedback

**Invoked by:** `/implement` controller after implementer completes

### code-quality-reviewer

Quick sanity check for obvious issues:

- Clear bugs (null access, off-by-one)
- Code smells (massive functions, deep nesting)
- Security red flags (hardcoded secrets, injection)
- Anti-patterns

Not exhaustive - use `/review` for thorough analysis.

**Invoked by:** `/implement` controller after spec review passes

## Development

### Adding Custom Agents

Create `agents/your-agent.md`:

```markdown
---
name: your-agent
description: What this agent does
tools: Read, Grep, Glob
model: sonnet
---

Your agent prompt and instructions here...
```

### Adding Custom Commands

Create `commands/your-command.md`:

```markdown
# Your Command Title

Command description and instructions...

## Arguments
$ARGUMENTS

## Instructions
...
```

### Debugging

```bash
# Enable debug mode
claude --debug

# Check plugin loading
grep "sdlc-plugin" ~/.claude/logs/debug.log

# Verify component registration
claude --list-plugins
```

## Troubleshooting

### Plugin Not Loading

1. Verify `.claude-plugin/plugin.json` exists and has valid JSON
2. Check file permissions are readable
3. Run `claude --debug` to see loading errors
4. Verify directory structure matches expected layout

### MCP Servers Not Working

1. Check Node.js is installed and accessible
2. Verify environment variables are set (`OPENROUTER_API_KEY`)
3. Test MCP servers independently:
   ```bash
   npx -y @upstash/context7-mcp@latest
   ```

### Commands Not Appearing

1. Ensure command files are in `commands/` directory
2. Check markdown files have proper frontmatter (if required)
3. Restart Claude Code session
4. Use `claude --debug` to verify command registration

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- **Documentation**: [Claude Code Plugin Reference](https://docs.claude.com/en/docs/claude-code/plugins-reference)
- **Issues**: [GitHub Issues](https://github.com/iamladi/cautious-computing-machine--sdlc-plugin/issues)
- **Author**: [Ladislav Martincik](https://github.com/iamladi)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.
