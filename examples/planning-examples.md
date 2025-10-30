# Planning Examples

## Feature Planning

### Simple Feature

```bash
/plan "Add dark mode toggle to settings page"
```

**Generated Plan Includes:**
- User story with acceptance criteria
- Implementation phases (Foundation, UI Components, State Management, Testing)
- Complexity ratings per phase
- Test strategy
- Validation commands

### Complex Feature

```bash
/plan "Implement real-time collaboration with WebSockets and operational transforms"
```

**Generated Plan Includes:**
- Multiple user stories (editor, viewer, admin)
- Technical requirements (WebSocket server, OT algorithm, conflict resolution)
- Performance requirements (latency, concurrent users)
- Security considerations (authentication, authorization)
- Scalability plan
- Rollback strategy

## Bug Fix Planning

### Critical Bug

```bash
/plan "Fix: Race condition causing duplicate payment charges"
```

**Generated Plan Includes:**
- Steps to reproduce
- Root cause analysis (5 Whys)
- Impact analysis
- Solution approach with alternatives
- Testing strategy (unit, integration, load testing)
- Rollback plan
- Monitoring requirements

### UI Bug

```bash
/plan "Fix: Mobile navigation menu not closing on route change"
```

**Generated Plan Includes:**
- Expected vs actual behavior
- Affected components
- Simple fix approach
- Test cases
- Regression prevention

## Refactoring Planning

### Code Organization

```bash
/plan "Refactor: Extract API client into reusable service layer"
```

**Generated Plan Includes:**
- Current pain points
- Technical debt being addressed
- Affected areas
- Migration strategy
- Backward compatibility plan
- Testing approach

### Performance Refactor

```bash
/plan "Refactor: Optimize database queries with connection pooling and caching"
```

**Generated Plan Includes:**
- Performance metrics (current vs target)
- Bottleneck analysis
- Solution design
- Monitoring strategy
- Gradual rollout plan

## Enhancement Planning

### Incremental Enhancement

```bash
/plan "Enhancement: Add pagination to user list endpoint"
```

**Generated Plan Includes:**
- Business value
- API changes
- Backward compatibility
- Client migration guide
- Performance impact

### Major Enhancement

```bash
/plan "Enhancement: Add multi-tenant support to application"
```

**Generated Plan Includes:**
- Architecture changes
- Data model changes (tenant ID, row-level security)
- Migration strategy for existing data
- Breaking changes
- Phased rollout plan

## Chore Planning

### Infrastructure

```bash
/plan "Chore: Migrate from Webpack to Vite"
```

**Generated Plan Includes:**
- Rationale
- Dependencies to update
- Configuration changes
- Build performance comparison
- Team communication plan

### Dependency Update

```bash
/plan "Chore: Update React 17 to React 18"
```

**Generated Plan Includes:**
- Breaking changes
- Code modifications required
- Feature flags for gradual migration
- Testing strategy
- Rollback plan

## Tips for Effective Planning

### Be Specific

❌ **Too vague:**
```bash
/plan "Improve performance"
```

✅ **Specific:**
```bash
/plan "Improve dashboard load time from 3s to <1s by optimizing API queries and adding caching"
```

### Include Context

❌ **No context:**
```bash
/plan "Add search"
```

✅ **With context:**
```bash
/plan "Add full-text search to product catalog with filtering by category, price range, and availability"
```

### Define Success Metrics

Include measurable goals:
```bash
/plan "Reduce API response time from 500ms to <100ms for user profile endpoint handling 1000 req/s"
```

## Viewing Generated Plans

Plans are saved to `plans/` directory:

```bash
# List all plans
ls plans/

# Open a plan
cat plans/add-dark-mode-toggle.md

# Edit a plan
code plans/oauth2-implementation.md
```
