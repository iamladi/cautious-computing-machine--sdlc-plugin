# Research Examples

## Technology Research

### Library Selection

```bash
/research "Compare React state management libraries: Redux vs Zustand vs Jotai for a medium-sized e-commerce app"
```

**Research Output:**
- Feature comparison
- Performance characteristics
- Bundle size analysis
- Learning curve
- Community support
- Best use cases
- Recommendation with rationale

### Implementation Patterns

```bash
/research "Best practices for implementing rate limiting in Node.js API"
```

**Research Output:**
- Common patterns (token bucket, sliding window, leaky bucket)
- Library recommendations
- Implementation examples
- Redis vs in-memory storage
- Distributed rate limiting considerations
- Code examples

### Architecture Decisions

```bash
/research "Microservices vs monolith for SaaS application with 10 developers"
```

**Research Output:**
- Pros/cons of each approach
- Team size considerations
- Deployment complexity
- Development velocity
- Migration path
- Industry examples
- Decision framework

## Best Practices Research

### Security

```bash
/research "OAuth2 security best practices for single-page applications"
```

**Research Output:**
- PKCE flow explanation
- Token storage recommendations
- Refresh token rotation
- XSS/CSRF protection
- Common vulnerabilities
- Implementation checklist

### Performance

```bash
/research "Next.js 14 performance optimization techniques for large applications"
```

**Research Output:**
- ISR vs SSR vs SSG tradeoffs
- Image optimization strategies
- Code splitting approaches
- Bundle size reduction
- Caching strategies
- Real-world examples

### Testing

```bash
/research "Testing strategy for event-driven microservices"
```

**Research Output:**
- Unit testing approaches
- Integration testing patterns
- Contract testing
- End-to-end testing
- Testing tools
- Best practices

## Framework/Library Specific

### Next.js

```bash
/research "Next.js 14 App Router data fetching patterns and caching strategies"
```

### React

```bash
/research "React Server Components use cases and migration strategy from Client Components"
```

### Database

```bash
/research "PostgreSQL connection pooling best practices for serverless environments"
```

### TypeScript

```bash
/research "TypeScript strict mode migration strategy for large codebases"
```

## Problem Solving

### Debugging Approaches

```bash
/research "Debugging memory leaks in Node.js applications"
```

**Research Output:**
- Diagnostic tools
- Common causes
- Detection techniques
- Profiling approaches
- Fix strategies

### Performance Issues

```bash
/research "Diagnosing slow API response times in Express.js"
```

**Research Output:**
- Profiling tools
- Common bottlenecks
- Monitoring approaches
- Optimization techniques

## Industry Standards

### API Design

```bash
/research "RESTful API versioning strategies for backward compatibility"
```

### Code Organization

```bash
/research "Folder structure best practices for large Next.js applications"
```

### DevOps

```bash
/research "Blue-green deployment vs canary deployment for production releases"
```

## Context-Aware Research

### With Project Context

```bash
/research "How to add real-time notifications to our Next.js app using Server-Sent Events" --taskIds "task-123,task-124"
```

**Benefits:**
- Considers project tech stack
- Refers to relevant existing code
- Suggests implementation aligned with current patterns
- Context from specific tasks

### With Custom Context

```bash
/research "GraphQL vs REST for mobile API" --customContext "We have React Native app, 5 endpoints currently, team of 3 developers"
```

## Research with Perplexity Integration

### Recent Information

```bash
/research "Latest security vulnerabilities in popular npm packages 2024"
```

Uses Perplexity MCP to fetch:
- Recent CVEs
- Security advisories
- Patch recommendations
- Alternative packages

### Trending Technologies

```bash
/research "Current state of AI code assistants and their capabilities"
```

### Framework Updates

```bash
/research "Breaking changes in React 19 and migration guide"
```

## Research Output Usage

### For Planning

Use research to inform `/plan` commands:

```bash
# 1. Research first
/research "JWT vs session-based authentication for SPA"

# 2. Plan implementation
/plan "Implement JWT authentication based on research findings"
```

### For Documentation

Save research to docs:

```bash
/research "Our API rate limiting strategy" --saveTo "docs/api-rate-limiting.md"
```

### For Decision Making

Research before making architectural decisions:

```bash
# Compare options
/research "Database options for multi-tenant SaaS: PostgreSQL schemas vs separate databases"

# Make informed decision
/plan "Implement PostgreSQL row-level security for multi-tenancy"
```

## Tips for Effective Research

### Be Specific

❌ **Too vague:**
```bash
/research "How to use React"
```

✅ **Specific:**
```bash
/research "React useEffect cleanup patterns for WebSocket connections"
```

### Include Constraints

```bash
/research "Serverless database options under $100/month supporting 1M requests/month"
```

### Specify Detail Level

```bash
/research "Quick overview of Tailwind CSS vs CSS Modules" --detailLevel low
```

```bash
/research "Comprehensive comparison of ORMs for TypeScript" --detailLevel high
```

### Include Project Context

```bash
/research "Add authentication to our Next.js app" --includeProjectTree
```

## Research + Implementation Workflow

```bash
# 1. Research
/research "Stripe payment integration for subscription billing"

# 2. Plan based on research
/plan "Implement Stripe subscription billing with webhook handling"

# 3. Analyze existing code
"Use codebase-analyzer to understand our current payment flow"

# 4. Implement
/implement plans/stripe-subscriptions.md

# 5. Verify
/verify plans/stripe-subscriptions.md
```
