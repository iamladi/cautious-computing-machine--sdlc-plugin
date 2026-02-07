---
name: finish-branch
description: Post-merge cleanup workflow. Detects PR merge, switches to main, pulls latest, runs tests, and removes worktree if exists. Use after PR is merged to clean up.
argument-hint: [PR-number] | [branch-name]
---

# Finish Branch Skill

## Priorities

Safety > Completeness > Speed

## Goal

Clean up local and worktree branches after PR merge. Verify merge status via gh pr view or git branch --merged, switch to main, pull latest, run tests, delete branch using safe delete, and remove associated worktree if present. Maintain repository hygiene without losing work.

## Constraints

- Check merge detection: use gh pr view for PR numbers, git branch -r --merged for branch names
- Never delete unmerged: use git branch -d (safe delete), never -D
- Verify clean state: check git status before switching branches
- Confirm worktree cleanup: git worktree remove only after verifying path
- Stop if PR not merged or branch has unmerged commits
- Warn on test failures but continue cleanup

## Workflow

1. Parse arguments: PR number, branch name, or detect from current branch
2. Verify merge status: gh pr view or git branch --merged check
3. Check uncommitted changes: git status --porcelain, warn if dirty
4. Switch to main: git checkout main
5. Pull latest: git pull origin main
6. Run tests: detect and execute appropriate test command
7. Delete branch: git branch -d [name]
8. Clean worktree: git worktree list, then git worktree remove if exists
9. Prune remotes: git remote prune origin

## Safety Checks

- PR merge detection: always verify before cleanup
- Safe delete only: never force delete with -D
- Check before switch: confirm no uncommitted work
- Worktree path confirmation: verify worktree path before removal
- Stop on unmerged: halt cleanup if branch not merged to main

## Arguments

$ARGUMENTS
