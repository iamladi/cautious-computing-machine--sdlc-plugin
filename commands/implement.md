# Implement the following plan

Follow the `Instructions` to implement the `Plan` with `Feedback loops` then `Report` the completed work.

## Instructions

### 1. Check if we're on work branch not main
- Run `git branch --show-current` to check if we're on main branch.
- If so, use SlashCommand(/p:generate_branch) with the issue class, and plan file to create new branch

### 2. Read the `Plan`

When given a plan path:
- Read the plan completely and check for any existing checkmarks (- [x])
- Read the original plan and all files mentioned in the plan
- **Read files fully** - never use limit/offset parameters, you need complete context
- Think deeply about how the pieces fit together
- Create a todo list to track your progress
- Start implementing if you understand what needs to be done

If no plan path provided, ask for one.

### 3. Implementation Philosophy

Plans are carefully designed, but reality can be messy. Your job is to:
- Follow the plan's intent while adapting to what you find
- Implement each phase fully before moving to the next
- Verify if your work makes sense in the broader codebase context
- Update checkboxes in the plan as you complete sections
- Use feedback loops to verify your code does what's expected 

When things don't match the plan exactly, think about why and communicate clearly.
The plan is your guide, but your judgment matters too.

If you encounter a mismatch:
- STOP and think deeply about why the plan can't be followed
- Present the issue clearly:
  ```text
  Issue in Phase [N]:
  Expected: [what the plan says]
  Found: [actual situation]
  Why this matters: [explanation]
  ```
- Finish the task as failed and do not continue

### Verification Approach

After implementing a phase:
- Run the app as background process with SlashCommand dedicated for starting the app
- Run the success criteria checks plus any health repo commands or agents
- Run codereview with Codex and Gemini skills grounded with websearch with parallel sub-agents
- Analyze the codereviews and fix any issues before proceeding (don't be lazy)
- Update your progress in both the plan and your todos
- Check off completed items in the plan file itself using Edit

If instructed to execute multiple phases consecutively, skip the pause until the last phase.
Otherwise, assume you are just doing one phase.

### If You Get Stuck

When something isn't working as expected:
- First, make sure you've read and understood all the relevant code
- Consider if the codebase has evolved since the plan was written
- Present the mismatch clearly and ask for guidance

Use sub-tasks sparingly - mainly for targeted debugging or exploring unfamiliar territory.

### Resuming Work

If the plan has existing checkmarks:
- Trust that completed work is done
- Pick up from the first unchecked item
- Verify previous work only if something seems off

Remember: You're implementing a solution, not just checking boxes. Keep the end goal in mind and maintain forward momentum.

## Feedback loops

Read `FEEDBACK_LOOPS.md` file in the repo. This file gives you tools and places to use for feedback on your implementation.

## Plan
$ARGUMENTS

## Report
- Summarize the work you've just done in a concise bullet point list.
- Report the files and total lines changed with `git diff --stat`