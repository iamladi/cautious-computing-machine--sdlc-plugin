export interface StructuralAssertion {
  name: string
  test: (content: string) => boolean
}

export interface BehavioralAssertion {
  name: string
  test: (output: string) => boolean
}

/** A binary yes/no criterion graded by a judge model against LLM output. */
export interface JudgeCriterion {
  name: string
  /** Yes/no question the judge answers about the output. */
  question: string
}

export interface JudgeConfig {
  criteria: JudgeCriterion[]
}

export interface EvalCase {
  /** Which prompt file this tests (relative to sdlc-plugin/) */
  promptFile: string
  /** Human-readable description */
  description: string
  /** Structural assertions checked against the prompt file content */
  structural: StructuralAssertion[]
  /** Behavioral assertions checked against LLM output (optional, requires API key) */
  behavioral?: BehavioralAssertion[]
  /** LLM-as-judge criteria graded against LLM output (optional, requires API key) */
  judge?: JudgeConfig
  /** Test input to feed the model along with the prompt (for behavioral evals) */
  testInput?: string
}

export interface EvalResult {
  promptFile: string
  description: string
  mode: 'structural' | 'behavioral'
  assertion: string
  passed: boolean
  details?: string
}

export interface EvalReport {
  timestamp: string
  mode: string
  totalCases: number
  totalAssertions: number
  passed: number
  failed: number
  skipped: number
  estimatedCost: number
  results: EvalResult[]
}
