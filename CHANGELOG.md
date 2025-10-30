# Changelog

All notable changes to the SDLC Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
