import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'skills/gemini/SKILL.md',
  description: 'Gemini skill provides multi-LLM capability with approval modes',
  structural: [
    ...commonStructural(),
    {
      name: 'has-frontmatter',
      test: (content) => /^---\s*\nname:/m.test(content)
    },
    {
      name: 'has-model-selection-guide',
      test: (content) => /model.*select|select.*model|gemini-.*-pro/i.test(content)
    },
    {
      name: 'mentions-approval-modes',
      test: (content) => /approval.*mode|yolo.*safe|--approval-mode/i.test(content)
    },
    {
      name: 'has-background-execution-warning',
      test: (content) => /background.*execution|run.*background|timeout/i.test(content)
    }
  ]
}

export default evalCase
