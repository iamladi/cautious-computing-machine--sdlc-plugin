// Configuration for the eval harness
export const config = {
  // Anthropic API - reads from ANTHROPIC_API_KEY env var
  apiKey: Bun.env.ANTHROPIC_API_KEY ?? '',
  model: 'claude-sonnet-4-5-20250929', // cheap + fast for eval
  maxTokens: 4096,

  // Rate limiting
  maxRequestsPerMinute: 10,

  // Spend guard - abort if estimated cost exceeds this
  maxSpendPerRun: 5.00, // USD

  // Behavior when no API key is available
  skipLlmOnMissingKey: true, // warn and skip LLM evals, still run structural
}

export type EvalMode = 'structural' | 'llm' | 'all'
