# Creating plan

Create a new plan in plans/*.md to resolve the `Plan` using the exact specified markdown `Plan Format`. Follow the `Instructions` to create the plan use the `Relevant Files` to focus on the right files.

## Instructions

- IMPORTANT: You're writing a plan to resolve a task based on the `Plan` that will add value to the application.
- IMPORTANT: The `Plan` describes the problem that will be resolved but remember we're not resolving the task, we're creating the plan that will be used to resolve the task based on the `Plan Format` below.
- You're writing a plan to resolve a task, it should be thorough and precise so we fix the root cause and prevent regressions.
- Create the plan in the `plans/*.md` file. Name it appropriately based on the `Plan`.
- Use the plan format below to create the plan.
- Research the codebase to understand the task, reproduce it, and put together a plan to fix it.
- IMPORTANT: Replace every <placeholder> in the `Plan Format` with the requested value. Add as much detail as needed to fix the task.
- Use your reasoning model: THINK HARD about the task, its root cause, and the steps to fix it properly.
- IMPORTANT: For all phases that have high complexity must be split into sub-tasks that are low or medium complexity. High complexity tasks will have more tasks to work on, but not more than 5.
- IMPORTANT: Be surgical with your fix, solve the task at hand and don't fall off track.
- IMPORTANT: We want the minimal number of changes that will fix and address the task.
- Don't use decorators. Keep it simple.
- If you need a new library, use whatever bundler is prefered and be sure to report it in the `Notes` section of the `Plan Format`.
- Start your research by reading the `README.md` file.

## After Creating the Plan

1. Commit the plan file to a new branch: `plan/feature-name`
2. Create a GitHub Issue from the plan using: `/github:create-issue-from-plan plans/feature-name.md`
3. This will:
   - Create GitHub Issue with plan summary + implementation phases as checklist
   - Update plan frontmatter with `issue: <number>`
   - Return both plan path and Issue URL
4. Push branch and optionally create plan review PR, or merge directly if no review needed

## Plan Format

```md
---
title: "<descriptive title>"
type: <Bug | Feature | Chore | Refactor | Enhancement | Documentation>
issue: null
research: []
status: Draft
created: <YYYY-MM-DD>
---

# PRD: <descriptive title>

## Metadata
- **Type**: <Bug | Feature | Chore | Refactor | Enhancement | Documentation>
- **Priority**: <Critical | High | Medium | Low>
- **Severity**: <Blocker | Major | Minor | Trivial> (for Bugs)
- **Estimated Complexity**: <1-10 scale>
- **Created**: <YYYY-MM-DD>
- **Status**: <Draft | Ready for Implementation | In Progress | Completed>

## Overview

### Problem Statement
<clearly define the specific problem that needs to be solved - what pain point are we addressing?>

For **Bugs**: Include expected vs actual behavior
For **Features**: Include user story and business value
For **Refactors**: Include current pain points and technical debt being addressed
For **Chores**: Include maintenance rationale

### Goals & Objectives
<what are we trying to achieve? List 3-5 clear, measurable goals>

1.
2.
3.

### Success Metrics
<how will we measure success?>

- **Primary Metric**:
- **Secondary Metrics**:
- **Quality Gates**:

## User Stories

<describe user personas and their needs - format: "As a [persona], I want [goal] so that [benefit]">

### Story 1: <title>
- **As a**: <user persona>
- **I want**: <capability>
- **So that**: <benefit>
- **Acceptance Criteria**:
  - [ ] <criterion 1>
  - [ ] <criterion 2>

### Story 2: <title>
- **As a**: <user persona>
- **I want**: <capability>
- **So that**: <benefit>
- **Acceptance Criteria**:
  - [ ] <criterion 1>
  - [ ] <criterion 2>

## Requirements

### Functional Requirements
<what must the solution do? Be specific and testable>

1. **FR-1**: <requirement>
   - Details:
   - Priority: <Must Have | Should Have | Nice to Have>

2. **FR-2**: <requirement>
   - Details:
   - Priority: <Must Have | Should Have | Nice to Have>

### Non-Functional Requirements
<performance, security, usability, accessibility, scalability>

1. **NFR-1**: <requirement category>
   - Requirement:
   - Target:
   - Measurement:

2. **NFR-2**: <requirement category>
   - Requirement:
   - Target:
   - Measurement:

### Technical Requirements
<implementation constraints, technology choices, architectural decisions>

- **Stack**:
- **Dependencies**:
- **Architecture**:
- **Data Model**:
- **API Contracts**:

## Scope

### In Scope
<what will be included in this implementation>

-
-
-

### Out of Scope
<what will NOT be included - be explicit to prevent scope creep>

-
-
-

### Future Considerations
<features deferred for later iterations>

-
-

## Impact Analysis

### Affected Areas
<list impacted components/modules>

-
-

### Users Affected
<who is impacted and how>

-

### System Impact
<performance, security, data integrity considerations>

- **Performance**:
- **Security**:
- **Data Integrity**:

### Dependencies
<what other features/systems are affected>

- **Upstream**:
- **Downstream**:
- **External**:

### Breaking Changes
<list any breaking changes - MUST be explicit>

- [ ] **None**
- [ ] <breaking change 1> - Impact:
- [ ] <breaking change 2> - Impact:

## Steps to Reproduce (for Bugs)
**Required for:** Bugs, Issues

<list exact steps to reproduce the issue with environment details>

1.
2.
3.

**Expected**:
**Actual**:

## Root Cause Analysis (for Bugs)
**Required for:** Bugs, Critical Issues

<analyze and explain the root cause - use the 5 Whys technique if applicable>

1. **Why**:
2. **Why**:
3. **Why**:
4. **Why**:
5. **Root Cause**:

## Solution Design

### Approach
<describe the proposed solution approach with architectural considerations>

### Alternatives Considered
<what other approaches were evaluated and why were they rejected>

1. **Alternative 1**:
   - Pros:
   - Cons:
   - Why rejected:

### Data Model Changes
<schema changes, migrations, data transformations>

### API Changes
<new endpoints, modified contracts, deprecated APIs>

### UI/UX Changes
<component changes, new screens, interaction flows>

## Implementation Plan

### Phase 1: Foundation & Preparation
**Complexity**: <1-10> | **Priority**: <High|Medium|Low>

- [ ] Setup and configuration
- [ ] Database schema updates
- [ ] Install required dependencies
- [ ] Create base types and interfaces

### Phase 2: Core Implementation
**Complexity**: <1-10> | **Priority**: <High|Medium|Low>

- [ ] Implement backend logic
- [ ] Create API endpoints
- [ ] Build UI components
- [ ] Integrate frontend with backend

### Phase 3: Testing & Validation
**Complexity**: <1-10> | **Priority**: <High|Medium|Low>

- [ ] Unit tests for all new functions
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user flows
- [ ] Performance testing
- [ ] Security testing

### Phase 4: Documentation & Polish
**Complexity**: <1-10> | **Priority**: <High|Medium|Low>

- [ ] Code documentation
- [ ] API documentation
- [ ] User documentation
- [ ] Update README if needed

### Phase 5: Validation
**Complexity**: <1-10> | **Priority**: <High|Medium|Low>

- [ ] Run all validation commands
- [ ] Manual testing
- [ ] User acceptance testing

## Relevant Files

### Existing Files
<find and list the files that are relevant to the task describe why they are relevant>

- `path/to/file1.ts` - <why relevant>
- `path/to/file2.tsx` - <why relevant>

### New Files
<files that need to be created>

- `path/to/new-file.ts` - <purpose and responsibility>

### Test Files
<test files to create or modify>

- `path/to/file.test.ts` - <what it tests>

## Testing Strategy

### Unit Tests
<describe unit test coverage requirements>

-

### Integration Tests
<describe integration test requirements>

-

### E2E Tests
<describe end-to-end test scenarios>

-

### Manual Test Cases
<tests that require manual validation>

1. **Test Case**:
   - Steps:
   - Expected:

## Risk Assessment

### Technical Risks
<potential technical challenges>

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| | Low/Med/High | Low/Med/High | |

### Business Risks
<potential business impact>

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| | Low/Med/High | Low/Med/High | |

### Mitigation Strategy
<overall strategy to minimize risks>

## Rollback Strategy

### Rollback Steps
<describe how to revert changes if issues arise>

1.
2.
3.

### Rollback Conditions
<when should we rollback?>

-
-

## Validation Commands

Execute every command to validate the implementation is successful with zero regressions.

```bash
# Run all tests
bun run test

# Run linter
bun run lint

# Build the project
bun run build

# Start dev server (background)
bun run dev

# Reproduce the original issue (for bugs)
# <specific commands to verify the bug is fixed>

# Verify new functionality (for features)
# <specific commands to verify the feature works>
```

## Acceptance Criteria

Define clear, testable success criteria:

- [ ] All functional requirements implemented
- [ ] All user stories satisfied
- [ ] All tests passing (unit, integration, E2E)
- [ ] No regressions in existing functionality
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Performance targets met
- [ ] Security requirements satisfied
- [ ] Accessibility standards met
- [ ] All validation commands execute successfully

## Dependencies

### New Dependencies
<packages that need to be installed>

- `package-name@version` - <reason and purpose>

### Dependency Updates
<existing packages that need version updates>

- `package-name@old-version` → `@new-version` - <reason>

## Notes & Context

### Additional Context
<any additional notes or context that are relevant>

### Assumptions
<assumptions made during planning>

-
-

### Constraints
<technical or business constraints>

-
-

### Related Tasks/Issues
<link to related tasks if applicable>

-

### References
<documentation links, design specs, etc.>

-
-

### Open Questions
<unresolved questions that need answers before implementation>

- [ ] Question 1?
- [ ] Question 2?
```

## Task
$ARGUMENTS

## Report
- Summarize the work you've just done in a concise bullet point list.
- Include a path to the plan you created in the `plans/*.md` file.
