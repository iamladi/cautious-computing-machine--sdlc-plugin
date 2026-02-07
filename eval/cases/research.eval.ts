import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'commands/research.md',
  description: 'Research command documents codebase findings without suggestions',
  structural: [
    ...commonStructural(),
    {
      name: 'has-documentarian-constraint',
      test: (content) => /YOUR ONLY JOB IS TO DOCUMENT/.test(content) || /documentarian.constraints/i.test(content)
    },
    {
      name: 'has-idea-section',
      test: (content) => /^## Idea/m.test(content)
    },
    {
      name: 'spawns-parallel-agents',
      test: (content) => /parallel.*agent|Task.*agent|sub-agent/i.test(content)
    },
    {
      name: 'has-frontmatter-template',
      test: (content) => /---\s*\n.*\ndate:.*\ngit_commit:/s.test(content) ||
                          /frontmatter/i.test(content)
    },
    {
      name: 'forbids-suggestions',
      test: (content) => /DO NOT suggest|no suggestion|documentarian/i.test(content)
    }
  ],
  behavioral: [
    {
      name: 'no-suggestions-in-output',
      test: (output) => !/(should consider|could improve|recommend|suggest)/i.test(output)
    },
    {
      name: 'has-structured-findings',
      test: (output) => /## (Detailed )?Findings/i.test(output) ||
                         /## Research Question/i.test(output)
    }
  ],
  testInput: 'How does the eval system load and execute test cases?'
}

export default evalCase
