import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'agents/spec-reviewer.md',
  description: 'Spec reviewer verifies implementation matches spec exactly',
  structural: [
    ...commonStructural(),
    {
      name: 'has-correct-frontmatter-tools',
      test: (content) => /^---[\s\S]*?tools:\s*Read,\s*Grep,\s*Glob/m.test(content)
    },
    {
      name: 'has-pass-fail-output-formats',
      test: (content) => /PASS|FAIL/i.test(content) &&
                          /output.*format|^## Output/im.test(content)
    },
    {
      name: 'checks-missing-extra-wrong',
      test: (content) => /missing.*extra.*wrong|nothing missing.*nothing extra/is.test(content)
    }
  ]
}

export default evalCase
