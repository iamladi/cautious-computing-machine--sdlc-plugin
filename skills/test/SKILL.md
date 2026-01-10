---
name: test
description: Write or review tests following Kent C. Dodds testing principles - flat structure, composable setup, disposable fixtures. Use when the user asks to write tests, review tests, or convert legacy tests.
argument-hint: [file] | review [path] | convert [file]
model: sonnet
---

# Test Writer Skill

Write and review tests following these non-negotiable principles:

1. **Flat structure** - No nested describe blocks (max 1 level for grouping)
2. **Composable setup()** - Functions instead of beforeEach
3. **Disposable fixtures** - `using` keyword for automatic cleanup
4. **AHA** - Avoid Hasty Abstractions (prefer duplication over wrong abstraction)

## Detecting Mode

Parse `$ARGUMENTS` to determine the mode:

1. **Review mode**: First arg is `review`
   - `/test review src/__tests__/` - Review tests in directory
   - `/test review src/utils.test.ts` - Review specific test file

2. **Convert mode**: First arg is `convert`
   - `/test convert old.test.ts` - Convert nested tests to flat

3. **Write mode** (default): Path to source file
   - `/test src/utils/parser.ts` - Write tests for file
   - `/test` with no args - Ask what to test

## Framework Detection

Before generating tests, detect the framework:

1. Read `package.json` in project root
2. Check dependencies for:
   - `vitest` → Use Vitest patterns
   - `bun` with `"test"` script → Use Bun test patterns
   - `jest` → **Recommend Vitest migration**, then use Vitest patterns

```typescript
// Vitest imports
import { describe, test, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'

// Bun test imports
import { describe, test, expect, mock, beforeAll, afterAll, afterEach } from 'bun:test'
```

---

## Write Mode (Default)

When given a source file path:

### Process

1. **Read the source file** completely
2. **Identify exports** - functions, classes, constants
3. **Analyze each export**:
   - Input types and edge cases
   - Return types and possible outputs
   - Side effects and dependencies
   - Error conditions
4. **Generate test file** adjacent to source or in `__tests__/`

### Test File Structure

```typescript
import { describe, test, expect, vi } from 'vitest'
import { functionName } from './module'

// ============================================================
// Setup Functions
// ============================================================

function setup(overrides?: Partial<SetupOptions>) {
  const defaults = { /* sensible defaults */ }
  const options = { ...defaults, ...overrides }

  // Create mocks
  const mockDependency = vi.fn()

  // Create instance or prepare state
  const instance = new Thing(options)

  return {
    instance,
    mockDependency,
    // Include everything tests might need
  }
}

// Composed setup for common scenarios
function setupWithValidInput() {
  const utils = setup()
  utils.instance.configure({ valid: true })
  return utils
}

// ============================================================
// Tests
// ============================================================

test('returns expected value for valid input', () => {
  const { instance } = setup()

  const result = instance.process('valid')

  expect(result).toBe('expected')
})

test('throws error for invalid input', () => {
  const { instance } = setup()

  expect(() => instance.process('')).toThrow('Input required')
})

test('calls dependency with correct arguments', () => {
  const { instance, mockDependency } = setup()

  instance.doWork()

  expect(mockDependency).toHaveBeenCalledWith('expected-arg')
})
```

### Disposable Fixtures for Resources

When tests need external resources (servers, databases, files), use disposable patterns:

```typescript
// ============================================================
// Disposable Fixtures
// ============================================================

function createTestServer() {
  const app = createApp()
  let server: Server | null = null
  let url = ''

  return {
    app,
    get url() { return url },
    async start() {
      server = app.listen(0)
      const address = server.address() as { port: number }
      url = `http://localhost:${address.port}`
    },
    async [Symbol.asyncDispose]() {
      if (server) {
        await new Promise<void>(resolve => server!.close(() => resolve()))
      }
    }
  }
}

function createTestDatabase() {
  const db = new TestDatabase()
  return {
    db,
    async [Symbol.asyncDispose]() {
      await db.close()
    }
  }
}

function createTempFile(content: string) {
  const path = `/tmp/test-${Date.now()}.txt`
  writeFileSync(path, content)
  return {
    path,
    [Symbol.dispose]() {
      unlinkSync(path)
    }
  }
}

// ============================================================
// Tests with Disposables
// ============================================================

test('fetches data from API', async () => {
  await using server = createTestServer()
  server.app.get('/data', () => ({ value: 42 }))
  await server.start()

  const response = await fetch(`${server.url}/data`)
  const data = await response.json()

  expect(data.value).toBe(42)
})

test('reads and processes file', () => {
  using file = createTempFile('test content')

  const result = processFile(file.path)

  expect(result).toContain('processed')
})
```

### Test Naming Convention

Use descriptive names that explain behavior:

```typescript
// GOOD - describes behavior
test('returns null when user not found', () => {})
test('throws ValidationError for empty email', () => {})
test('caches response for subsequent calls', () => {})

// BAD - describes implementation
test('calls findById', () => {})
test('checks email length', () => {})
test('uses Map for storage', () => {})
```

---

## Review Mode

When first argument is `review`:

### Process

1. **Find test files** in the specified path
   - Match `*.test.ts`, `*.spec.ts`, `*.test.tsx`, `*.spec.tsx`
2. **Analyze each file** for anti-patterns
3. **Report findings** with specific fix suggestions

### Anti-Patterns to Detect

#### 1. Nested Describe Blocks (>1 level)

```typescript
// FLAG THIS ❌
describe('User', () => {
  describe('when logged in', () => {
    describe('with admin role', () => {  // Too deep!
      test('can delete', () => {})
    })
  })
})

// FIX ✅
test('logged-in admin user can delete', () => {
  const { user } = setupAdminUser()
  // ...
})
```

#### 2. beforeEach with Variable Assignment

```typescript
// FLAG THIS ❌
let user: User
let service: UserService

beforeEach(() => {
  user = createUser()  // Mutable shared state!
  service = new UserService()
})

// FIX ✅
function setup() {
  const user = createUser()
  const service = new UserService()
  return { user, service }
}

test('...', () => {
  const { user, service } = setup()
})
```

#### 3. Missing Resource Cleanup

```typescript
// FLAG THIS ❌
test('starts server', async () => {
  const server = await startServer()
  // server never closed!
  expect(server.isRunning).toBe(true)
})

// FIX ✅
test('starts server', async () => {
  await using server = createTestServer()
  await server.start()
  expect(server.isRunning).toBe(true)
})
```

#### 4. Over-Abstracted Test Helpers

```typescript
// FLAG THIS ❌
const testCRUD = (entity: string) => {
  test(`creates ${entity}`, () => { /* ... */ })
  test(`reads ${entity}`, () => { /* ... */ })
  test(`updates ${entity}`, () => { /* ... */ })
  test(`deletes ${entity}`, () => { /* ... */ })
}

testCRUD('user')
testCRUD('post')

// FIX ✅
// Write explicit tests - duplication is fine
test('creates user', () => {
  const { userService } = setup()
  const user = userService.create({ name: 'Test' })
  expect(user.id).toBeDefined()
})
```

#### 5. Shared Mutable State

```typescript
// FLAG THIS ❌
const testData = { count: 0 }

test('increments count', () => {
  testData.count++
  expect(testData.count).toBe(1)
})

test('uses count', () => {
  expect(testData.count).toBe(0)  // FAILS - state leaked!
})
```

### Review Output Format

```markdown
## Test Review: path/to/tests

### Summary
- Files analyzed: X
- Issues found: Y
- Severity: High/Medium/Low

### Issues

#### 1. Nested describes in `user.test.ts:15-45`
**Severity**: High
**Pattern**: 3 levels of nesting

```typescript
// Current (lines 15-45)
describe('User', () => {
  describe('authentication', () => {
    describe('with valid credentials', () => {
```

**Fix**: Flatten to single level with descriptive test names

```typescript
test('authenticates user with valid credentials', () => {
```

#### 2. beforeEach variable assignment in `api.test.ts:8-12`
**Severity**: High
**Pattern**: Mutable shared state

```typescript
// Current
let client: ApiClient
beforeEach(() => {
  client = new ApiClient()
})
```

**Fix**: Use setup function

```typescript
function setup() {
  return { client: new ApiClient() }
}
```

### Recommendations
1. [List of prioritized fixes]
```

---

## Convert Mode

When first argument is `convert`:

### Process

1. **Read the test file** completely
2. **Parse the structure**:
   - Identify all describe blocks and their nesting
   - Find all beforeEach/afterEach hooks
   - Map variable declarations to their usage
3. **Transform**:
   - Flatten nested describes
   - Convert beforeEach to setup functions
   - Add disposable patterns for resources
4. **Write the converted file** (or show diff)

### Transformation Rules

#### Rule 1: Flatten Describes

```typescript
// Before
describe('Calculator', () => {
  describe('add', () => {
    describe('with positive numbers', () => {
      test('returns sum', () => {})
    })
  })
})

// After
test('Calculator.add returns sum for positive numbers', () => {})
```

#### Rule 2: beforeEach → setup()

```typescript
// Before
describe('UserService', () => {
  let service: UserService
  let mockDb: MockDatabase

  beforeEach(() => {
    mockDb = new MockDatabase()
    service = new UserService(mockDb)
  })

  test('creates user', () => {
    service.create({ name: 'Test' })
    expect(mockDb.users).toHaveLength(1)
  })
})

// After
function setup() {
  const mockDb = new MockDatabase()
  const service = new UserService(mockDb)
  return { service, mockDb }
}

test('UserService creates user', () => {
  const { service, mockDb } = setup()

  service.create({ name: 'Test' })

  expect(mockDb.users).toHaveLength(1)
})
```

#### Rule 3: Add Disposables for Resources

```typescript
// Before
describe('API', () => {
  let server: Server

  beforeAll(async () => {
    server = await startServer()
  })

  afterAll(async () => {
    await server.close()
  })

  test('responds to GET', async () => {
    const res = await fetch(`${server.url}/health`)
    expect(res.ok).toBe(true)
  })
})

// After
function createTestServer() {
  const server = new Server()
  return {
    server,
    get url() { return server.url },
    async start() { await server.listen() },
    async [Symbol.asyncDispose]() { await server.close() }
  }
}

test('API responds to GET /health', async () => {
  await using { url } = createTestServer()

  const res = await fetch(`${url}/health`)

  expect(res.ok).toBe(true)
})
```

---

## When Hooks ARE Appropriate

These patterns are acceptable and should NOT be flagged:

```typescript
// Global mocking (console, timers, etc.)
beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  vi.mocked(console.error).mockClear()
})
afterAll(() => {
  vi.mocked(console.error).mockRestore()
})

// React Testing Library cleanup
afterEach(() => {
  cleanup()
})

// Shared expensive setup (when truly necessary)
let expensiveResource: Resource
beforeAll(async () => {
  expensiveResource = await createExpensiveResource()
})
afterAll(async () => {
  await expensiveResource.dispose()
})
```

---

## Arguments

$ARGUMENTS
