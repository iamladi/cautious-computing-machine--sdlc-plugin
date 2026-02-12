# Behavioral Test Quality

## Core Principle

A good test describes **what the system does**, not **how it does it**. Tests are specifications — they should read like a behavior contract.

## Good Tests

### Verify Behavior Through Public Interfaces

```typescript
// GOOD: Tests observable behavior through the public API
test('registered user can log in with correct password', async () => {
  const { auth } = setup()

  await auth.register('user@test.com', 'secret123')
  const session = await auth.login('user@test.com', 'secret123')

  expect(session.userId).toBeDefined()
  expect(session.expiresAt).toBeInstanceOf(Date)
})
```

### Read Like a Specification

```typescript
// GOOD: Test name + body tells you the business rule
test('order total includes tax for taxable items', () => {
  const { cart } = setup()

  cart.add({ name: 'Book', price: 20, taxable: true })
  cart.add({ name: 'Gift Card', price: 50, taxable: false })

  expect(cart.total()).toBe(71.60) // 20 * 1.08 + 50
})
```

### Survive Refactors

```typescript
// GOOD: This test passes whether you use a Map, object, array,
// Redis, or SQLite internally — it only cares about behavior
test('cached value is returned on second call', async () => {
  const { cache, fetchCount } = setup()

  await cache.get('key')
  await cache.get('key')

  expect(fetchCount()).toBe(1) // Fetched once, cached second time
})
```

## Bad Tests (Before/After)

### Coupled to Implementation

```typescript
// BAD: Tests HOW, not WHAT — breaks if you rename the method or change data flow
test('calls userRepository.findByEmail', async () => {
  const repo = { findByEmail: vi.fn().mockResolvedValue(mockUser) }
  const service = new AuthService(repo)

  await service.login('user@test.com', 'pass')

  expect(repo.findByEmail).toHaveBeenCalledWith('user@test.com') // Implementation detail
})

// BETTER: Tests the outcome
test('returns user session for valid credentials', async () => {
  const { auth } = setupWithUser('user@test.com', 'pass')

  const session = await auth.login('user@test.com', 'pass')

  expect(session.userId).toBeDefined()
})
```

### Mock Internal Collaborators

```typescript
// BAD: Mocking your own module — test breaks when you refactor internals
vi.mock('./utils/hash', () => ({ hashPassword: vi.fn(() => 'hashed') }))
vi.mock('./services/email', () => ({ sendWelcome: vi.fn() }))

test('registers user', async () => {
  await register('user@test.com', 'pass')
  expect(hashPassword).toHaveBeenCalledWith('pass')  // Internal detail
  expect(sendWelcome).toHaveBeenCalledWith('user@test.com')  // Internal detail
})

// BETTER: Test through the public interface, mock only boundaries
test('registered user receives welcome email', async () => {
  const { auth, emails } = setup()  // emails is a boundary fake

  await auth.register('user@test.com', 'pass')

  expect(emails.sent).toContainEqual(
    expect.objectContaining({ to: 'user@test.com', subject: 'Welcome' })
  )
})
```

### Test Private Methods

```typescript
// BAD: Accessing internals to test them directly
test('_normalizeEmail lowercases and trims', () => {
  const service = new AuthService()
  // @ts-expect-error accessing private method
  expect(service._normalizeEmail(' User@Test.COM ')).toBe('user@test.com')
})

// BETTER: Test the behavior that USES normalization
test('login works regardless of email casing', async () => {
  const { auth } = setupWithUser('user@test.com', 'pass')

  const session = await auth.login(' User@TEST.com ', 'pass')

  expect(session.userId).toBeDefined()
})
```

> **Framework note**: In React, test component behavior (render output, user interactions, callbacks) not internal state. In API handlers, test request/response, not middleware internals.

## Test Naming

Name tests after WHAT happens, not HOW:

```typescript
// GOOD — describes behavior
test('returns null when user not found', () => {})
test('throws ValidationError for empty email', () => {})
test('expires session after 30 minutes of inactivity', () => {})

// BAD — describes implementation
test('calls findById with the user ID', () => {})
test('checks email length > 0', () => {})
test('uses setTimeout for session timeout', () => {})
```

## See Also

- `references/mocking.md` — when and how to mock
- `references/interface-design.md` — designing for testability
