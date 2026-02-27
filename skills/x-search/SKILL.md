---
name: x-search
description: Search X/Twitter for real-time developer discourse, product feedback, community sentiment, and expert opinions. Use when user says "x search", "search x for", "search twitter for", "what are people saying about", or needs recent X discourse for context (library releases, API changes, product launches, industry discussion). Also use when researching a library, framework, API, or product to supplement web search with real-time community signal — e.g. "research Bun", "what do devs think of Hono", "is Turso production-ready".
argument-hint: <query> | profile <user> | thread <id>
---

# X Search

## Priorities

Signal quality > Source attribution > API cost efficiency

## Goal

Surface real-time perspectives, developer discussions, product feedback, and expert opinions from X/Twitter. The value you provide is turning raw social discourse into a sourced, structured briefing — separating signal from noise and attributing every claim to its source with engagement context.

## Platform Constraints

These are hard technical limits that shape your approach:

- **Auth**: Requires `X_BEARER_TOKEN` env var (Basic tier, $200/mo from https://developer.x.com).
- **Time window**: Basic tier covers last 7 days only — you cannot search older tweets, so don't promise historical analysis.
- **Rate limits**: 450 requests per 15-minute window. The CLI adds 350ms delay between calls, but be aware during multi-page research that you're consuming a shared budget.
- **Filtering**: `min_likes`/`min_retweets` search operators are unavailable on Basic tier. The CLI filters post-hoc from `public_metrics` instead — this means you still fetch the full result set even when filtering aggressively.
- **Volume**: Max 100 tweets per request, max 5 pages (500 tweets per search). For most research questions this is sufficient; if not, refine queries rather than paginating blindly.

## CLI Tool

Locate the CLI entry point:

```
Glob(pattern: "**/sdlc/**/utils/x-search/x-search.ts", path: "~/.claude/plugins")
```

Run via Bash tool with the resolved path. The CLI has built-in `--help` for each subcommand. Key subcommands:

- **`search "<query>" [options]`** — Search tweets. Useful options: `--sort` (likes/impressions/retweets/recent), `--since` (1h/3h/12h/1d/7d), `--min-likes N`, `--pages N` (1-5), `--limit N`, `--no-replies`, `--save`. Auto-adds `-is:retweet` unless your query already includes it.
- **`profile <username> [--count N] [--replies]`** — Recent tweets from a user (excludes replies by default).
- **`thread <tweet_id> [--pages N]`** — Full conversation thread from a root tweet.
- **`tweet <tweet_id>`** — Fetch a single tweet with full metadata.
- **`watchlist [add|remove|check]`** — Manage tracked accounts (stored in `data/watchlist.json` alongside CLI).
- **`cache clear`** — Clear cached results (15-minute TTL).

Output defaults to markdown. Use `--json` for raw data, `--save` to write to CWD as `x-research-{slug}-{date}.md`.

## Research Approach

For a quick single search, just run the query and present results. For deeper research questions, use an iterative approach:

**Decompose the question into targeted searches.** Think about what angles will surface useful signal: the core topic, known expert voices (`from:` operator), pain points vs positive sentiment, and linked resources (`has:links`, `url:domain`). Use X search operators to reduce noise — the reference docs below cover the full operator set.

**Iterate based on what you find.** After each search, assess: Is this signal or noise? Are there expert voices worth searching directly? High-engagement threads worth following? Linked resources worth fetching? Adjust your queries based on what the data tells you rather than running a fixed set.

**Follow threads and linked content.** Threads often contain the most substantive takes because they allow nuance. When tweets link to GitHub repos, blog posts, or docs, use `web_fetch` to get the full context — especially for links that multiple tweets reference or that come from high-engagement sources.

**Synthesize by theme, not by query.** Group your findings around what you learned, not how you searched. Each theme should include a brief summary, attributed quotes with engagement metrics (likes, impressions), and links to referenced resources.

## Improving Search Quality

Use your judgment to adapt these strategies:

- **Too much noise?** Exclude replies (`-is:reply`), sort by likes, use more specific keywords.
- **Too few results?** Broaden with `OR` operators, remove restrictive filters, try alternative terminology.
- **Crypto/spam flooding?** Add exclusions like `-$ -airdrop -giveaway -whitelist`.
- **Want substance over hot takes?** Filter for tweets with links (`has:links`) or minimum engagement (`--min-likes`).
- **Want expert perspectives?** Use `from:` for known voices in the space, or sort by engagement to surface authoritative tweets.

Match your search depth to the question. A "what do people think about X?" question might need one or two searches. A "comprehensive landscape of Y" might need five searches across different angles with thread follows and link deep-dives.

## References

For X API endpoint details, search operators, and response structure:

- `Glob(pattern: "**/sdlc/**/skills/x-search/references/x-api.md", path: "~/.claude/plugins")` → Read result

## Arguments

$ARGUMENTS
