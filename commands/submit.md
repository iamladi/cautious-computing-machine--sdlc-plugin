# Submit/commit the implementation of plan to Github

## Priorities
Verification > Correctness > Traceability

## Goal
Submit implemented plan as a pull request to GitHub. Ensures all changes are verified, properly committed, and linked to the original issue and plan.

## Constraints
- Must be on a work branch, not main (check with `git branch --show-current`)
- Verification must pass before submission (run `/verify {plan_file}` if not already done)
- Issue number must exist in plan frontmatter (`issue: 123`)
- Issue must exist in GitHub (verify with `gh issue view #123`)
- All git changes must implement the plan fully
- Production build must pass before submission
- Precommit validations must pass
- PR creation uses `/github:create-pr <issue_number> <plan_file_path>`
- PR title format: `feat: #123 - Title`
- PR body must link both the issue and plan

## Plan
$ARGUMENTS

## Report
- Summarize changes in concise bullet points
- Provide links to the created issue and PR
