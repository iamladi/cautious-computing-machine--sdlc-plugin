<!-- Production Failure Pattern Library -->
<!-- Used by: commands/review.md -->
<!-- Source: "The Bug That Shipped" research (3,700+ trials, 5 frontier models, March 2026) -->

## Production Failure Pattern Library

Models catch code-level bugs reliably but miss production-level failures 87-100% of the time in undirected review. This library provides targeted probe questions that achieve near-100% catch rates when asked directly.

### How to Use

1. Scan the diff for **trigger patterns** (column 3)
2. For each match, include the **probe question** (column 2) in the reviewer prompt
3. The reviewer must answer the probe with specific code citations or explicitly state the code doesn't handle it

### Patterns

#### Tier 1: Infrastructure Bugs (0-8% undirected catch rate)

These require changes OUTSIDE the code (distributed locks, external schedulers, infrastructure). Models almost never volunteer these.

| Pattern | Probe Question | Triggers In Diff |
|---------|---------------|-----------------|
| **Cron double-execution** | "If two instances of this service run behind a load balancer, what happens when this job fires? Is there a distributed lock or leader election?" | cron, schedule, setInterval, @Cron, @Scheduled, periodic, recurring, job, worker |
| **Rolling deploy incompatibility** | "During a rolling deploy, old and new code run simultaneously. Can both versions handle the same data/schema/API without corruption?" | migration, schema change, ALTER TABLE, column rename, API version, breaking change, feature flag |
| **Split-brain / partition** | "If network partitions this service from its database or cache, what happens to in-flight requests? Is there a fallback or does it fail open/closed?" | distributed, replica, cluster, failover, primary, secondary |

#### Tier 2: One-Line-Fix Bugs (4-63% undirected catch rate)

Fixable in the code itself, usually 1-5 lines, but models miss them because the fix requires production-scale thinking.

| Pattern | Probe Question | Triggers In Diff |
|---------|---------------|-----------------|
| **Thundering herd** | "If 1,000 clients all fail and retry simultaneously after an upstream outage, do they converge into synchronized waves? Is there jitter in the backoff?" | retry, backoff, reconnect, sleep, setTimeout, delay, exponential |
| **OOM / unbounded growth** | "What bounds the size of this collection, buffer, or result set? What happens when the input is 100x larger than expected?" | fetchAll, toArray, readFile, collect, findMany, getAll, SELECT *, readFileSync, Buffer.concat |
| **N+1 queries** | "Is there a database query inside a loop? For N items, how many queries execute?" | forEach + query, map + await, for...of + db, loop + fetch, Promise.all + query |
| **Connection pool exhaustion** | "What happens when all connections in the pool are in use? Is there a checkout timeout? Are connections always returned (even on error paths)?" | pool, createConnection, getConnection, db.query, knex, prisma, pg.Pool, createPool |
| **Cache stampede** | "If the cache is cold and 1,000 requests arrive simultaneously for the same key, how many hit the backend? Is there a lock or single-flight mechanism?" | cache.get, getOrSet, cache.fetch, lazy load, memoize, invalidate |
| **Thread/async safety** | "Can two concurrent requests/threads modify this shared state simultaneously? Does the lock cover the full critical section including async operations?" | lock, mutex, synchronized, shared state, global variable, singleton, static mutable |

#### Tier 3: Error Handling & State Bugs (varies widely)

| Pattern | Probe Question | Triggers In Diff |
|---------|---------------|-----------------|
| **Partial write corruption** | "If this process crashes between step 2 and step 3, what state is left? Is it recoverable? Are these writes in a transaction?" | multi-step write, sequential updates, no transaction, writeFile + rename, two API calls |
| **Silent error swallowing** | "Does this catch block hide the failure from the caller and monitoring? What happens to the operation that failed?" | catch {}, catch(e) { log }, catch without rethrow, .catch(() => {}), on('error') |
| **Token/session expiry mid-request** | "What happens if the auth token or session expires between the authorization check and the actual operation?" | token, session, middleware, auth check, Bearer, jwt.verify, isAuthenticated |
| **DNS/timeout cascade** | "If the upstream service is slow (not down), does this service back up? Is there a timeout? Does it shed load or block all workers?" | http client, fetch, axios, request, got, timeout not set, no AbortController |
| **Log-and-throw antipattern** | "Is the same error logged at multiple levels as it propagates up the call stack?" | logger.error + throw, console.error + throw, log then rethrow |
| **Resource leak on error path** | "If an error occurs after acquiring this resource (file handle, connection, stream), is it still released?" | open + close, acquire + release, createReadStream, try without finally |

### Probe Generation Rules

When scanning a diff, apply these rules:

1. **Match triggers loosely** — a diff touching `setTimeout(fn, delay * 2)` should trigger the thundering herd probe even if "retry" isn't mentioned
2. **Always include Tier 1 probes** for any service-level code (not scripts/CLIs) — infrastructure bugs are the most missed and most damaging
3. **Combine probes when patterns overlap** — a retry function touching a database connection should get both thundering herd AND connection pool probes
4. **If no triggers match**, still probe for: silent error swallowing, partial write corruption, and resource leaks — these are universal
