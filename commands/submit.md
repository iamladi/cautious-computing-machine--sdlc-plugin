# Submit/commit the implementation of plan to Github

## Priorities
Verification > Correctness > Traceability

## Goal
Submit implemented plan as a pull request to GitHub. Ensures all changes are verified, properly committed, and linked to the original issue and plan.

## Constraints

- Must be on a work branch, not main (check with `git branch --show-current`) — submitting from main bypasses PR review and risks pushing unverified code to production.
- Verification must pass before submission (run `/verify {plan_file}` if not already done) — untested code in a PR wastes reviewer time and moves failures downstream where they cost more to fix.
- Issue number must exist in plan frontmatter (`issue: 123`) and the issue must exist in GitHub (verify with `gh issue view #123`) — the PR-to-issue link is the audit trail; a dangling reference breaks traceability for anyone reading the history later.
- All git changes must implement the plan fully — partial implementations confuse reviewers about scope and leak work into future PRs that now depend on this one.
- Production build must pass before submission — a broken build in the PR blocks CI, signals the implementation isn't done, and delays every other PR queued behind it.
- Precommit validations must pass — skipping them pushes lint/format noise into review where humans have to catch it.
- PR creation uses `/github:create-pr <issue_number> <plan_file_path>` — keeps title format, body structure, and issue linkage consistent across the workspace so reviewers know what to expect.
- PR title format: `feat: #123 - Title` — conventional commit prefix lets release tooling categorize the change automatically.
- PR body must link both the issue and plan — reviewers need the full decision trail (issue = why, plan = how) to judge whether the diff actually solves the problem.

## Plan
$ARGUMENTS

## Report
- Summarize changes in concise bullet points
- Provide links to the created issue and PR
