---
name: x-search
description: Search X/Twitter for real-time developer discourse, product feedback, community sentiment, and expert opinions. Use when user says "x search", "search x for", "search twitter for", "what are people saying about", or needs recent X discourse for context (library releases, API changes, product launches, industry discussion).
argument-hint: <query> | profile <user> | thread <id>
---

# X Search

## Priorities

Signal quality > Source attribution > API cost efficiency

## Goal

Search X/Twitter for real-time perspectives, developer discussions, product feedback, and expert opinions. Decompose research questions into targeted searches, iteratively refine, follow threads, deep-dive linked content, and synthesize into a sourced briefing with engagement metrics and attribution.

## Constraints

- Requires `X_BEARER_TOKEN` env var. Get a bearer token from https://developer.x.com (Basic tier, $200/mo).
- X API covers last 7 days only (Basic tier). Cannot search older tweets.
- Rate limit: 450 requests per 15-minute window. CLI adds 350ms delay between calls.
- `min_likes`/`min_retweets` search operators unavailable on Basic tier — filter post-hoc from `public_metrics`.
- Max 100 tweets per API request, max 5 pages (500 tweets per search).
- Default output is markdown. Use `--json` for raw data, `--telegram` for legacy format.
- `--save` writes to current working directory as `x-research-{slug}-{date}.md`.

## CLI Tool

Locate the CLI entry point:

```
Glob(pattern: "**/sdlc/**/utils/x-search/x-search.ts", path: "~/.claude/plugins")
```

Run via Bash tool with the resolved path.

### Search

```bash
bun run <path>/x-search.ts search "<query>" [options]
```

**Options:**
- `--sort likes|impressions|retweets|recent` — sort order (default: likes)
- `--since 1h|3h|12h|1d|7d` — time filter (default: last 7 days). Also accepts minutes (`30m`) or ISO timestamps.
- `--min-likes N` — filter by minimum likes
- `--min-impressions N` — filter by minimum impressions
- `--pages N` — pages to fetch, 1-5 (default: 1, 100 tweets/page)
- `--limit N` — max results to display (default: 15)
- `--no-replies` — exclude replies
- `--include-retweets` — include retweets (excluded by default)
- `--save` — save results to CWD as `x-research-{slug}-{date}.md`
- `--json` — raw JSON output
- `--telegram` — legacy Telegram format

Auto-adds `-is:retweet` unless query already includes it.

**Examples:**
```bash
bun run <path>/x-search.ts search "bun 2.0" --sort likes --limit 10
bun run <path>/x-search.ts search "from:anthropic" --sort recent
bun run <path>/x-search.ts search "(claude OR opus) coding" --pages 2 --save
bun run <path>/x-search.ts search "react server components" --min-likes 5
```

### Profile

```bash
bun run <path>/x-search.ts profile <username> [--count N] [--replies] [--json]
```

Fetches recent tweets from a specific user (excludes replies by default).

### Thread

```bash
bun run <path>/x-search.ts thread <tweet_id> [--pages N]
```

Fetches full conversation thread by root tweet ID.

### Single Tweet

```bash
bun run <path>/x-search.ts tweet <tweet_id> [--json]
```

### Watchlist

```bash
bun run <path>/x-search.ts watchlist                       # Show all
bun run <path>/x-search.ts watchlist add <user> [note]     # Add account
bun run <path>/x-search.ts watchlist remove <user>          # Remove account
bun run <path>/x-search.ts watchlist check                  # Check recent from all
```

Watchlist stored in `data/watchlist.json` alongside the CLI.

### Cache

```bash
bun run <path>/x-search.ts cache clear    # Clear all cached results
```

15-minute TTL. Avoids re-fetching identical queries.

## Research Loop (Agentic)

When doing deep research (not just a quick search), follow this loop:

### 1. Decompose the Question into Queries

Turn the research question into 3-5 keyword queries using X search operators:

- **Core query**: Direct keywords for the topic
- **Expert voices**: `from:` specific known experts
- **Pain points**: Keywords like `(broken OR bug OR issue OR migration)`
- **Positive signal**: Keywords like `(shipped OR love OR fast OR benchmark)`
- **Links**: `url:github.com` or `url:` specific domains
- **Noise reduction**: `-is:retweet` (auto-added), add `-is:reply` if needed
- **Crypto spam**: Add `-airdrop -giveaway -whitelist` if crypto topics flooding

### 2. Search and Extract

Run each query via CLI. After each, assess:
- Signal or noise? Adjust operators.
- Key voices worth searching `from:` specifically?
- Threads worth following via `thread` command?
- Linked resources worth deep-diving with `web_fetch`?

### 3. Follow Threads

When a tweet has high engagement or is a thread starter:
```bash
bun run <path>/x-search.ts thread <tweet_id>
```

### 4. Deep-Dive Linked Content

When tweets link to GitHub repos, blog posts, or docs, fetch with `web_fetch`. Prioritize links that:
- Multiple tweets reference
- Come from high-engagement tweets
- Point to technical resources directly relevant to the question

### 5. Synthesize

Group findings by theme, not by query:

```
### [Theme/Finding Title]

[1-2 sentence summary]

- @username: "[key quote]" (NL, NI) [Tweet](url)
- @username2: "[another perspective]" (NL, NI) [Tweet](url)

Resources shared:
- [Resource title](url) — [what it is]
```

### 6. Save

Use `--save` flag to save results to the current working directory.

## Refinement Heuristics

- **Too much noise?** Add `-is:reply`, use `--sort likes`, narrow keywords
- **Too few results?** Broaden with `OR`, remove restrictive operators
- **Crypto spam?** Add `-$ -airdrop -giveaway -whitelist`
- **Expert takes only?** Use `from:` or `--min-likes 50`
- **Substance over hot takes?** Search with `has:links`

## References

Load X API reference for endpoint details, search operators, and response structure:

- `Glob(pattern: "**/sdlc/**/skills/x-search/references/x-api.md", path: "~/.claude/plugins")` → Read result

## Arguments

$ARGUMENTS
