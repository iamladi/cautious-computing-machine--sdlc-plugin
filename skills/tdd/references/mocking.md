# Mocking Policy: Boundary Only

## Rule

Mock at **system boundaries** only. Never mock your own classes or modules.

## What Is a System Boundary?

Anything outside your package that you don't control:

- **External APIs** (HTTP services, third-party SDKs)
- **Databases** (queries, connections)
- **OS services** (filesystem, network, timers)
- **Randomness and time** (`Date.now()`, `Math.random()`, `crypto`)

**Monorepo clause**: Another team's package is a boundary. Your own modules within the same package are NOT.

## Why Not Mock Internals?

Internal mocks couple tests to implementation. When you refactor (rename a method, extract a class, change data flow), every mock breaks — even if behavior is unchanged. This makes tests an obstacle to improvement rather than a safety net.

## Patterns

### Dependency Injection

Pass dependencies instead of importing them:

```typescript
// WRONG: Hardcoded dependency — must mock module to test
class OrderService {
  async place(order: Order) {
    const payment = await stripe.charges.create(order.total) // Coupled to Stripe
    await db.orders.insert({ ...order, paymentId: payment.id }) // Coupled to DB
  }
}

// RIGHT: Inject boundaries — test with fakes, run with real implementations
class OrderService {
  constructor(
    private payments: PaymentGateway,  // Interface, not Stripe
    private orders: OrderRepository     // Interface, not DB
  ) {}

  async place(order: Order) {
    const payment = await this.payments.charge(order.total)
    await this.orders.save({ ...order, paymentId: payment.id })
  }
}

// Test: inject fakes for boundaries
function setup() {
  const payments: PaymentGateway = { charge: vi.fn().mockResolvedValue({ id: 'pay_1' }) }
  const orders: OrderRepository = { save: vi.fn().mockResolvedValue(undefined) }
  const service = new OrderService(payments, orders)
  return { service, payments, orders }
}
```

> **Framework note**: In React, use Context or props for DI. In Angular, use the DI container. In Go, pass interfaces. The principle is the same: accept dependencies, don't create them.

### SDK-Style Interface

Wrap external SDKs behind your own interface:

```typescript
// Define YOUR interface for what you need
interface EmailSender {
  send(to: string, subject: string, body: string): Promise<void>
}

// Production: real SDK
class SendGridEmailSender implements EmailSender {
  constructor(private client: SendGridClient) {}
  async send(to: string, subject: string, body: string) {
    await this.client.send({ to, subject, html: body })
  }
}

// Test: fake implementation (not a mock of SendGrid internals)
class FakeEmailSender implements EmailSender {
  sent: Array<{ to: string; subject: string; body: string }> = []
  async send(to: string, subject: string, body: string) {
    this.sent.push({ to, subject, body })
  }
}

// Test reads naturally — no mock assertions
test('sends welcome email after signup', async () => {
  const emails = new FakeEmailSender()
  const auth = new AuthService(emails)

  await auth.signup('user@example.com', 'password')

  expect(emails.sent).toEqual([
    { to: 'user@example.com', subject: 'Welcome', body: expect.stringContaining('Welcome') }
  ])
})
```

## Legacy Compatibility

When working in a codebase that already mocks internal modules (e.g., `vi.mock('./utils')`, `jest.mock('../services/foo')`), **follow the repo's existing conventions** unless explicitly asked to refactor the testing approach. The boundary-only policy is a best practice for new code, not a mandate to rewrite existing tests.

## See Also

- `references/interface-design.md` — DI and testability principles
- `references/test-quality.md` — behavioral test criteria
