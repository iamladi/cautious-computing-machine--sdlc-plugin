---
name: finish-branch
description: Post-merge cleanup workflow. Detects PR merge, switches to main, pulls latest, runs tests, and removes worktree if exists. Use after PR is merged to clean up.
argument-hint: [PR-number] | [branch-name]
---

# Finish Branch Skill

## Priorities

Safety > Completeness > Speed

## Role

Clean up a merged feature branch — local branch, worktree, remote refs — without losing any work. The caller expects the PR is merged; you verify that claim before deleting anything, because the only failure mode that matters here is deleting work that wasn't actually on `main`.

## Success

The user ends on `main` with the branch fully pulled, tests run, the old local branch deleted, the worktree removed if one existed, and stale remote refs pruned. If any precondition fails (branch not merged, dirty working tree, worktree path unresolved), stop and explain what's blocking cleanup rather than force through it.

## Workflow

The sequence is load-bearing: verify → switch → pull → test → delete → prune. Skipping ahead risks losing uncommitted work or deleting an unmerged branch.

1. **Resolve the target.** Parse `$ARGUMENTS` — PR number, branch name, or detect from current branch. If ambiguous, ask.
2. **Verify merge status before touching anything.** Use `gh pr view <n>` for PR numbers, `git branch -r --merged main` for branch names. If the branch isn't merged, halt and report — the caller may have invoked the skill too early, and deleting now would lose commits.
3. **Check for uncommitted work.** `git status --porcelain` before switching branches. If dirty, stop and show the user what's uncommitted. Auto-stashing hides a surprise from the user; refusing forces them to decide.
4. **Switch to main and pull.** `git checkout main && git pull origin main`. If the pull conflicts or fails, halt — the local `main` is now in an indeterminate state and safer to leave for the user to resolve.
5. **Run tests.** Detect the test command from `package.json` / `pyproject.toml` / `Makefile` etc. Test failures do *not* block cleanup (the PR already merged; the regression belongs to `main` now), but surface them clearly so the user knows to follow up.
6. **Delete the branch with safe delete only.** `git branch -d <name>` — never `-D`. The safe delete refuses if git can't prove the branch is merged into the current HEAD; that refusal is exactly the guardrail we want against deleting unreviewed work.
7. **Remove the worktree if one exists.** `git worktree list` first to resolve the path, then `git worktree remove <path>`. Confirming the path before removing prevents deleting the wrong directory when branch names and worktree names drift apart.
8. **Prune remote refs.** `git remote prune origin` to drop the now-deleted remote tracking ref.

## Arguments

$ARGUMENTS
