# Changelog

All notable changes to the SDLC Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
