#!/usr/bin/env bun

/**
 * Eval harness runner for sdlc-plugin prompts
 *
 * Usage:
 *   bun run eval/run-eval.ts [--mode structural|llm|all] [--filter <glob>]
 *
 * Modes:
 *   structural: Run only structural assertions (no API calls)
 *   llm: Run only behavioral assertions (requires API key)
 *   all: Run both structural and behavioral
 */

import { readdir, readFile, mkdir } from 'fs/promises'
import { join, resolve } from 'path'
import { existsSync } from 'fs'
import Anthropic from '@anthropic-ai/sdk'
import { config, type EvalMode } from './eval.config.ts'
import type { EvalCase, EvalResult, EvalReport } from './eval.types.ts'

const PLUGIN_ROOT = resolve(import.meta.dir, '..')
const CASES_DIR = join(import.meta.dir, 'cases')
const RESULTS_DIR = join(import.meta.dir, 'results')

// Parse CLI arguments
function parseArgs(): { mode: EvalMode; filter?: string } {
  const args = process.argv.slice(2)
  let mode: EvalMode = 'structural'
  let filter: string | undefined

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--mode' && i + 1 < args.length) {
      const modeArg = args[i + 1]
      if (modeArg === 'structural' || modeArg === 'llm' || modeArg === 'all') {
        mode = modeArg
      } else {
        console.error(`Invalid mode: ${modeArg}. Use structural, llm, or all.`)
        process.exit(1)
      }
      i++
    } else if (args[i] === '--filter' && i + 1 < args.length) {
      filter = args[i + 1]
      i++
    }
  }

  return { mode, filter }
}

// Load eval cases from cases directory
async function loadEvalCases(filter?: string): Promise<EvalCase[]> {
  if (!existsSync(CASES_DIR)) {
    console.warn(`Cases directory not found: ${CASES_DIR}`)
    return []
  }

  const files = await readdir(CASES_DIR)
  const caseFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.js'))

  const cases: EvalCase[] = []
  for (const file of caseFiles) {
    if (filter && !file.includes(filter)) continue

    const casePath = join(CASES_DIR, file)
    const caseModule = await import(casePath)

    if (caseModule.default) {
      cases.push(caseModule.default)
    } else if (caseModule.cases) {
      cases.push(...caseModule.cases)
    }
  }

  return cases
}

// Read prompt file content
async function readPromptFile(promptFile: string): Promise<string> {
  const fullPath = join(PLUGIN_ROOT, promptFile)
  if (!existsSync(fullPath)) {
    throw new Error(`Prompt file not found: ${fullPath}`)
  }
  return await readFile(fullPath, 'utf-8')
}

// Run structural assertions
function runStructuralAssertions(
  evalCase: EvalCase,
  content: string
): EvalResult[] {
  const results: EvalResult[] = []

  for (const assertion of evalCase.structural) {
    try {
      const passed = assertion.test(content)
      results.push({
        promptFile: evalCase.promptFile,
        description: evalCase.description,
        mode: 'structural',
        assertion: assertion.name,
        passed,
        details: passed ? undefined : 'Assertion failed'
      })
    } catch (error) {
      results.push({
        promptFile: evalCase.promptFile,
        description: evalCase.description,
        mode: 'structural',
        assertion: assertion.name,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : String(error)}`
      })
    }
  }

  return results
}

// Run behavioral assertions (requires API)
async function runBehavioralAssertions(
  evalCase: EvalCase,
  promptContent: string,
  anthropic: Anthropic
): Promise<{ results: EvalResult[]; cost: number }> {
  const results: EvalResult[] = []

  if (!evalCase.behavioral || evalCase.behavioral.length === 0) {
    return { results, cost: 0 }
  }

  try {
    // Call Anthropic API with prompt
    const userMessage = evalCase.testInput || 'Test input'
    const fullPrompt = `${promptContent}\n\n---\n\n${userMessage}`

    const response = await anthropic.messages.create({
      model: config.model,
      max_tokens: config.maxTokens,
      messages: [{
        role: 'user',
        content: fullPrompt
      }]
    })

    // Extract text output
    const output = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('\n')

    // Calculate cost (Sonnet 4.5: $3/MTok input, $15/MTok output)
    const inputTokens = response.usage.input_tokens
    const outputTokens = response.usage.output_tokens
    const cost = (inputTokens / 1_000_000 * 3) + (outputTokens / 1_000_000 * 15)

    // Run assertions against output
    for (const assertion of evalCase.behavioral) {
      try {
        const passed = assertion.test(output)
        results.push({
          promptFile: evalCase.promptFile,
          description: evalCase.description,
          mode: 'behavioral',
          assertion: assertion.name,
          passed,
          details: passed ? undefined : 'Assertion failed'
        })
      } catch (error) {
        results.push({
          promptFile: evalCase.promptFile,
          description: evalCase.description,
          mode: 'behavioral',
          assertion: assertion.name,
          passed: false,
          details: `Error: ${error instanceof Error ? error.message : String(error)}`
        })
      }
    }

    return { results, cost }
  } catch (error) {
    // API call failed
    for (const assertion of evalCase.behavioral) {
      results.push({
        promptFile: evalCase.promptFile,
        description: evalCase.description,
        mode: 'behavioral',
        assertion: assertion.name,
        passed: false,
        details: `API Error: ${error instanceof Error ? error.message : String(error)}`
      })
    }
    return { results, cost: 0 }
  }
}

// Rate limiter
export async function rateLimit(requestsPerMinute: number) {
  const delayMs = (60 * 1000) / requestsPerMinute
  await new Promise(resolve => setTimeout(resolve, delayMs))
}

interface RunCaseOpts {
  mode: EvalMode
  anthropic: Anthropic | null
  totalCost: number
}

interface RunCaseResult {
  results: EvalResult[]
  cost: number
  skipped: boolean
}

// Run a single eval case and return its results, cost, and whether it was skipped
export async function runCase(evalCase: EvalCase, opts: RunCaseOpts): Promise<RunCaseResult> {
  const { mode, anthropic, totalCost } = opts
  const caseResults: EvalResult[] = []
  let caseCost = 0

  console.log(`Testing: ${evalCase.promptFile}`)
  console.log(`  ${evalCase.description}`)

  try {
    // Read prompt content
    const content = await readPromptFile(evalCase.promptFile)

    // Run structural assertions
    if (mode === 'structural' || mode === 'all') {
      const structuralResults = runStructuralAssertions(evalCase, content)
      caseResults.push(...structuralResults)

      const passed = structuralResults.filter(r => r.passed).length
      const failed = structuralResults.filter(r => !r.passed).length
      console.log(`  Structural: ${passed} passed, ${failed} failed`)
    }

    // Run behavioral assertions
    if ((mode === 'llm' || mode === 'all') && anthropic && evalCase.behavioral) {
      // Check spend guard
      if (totalCost >= config.maxSpendPerRun) {
        console.warn(`  ⚠️  Spend limit reached ($${config.maxSpendPerRun}). Skipping LLM eval.`)
        console.log()
        return { results: caseResults, cost: 0, skipped: true }
      }

      // Rate limit
      await rateLimit(config.maxRequestsPerMinute)

      const { results: behavioralResults, cost } = await runBehavioralAssertions(
        evalCase,
        content,
        anthropic
      )
      caseResults.push(...behavioralResults)
      caseCost = cost

      const passed = behavioralResults.filter(r => r.passed).length
      const failed = behavioralResults.filter(r => !r.passed).length
      console.log(`  Behavioral: ${passed} passed, ${failed} failed (cost: $${cost.toFixed(4)})`)
    }
  } catch (error) {
    console.error(`  ✗ Error: ${error instanceof Error ? error.message : String(error)}`)
    // Append a synthetic failed result so the harness exits non-zero
    caseResults.push({
      case: evalCase.promptFile,
      assertion: 'case_execution',
      type: 'structural',
      passed: false,
      details: `Case failed to execute: ${error instanceof Error ? error.message : String(error)}`
    })
  }

  console.log()
  return { results: caseResults, cost: caseCost, skipped: false }
}

// Format and persist the eval report, returning the path it was written to
export async function generateReport(
  results: EvalResult[],
  mode: EvalMode,
  totalCases: number,
  skippedCount: number,
  totalCost: number
): Promise<string> {
  const report: EvalReport = {
    timestamp: new Date().toISOString(),
    mode,
    totalCases,
    totalAssertions: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    skipped: skippedCount,
    estimatedCost: totalCost,
    results
  }

  // Write report to results directory
  await mkdir(RESULTS_DIR, { recursive: true })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const reportPath = join(RESULTS_DIR, `eval-${timestamp}.json`)
  const { writeFile } = await import('fs/promises')
  await writeFile(reportPath, JSON.stringify(report, null, 2))

  // Print summary
  console.log('=== Summary ===')
  console.log(`Total cases: ${report.totalCases}`)
  console.log(`Total assertions: ${report.totalAssertions}`)
  console.log(`Passed: ${report.passed}`)
  console.log(`Failed: ${report.failed}`)
  console.log(`Skipped: ${report.skipped}`)
  if (totalCost > 0) {
    console.log(`Estimated cost: $${totalCost.toFixed(4)}`)
  }
  console.log(`\nReport saved to: ${reportPath}\n`)

  return reportPath
}

// Main eval runner — arg parsing, case loading, orchestration, exit code
async function runEval() {
  const { mode, filter } = parseArgs()

  console.log(`\n=== SDLC Plugin Eval Harness ===`)
  console.log(`Mode: ${mode}`)
  if (filter) console.log(`Filter: ${filter}`)
  console.log()

  // Load eval cases
  const cases = await loadEvalCases(filter)
  if (cases.length === 0) {
    console.warn('No eval cases found.')
    process.exit(0)
  }

  console.log(`Loaded ${cases.length} eval case(s)\n`)

  // Check API key if LLM mode
  let anthropic: Anthropic | null = null
  if (mode === 'llm' || mode === 'all') {
    if (!config.apiKey) {
      if (config.skipLlmOnMissingKey) {
        console.warn('⚠️  ANTHROPIC_API_KEY not set. Skipping LLM evals.\n')
      } else {
        console.error('Error: ANTHROPIC_API_KEY required for LLM evals.')
        process.exit(1)
      }
    } else {
      anthropic = new Anthropic({ apiKey: config.apiKey })
    }
  }

  // Run evals case-by-case
  const allResults: EvalResult[] = []
  let totalCost = 0
  let skippedCount = 0

  for (const evalCase of cases) {
    const { results, cost, skipped } = await runCase(evalCase, { mode, anthropic, totalCost })
    allResults.push(...results)
    totalCost += cost
    if (skipped) skippedCount++
  }

  // Generate and persist the report, then decide exit code
  await generateReport(allResults, mode, cases.length, skippedCount, totalCost)

  if (allResults.filter(r => !r.passed).length > 0) {
    process.exit(1)
  }
}

// Run the eval only when executed directly (not when imported for tests)
if (import.meta.main) {
  runEval().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}
