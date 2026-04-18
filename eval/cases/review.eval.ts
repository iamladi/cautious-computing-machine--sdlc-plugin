import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'commands/review.md',
  description: 'Review command spawns parallel Codex and Gemini reviewers with priority-sorted report',
  structural: [
    ...commonStructural(),
    {
      name: 'has-codex-reviewer',
      test: (content) => /codex.*(review|analyst|failure mode)/is.test(content)
    },
    {
      name: 'has-gemini-reviewer',
      test: (content) => /gemini.*(review|analyst|production)/is.test(content)
    },
    {
      name: 'mentions-parallel-execution',
      test: (content) => /parallel|spawn.*both|wait.*both/i.test(content)
    },
    {
      name: 'has-consolidated-report-format',
      test: (content) => /consolidat.*report|consolidat.*feedback/i.test(content)
    },
    {
      name: 'has-priority-levels',
      test: (content) => /P0.*P1.*P2.*P3|Critical.*High.*Medium.*Low/s.test(content)
    },
    {
      name: 'has-scope-with-arguments',
      test: (content) => /^## (Scope|Review Scope)/m.test(content) && /\$ARGUMENTS/.test(content) ||
                          /\$ARGUMENTS/.test(content)
    }
  ],
  behavioral: [
    {
      name: 'spawns-parallel-reviewers',
      test: (output) => /(codex|gemini).*review/i.test(output)
    },
    {
      name: 'generates-priority-sorted-report',
      test: (output) => /(P0|P1|P2|P3|Critical|High|Medium|Low)/.test(output)
    }
  ],
  testInput: 'Review the eval system implementation'
}

export default evalCase
