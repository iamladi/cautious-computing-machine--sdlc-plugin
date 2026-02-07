/**
 * Example eval case for the /plan command
 *
 * This demonstrates how to write eval cases for prompt files.
 * Copy this template to create new eval cases.
 */

import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'commands/plan.md',
  description: 'Tests the /plan command prompt structure and behavior',

  structural: [
    ...commonStructural(),
    {
      name: 'has-session-naming-section',
      test: (content) => /^## Session Naming/m.test(content)
    },
    {
      name: 'has-plan-format-section',
      test: (content) => /^## Plan Format/m.test(content)
    },
    {
      name: 'has-instructions-section',
      test: (content) => /^## Instructions/m.test(content)
    },
    {
      name: 'has-multi-llm-review',
      test: (content) => /Multi-LLM.*Review/i.test(content)
    },
    {
      name: 'mentions-codex-and-gemini',
      test: (content) => /codex/i.test(content) && /gemini/i.test(content)
    },
  ],

  // Behavioral assertions would test LLM output
  // Uncomment to enable (requires API key):
  // behavioral: [
  //   {
  //     name: 'generates-valid-plan-structure',
  //     test: (output) => {
  //       // Check that output contains expected plan sections
  //       return /## Metadata/m.test(output) &&
  //              /## Overview/m.test(output) &&
  //              /## Implementation Plan/m.test(output)
  //     }
  //   },
  // ],
  // testInput: 'Create a plan to add a new /status command that shows the current state of the SDLC workflow'
}

export default evalCase
