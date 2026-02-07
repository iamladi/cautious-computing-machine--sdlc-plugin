import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'skills/interview/SKILL.md',
  description: 'Interview skill gathers requirements through structured questioning',
  structural: [
    ...commonStructural(),
    {
      name: 'has-frontmatter-with-model',
      test: (content) => /^---\s*\nname:.*\nmodel:/ms.test(content)
    },
    {
      name: 'has-askuserquestion-usage',
      test: (content) => /AskUserQuestion|ask.*user.*question/i.test(content)
    },
    {
      name: 'has-interview-categories',
      test: (content) => /categor.*question|question.*categor|scope.*technical.*user/is.test(content)
    },
    {
      name: 'has-completion-section',
      test: (content) => /completion|when.*finish|after.*interview/i.test(content)
    }
  ]
}

export default evalCase
