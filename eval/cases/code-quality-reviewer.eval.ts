import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'agents/code-quality-reviewer.md',
  description: 'Code quality reviewer checks for bugs, smells, and security issues',
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
      name: 'checks-bugs-smells-security-antipatterns',
      test: (content) => /bugs.*smell.*security|anti-pattern|code.*quality/is.test(content)
    }
  ]
}

export default evalCase
