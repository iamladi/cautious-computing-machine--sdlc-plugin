---
name: finish-branch
description: Post-merge cleanup workflow. Detects PR merge, switches to main, pulls latest, runs tests, and removes worktree if exists. Use after PR is merged to clean up.
argument-hint: [PR-number] | [branch-name]
---

# Finish Branch Skill

Clean up after a feature branch has been merged. This skill handles the post-merge workflow to keep your repository tidy.

## When to Use

- After a PR has been merged to main
- When you want to clean up a completed feature branch
- After confirming work is integrated and no longer needed locally

## Workflow

### 1. Detect Merge Status

First, verify the PR/branch has been merged:

```bash
# If PR number provided
gh pr view [PR-number] --json state,mergedAt

# If branch name provided, check if it exists on remote and was merged
git fetch origin
git branch -r --merged origin/main | grep [branch-name]
```

**If not merged**: Stop and inform user. Don't clean up unmerged work.

### 2. Stash or Verify Clean State

Before switching branches, ensure no uncommitted work:

```bash
# Check for uncommitted changes
git status --porcelain

# If changes exist, warn user
# Offer to stash or abort
```

### 3. Switch to Main

```bash
git checkout main
```

### 4. Pull Latest

```bash
git pull origin main
```

### 5. Run Test Suite

Verify the merged code works:

```bash
# Detect and run appropriate test command
# Check package.json for test script
bun run test
# or
npm test
# or appropriate command for the project
```

**If tests fail**: Warn user but continue cleanup. The merged code may have issues that need addressing separately.

### 6. Delete Local Branch

```bash
git branch -d [branch-name]
```

Use `-d` (safe delete) not `-D`. If branch has unmerged commits, git will warn us.

### 7. Clean Up Worktree (if exists)

If the branch used a git worktree:

```bash
# List worktrees
git worktree list

# If worktree exists for the branch
git worktree remove [worktree-path]
```

### 8. Optional: Prune Remote Tracking

```bash
git remote prune origin
```

## Arguments

Parse `$ARGUMENTS`:

- **PR number**: `finish-branch #123` or `finish-branch 123`
  - Fetch PR details to get branch name
  - Verify PR is merged

- **Branch name**: `finish-branch feat/my-feature`
  - Verify branch was merged to main
  - Proceed with cleanup

- **No argument**: Detect from current branch
  - Get current branch name
  - Find associated PR if any
  - Verify merged status

## Output Format

### Success

```markdown
## Branch Cleanup Complete

### PR/Branch
- PR: #123 (merged [date])
- Branch: feat/my-feature

### Actions Taken
- [x] Switched to main
- [x] Pulled latest (now at [commit])
- [x] Tests passed
- [x] Deleted local branch
- [x] Removed worktree: /path/to/worktree

### Status
Clean! Ready for next task.
```

### Partial Success

```markdown
## Branch Cleanup Partial

### PR/Branch
- PR: #123 (merged [date])
- Branch: feat/my-feature

### Actions Taken
- [x] Switched to main
- [x] Pulled latest
- [ ] Tests FAILED (see below)
- [x] Deleted local branch

### Test Failures
[test output]

### Note
Branch cleaned up but tests are failing on main.
This may need separate investigation.
```

### Blocked

```markdown
## Branch Cleanup Blocked

### Reason
PR #123 is not merged yet.

### Current State
- PR Status: Open
- Branch: feat/my-feature
- Uncommitted changes: [yes/no]

### Next Steps
1. Complete PR review and merge
2. Then run `/finish-branch #123` again
```

## Safety Checks

1. **Never delete unmerged branches**: Always verify merge status first
2. **Never force delete**: Use `git branch -d` not `-D`
3. **Check for uncommitted work**: Don't lose user's changes
4. **Verify we're not on the branch**: Can't delete checked-out branch
5. **Confirm worktree path**: Don't remove wrong directory

## Error Handling

### PR Not Found
```
Error: PR #123 not found. Check the number and try again.
```

### Branch Not Found
```
Error: Branch 'feat/my-feature' not found locally.
Already cleaned up or never existed.
```

### Unmerged Work
```
Warning: Branch has commits not in main.
Cannot safely delete. Use 'git branch -D' manually if intentional.
```

### Worktree Issues
```
Warning: Could not remove worktree at /path.
Manual cleanup may be needed: git worktree remove /path
```

## Integration with Workflow

Typical flow after PR merge:

```
1. PR merged on GitHub
2. User runs: /finish-branch #123
3. Skill verifies merge, cleans up
4. User starts next task with clean state
```

## Related Skills

- `/implement` - Implementation that creates branches
- `/submit` - Creates PRs that eventually need cleanup
- `primitives:worktree` - Worktree management (if available)
