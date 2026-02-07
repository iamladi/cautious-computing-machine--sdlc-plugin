# SDLC Plugin Eval Harness

Infrastructure for testing prompt files (markdown) by checking structural properties and optionally running them through the Anthropic API.

## Quick Start

```bash
# Run structural checks only (safe, no API calls)
bun run eval/run-eval.ts --mode structural

# Run behavioral checks (requires ANTHROPIC_API_KEY)
export ANTHROPIC_API_KEY=your-key
bun run eval/run-eval.ts --mode llm

# Run all checks
bun run eval/run-eval.ts --mode all

# Filter to specific cases
bun run eval/run-eval.ts --mode structural --filter plan
```

## Architecture

### Files

- `eval.config.ts` - Configuration (API key, model, rate limits, spend guards)
- `eval.types.ts` - TypeScript types for eval cases, results, and reports
- `shared-assertions.ts` - Reusable assertion factories
- `run-eval.ts` - Main eval runner (CLI interface)
- `eval.test.ts` - Self-test for the eval harness itself
- `cases/*.ts` - Eval case definitions
- `results/*.json` - Eval run results (timestamped)

### Eval Modes

1. **structural** - Fast, no API calls. Tests prompt structure (sections, formatting, patterns)
2. **llm** - Requires API key. Sends prompt to Anthropic API and tests output behavior
3. **all** - Runs both structural and behavioral checks

## Writing Eval Cases

Create a new file in `cases/` directory:

```typescript
import type { EvalCase } from '../eval.types.ts'
import { commonStructural } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  // Path to prompt file (relative to sdlc-plugin/)
  promptFile: 'agents/my-agent.md',

  // Human-readable description
  description: 'Tests my-agent prompt structure and behavior',

  // Structural assertions (checked against file content)
  structural: [
    {
      name: 'has-priorities-section',
      test: (content) => /^## Priorities/m.test(content)
    },
    {
      name: 'mentions-tool-usage',
      test: (content) => /Read|Grep|Glob|Bash/.test(content)
    },
  ],

  // Behavioral assertions (checked against LLM output)
  behavioral: [
    {
      name: 'follows-instructions',
      test: (output) => output.includes('expected-phrase')
    },
  ],

  // Input to send with the prompt (for behavioral tests)
  testInput: 'Test scenario description here'
}

export default evalCase
```

### Shared Assertions

Use `shared-assertions.ts` for common patterns:

```typescript
import { commonStructural, documentarianBehavioral } from '../shared-assertions.ts'

const evalCase: EvalCase = {
  promptFile: 'agents/documentarian.md',
  description: 'Tests documentarian agent',
  structural: [
    ...commonStructural(), // Includes priorities section, no-stacking, no-casual-language
  ],
  behavioral: [
    ...documentarianBehavioral(), // Includes no-suggestions, has-file-references
  ],
  testInput: 'Analyze this codebase'
}
```

## Configuration

Edit `eval.config.ts` to adjust:

- `model` - Which Claude model to use (default: Sonnet 4.5)
- `maxTokens` - Max output tokens per request
- `maxRequestsPerMinute` - Rate limiting
- `maxSpendPerRun` - Spend guard (aborts if exceeded)
- `skipLlmOnMissingKey` - Behavior when API key missing

## Cost Tracking

The harness tracks estimated costs for LLM evals:
- Input tokens: $3 per million
- Output tokens: $15 per million
- Spend guard aborts run if `maxSpendPerRun` exceeded

Results include `estimatedCost` field with total spend.

## Results

Results are saved to `results/` with timestamp:
```
results/eval-2026-02-07T19-20-17-162Z.json
```

Format:
```json
{
  "timestamp": "2026-02-07T19:20:17.162Z",
  "mode": "structural",
  "totalCases": 3,
  "totalAssertions": 15,
  "passed": 12,
  "failed": 3,
  "skipped": 0,
  "estimatedCost": 0.0234,
  "results": [
    {
      "promptFile": "commands/plan.md",
      "description": "...",
      "mode": "structural",
      "assertion": "has-priorities-section",
      "passed": false,
      "details": "Assertion failed"
    }
  ]
}
```

## Baseline Results

Store baseline results in `results/baseline/` for regression testing:

```bash
# Create baseline
bun run eval/run-eval.ts --mode structural
cp results/eval-*.json results/baseline/structural-baseline.json

# Compare against baseline
diff results/baseline/structural-baseline.json results/eval-latest.json
```

## Testing the Harness

The harness includes a self-test:

```bash
bun run eval/eval.test.ts
```

This verifies that structural assertions work correctly on mock prompts.

## Best Practices

### Structural Assertions

- Test for required sections (## Priorities, ## Instructions, etc.)
- Check for anti-patterns (stacked IMPORTANT, casual language)
- Verify tool references are present (Read, Grep, etc.)
- Ensure formatting consistency

### Behavioral Assertions

- Test that output follows instructions
- Check for unwanted patterns (suggestions when documenting)
- Verify output format (file references, code blocks)
- Test edge cases and error handling

### When to Use Each Mode

- **structural**: Fast, safe. Run on every commit (CI/CD)
- **llm**: Slow, costs money. Run before releases or when prompts change
- **all**: Comprehensive. Run before major releases

## Integration with CI/CD

Add to GitHub Actions:

```yaml
- name: Run structural evals
  run: bun run eval/run-eval.ts --mode structural
```

Only run LLM evals manually or on release branches (due to cost).
