import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'agents/research-synthesizer.md',
  description: 'Research synthesizer combines multi-LLM findings with attribution',
  structural: [
    ...commonStructural(),
    {
      name: 'has-correct-frontmatter-tools',
      test: (content) => /^---[\s\S]*?tools:\s*Read,\s*Write,\s*Glob/m.test(content)
    },
    {
      name: 'has-llm-attribution-section',
      test: (content) => /LLM.*attribution|attribution.*marker|consensus.*marker/i.test(content)
    },
    {
      name: 'has-output-format-with-frontmatter',
      test: (content) => /output.*format.*frontmatter|frontmatter.*output/is.test(content) ||
                          (/^## Output/m.test(content) && /---.*\ndate:/s.test(content))
    }
  ]
}

export default evalCase
