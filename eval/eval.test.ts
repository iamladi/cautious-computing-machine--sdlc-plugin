/**
 * Self-test for the eval harness
 * Verifies that structural assertions work correctly on mock prompts
 */

import type { StructuralAssertion } from './eval.types.ts'
import { commonStructural } from './shared-assertions.ts'

// Mock prompt content for testing
const mockPromptWithPriorities = `
# Test Prompt

## Priorities
1. Correctness
2. Safety
3. Clarity
`

const mockPromptWithoutPriorities = `
# Test Prompt

This is a prompt without a priorities section.
`

const mockPromptWithStackedImportant = `
# Test Prompt

## Instructions

IMPORTANT: Do this first.
CRITICAL: And this is critical too.
IMPORTANT: Another important thing right here.
`

const mockPromptCasualLanguage = `
# Test Prompt

You're a smart cookie! I believe in you to ultrathink this problem.
`

function runStructuralTest(content: string, assertion: StructuralAssertion): boolean {
  return assertion.test(content)
}

function testSuite() {
  const tests: { name: string; passed: boolean; details?: string }[] = []

  // Test 1: has-priorities-section positive case
  const hasPrioritiesAssertion = commonStructural().find(a => a.name === 'has-priorities-section')!
  tests.push({
    name: 'has-priorities-section: should pass when priorities section exists',
    passed: runStructuralTest(mockPromptWithPriorities, hasPrioritiesAssertion)
  })

  // Test 2: has-priorities-section negative case
  tests.push({
    name: 'has-priorities-section: should fail when priorities section missing',
    passed: !runStructuralTest(mockPromptWithoutPriorities, hasPrioritiesAssertion)
  })

  // Test 3: no-important-stacking should catch stacked IMPORTANT/CRITICAL
  const noStackingAssertion = commonStructural().find(a => a.name === 'no-important-stacking')!
  tests.push({
    name: 'no-important-stacking: should fail when IMPORTANT/CRITICAL are stacked',
    passed: !runStructuralTest(mockPromptWithStackedImportant, noStackingAssertion)
  })

  // Test 4: no-important-stacking should pass when no stacking
  tests.push({
    name: 'no-important-stacking: should pass when no stacking',
    passed: runStructuralTest(mockPromptWithPriorities, noStackingAssertion)
  })

  // Test 5: no-casual-language should catch casual phrases
  const noCasualAssertion = commonStructural().find(a => a.name === 'no-casual-language')!
  tests.push({
    name: 'no-casual-language: should fail when casual language detected',
    passed: !runStructuralTest(mockPromptCasualLanguage, noCasualAssertion)
  })

  // Test 6: no-casual-language should pass when no casual language
  tests.push({
    name: 'no-casual-language: should pass when no casual language',
    passed: runStructuralTest(mockPromptWithPriorities, noCasualAssertion)
  })

  // Report results
  console.log('\n=== Eval Harness Self-Test ===\n')
  const passed = tests.filter(t => t.passed).length
  const failed = tests.filter(t => !t.passed).length

  tests.forEach(test => {
    const status = test.passed ? '✓' : '✗'
    console.log(`${status} ${test.name}`)
    if (test.details) {
      console.log(`  ${test.details}`)
    }
  })

  console.log(`\nTotal: ${tests.length} | Passed: ${passed} | Failed: ${failed}\n`)

  if (failed > 0) {
    console.error('Self-test failed!')
    process.exit(1)
  } else {
    console.log('Self-test passed!')
    process.exit(0)
  }
}

// Run tests
testSuite()
