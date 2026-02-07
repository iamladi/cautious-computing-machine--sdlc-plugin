import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'commands/submit.md',
  description: 'Submit command creates PR after verification',
  structural: [
    ...commonStructural(),
    {
      name: 'has-arguments-placeholder',
      test: (content) => /\$ARGUMENTS/.test(content)
    },
    {
      name: 'mentions-branch-check',
      test: (content) => /branch.*check|check.*branch|git branch/i.test(content)
    },
    {
      name: 'mentions-verification',
      test: (content) => /verif|validation|test.*pass/i.test(content)
    },
    {
      name: 'mentions-pr-creation',
      test: (content) => /PR|pull request|gh pr create/i.test(content)
    }
  ]
}

export default evalCase
