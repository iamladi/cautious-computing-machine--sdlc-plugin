import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'commands/research-deep.md',
  description: 'Deep research with multi-LLM cross-pollination synthesis',
  structural: [
    ...commonStructural(),
    {
      name: 'has-four-phases',
      test: (content) => /(Discovery|Analysis|Refinement|Synthesis).*phase/i.test(content) ||
                          /Phase.*1.*2.*3.*4/s.test(content)
    },
    {
      name: 'has-cross-pollination',
      test: (content) => /cross.pollination|refinement.*peer|skeptic/i.test(content)
    },
    {
      name: 'has-completion-marker',
      test: (content) => /RESEARCH_COMPLETE/.test(content)
    },
    {
      name: 'has-fatal-error-detection',
      test: (content) => /fatal.*pattern|proactiv.*kill|poll/i.test(content)
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
      name: 'has-refined-outputs',
      test: (content) => /refined\.md/i.test(content)
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
    },
    {
      name: 'has-theme-based-synthesis',
      test: (output) => /theme|themed|by topic/i.test(output) &&
                          !/organized by.*source|per.llm section/i.test(output)
    }
  ],
  testInput: 'Deep dive into the plugin loading architecture'
}

export default evalCase
