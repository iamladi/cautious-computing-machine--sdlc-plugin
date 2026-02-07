import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'agents/test-writer.md',
  description: 'Test writer creates tests with flat structure and composable setup',
  structural: [
    ...commonStructural(),
    {
      name: 'has-correct-frontmatter-tools',
      test: (content) => /^---[\s\S]*?tools:\s*Read,\s*Grep,\s*Glob,\s*Write,\s*Edit,\s*Bash/m.test(content)
    },
    {
      name: 'mentions-flat-structure',
      test: (content) => /flat.*structure|no.*nest.*describe/i.test(content)
    },
    {
      name: 'mentions-composable-setup',
      test: (content) => /composable.*setup|setup.*function/i.test(content)
    },
    {
      name: 'mentions-disposable-fixtures',
      test: (content) => /disposable.*fixture|fresh.*fixture/i.test(content)
    }
  ]
}

export default evalCase
