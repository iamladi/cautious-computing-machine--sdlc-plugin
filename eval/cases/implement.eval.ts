import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'commands/implement.md',
  description: 'Implement command orchestrates subagent workflow with TDD awareness',
  structural: [
    ...commonStructural(),
    {
      name: 'mentions-dispatching-agents',
      test: (content) => /dispatch.*implementer|subagent.*implementer/i.test(content)
    },
    {
      name: 'has-tdd-mode-section',
      test: (content) => /^## (Instructions|1\. Pre-Flight Checks)[\s\S]*TDD Mode/m.test(content) ||
                          /Check TDD Mode/i.test(content)
    },
    {
      name: 'has-plan-section-with-arguments',
      test: (content) => /^## Plan/m.test(content) && /\$ARGUMENTS/.test(content)
    },
    {
      name: 'has-progress-tracking',
      test: (content) => /progress.*track|todo.*list/i.test(content)
    },
    {
      name: 'has-error-handling-section',
      test: (content) => /^## Error Handling/m.test(content) ||
                          /review.*loop.*converge/i.test(content)
    }
  ],
  behavioral: [
    {
      name: 'dispatches-implementer-agent',
      test: (output) => /implementer.*agent|Task.*implementer/i.test(output)
    },
    {
      name: 'dispatches-spec-reviewer',
      test: (output) => /spec.*review|spec-reviewer/i.test(output)
    },
    {
      name: 'dispatches-code-quality-reviewer',
      test: (output) => /code.*quality.*review|code-quality-reviewer/i.test(output)
    }
  ],
  testInput: 'plans/add-retry-logic.md'
}

export default evalCase
