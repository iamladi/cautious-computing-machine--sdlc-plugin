# Codex Integration Examples

## Basic Usage

### Read-Only Analysis

```bash
"Use codex to analyze the authentication module for potential security issues"
```

**HAL will ask:**
- Which model? (gpt-5-codex or gpt-5)
- Reasoning effort? (high, medium, low)

**Example selection:**
- Model: gpt-5-codex
- Effort: high
- Sandbox: read-only (default for analysis)

### Code Refactoring

```bash
"Use codex to refactor the API client with high reasoning effort"
```

**HAL will ask for model selection, then run:**
```bash
codex exec --skip-git-repo-check -m gpt-5-codex --config model_reasoning_effort="high" --sandbox workspace-write --full-auto "Refactor the API client..." 2>/dev/null
```

## Reasoning Effort Levels

### High Effort (Complex Tasks)

Use for:
- Complex refactoring
- Architecture changes
- Security analysis
- Performance optimization

```bash
"Use codex with high reasoning effort to analyze the payment processing flow for race conditions"
```

### Medium Effort (Standard Tasks)

Use for:
- Standard refactoring
- Code organization
- Feature additions
- Bug fixes

```bash
"Use codex with medium reasoning to add error handling to API routes"
```

### Low Effort (Simple Tasks)

Use for:
- Quick fixes
- Simple changes
- Code formatting
- Documentation

```bash
"Use codex with low reasoning to add JSDoc comments to utility functions"
```

## Sandbox Modes

### Read-Only (Safe Analysis)

Default for analysis tasks:

```bash
"Use codex to review the authentication code"
```

**Codex can:**
- Read all files
- Analyze code
- Suggest improvements

**Codex cannot:**
- Modify files
- Create files
- Access network

### Workspace-Write (Standard Edits)

For making local changes:

```bash
"Use codex to refactor the database queries in workspace-write mode"
```

**Codex can:**
- Read files
- Modify files
- Create files

**Codex cannot:**
- Access network
- Install packages (without permission)

### Danger-Full-Access (Network + Edits)

For tasks requiring network access:

```bash
"Use codex with full access to install dependencies and update the API client"
```

**Codex can:**
- Read/write files
- Install packages
- Access network
- Run external commands

⚠️ **HAL will ask for permission before using this mode**

## Session Management

### Starting a Session

```bash
"Use codex to analyze the codebase structure"
```

**HAL tracks the session for you**

### Resuming a Session

```bash
"Codex resume: now add type definitions to the identified modules"
```

**HAL will:**
```bash
echo "now add type definitions to the identified modules" | codex exec --skip-git-repo-check resume --last 2>/dev/null
```

**Session inherits:**
- Original model
- Original reasoning effort
- Original sandbox mode

### Alternative Resume Syntax

```bash
"Resume the last codex session and refactor the validators"
```

```bash
"Continue with codex: add comprehensive error handling"
```

## Advanced Examples

### Security Audit

```bash
# Step 1: Initial analysis
"Use codex with high reasoning in read-only mode to audit API security"

# Step 2: Review findings, then fix
"Codex resume: now implement the suggested security improvements in workspace-write mode"
```

### Large Refactoring

```bash
# Step 1: Analyze scope
"Use codex with high reasoning to analyze the API client structure and suggest refactoring approach"

# Step 2: Execute refactor
"Codex resume: implement the refactoring with full-auto mode"

# Step 3: Add tests
"Codex resume: now add unit tests for the refactored modules"
```

### Code Migration

```bash
# Step 1: Analyze current state
"Use codex to analyze how we currently handle API requests"

# Step 2: Plan migration
"Codex resume: create a migration plan to move from fetch to axios"

# Step 3: Execute migration
"Codex resume: implement the migration in phases, starting with utility functions"

# Step 4: Update tests
"Codex resume: update all affected tests"
```

### Performance Optimization

```bash
# Step 1: Profile
"Use codex with high reasoning to analyze performance bottlenecks in the dashboard"

# Step 2: Optimize
"Codex resume: implement memoization and lazy loading for the identified components"

# Step 3: Verify
"Codex resume: add performance metrics to measure improvements"
```

## Codex with Other Tools

### Research → Codex

```bash
# Research best practices
/research "React performance optimization patterns"

# Apply with Codex
"Use codex to implement the researched optimization patterns in our components"
```

### Analyze → Codex

```bash
# Understand current implementation
"Use codebase-analyzer to document how error handling works"

# Improve with Codex
"Use codex to refactor error handling based on the analysis"
```

### Plan → Codex

```bash
# Create plan
/plan "Refactor: Consolidate API client into service layer"

# Execute with Codex
"Use codex to implement phase 1 of the API client refactoring plan"
```

## Model Selection Guide

### gpt-5-codex

**Best for:**
- Code refactoring
- Architecture changes
- Complex transformations
- Automated edits

**Characteristics:**
- Optimized for code
- Fast execution
- Reliable edits

### gpt-5

**Best for:**
- Security analysis
- Code review
- Documentation
- Explanations

**Characteristics:**
- Broader context
- Detailed reasoning
- Better explanations

## Tips for Effective Codex Usage

### Be Specific

❌ **Too vague:**
```bash
"Use codex to improve the code"
```

✅ **Specific:**
```bash
"Use codex to refactor the authentication middleware to use async/await instead of callbacks"
```

### Choose Appropriate Settings

| Task Type | Model | Reasoning | Sandbox |
|-----------|-------|-----------|---------|
| Security audit | gpt-5 | high | read-only |
| Simple refactor | gpt-5-codex | medium | workspace-write |
| Complex migration | gpt-5-codex | high | workspace-write |
| Add types | gpt-5-codex | low | workspace-write |
| Install deps | gpt-5-codex | medium | danger-full-access |

### Use Session Continuity

Instead of:
```bash
"Use codex to analyze X"
"Use codex to fix Y"  # New session, loses context
```

Do:
```bash
"Use codex to analyze X"
"Codex resume: now fix Y"  # Continues session, keeps context
```

### Review Before Committing

```bash
# After Codex makes changes
git diff

# If good, commit
git add .
git commit -m "Refactored API client using Codex"

# If not, revert
git checkout .
```

## Error Handling

### Codex Errors

If Codex fails:

```bash
# HAL will report the error and ask how to proceed
# Options:
1. Retry with different settings
2. Try manual approach
3. Adjust the prompt
```

### Debugging Codex

To see thinking tokens (stderr):

```bash
"Use codex to analyze this, and show me the thinking process"
```

**HAL will run without `2>/dev/null` to show stderr**

## Workflow Integration

### Complete Feature with Codex

```bash
# 1. Research
/research "Best practices for API rate limiting"

# 2. Plan
/plan "Add rate limiting to API routes"

# 3. Analyze existing code
"Use codebase-analyzer to understand current API middleware structure"

# 4. Implement with Codex
"Use codex with high reasoning to implement the rate limiting based on the plan"

# 5. Resume to add tests
"Codex resume: add comprehensive tests for the rate limiting"

# 6. Verify
/verify plans/api-rate-limiting.md

# 7. Submit
/submit "API rate limiting implemented with tests"
```
