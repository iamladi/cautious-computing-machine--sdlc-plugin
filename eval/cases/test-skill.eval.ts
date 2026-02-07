import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'skills/test/SKILL.md',
  description: 'Test skill enforces flat structure, composable setup, AHA testing',
  structural: [
    ...commonStructural(),
    {
      name: 'has-frontmatter',
      test: (content) => /^---\s*\nname:.*\ndescription:/m.test(content)
    },
    {
      name: 'mentions-flat-structure',
      test: (content) => /flat.*structure|no.*nest.*describe/i.test(content)
    },
    {
      name: 'mentions-composable-setup',
      test: (content) => /composable.*setup|setup.*function/i.test(content)
    },
    {
      name: 'mentions-disposable-fixtures',
      test: (content) => /disposable.*fixture|fresh.*fixture/i.test(content)
    },
    {
      name: 'mentions-aha-testing',
      test: (content) => /AHA.*testing|avoid.*hasty.*abstraction/i.test(content)
    },
    {
      name: 'has-write-review-convert-modes',
      test: (content) => /Write.*Review.*Convert|mode.*write|mode.*review|mode.*convert/is.test(content)
    },
    {
      name: 'has-framework-detection',
      test: (content) => /framework.*detect|detect.*framework|vitest.*jest.*bun/is.test(content)
    }
  ],
  behavioral: [
    {
      name: 'no-nested-describes',
      test: (output) => !/describe.*\n.*describe/s.test(output) ||
                         !output.includes('describe(') // might not generate test code
    },
    {
      name: 'uses-setup-functions',
      test: (output) => /setup|beforeEach|createFixture/i.test(output) ||
                         !output.includes('test(') // might not generate test code
    }
  ],
  testInput: 'Write tests for the eval runner'
}

export default evalCase
