import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'skills/finish-branch/SKILL.md',
  description: 'Finish branch skill handles PR merge and worktree cleanup',
  structural: [
    ...commonStructural(),
    {
      name: 'has-frontmatter',
      test: (content) => /^---\s*\nname:/m.test(content)
    },
    {
      name: 'mentions-pr-merge-detection',
      test: (content) => /PR.*merg|merge.*detect|gh pr view/i.test(content)
    },
    {
      name: 'mentions-worktree-cleanup',
      test: (content) => /worktree.*clean|clean.*worktree|git worktree remove/i.test(content)
    },
    {
      name: 'has-safety-checks',
      test: (content) => /safety.*check|check.*before|confirm.*delet/i.test(content)
    }
  ]
}

export default evalCase
