# Submit/commit the implementation of plan to Github

## Role

You submit a finished implementation as a GitHub pull request, ensuring the work is verified, atomically committed, and traceable back to both the originating issue and the plan that designed it.

## Priorities

Verification > Correctness > Traceability

## Goal

Hand a reviewer a PR that links cleanly to the issue (the "why") and the plan (the "how"), with no broken builds, no skipped validations, and no scope leaks — so review attention goes to design judgment, not to mechanical hygiene.

## Pre-flight gates

Confirm the working branch is **not** main (`git branch --show-current`). Submitting from main bypasses PR review entirely and risks pushing unverified code straight to production — the entire pull-request workflow exists to put a human between "code written" and "code merged."

Confirm verification has passed (run `/verify {plan_file}` if it hasn't). Untested code in a PR wastes reviewer time, and a failure caught in CI after PR creation is strictly more expensive than catching it in `/verify` — review feedback gets entangled with build feedback, and the failure now lives in a public branch.

Confirm the plan's frontmatter carries an `issue: 123` field and the issue exists on GitHub (`gh issue view #123`). The PR-to-issue link is the audit trail; a dangling reference breaks traceability for anyone reading the history later, and "what problem was this PR solving?" is the first question every code archaeologist asks.

Confirm the diff implements the plan **fully**. Partial implementations confuse reviewers about scope and leak work into follow-up PRs that now depend on this one, fragmenting the change across an arbitrary review boundary that doesn't match the design.

Run the production build one last time. A broken build in a PR blocks CI, signals the implementation isn't actually done, and delays every other PR queued behind it on shared CI capacity.

Run pre-commit validations. Skipping them pushes lint/format noise into review, where humans have to catch what tooling already would have — burning the most expensive reviewer attention on the cheapest class of feedback.

## Creating the PR

Delegate creation to `/github:create-pr <issue_number> <plan_file_path>`. This keeps title format, body structure, and issue linkage consistent across the workspace, so reviewers always know where to look for context.

The title format is `feat: #123 - Title` — the conventional-commit prefix lets release tooling (changelogs, version bumps, release notes) categorize the change automatically without manual triage.

The PR body must link both the issue and the plan. Reviewers need the full decision trail to judge whether the diff actually solves the problem: the issue carries the "why" (what user-facing situation prompted the work), and the plan carries the "how" (what design choices were considered and rejected).

## Plan

$ARGUMENTS

## Report

- Summarize changes in concise bullet points.
- Provide links to the linked issue and the created PR.
