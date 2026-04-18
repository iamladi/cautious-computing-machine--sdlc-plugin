import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'skills/interview/SKILL.md',
  description: 'Interview skill walks decision tree with mandatory recommendations, one decision per round',
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
    },
    {
      name: 'description-is-trigger-style',
      test: (content) => /description:.*(Use when|Triggers when|when user)/i.test(content)
    },
    {
      name: 'has-mandatory-recommendation',
      test: (content) => /\(Recommended\)|mandatory recommendation|recommendation.*every round/i.test(content)
    },
    {
      name: 'has-decision-tree-framing',
      test: (content) => /decision.tree|branch.by.branch|unresolved.*branch|depth.first|walk.*branch/i.test(content)
    },
    {
      name: 'has-one-decision-per-round',
      test: (content) => /one decision per round|one.*question.*at a time|one\s+\*?\*?decision\*?\*?/i.test(content)
    },
    {
      name: 'has-codebase-first-rule',
      test: (content) => /codebase.*answer|explore.*don.t ask|Read\/Grep\/Glob|answerable.*code/i.test(content)
    },
    {
      name: 'has-thinking-block',
      test: (content) => /<thinking>/i.test(content)
    },
    {
      name: 'has-example-block',
      test: (content) => /<example>/i.test(content)
    },
    {
      name: 'has-no-fabrication-rule',
      test: (content) => /not fabricate|do not fabricate|surface.*ambiguity/i.test(content)
    },
    {
      name: 'has-effort-guidance',
      test: (content) => /xhigh|thinking effort|high.*effort/i.test(content)
    },
    {
      name: 'has-opinionated-role',
      test: (content) => /opinionated|challenge assumptions|senior engineer/i.test(content)
    }
  ],
  testInput: 'I want to add OAuth authentication to my Node.js Express API. Interview me about this plan.',
  judge: {
    criteria: [
      {
        name: 'identifies-one-decision',
        question: 'Does the output focus on exactly ONE decision for this round (rather than asking many questions at once)?'
      },
      {
        name: 'offers-recommendation',
        question: 'Does the output include an explicit recommendation marked "(Recommended)" or an equivalent clear recommendation among the options?'
      },
      {
        name: 'cites-tradeoff',
        question: 'Does the recommended option include a rationale that names a concrete tradeoff (e.g., performance, complexity, durability)?'
      },
      {
        name: 'offers-alternatives',
        question: 'Does the output present at least 2 alternatives besides the recommendation, each with its own tradeoff?'
      },
      {
        name: 'opinionated-stance',
        question: 'Does the output adopt an opinionated stance (senior-engineer reviewer style) rather than a passive neutral tone?'
      },
      {
        name: 'targets-decision-branch',
        question: 'Does the question target a specific design decision branch (e.g. token storage, session lifetime, provider choice) rather than a vague open-ended question?'
      },
      {
        name: 'no-fabrication',
        question: 'Does the output avoid making up specific codebase details (file names, package versions, existing code) that were not provided in the input?'
      }
    ]
  }
}

export default evalCase
