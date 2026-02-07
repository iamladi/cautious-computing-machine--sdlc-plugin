import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'skills/tdd/SKILL.md',
  description: 'TDD skill defines strict/soft/off modes and test-first workflow',
  structural: [
    ...commonStructural(),
    {
      name: 'has-frontmatter',
      test: (content) => /^---\s*\nname:/m.test(content)
    },
    {
      name: 'defines-tdd-modes',
      test: (content) => /strict.*soft.*off|tdd.*mode.*strict|tdd.*mode.*soft/is.test(content)
    },
    {
      name: 'mentions-claude-md-reading',
      test: (content) => /CLAUDE\.md|read.*tdd.*setting/i.test(content)
    },
    {
      name: 'has-examples-section',
      test: (content) => /^## Example|example.*tdd|red.*green.*refactor/im.test(content)
    }
  ]
}

export default evalCase
