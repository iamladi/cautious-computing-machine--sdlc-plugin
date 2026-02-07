import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'agents/implementer.md',
  description: 'Implementer agent completes tasks with TDD awareness and self-review',
  structural: [
    ...commonStructural(),
    {
      name: 'has-correct-frontmatter-tools',
      test: (content) => /^---[\s\S]*?tools:\s*Read,\s*Grep,\s*Glob,\s*Write,\s*Edit,\s*Bash/m.test(content)
    },
    {
      name: 'has-tdd-awareness-section',
      test: (content) => /^## (Operating Principles|Your Mission)[\s\S]*TDD Awareness/m.test(content) ||
                          /TDD.*mode.*strict.*soft.*off/is.test(content)
    },
    {
      name: 'has-self-review-checklist',
      test: (content) => /self.*review|review.*before.*handoff/i.test(content) &&
                          /\[.*\].*requirements/i.test(content)
    },
    {
      name: 'has-commit-section',
      test: (content) => /^## (Operating Principles|5\.)[\s\S]*Commit/m.test(content) ||
                          /git commit.*EOF/s.test(content)
    }
  ]
}

export default evalCase
