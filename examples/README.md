# SDLC Plugin Examples

Real-world usage examples for the SDLC plugin.

## Quick Start

### 1. Planning a Feature

```bash
/plan "Add user authentication with JWT tokens"
```

**Output**: Generates comprehensive PRD at `plans/user-authentication-jwt.md`

### 2. Researching Implementation

```bash
/research "Best practices for JWT token storage in Next.js"
```

**Output**: Research report with web search results and recommendations

### 3. Analyzing Existing Code

```
Use codebase-analyzer to understand how the current session management works
```

**Output**: Detailed analysis with file:line references showing session flow

## Examples by Use Case

- [Planning Examples](./planning-examples.md) - Feature planning, bug fixes, refactoring
- [Research Examples](./research-examples.md) - Technology research, best practices
- [Codebase Analysis Examples](./codebase-analysis-examples.md) - Understanding implementations
- [Workflow Examples](./workflow-examples.md) - Complete SDLC workflows
- [Codex Integration Examples](./codex-examples.md) - Using OpenAI Codex skill

## Common Workflows

### Bug Fix Workflow

```bash
# 1. Plan the fix
/plan "Fix: User logout not clearing session cookie"

# 2. Analyze implementation
"Use codebase-analyzer to understand how logout currently works"

# 3. Implement
/implement plans/fix-logout-cookie.md

# 4. Verify
/verify plans/fix-logout-cookie.md
```

### Feature Development Workflow

```bash
# 1. Research
/research "OAuth2 implementation patterns for SaaS applications"

# 2. Plan
/plan "Add OAuth2 authentication provider support"

# 3. Implement phases
/implement plans/oauth2-support.md --phase 1
/implement plans/oauth2-support.md --phase 2

# 4. Submit for review
/submit "OAuth2 authentication feature complete"
```

### Refactoring Workflow

```bash
# 1. Find patterns
"Use codebase-pattern-finder to identify all API route patterns"

# 2. Analyze complexity
"Use codebase-analyzer to understand the data validation layer"

# 3. Plan refactor
/plan "Refactor: Consolidate API validation into middleware"

# 4. Use Codex for automated refactoring
"Use codex to refactor the validation logic with high reasoning effort"
```
