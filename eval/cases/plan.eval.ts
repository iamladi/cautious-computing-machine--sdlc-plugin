import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'commands/plan.md',
  description: 'Plan command generates PRD from research',
  structural: [
    ...commonStructural(),
    {
      name: 'has-plan-format-section',
      test: (content) => /^## Plan Format/m.test(content)
    },
    {
      name: 'has-blindspot-review-section',
      test: (content) => /^## (Phase 2: )?Multi-LLM Blindspot Review/m.test(content) ||
                          /Blindspot Review/i.test(content)
    },
    {
      name: 'has-session-naming',
      test: (content) => /^## Session Naming/m.test(content)
    },
    {
      name: 'has-arguments-placeholder',
      test: (content) => /\$ARGUMENTS/.test(content)
    },
    {
      name: 'has-prd-template-content',
      test: (content) => /## Metadata/.test(content) &&
                          /## Overview/.test(content) &&
                          /## Implementation Plan/.test(content)
    }
  ],
  behavioral: [
    {
      name: 'output-includes-prd-sections',
      test: (output) => /## Metadata/m.test(output) &&
                         /## Overview/m.test(output) &&
                         /## Implementation Plan/m.test(output)
    },
    {
      name: 'phases-have-complexity',
      test: (output) => /\*\*Complexity\*\*:\s*\d+/i.test(output)
    },
    {
      name: 'has-frontmatter',
      test: (output) => /^---\s*\n.*\ntitle:/.test(output)
    },
    {
      name: 'mentions-multi-llm-review',
      test: (output) => /(codex|gemini|multi-llm|blindspot)/i.test(output)
    }
  ],
  testInput: 'Create a plan to add retry logic with exponential backoff to the API client'
}

export default evalCase
