---
date: "2026-02-08"
git_commit: feb57b1
branch: main
repository: sdlc-plugin
topic: X/Twitter search skill integration from rohunvora/x-research-skill
tags: [skill, x-search, twitter, api, cli, integration]
status: complete
last_updated: "2026-02-08"
last_updated_by: research
---

# Research Question

How to integrate the [rohunvora/x-research-skill](https://github.com/rohunvora/x-research-skill) repository as a skill called `x-search` in the sdlc-plugin, and what improvements should be made during integration.

## Summary

The external repository is a well-structured X/Twitter research CLI tool (`x-search.ts`) with a SKILL.md prompt, API wrapper, file cache, and formatters. Integration requires adapting its file structure and conventions to match the sdlc-plugin's pure-markdown skill pattern, while the TypeScript CLI and lib files go under a `utils/` directory (following the precedent set by `utils/perplexity-mcp/`). The external repo has several hardcoded paths and conventions specific to the original author's setup that need adaptation.

---

## Detailed Findings

### 1. Source Repository Structure

The external repo at `/tmp/x-research-skill/` contains:

```
x-research-skill/
├── SKILL.md              # Skill prompt (185 lines)
├── x-search.ts           # Bun CLI entry point (400 lines)
├── lib/
│   ├── api.ts            # X API wrapper (321 lines)
│   ├── cache.ts          # File-based 15min TTL cache (110 lines)
│   └── format.ts         # Telegram + markdown formatters (158 lines)
├── data/
│   ├── watchlist.example.json
│   └── cache/.gitkeep
├── references/
│   └── x-api.md          # X API endpoint reference (113 lines)
├── README.md
├── CHANGELOG.md
└── .gitignore
```

**Key components:**

| File | Purpose | Lines |
|------|---------|-------|
| `SKILL.md` | Agentic research prompt with CLI docs, research loop, refinement heuristics | 185 |
| `x-search.ts` | CLI entry: search, thread, profile, tweet, watchlist, cache commands | 400 |
| `lib/api.ts` | X API v2 wrapper: search, thread, profile, getTweet, sort, filter, dedupe | 321 |
| `lib/cache.ts` | MD5-keyed file cache with 15min TTL, prune, clear | 110 |
| `lib/format.ts` | formatTweetTelegram, formatResultsTelegram, formatTweetMarkdown, formatResearchMarkdown, formatProfileTelegram | 158 |
| `references/x-api.md` | Search operators, response structure, rate limits, auth | 113 |

### 2. Existing sdlc-plugin Skill Convention

Skills in this plugin follow a pure-markdown pattern:

```
skills/{skill-name}/
├── SKILL.md              # YAML frontmatter + markdown prompt
└── references/           # Optional supporting markdown
    └── *.md
```

**Frontmatter schema** (from existing skills like `gemini/SKILL.md:1-3`, `codex/SKILL.md:1-3`):

```yaml
---
name: {skill-id}           # kebab-case, required
description: {text}         # trigger description, required
argument-hint: {hint}       # optional, shows usage
model: {haiku|sonnet|opus}  # optional
tools: {tool-list}          # optional
---
```

**Content sections** (consistent pattern across `gemini/SKILL.md`, `codex/SKILL.md`, `test/SKILL.md`):
1. `# {Skill Name}` — title
2. `## Priorities` — ranked values
3. `## Goal` — what the skill does
4. `## Constraints` — rules and boundaries
5. `## {Domain-specific sections}` — workflow, modes, etc.
6. `## References` — Glob patterns pointing to reference files
7. `## Arguments` — `$ARGUMENTS` placeholder

**No TypeScript in skills.** All skills are pure markdown. TypeScript tooling lives under `utils/` at the plugin root (precedent: `utils/perplexity-mcp/` — `sdlc-plugin/.mcp.json:7`).

### 3. Files to Copy and Where They Go

Based on the sdlc-plugin conventions:

| Source file | Destination in sdlc-plugin | Notes |
|-------------|---------------------------|-------|
| `SKILL.md` | `skills/x-search/SKILL.md` | Rewrite to match plugin conventions |
| `references/x-api.md` | `skills/x-search/references/x-api.md` | Copy as-is |
| `x-search.ts` | `utils/x-search/x-search.ts` | TypeScript goes under utils/ |
| `lib/api.ts` | `utils/x-search/lib/api.ts` | Copy, adapt paths |
| `lib/cache.ts` | `utils/x-search/lib/cache.ts` | Copy, adapt paths |
| `lib/format.ts` | `utils/x-search/lib/format.ts` | Copy, adapt paths |
| `data/watchlist.example.json` | `utils/x-search/data/watchlist.example.json` | Copy |
| `data/cache/.gitkeep` | `utils/x-search/data/cache/.gitkeep` | Copy |
| `.gitignore` entries | Append to sdlc-plugin `.gitignore` | `utils/x-search/data/cache/*.json` and `utils/x-search/data/watchlist.json` |

### 4. Hardcoded Paths Requiring Adaptation

The source repo has several hardcoded paths tied to the original author's setup:

| Location | Hardcoded value | Needs change |
|----------|----------------|--------------|
| `SKILL.md:28` | `cd ~/clawd/skills/x-research` | Change to relative path within plugin |
| `SKILL.md:28` | `source ~/.config/env/global.env` | Change to use `$X_BEARER_TOKEN` env var directly |
| `SKILL.md:44` | `~/clawd/drafts/x-research-{slug}-{date}.md` | Change to skill-relative or configurable |
| `SKILL.md:155` | `~/clawd/drafts/x-research-{topic-slug}-{YYYY-MM-DD}.md` | Same |
| `x-search.ts:37` | `join(process.env.HOME!, "clawd", "drafts")` | Change to `data/drafts/` within the utils dir |
| `lib/api.ts:17` | `${process.env.HOME}/.config/env/global.env` | Remove — rely on `$X_BEARER_TOKEN` env var only |
| `lib/cache.ts:11` | `join(import.meta.dir, "..", "data", "cache")` | Works if `x-search.ts` stays alongside `lib/` |

### 5. Authentication Pattern

The source uses two methods to get the X API Bearer Token (`lib/api.ts:11-28`):
1. `process.env.X_BEARER_TOKEN` — standard env var
2. Fallback: reads `~/.config/env/global.env` file — author-specific, fragile

The sdlc-plugin already handles env-based secrets via `.mcp.json` (`sdlc-plugin/.mcp.json:8-10` shows `PERPLEXITY_API_KEY` pattern). The `X_BEARER_TOKEN` should follow the same pattern: env var only, no file fallback.

### 6. CLI Command Structure

The CLI (`x-search.ts`) supports these commands:

| Command | Description | Key options |
|---------|-------------|-------------|
| `search <query>` / `s` | Search recent tweets (7d) | `--sort`, `--since`, `--min-likes`, `--min-impressions`, `--pages`, `--limit`, `--no-replies`, `--save`, `--json`, `--markdown` |
| `thread <tweet_id>` / `t` | Fetch full conversation thread | `--pages` |
| `profile <username>` / `p` | Recent tweets from user | `--count`, `--replies`, `--json` |
| `tweet <tweet_id>` | Fetch single tweet | `--json` |
| `watchlist` / `wl` | Show/manage watchlist | `add`, `remove`, `check` |
| `cache` | Cache management | `clear` |

### 7. X API Details

- **Endpoint:** `GET https://api.x.com/2/tweets/search/recent` (`lib/api.ts:8`)
- **Coverage:** Last 7 days only (Basic tier)
- **Rate limit:** 450 req/15min app-level, 350ms delay between requests (`lib/api.ts:9`)
- **Cost:** ~$0.005/tweet read; Basic tier $200/mo
- **Pagination:** Up to 5 pages, 100 tweets/page
- **Response parsing:** `parseTweets()` normalizes raw API response into `Tweet` interface with metrics, URLs, mentions, hashtags (`lib/api.ts:34-104`)

### 8. Agentic Research Loop (SKILL.md)

The SKILL.md defines a multi-step research workflow:
1. **Decompose** — Turn question into 3-5 targeted queries using X search operators
2. **Search & Extract** — Run queries, assess signal vs noise
3. **Follow Threads** — Deep-dive high-engagement thread starters
4. **Deep-Dive Links** — WebFetch linked GitHub repos, blogs, docs
5. **Synthesize** — Group by theme, include engagement metrics and attribution
6. **Save** — Write results to file

---

## Code References

### External Repository (Source)

| File | Key exports/functions |
|------|----------------------|
| `/tmp/x-research-skill/lib/api.ts:34-54` | `Tweet` interface definition |
| `/tmp/x-research-skill/lib/api.ts:165-207` | `search()` — paginated tweet search |
| `/tmp/x-research-skill/lib/api.ts:212-239` | `thread()` — conversation thread fetch |
| `/tmp/x-research-skill/lib/api.ts:244-268` | `profile()` — user profile + recent tweets |
| `/tmp/x-research-skill/lib/api.ts:273-283` | `getTweet()` — single tweet lookup |
| `/tmp/x-research-skill/lib/api.ts:288-320` | `sortBy()`, `filterEngagement()`, `dedupe()` |
| `/tmp/x-research-skill/lib/cache.ts:33-54` | `get()` — cache lookup with TTL |
| `/tmp/x-research-skill/lib/cache.ts:56-73` | `set()` — cache write |
| `/tmp/x-research-skill/lib/cache.ts:78-109` | `prune()`, `clear()` — cache management |
| `/tmp/x-research-skill/lib/format.ts:26-44` | `formatTweetTelegram()` — single tweet format |
| `/tmp/x-research-skill/lib/format.ts:49-68` | `formatResultsTelegram()` — list format |
| `/tmp/x-research-skill/lib/format.ts:73-85` | `formatTweetMarkdown()` — markdown format |
| `/tmp/x-research-skill/lib/format.ts:90-138` | `formatResearchMarkdown()` — full research doc |
| `/tmp/x-research-skill/x-search.ts:81-177` | `cmdSearch()` — main search command |
| `/tmp/x-research-skill/x-search.ts:245-325` | `cmdWatchlist()` — watchlist management |

### sdlc-plugin (Target)

| File | Relevance |
|------|-----------|
| `skills/gemini/SKILL.md:1-3` | Frontmatter format reference |
| `skills/codex/SKILL.md:1-3` | Frontmatter format reference |
| `skills/test/SKILL.md` | Skill with `argument-hint` field |
| `.mcp.json:7-10` | Env var pattern for API keys |
| `utils/perplexity-mcp/` | Precedent for TypeScript utils in plugin |

---

## Architecture Documentation

### Proposed File Layout

```
sdlc-plugin/
├── skills/
│   └── x-search/
│       ├── SKILL.md                    # Rewritten to match plugin conventions
│       └── references/
│           └── x-api.md                # Copied from source
├── utils/
│   └── x-search/
│       ├── x-search.ts                 # CLI entry (adapted paths)
│       ├── lib/
│       │   ├── api.ts                  # X API wrapper (env-only auth)
│       │   ├── cache.ts               # File cache
│       │   └── format.ts             # Formatters
│       └── data/
│           ├── watchlist.example.json  # Template
│           ├── cache/                  # Auto-managed
│           └── drafts/                 # Save target for --save
```

### Data Flow

```
User invokes /x-search → SKILL.md prompt activates →
Claude reads SKILL.md → uses Bash to run CLI commands →
x-search.ts parses args → calls lib/api.ts →
api.ts hits X API v2 → lib/cache.ts caches results →
lib/format.ts renders output → stdout back to Claude →
Claude synthesizes research briefing
```

---

## Suggested Improvements

The user explicitly requested improvements. These are organized by priority.

### High Priority — Required for Integration

1. **Remove hardcoded `~/clawd/` paths.** The SKILL.md and `x-search.ts:37` reference `~/clawd/skills/x-research` and `~/clawd/drafts/`. Replace with `$CLAUDE_PLUGIN_ROOT`-relative paths or `import.meta.dir`-relative paths so the CLI works from wherever the plugin is installed.

2. **Remove `global.env` file fallback in `lib/api.ts:16-23`.** The sdlc-plugin pattern is env-var-only authentication (see `.mcp.json:8-10`). Reading arbitrary files from the filesystem is fragile and author-specific. Keep only `process.env.X_BEARER_TOKEN`.

3. **Rewrite SKILL.md frontmatter** to match sdlc-plugin convention. Current format uses `name: x-research` and a multi-line `description` with a `Use when:` block. Rename to `name: x-search` and flatten the description.

4. **Add `argument-hint`** to SKILL.md frontmatter. Pattern from `test/SKILL.md` shows `argument-hint: [file] | review [path]`. For x-search: `argument-hint: <query> | profile <user> | thread <id>`.

5. **Add `## Arguments` section with `$ARGUMENTS`** at the bottom of SKILL.md, following the convention from all existing skills.

### Medium Priority — Code Quality

6. **Add error message for missing `X_BEARER_TOKEN` with setup instructions.** Current error in `api.ts:25-27` references `~/.config/env/global.env` which won't exist. Replace with: `"X_BEARER_TOKEN not set. Get a bearer token from https://developer.x.com and export X_BEARER_TOKEN=your-token"`.

7. **Make `--save` path configurable.** Currently hardcoded to `~/clawd/drafts/`. Change to save relative to `data/drafts/` within the utils directory, or accept a `--output` path.

8. **Remove Telegram-specific formatting as default.** The sdlc-plugin is a Claude Code plugin, not a Telegram bot. The default output format should be markdown (suitable for Claude to read). Keep Telegram format as an opt-in `--telegram` flag instead.

9. **Add `## Priorities` section** to SKILL.md. All sdlc-plugin skills have this. Suggested: `Signal quality > Source attribution > API cost efficiency`.

10. **Add `## References` section** with a Glob pattern pointing to `x-api.md`, following the convention from `gemini/SKILL.md:42` and `codex/SKILL.md:39`.

### Low Priority — Nice to Have

11. **Remove Heartbeat Integration section** from SKILL.md (`SKILL.md:166-167`). This is specific to the original author's personal setup (references "Flag to Frank only if..."). Not relevant to the sdlc-plugin.

12. **Remove watchlist `check` integration with heartbeat.** The watchlist feature itself is useful, but the heartbeat language should be removed.

13. **Consider adding the X bearer token to `.mcp.json`** as a documented env var pattern, even though x-search isn't an MCP server. This would centralize the documentation of required API keys.

14. **Add a `--quiet` flag** to suppress stderr stats output. When Claude runs the CLI via Bash, stderr noise (stats, cache status) goes to the user. A quiet mode would keep output clean.

15. **Thread root tweet fetch has a bug** in `lib/api.ts:226-232`. The `parseTweets` call constructs a malformed data array when the API returns a single tweet at top level. The empty code block at line 229 (`// raw is the tweet itself — need to re-fetch with proper structure`) suggests unfinished work.

---

## Related Research

- No existing research documents in `research/` cover X/Twitter integration.
- The `utils/perplexity-mcp/` directory provides the closest architectural precedent for adding a TypeScript-based external service wrapper to this plugin.

---

## Open Questions

1. **X API tier requirement:** Basic tier costs $200/mo. Should the SKILL.md document this cost requirement, or is that assumed?
2. **Cache location:** Should the cache live within `utils/x-search/data/cache/` (portable but grows in plugin dir) or in a temp directory (cleaned on reboot)?
3. **Drafts save location:** Where should `--save` write files? Within the plugin utils dir, or in the user's project working directory?
4. **Watchlist persistence:** The watchlist is per-plugin-installation. Should it be documented as user-managed data that persists across upgrades?
