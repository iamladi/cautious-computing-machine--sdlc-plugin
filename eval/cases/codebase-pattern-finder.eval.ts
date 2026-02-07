import type { EvalCase } from '../eval.types.ts'
import { commonStructural, documentarianBehavioral } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'agents/codebase-pattern-finder.md',
  description: 'Pattern finder documents existing patterns without evaluating them',
  structural: [
    ...commonStructural(),
    {
      name: 'has-correct-frontmatter-tools',
      test: (content) => /^---[\s\S]*?tools:\s*Grep,\s*Glob,\s*Read,\s*LS/m.test(content)
    },
    {
      name: 'has-documentarian-constraint',
      test: (content) => /YOUR ONLY JOB IS TO DOCUMENT/.test(content) || /documentarian.constraints/i.test(content)
    },
    {
      name: 'shows-code-examples-in-output',
      test: (content) => /code example|example.*pattern|```/i.test(content)
    },
    {
      name: 'has-pattern-categories',
      test: (content) => /categor.*pattern|pattern.*categor/i.test(content)
    }
  ],
  behavioral: documentarianBehavioral(),
  testInput: 'Find examples of how agents are defined in this codebase'
}

export default evalCase
