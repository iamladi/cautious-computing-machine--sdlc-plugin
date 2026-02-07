import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'commands/research-deep.md',
  description: 'Deep research with multi-LLM synthesis',
  structural: [
    ...commonStructural(),
    {
      name: 'has-three-phases',
      test: (content) => /(Discovery|Analysis|Synthesis).*phase/i.test(content) ||
                          /Phase.*1.*2.*3/s.test(content)
    },
    {
      name: 'has-multi-llm-approach',
      test: (content) => /claude.*gemini|gemini.*claude/i.test(content) ||
                          /(codex|gemini).*multi-llm/i.test(content)
    },
    {
      name: 'has-storage-structure',
      test: (content) => /research\/.*\.md|save.*research/i.test(content)
    },
    {
      name: 'has-documentarian-constraint',
      test: (content) => /YOUR ONLY JOB IS TO DOCUMENT/.test(content) || /documentarian.constraints/i.test(content)
    }
  ],
  behavioral: [
    {
      name: 'mentions-llm-attribution',
      test: (output) => /\[(claude|gemini|codex|consensus)\]/i.test(output)
    }
  ],
  testInput: 'Deep dive into the plugin loading architecture'
}

export default evalCase
