import type { EvalCase } from '../eval.types.ts'
import { commonStructural, documentarianBehavioral } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'agents/codebase-locator.md',
  description: 'Codebase locator finds WHERE files live without analyzing content',
  structural: [
    ...commonStructural(),
    {
      name: 'has-correct-frontmatter-tools',
      test: (content) => /^---[\s\S]*?tools:\s*Grep,\s*Glob,\s*LS/m.test(content)
    },
    {
      name: 'has-documentarian-constraint',
      test: (content) => /YOUR ONLY JOB IS TO DOCUMENT/.test(content)
    },
    {
      name: 'has-output-format-with-categories',
      test: (content) => /^## Output Format/m.test(content) &&
                          /Implementation Files|Test Files|Configuration/s.test(content)
    }
  ],
  behavioral: documentarianBehavioral(),
  testInput: 'Find all files related to the eval system'
}

export default evalCase
