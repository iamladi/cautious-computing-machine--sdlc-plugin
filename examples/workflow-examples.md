# Complete Workflow Examples

## Feature Development: OAuth2 Authentication

### End-to-End Workflow

```bash
# Phase 1: Research
/research "OAuth2 PKCE flow implementation for Next.js App Router"

# Phase 2: Plan
/plan "Add OAuth2 authentication with Google and GitHub providers"

# Phase 3: Understand Existing Code
"Use codebase-analyzer to understand the current authentication implementation"

# Phase 4: Implement Foundation (Phase 1)
/implement plans/oauth2-authentication.md --phase 1

# Phase 5: Implement Core (Phase 2)
/implement plans/oauth2-authentication.md --phase 2

# Phase 6: Testing (Phase 3)
/implement plans/oauth2-authentication.md --phase 3

# Phase 7: Verify Implementation
/verify plans/oauth2-authentication.md

# Phase 8: Submit for Review
/submit "OAuth2 authentication complete with Google and GitHub providers"
```

## Bug Fix: Race Condition in Payment Processing

### Complete Bug Fix Workflow

```bash
# Step 1: Research the Problem
/research "Handling race conditions in payment processing with idempotency keys"

# Step 2: Analyze Current Implementation
"Use codebase-analyzer to trace the payment processing flow from checkout to confirmation"

# Step 3: Locate All Related Files
"Use codebase-locator to find all payment-related middleware and handlers"

# Step 4: Create Fix Plan
/plan "Fix: Race condition causing duplicate charges in payment processing"

# Step 5: Review Root Cause
# Plan includes 5 Whys analysis and root cause identification

# Step 6: Implement Fix
/implement plans/fix-payment-race-condition.md

# Step 7: Verify Fix
/verify plans/fix-payment-race-condition.md

# Step 8: Submit
/submit "Payment race condition fixed with idempotency key implementation"
```

## Refactoring: Extract API Client Service

### Refactoring Workflow

```bash
# Step 1: Discover Current Pattern
"Use codebase-pattern-finder to identify all API client usage patterns"

# Step 2: Analyze Implementation
"Use codebase-analyzer to understand how API requests are currently made across the app"

# Step 3: Find All Usages
"Use codebase-locator to find all files that make API calls"

# Step 4: Plan Refactor
/plan "Refactor: Extract API client into reusable service layer with interceptors"

# Step 5: Research Best Practices
/research "API client service layer patterns in TypeScript with retry logic and error handling"

# Step 6: Execute Refactor (using Codex for automated refactoring)
"Use codex to refactor API client calls into service layer with high reasoning effort"

# Step 7: Verify No Regressions
/verify plans/refactor-api-client.md

# Step 8: Submit
/submit "API client refactored into reusable service layer"
```

## New Project Setup

### Bootstrapping Workflow

```bash
# Step 1: Research Tech Stack
/research "Next.js 14 with TypeScript, Tailwind, and Prisma: best project structure"

# Step 2: Plan Initial Architecture
/plan "Setup: Next.js project with authentication, database, and API structure"

# Step 3: Implement Foundation
/implement plans/project-setup.md

# Step 4: Create Development Standards
/plan "Documentation: Code standards and development guidelines"

# Step 5: Verify Setup
/verify plans/project-setup.md
```

## Performance Optimization

### Performance Improvement Workflow

```bash
# Step 1: Analyze Current Performance
"Use codebase-analyzer to understand how the dashboard data is fetched and rendered"

# Step 2: Research Solutions
/research "Next.js dashboard performance optimization: data fetching, caching, and rendering"

# Step 3: Identify Bottlenecks
"Use codebase-pattern-finder to identify all data fetching patterns in dashboard components"

# Step 4: Plan Optimizations
/plan "Performance: Optimize dashboard load time from 3s to <1s"

# Step 5: Implement Caching Layer
/implement plans/optimize-dashboard.md --phase 1

# Step 6: Implement Query Optimization
/implement plans/optimize-dashboard.md --phase 2

# Step 7: Measure Results
/verify plans/optimize-dashboard.md

# Step 8: Submit
/submit "Dashboard performance optimized: 3s → 0.8s load time"
```

## Migration: Database Schema Update

### Schema Migration Workflow

```bash
# Step 1: Understand Current Schema
"Use codebase-analyzer to understand the current user schema and relationships"

# Step 2: Plan Migration
/plan "Migration: Add user roles and permissions system"

# Step 3: Research Best Practices
/research "PostgreSQL role-based access control schema design with row-level security"

# Step 4: Locate All User References
"Use codebase-locator to find all database queries referencing users table"

# Step 5: Analyze Impact
"Use codebase-analyzer to understand how user data flows through authentication and authorization"

# Step 6: Implement Migration
/implement plans/user-roles-migration.md

# Step 7: Verify Backward Compatibility
/verify plans/user-roles-migration.md

# Step 8: Submit
/submit "User roles and permissions system with backward-compatible migration"
```

## Security Audit & Fix

### Security Workflow

```bash
# Step 1: Research Security Best Practices
/research "Next.js API route security: authentication, CSRF, rate limiting, input validation"

# Step 2: Audit Current Implementation
"Use codebase-pattern-finder to identify all authentication and authorization patterns"

# Step 3: Analyze API Security
"Use codebase-analyzer to understand how API routes validate and authorize requests"

# Step 4: Plan Security Improvements
/plan "Security: Implement comprehensive API security (CSRF, rate limiting, input validation)"

# Step 5: Implement Security Layer
/implement plans/api-security.md

# Step 6: Verify Security
/verify plans/api-security.md

# Step 7: Submit
/submit "API security hardened with CSRF protection, rate limiting, and validation"
```

## Team Onboarding

### New Developer Workflow

```bash
# Step 1: Generate Architecture Overview
"Use codebase-pattern-finder to identify the overall architecture and patterns used"

# Step 2: Document Authentication
"Use codebase-analyzer to document how authentication and session management works"

# Step 3: Document API Structure
"Use codebase-analyzer to document the API routing and middleware structure"

# Step 4: Create Onboarding Guide
/plan "Documentation: Developer onboarding guide with architecture overview"

# Step 5: Save Research
/research "Project architecture and key patterns" --saveTo "docs/architecture.md"
```

## Microservice Extraction

### Service Extraction Workflow

```bash
# Step 1: Analyze Current Monolith
"Use codebase-analyzer to understand how the notification system is currently implemented"

# Step 2: Find Boundaries
"Use codebase-pattern-finder to identify all notification-related code and dependencies"

# Step 3: Research Patterns
/research "Microservice extraction patterns: strangler fig, bounded contexts, event-driven"

# Step 4: Plan Extraction
/plan "Extract notification system into standalone microservice"

# Step 5: Locate All Dependencies
"Use codebase-locator to find all code that depends on notification system"

# Step 6: Implement Service
/implement plans/notification-microservice.md

# Step 7: Verify Integration
/verify plans/notification-microservice.md

# Step 8: Submit
/submit "Notification system extracted as microservice with event-driven integration"
```

## Tips for Effective Workflows

### Always Start with Understanding

1. Research the problem/solution space
2. Analyze existing code
3. Identify patterns and dependencies
4. Then plan

### Use the Right Agent for Each Step

- **codebase-locator**: Find files, functions, components
- **codebase-analyzer**: Understand how code works
- **codebase-pattern-finder**: Discover patterns and architecture
- **/research**: Learn best practices and solutions
- **/plan**: Create implementation roadmap
- **codex**: Automated refactoring and analysis

### Iterate and Verify

- Implement in phases
- Verify after each phase
- Use `/verify` to ensure quality
- Submit only when complete

### Document as You Go

- Save research findings
- Update plans based on learnings
- Document decisions and rationale
- Keep team informed with `/submit`
