# SDLC Plugin for Claude Code

A comprehensive Claude Code plugin that enhances your software development lifecycle with specialized agents, commands, and integrations.

## Features

### 🤖 Specialized Agents

- **codebase-analyzer** - Deep implementation analysis with precise file:line references
- **codebase-locator** - Fast component location and discovery across your codebase
- **codebase-pattern-finder** - Pattern detection and architectural understanding
- **web-search-researcher** - Real-time research capabilities via web search

### ⚡ Commands

- **/plan** - Generate detailed implementation plans with phases, complexity analysis, and validation steps
- **/research** - AI-powered research with project context
- **/implement** - Execute implementation based on generated plans
- **/submit** - Prepare and submit work for review
- **/verify** - Validate implementation against acceptance criteria

### 🎯 Skills

- **codex** - OpenAI Codex integration for advanced code analysis and automated editing
- **gemini** - Google Gemini integration for additional AI capabilities

### 🔌 Integrations

- **Context7** - Up-to-date library documentation and code examples
- **Perplexity** - Advanced web search and research capabilities

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
# Required for Perplexity integration
export PERPLEXITY_API_KEY="your-api-key"
export PERPLEXITY_MODEL="llama-3.1-sonar-small-128k-online"  # or your preferred model
```

## Usage

### Commands

#### Planning

```bash
/plan "Add user authentication with OAuth2"
```

Generates a comprehensive PRD with:
- Problem statement and goals
- User stories with acceptance criteria
- Functional and non-functional requirements
- Implementation phases with complexity ratings
- Testing strategy and validation commands
- Risk assessment and rollback plan

#### Research

```bash
/research "How does Next.js handle server-side rendering?"
```

Performs AI-powered research using project context and web search.

#### Implementation

```bash
/implement plans/oauth-authentication.md
```

Executes the implementation plan with guided steps.

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
    "perplexity": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/utils/perplexity-mcp/index.js"],
      "env": {
        "PERPLEXITY_API_KEY": "${PERPLEXITY_API_KEY}",
        "PERPLEXITY_MODEL": "${PERPLEXITY_MODEL}"
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
│   └── web-search-researcher.md
├── commands/
│   ├── plan.md
│   ├── research.md
│   ├── implement.md
│   ├── submit.md
│   └── verify.md
├── skills/
│   ├── codex/SKILL.md
│   └── gemini/SKILL.md
├── utils/
│   └── perplexity-mcp/
│       └── index.js         # Perplexity MCP server
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
2. Verify environment variables are set (for Perplexity)
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
- **Issues**: [GitHub Issues](https://github.com/iamladi/sdlc-plugin/issues)
- **Author**: [Ladislav Martincik](https://github.com/iamladi)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.
