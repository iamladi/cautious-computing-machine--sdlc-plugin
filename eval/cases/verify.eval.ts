import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'commands/verify.md',
  description: 'Verify command checks implementation against plan',
  structural: [
    ...commonStructural(),
    {
      name: 'has-arguments-placeholder',
      test: (content) => /\$ARGUMENTS/.test(content)
    },
    {
      name: 'mentions-git-diff',
      test: (content) => /git diff|diff.*stat/i.test(content)
    },
    {
      name: 'mentions-plan-reading',
      test: (content) => /read.*plan|plan.*file/i.test(content)
    },
    {
      name: 'has-verification-approach',
      test: (content) => /verif.*approach|approach.*verif|how.*verif/i.test(content)
    }
  ]
}

export default evalCase
