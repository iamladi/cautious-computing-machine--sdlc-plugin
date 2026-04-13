# Constitution Alignment Scoring Rubric

## Purpose

This rubric measures how well a prompt follows the Anthropic Constitution's principle: **reasoning-based instructions with judgment criteria outperform rigid rule-based instructions**.

Use this rubric to score plugin prompts, agent definitions, and command specifications on a 1-10 scale across five dimensions.

---

## The 1-10 Scale

### 1-2: Rule-Heavy (Anti-Pattern)

**Characteristics:**
- Almost entirely step-by-step procedures
- Rigid templates with prescribed format
- "Never/always" rules without explanation
- Claude follows literally, fails on edge cases the writer didn't anticipate
- No trust in model judgment

**Markers:**
- Numbered procedural scripts
- Bash command sequences to execute verbatim
- Rules like "Never X" or "Always Y" without reasoning
- Exhaustive checklists without context
- Template fill-in-the-blank formats

**Example (Level 2):**
```markdown
## Commit Process

Follow these steps exactly:
1. Run `git status`
2. Run `git diff`
3. Run `git log -5`
4. Stage files with `git add <file>`
5. Commit with format: `type: description`
6. Never commit without running all checks
7. Always use conventional commit types
8. Never skip the git status step
```

---

### 3-4: Mostly Rules

**Characteristics:**
- Predominantly rules with occasional reasoning
- May have good structure (priorities, goals) but constraints lack justification
- Lists of constraints without explaining why they matter
- Rigid format templates with minimal flexibility
- Some acknowledgment of edge cases, but handled via more rules

**Markers:**
- Constraint bullet lists without explanations
- Format templates with strict requirements
- Checklists without context about what success looks like
- "Don't do X, Y, Z" lists without principles

**Example (Level 4):**
```markdown
## Commit Requirements

**Format:** Must use conventional commits

**Types allowed:**
- feat: new features
- fix: bug fixes
- docs: documentation
- refactor: code changes

**Rules:**
- Commit message must be under 72 characters
- Body must explain what and why
- Never use past tense
- Always capitalize first word
- No period at end of subject
```

---

### 5-6: Hybrid (Transitional)

**Characteristics:**
- Mix of rules and reasoning
- Some sections explain why, others don't
- Priority declarations present (good) but followed by procedural steps (mixed)
- Attempts to provide context but reverts to prescription
- Judgment criteria stated but then overridden by specific rules

**Markers:**
- Goals stated clearly but implementation prescribed step-by-step
- "Why" provided for some constraints but not others
- Flexible in some areas, rigid in others
- Mix of outcome-driven and procedure-driven instructions

**Example (Level 5):**
```markdown
## Commit Guidelines

**Goal:** Create commits that clearly communicate intent to future developers.

**Process:**
1. Review changes to understand the scope
2. Draft a commit message that captures the "why"
3. Use conventional commit format for tooling compatibility

**Format requirements:**
- Type prefix (feat/fix/docs/refactor)
- Keep subject under 72 chars
- Use imperative mood because it matches git's own convention

**Don't:**
- Commit unrelated changes together
- Use vague descriptions like "fix stuff"
```

---

### 7-8: Mostly Reasoning (Good)

**Characteristics:**
- Constraints explained with reasoning
- Outcome-driven rather than procedure-driven
- Judgment criteria used instead of rigid rules
- Some prescriptive elements remain where appropriate (format contracts, safety checks)
- Trusts model to adapt approach to context

**Markers:**
- "X because Y" pattern throughout
- Judgment dimensions listed with examples
- Examples illustrating criteria rather than templates to fill
- Principles that apply across contexts
- Explicit acknowledgment of when to use judgment

**Example (Level 7):**
```markdown
## Creating Commits

**Goal:** Communicate intent clearly to future developers reviewing history.

**Key principles:**
- Focus on **why** over what (diff shows what changed)
- Use conventional commit types (feat/fix/docs/refactor) for tooling compatibility
- Keep subject lines concise because they appear in git log one-liners
- Use imperative mood to match git's own convention ("add feature" not "added feature")

**Judgment criteria for a good commit:**
- Someone reading it in 6 months understands the motivation
- The scope is cohesive (related changes grouped together)
- The type accurately reflects the nature of the change

**When to split commits:**
- Changes serve different purposes (feature + refactor = two commits)
- Different parts might need reverting independently
- Combining would make the message unclear

Use your judgment on message length. If explaining the change takes 5 lines, use 5 lines.
```

---

### 9-10: Constitution-Aligned (Exemplary)

**Characteristics:**
- Features defined as judgment criteria
- Guides rather than micromanages
- Trusts the model's intelligence and reasoning
- Rules only where genuinely needed (hard safety constraints, format contracts)
- Examples provided for ambiguous cases
- Reads like an onboarding document for a thoughtful professional

**Markers:**
- "Use your judgment" explicit trust statements
- Criteria dimensions with reasoning
- Before/after examples showing good vs. poor judgment
- Clear identity/goal/constraint structure
- Principles over procedures
- Acknowledges tradeoffs and context-dependence

**Example (Level 9):**
```markdown
## Commits

**Goal:** Create a commit history that serves as clear documentation of project evolution.

**Why this matters:**
Future developers (including you) use git history to:
- Understand why decisions were made
- Find when bugs were introduced
- Review context for features
- Decide what's safe to change

**Judgment criteria:**

*Clarity:* Someone unfamiliar with the current context can understand the motivation.
- Good: "feat: add retry logic to handle transient API failures"
- Poor: "feat: add retry logic" (why was this needed?)

*Scope:* Changes serve a single coherent purpose.
- Good: Bug fix in one commit, refactoring in another
- Poor: Bug fix + "while I was here" improvements mixed together

*Accuracy:* The type reflects the nature of the change.
- feat = new capability that didn't exist
- fix = correcting unintended behavior
- refactor = improving code without changing behavior
- docs = documentation only

**Format notes:**
Use conventional commit format (type: description) because tooling depends on it. Keep the first line under 72 characters for git log readability. Use imperative mood ("add", not "added") to match git's convention.

**When to split commits:**
If you're tempted to use "and" in your commit message ("add X and refactor Y"), that's usually two commits. Split when changes have different purposes or might need independent reverting.

**Edge cases:**
- Fixing a bug discovered while building a feature? Your judgment: if the bug is in existing code, split it. If it's in the new feature code, combine it.
- Typo fixes? Combine related typos in one docs commit unless they're in different logical areas.
- Refactoring before implementing? Split if the refactoring has value independent of the new feature.

Use your judgment on message length and detail. Match the complexity of the explanation to the complexity of the change.
```

---

## Scoring Dimensions

Score each dimension 1-10, then average for overall score.

### 1. Constraint Style

**Question:** How are constraints communicated?

- **1-3:** Bare rules without justification ("Never X", "Always Y")
- **4-6:** Mix of rules and reasoning; some constraints explained, others not
- **7-9:** Constraints explained with "because Y" reasoning
- **10:** Only essential constraints; all have clear reasoning; tradeoffs acknowledged

### 2. Workflow Style

**Question:** How is the work process described?

- **1-3:** Step-by-step procedure to follow literally
- **4-6:** Suggested steps with some outcome context
- **7-9:** Outcome-driven with principles for achieving it
- **10:** Goal and judgment criteria; model chooses approach

### 3. Format Style

**Question:** How are format/structure requirements specified?

- **1-3:** Rigid template to fill in; exact format prescribed
- **4-6:** Template provided with some flexibility noted
- **7-9:** Format explained as convention with reasoning; examples show good judgment
- **10:** Format criteria with examples; model applies judgment to meet criteria

### 4. Trust Level

**Question:** How much does the prompt trust model judgment?

- **1-3:** Micromanages every decision; no trust
- **4-6:** Prescriptive but acknowledges some judgment areas
- **7-9:** Guides judgment with criteria; trusts model in most areas
- **10:** Explicit trust statements; "use your judgment" present; model treated as thoughtful professional

### 5. Edge Case Handling

**Question:** How are novel/unexpected situations addressed?

- **1-3:** Only enumerated cases covered; no principles for new situations
- **4-6:** Common cases enumerated; some general guidance
- **7-9:** Principles apply to novel situations; examples show judgment application
- **10:** Principles clearly generalize; edge cases explicitly call for judgment; tradeoffs discussed

---

## Comparative Examples

### Constraint Style: "Don't commit secrets"

**Level 2 (Rule-Heavy):**
```markdown
Never commit:
- .env files
- credentials.json
- config/secrets.yml
- *.key files
- passwords.txt
```

**Level 5 (Hybrid):**
```markdown
Don't commit sensitive files:
- .env (contains API keys)
- credentials.json
- *.key files

Check git status before committing to catch these.
```

**Level 7 (Mostly Reasoning):**
```markdown
Don't commit secrets because they'd be exposed in repository history.

Common secret patterns:
- API keys and tokens (.env files, config with keys)
- Credentials (passwords, certificates, private keys)
- Connection strings with embedded passwords

Before committing, scan staged files for these patterns. If you're unsure whether something is sensitive, ask.
```

**Level 9 (Constitution-Aligned):**
```markdown
**Security:** Never commit secrets to version control. Once in git history, secrets are exposed permanently (even if later removed).

What counts as a secret?
- Anything granting access: API keys, tokens, passwords, private keys, certificates
- Connection strings embedding credentials
- Files typically in .gitignore: .env, credentials.json, etc.

Use your judgment: if exposing it publicly would create a security risk, it's a secret.

Before committing, review staged files. If you spot something that looks like a secret, warn the user and skip staging that file. For ambiguous cases (e.g., example configs with placeholder values), use context to decide.
```

---

### Workflow Style: "Create a pull request"

**Level 2 (Rule-Heavy):**
```markdown
PR Creation Steps:
1. Run `git status`
2. Run `git diff`
3. Run `git log --oneline -10`
4. Run `git push origin HEAD`
5. Run `gh pr create --title "..." --body "..."`
6. Return the PR URL
```

**Level 5 (Hybrid):**
```markdown
PR Creation Process:

Goal: Create a PR that clearly describes all changes.

Steps:
1. Review the changes (git status, git diff, git log)
2. Understand what changed and why
3. Draft a PR title (under 70 chars) and description
4. Push the branch if needed
5. Create PR using gh CLI with title and body
6. Return the URL

Include a summary and test plan in the body.
```

**Level 7 (Mostly Reasoning):**
```markdown
Creating Pull Requests:

Goal: Communicate the change clearly so reviewers understand intent and scope.

What to include:
- **Title:** Clear, concise summary (under 70 chars for UI display)
- **Summary:** What changed and why (2-5 bullets usually sufficient)
- **Test plan:** How to verify the change works

Before creating the PR:
- Review the full diff and commit history since branching
- Ensure the branch is pushed to remote
- Check if there are uncommitted changes that should be included

Use gh pr create with title and body. Format the body with markdown sections for readability.
```

**Level 9 (Constitution-Aligned):**
```markdown
Pull Requests:

Goal: Help reviewers quickly understand what changed, why it matters, and how to verify it works.

A good PR description answers:
- What capability changed? (new feature, bug fix, refactor)
- Why was this change needed? (problem it solves, context)
- How can someone verify it works? (test plan)

Title guidelines: Keep under 70 characters because that's what displays in GitHub's UI without truncation. Focus on the outcome, not the implementation details.

Before creating the PR:
- Review all commits since branching (not just the latest) to capture full scope
- Verify the branch is pushed to remote
- Check git status for uncommitted changes

Use your judgment on description length. Match detail to change complexity. A small bug fix might need 2 sentences; a major feature might need several paragraphs.

Format: Use gh pr create with markdown sections (## Summary, ## Test plan) for readability.
```

---

### Format Style: "Error handling"

**Level 2 (Rule-Heavy):**
```markdown
Error Handling Rules:
1. Use try-catch only at system boundaries (API handlers, queue consumers, cron entry points)
2. Let errors propagate through business logic — do not catch and return null
3. Log errors with console.error() at the boundary where you catch them
4. Return error object with shape: {error: true, message: string} from boundary handlers
5. Always include stack traces in error logs
```

**Level 5 (Hybrid):**
```markdown
Error Handling:

Catch errors at system boundaries (API route handlers, message queue consumers, cron jobs) — not inside business logic functions.

At boundaries:
- Log the full error for debugging (include stack trace and request context)
- Return a consistent error shape to the caller: {error: true, message: string}
- Don't let exceptions crash the process

Inside business logic, let errors propagate naturally. A function that catches an error and returns null hides the failure from every caller above it.
```

**Level 7 (Mostly Reasoning):**
```markdown
Error Handling:

Goal: Surface failures quickly with useful debugging information. Errors caught too early (inside business logic) hide bugs; errors caught too late (nowhere) crash processes.

The sweet spot is **system boundaries** — API handlers, queue consumers, cron entry points. These are where you translate internal errors into external responses:
- Users get actionable messages (what went wrong, what to try)
- Developers get debugging information (stack traces, context)
- The process doesn't crash unexpectedly

Inside business logic, let errors propagate. If `getUser()` fails, the caller should see the error — not a silent `null` that causes a confusing failure three layers up.

Exception: operations where partial failure is expected and recovery is defined (e.g., batch processing with per-item error handling).
```

**Level 9 (Constitution-Aligned):**
```markdown
Error Handling:

Goal: Fail fast in business logic, fail gracefully at system edges.

The core principle: errors should propagate through business logic untouched, then be caught and handled at system boundaries where you control the response format.

**System boundaries** (catch here):
- API route handlers → log + return error response
- Queue consumers → log + nack/retry
- Cron entry points → log + alert

**Business logic** (don't catch here):
- Let errors propagate naturally — callers need to see failures
- A function that catches and returns null hides bugs from every layer above it
- If `getUser()` can fail, the caller must handle that possibility — don't mask it

Use your judgment on granularity:
- A missing optional config file might warn and use defaults
- A missing required file should throw clearly — don't `?? fallback` required data
- Batch processing may catch per-item to continue processing remaining items

Match error handling to failure impact: the higher the impact, the faster it should surface.
```

---

## Scoring Process

1. Read the prompt thoroughly
2. Score each of the 5 dimensions (1-10)
3. Note specific examples supporting each score
4. Average the dimension scores for overall score
5. Provide concrete suggestions for improvement

**Example Scoring:**

```
Constraint Style: 6/10
- Constraints present but some lack reasoning
- Example: "Never use X" without explaining why

Workflow Style: 7/10
- Mostly outcome-driven
- Example: Specifies goal before process

Format Style: 4/10
- Rigid template prescribed
- Example: Exact output structure required

Trust Level: 5/10
- Some judgment areas, but also micromanagement
- Example: Prescribes specific bash commands

Edge Cases: 6/10
- General principles present but not consistently applied

Overall: 5.6/10 (Hybrid - leans toward reasoning but still has prescriptive elements)
```

---

## Common Anti-Patterns to Avoid

### Never/Always Without Why
```markdown
❌ Never commit without tests
✓ Don't commit without tests because untested code tends to break production
```

### Step-by-Step Scripts
```markdown
❌ 1. Run command X, 2. Run command Y, 3. Run command Z
✓ Goal: Achieve Y. Review X first, then use Z to verify. Use your judgment on order if context requires it.
```

### Enumerated Cases Without Principles
```markdown
❌ For bug fixes use "fix:", for features use "feat:", for docs use "docs:"
✓ Use type prefixes that reflect the change nature (fix=correcting behavior, feat=new capability, docs=documentation). This helps tooling categorize changes.
```

### Template Fill-in-the-Blank
```markdown
❌ Output format: "Summary: [X]\nDetails: [Y]\nNext steps: [Z]"
✓ Include summary, details, and next steps. Use markdown sections for readability. Match detail level to complexity.
```

### Bare Constraints Lists
```markdown
❌ Requirements: Must be under 100 chars, must use active voice, must include emoji
✓ Keep concise (under 100 chars) for quick scanning. Use active voice for clarity. Emoji optional based on tone.
```

---

## Using This Rubric

**During review:**
1. Score the prompt across all 5 dimensions
2. Calculate average for overall score
3. Identify specific anti-patterns with line references
4. Suggest rewrites using higher-scoring patterns
5. Prioritize changes by impact (trust level and edge cases usually highest leverage)

**Target scores:**
- **7+**: Constitution-aligned, ship it
- **5-6**: Functional but could be better; suggest improvements
- **Below 5**: Needs significant rework before shipping

**Remember:** The goal isn't to eliminate all structure or requirements. Format contracts, safety constraints, and essential requirements can be prescriptive. The question is: does this prescription serve the model's judgment, or replace it?
