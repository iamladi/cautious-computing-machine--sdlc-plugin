# X API Reference

## Authentication

Bearer token from env var `X_BEARER_TOKEN`.

```
-H "Authorization: Bearer $X_BEARER_TOKEN"
```

## Search Endpoint

```
GET https://api.x.com/2/tweets/search/recent
```

Covers last 7 days. Max 100 results per request.

### Standard Query Params

```
tweet.fields=created_at,public_metrics,author_id,conversation_id,entities
expansions=author_id
user.fields=username,name,public_metrics
max_results=100
```

Add `sort_order=relevancy` for relevance ranking (default is recency).

Paginate with `next_token` from response `meta.next_token`.

### Search Operators

| Operator | Example | Notes |
|----------|---------|-------|
| keyword | `bun 2.0` | Implicit AND |
| `OR` | `bun OR deno` | Must be uppercase |
| `-` | `-is:retweet` | Negation |
| `()` | `(fast OR perf)` | Grouping |
| `from:` | `from:elonmusk` | Posts by user |
| `to:` | `to:elonmusk` | Replies to user |
| `#` | `#buildinpublic` | Hashtag |
| `$` | `$AAPL` | Cashtag |
| `lang:` | `lang:en` | BCP-47 language code |
| `is:retweet` | `-is:retweet` | Filter retweets |
| `is:reply` | `-is:reply` | Filter replies |
| `is:quote` | `is:quote` | Quote tweets |
| `has:media` | `has:media` | Contains media |
| `has:links` | `has:links` | Contains links |
| `url:` | `url:github.com` | Links to domain |
| `conversation_id:` | `conversation_id:123` | Thread by root tweet ID |
| `place_country:` | `place_country:US` | Country filter |

**Unavailable on current tier:** `min_likes`, `min_retweets`, `min_replies`. Filter engagement post-hoc from `public_metrics`.

**Limits:** Max query length 512 chars. Max ~10 operators per query.

### Response Structure

```json
{
  "data": [{
    "id": "tweet_id",
    "text": "...",
    "author_id": "user_id",
    "created_at": "2026-...",
    "conversation_id": "root_tweet_id",
    "public_metrics": {
      "retweet_count": 0,
      "reply_count": 0,
      "like_count": 0,
      "quote_count": 0,
      "bookmark_count": 0,
      "impression_count": 0
    },
    "entities": {
      "urls": [{"expanded_url": "https://..."}],
      "mentions": [{"username": "..."}],
      "hashtags": [{"tag": "..."}]
    }
  }],
  "includes": {
    "users": [{"id": "user_id", "username": "handle", "name": "Display Name", "public_metrics": {...}}]
  },
  "meta": {"next_token": "...", "result_count": 100}
}
```

### Constructing Tweet URLs

```
https://x.com/{username}/status/{tweet_id}
```

Both values available from response data + user expansions.

### Linked Content

External URLs from tweets are in `entities.urls[].expanded_url`. Use WebFetch to deep-dive into linked pages (GitHub READMEs, blog posts, docs, etc.).

### Rate Limits

- 450 requests per 15-minute window (app-level)
- 300 requests per 15-minute window (user-level)

## Single Tweet Lookup

```
GET https://api.x.com/2/tweets/{id}
```

Same fields/expansions params. Returns `data` as a single object (not array). Use for fetching specific tweets by ID.
