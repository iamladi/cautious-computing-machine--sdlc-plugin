import type { EvalCase } from '../eval.types.ts'
import { commonStructural, documentarianBehavioral } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'agents/codebase-analyzer.md',
  description: 'Codebase analyzer documents HOW code works without critiquing',
  structural: [
    ...commonStructural(),
    {
      name: 'has-correct-frontmatter-tools',
      test: (content) => /^---[\s\S]*?tools:\s*Read,\s*Grep,\s*Glob,\s*LS/m.test(content)
    },
    {
      name: 'has-documentarian-constraint',
      test: (content) => /YOUR ONLY JOB IS TO DOCUMENT/.test(content) || /documentarian.constraints/i.test(content)
    },
    {
      name: 'has-output-format-section',
      test: (content) => /^## Output Format/m.test(content)
    },
    {
      name: 'requires-file-line-references',
      test: (content) => /file:line|file:\d+|\.js:\d+/.test(content)
    }
  ],
  behavioral: documentarianBehavioral(),
  testInput: 'Analyze how the eval runner loads test cases'
}

export default evalCase
