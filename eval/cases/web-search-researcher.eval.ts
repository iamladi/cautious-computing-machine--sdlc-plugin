import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'agents/web-search-researcher.md',
  description: 'Web search researcher gathers external documentation and resources',
  structural: [
    ...commonStructural(),
    {
      name: 'has-web-search-tools',
      test: (content) => /^---[\s\S]*?tools:.*(?:WebSearch|WebFetch|fast_deep_search|Context7)/m.test(content)
    },
    {
      name: 'has-search-strategies-section',
      test: (content) => /^## (Search )?Strategies|search.*strateg/im.test(content)
    },
    {
      name: 'has-output-format',
      test: (content) => /^## Output Format|output.*format/im.test(content)
    }
  ]
}

export default evalCase
