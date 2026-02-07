import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'skills/codex/SKILL.md',
  description: 'Codex skill provides OpenAI Codex integration with sandbox modes',
  structural: [
    ...commonStructural(),
    {
      name: 'has-frontmatter',
      test: (content) => /^---\s*\nname:/m.test(content)
    },
    {
      name: 'has-model-options-table',
      test: (content) => /gpt-.*-codex|model.*option|codex.*model/i.test(content)
    },
    {
      name: 'mentions-sandbox-modes',
      test: (content) => /sandbox.*mode|--sandbox|read-only.*isolated/i.test(content)
    },
    {
      name: 'mentions-skip-git-repo-check',
      test: (content) => /--skip-git-repo-check/.test(content)
    }
  ]
}

export default evalCase
