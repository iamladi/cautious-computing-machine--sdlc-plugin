# Submit/commit the implementation of plan to Github

Follow the `Instructions` to submit/commit the `Plan` as PR to Github and then `Report` what was done.

## Instructions

### 1. Check if we're on work branch not main
- Run `git branch --show-current` to check if we're on main branch.
- If so, use SlashCommand(/generate_branch) with the issue class, and plan file to create new branch

### 2. Run verification (if not already done in conversation)
- Check conversation context: Has `/verify` been run on this plan already?
- If verification has NOT been run yet:
  - Inform user: "Running verification before submission..."
  - Execute `/verify {plan_file}` using SlashCommand tool
  - Wait for verification to complete
  - If verification fails: STOP and report errors to user
  - If verification passes: Continue to submission
- If verification was already run in conversation: Skip and proceed to next step

### 3. Process `Plan`
- Read the plan fully so you understand it
- Extract Issue number from plan frontmatter: `issue: 123`
- If no Issue number found, error: "Issue not created. Run `/github:create-issue-from-plan` first"
- Verify Issue exists: `gh issue view #123` (will error if not found)

### 4. Read the git status
- Run `git diff origin/main...HEAD --stat` to see a summary of changed files
- Run `git log origin/main..HEAD --oneline` to see the commits that will be included
- Run `git diff origin/main...HEAD --name-only` to get a list of changed files

### 5. Verify the plan was successfully implemented
- Does the current code changes implement the plan fully?
    - If the answer is no, STOP and report back to the user
- Run production build to catch any build-time errors
    - If build fails, STOP and report back to the user with the error
- Run precommit validations
    - If there are critical issues, STOP and report back to the user

### 6. Commit and create PR
- Commit the changes with SlashCommand dedicated for commit
- Submit PR to Github using SlashCommand: `/github:create-pr <issue_number> <plan_file_path>`
  - Example: `/github:create-pr 123 plans/add-oauth2-auth.md`
  - This will create PR with title `feat: #123 - Title` and body linking both Issue and plan

## Plan
$ARGUMENTS

## Report
- Summarize the work you've just done in a concise bullet point list
- Provide links to the Issue and PR created