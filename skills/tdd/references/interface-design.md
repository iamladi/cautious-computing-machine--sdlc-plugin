# Interface Design for Testability

## Three Principles

### 1. Accept Dependencies, Don't Create Them

Functions and classes should receive what they need, not reach out for it.

```typescript
// HARD TO TEST: creates its own dependencies
async function processOrder(orderId: string) {
  const db = new Database(process.env.DATABASE_URL)  // Hidden dependency
  const order = await db.orders.findById(orderId)
  const result = await fetch('https://api.payment.com/charge', { ... })  // Hidden dependency
  return result
}

// TESTABLE: accepts what it needs
async function processOrder(
  orderId: string,
  orders: OrderRepository,
  payments: PaymentGateway
) {
  const order = await orders.findById(orderId)
  const result = await payments.charge(order.total)
  return result
}
```

> **Framework note**: React components accept dependencies via props and Context. Server frameworks use constructor injection (NestJS, Angular) or middleware patterns (Hono, Express). The principle is universal.

### 2. Return Results, Don't Produce Side Effects

Prefer returning values over mutating state or triggering side effects.

```typescript
// SIDE EFFECTS: hard to verify, order-dependent
function validateUser(user: User) {
  if (!user.email) {
    logger.error('Missing email')       // Side effect
    metrics.increment('validation.fail') // Side effect
    throw new ValidationError('Email required')
  }
  user.validated = true  // Mutation
}

// PURE RETURN: easy to test, composable
function validateUser(user: User): ValidationResult {
  if (!user.email) {
    return { valid: false, errors: ['Email required'] }
  }
  return { valid: true, data: { ...user, validated: true } }
}

// Caller handles side effects at the boundary
const result = validateUser(input)
if (!result.valid) {
  logger.error('Validation failed', result.errors)
  metrics.increment('validation.fail')
}
```

### 3. Small Surface Area

Expose the minimum interface needed. Hide implementation details.

```typescript
// TOO MUCH SURFACE: tests couple to internal structure
class UserCache {
  public cache: Map<string, User> = new Map()  // Exposed internal
  public ttl: number = 300                       // Exposed config
  public lastCleanup: Date = new Date()          // Exposed state

  get(id: string): User | undefined { ... }
  set(id: string, user: User): void { ... }
  cleanup(): void { ... }                        // Exposed internal operation
}

// MINIMAL SURFACE: tests use the same interface as production code
class UserCache {
  constructor(private options: { ttlSeconds: number }) {}

  get(id: string): User | undefined { ... }
  set(id: string, user: User): void { ... }
  // cleanup is internal — triggered automatically, not part of the API
}
```

## Deep Modules

A deep module has a **simple interface** that hides **complex implementation**. This is the key to both good design and testability.

```
┌─────────────────────────────────────────┐
│         Shallow Module (avoid)          │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │     Large, complex interface      │  │
│  │  get() set() delete() cleanup()   │  │
│  │  configure() validate() reset()   │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │   Thin implementation             │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          Deep Module (prefer)           │
│                                         │
│       ┌───────────────────┐             │
│       │  Small interface  │             │
│       │   get()  set()    │             │
│       └───────────────────┘             │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │   Rich implementation handles     │  │
│  │   caching, validation, cleanup,   │  │
│  │   concurrency, error recovery     │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

Deep modules are testable because:
- **Small interface** = few test scenarios to cover
- **Hidden complexity** = implementation can change without breaking tests
- **Clear contract** = tests verify WHAT, not HOW

> Concept from "A Philosophy of Software Design" by John Ousterhout.

## See Also

- `references/mocking.md` — boundary-only mocking patterns using DI
- `references/test-quality.md` — behavioral test criteria
