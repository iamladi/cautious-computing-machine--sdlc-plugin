# Verify the plan implementation

Follow the `Instructions` to implement the `Plan` then `Report` the completed work.

## Instructions

### 1. Get the implementation
- Run `git diff origin/main...HEAD --stat` to see a summary of changed files
- Run `git log origin/main..HEAD --oneline` to see the commits that will be included
- Run `git diff origin/main...HEAD --name-only` to get a list of changed files

### 2. Read the `Plan`

When given a plan path:
- Read the plan completely and check for any existing checkmarks (- [x])
- Read the original plan and all files mentioned in the plan
- **Read files fully** - never use limit/offset parameters, you need complete context
- Think deeply about how the pieces fit together
- Create a todo list to track your progress
- Start verification process if you understand what needs to be done

If no plan path provided, ask for one.

### 3. Verification Philosophy

Plans are carefully designed, but reality can be messy. Your job is to:
- Follow the plan's intent while adapting to what you find
- Verify each phase fully before moving to the next
- Verify the implementation makes sense in the broader codebase context

When things don't match the plan exactly, think about why and communicate clearly.
The plan is your guide, but your judgment matters.

If you encounter a mismatch:
- STOP and think deeply about why the implementation does not follow the plan
- Present the issue clearly:
  ```text
  Issue in Phase [N]:
  Expected: [what the plan says]
  Found: [actual situation]
  Why this matters: [explanation]
  ```

### Verification Approach

After implementing a phase:

1) Verify that we worked on the right thing
- Is the code we implemented the right solution for the plan? If not, explain why and what should we do differently.
- Does the implementation fulfills the plan in all aspects? If not, what's missing and why?
- Is the solution we provided the best possible and simplest we could do?
- If we're off track, stop the implementation and report back

2) Verify that the implementation is right
- Run production build to catch any build-time errors
  - If build fails: STOP and report errors
- **Check if package has validation script:**
  - Run: `cat package.json | grep -q '"validate"'`
  - If exists: Run `bun run validate`
  - If validation fails: STOP and report errors with fix instructions
  - If validation passes: Continue to next step
- If build succeeds, run the app as background process with Bash command
- Run the success criteria checks via running @agent-repo-health-checker
- Run codereview with Codex and Gemini
- Analyze the feedback and fix any issues before proceeding

If instructed to execute multiple phases consecutively, skip the pause until the last phase.
Otherwise, assume you are just doing one phase.

### If You Get Stuck

When something isn't working as expected:
- First, make sure you've read and understood all the relevant code and plan section
- Present the mismatch clearly and ask for guidance

Use sub-tasks sparingly - mainly for targeted debugging or exploring unfamiliar territory.

## Plan
$ARGUMENTS

## Report
- Summarize the work you've just done in a concise bullet point list.
- Report the files and total lines changed with `git diff --stat`