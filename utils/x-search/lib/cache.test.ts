import { describe, expect, test, beforeEach, mock } from "bun:test";

// ---------------------------------------------------------------------------
// In-memory fs mock
// We redirect all fs operations to a Map<path, string> store so tests never
// touch the real filesystem and run instantly regardless of cwd.
// ---------------------------------------------------------------------------

const store = new Map<string, string>();
const mtimes = new Map<string, number>();
let dirEnsured = false;

mock.module("fs", () => ({
  existsSync: (p: string) => {
    // treat the cache dir as "existing" after ensureDir runs
    if (!p.endsWith(".json")) return dirEnsured;
    return store.has(p);
  },
  mkdirSync: (_p: string, _opts?: unknown) => {
    dirEnsured = true;
  },
  readFileSync: (p: string, _enc: string) => {
    const v = store.get(p);
    if (v === undefined) throw new Error(`ENOENT: ${p}`);
    return v;
  },
  writeFileSync: (p: string, data: string) => {
    store.set(p, data);
    mtimes.set(p, Date.now());
  },
  readdirSync: (_p: string) => {
    return [...store.keys()].map((k) => k.split("/").at(-1) as string);
  },
  statSync: (p: string) => {
    const mt = mtimes.get(p);
    if (mt === undefined) throw new Error(`ENOENT: ${p}`);
    return { mtimeMs: mt };
  },
  unlinkSync: (p: string) => {
    store.delete(p);
    mtimes.delete(p);
  },
}));

// Import AFTER the mock is registered so the module picks up the fake fs.
const { get, set, prune, clear } = await import("./cache");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTweet(id: string) {
  return {
    id,
    text: `tweet ${id}`,
    author_id: "u1",
    username: "testuser",
    name: "Test User",
    created_at: new Date().toISOString(),
    conversation_id: id,
    metrics: { likes: 0, retweets: 0, replies: 0, quotes: 0, impressions: 0, bookmarks: 0 },
    urls: [],
    mentions: [],
    hashtags: [],
    tweet_url: `https://x.com/testuser/status/${id}`,
  };
}

// ---------------------------------------------------------------------------
// Reset store between tests for isolation
// ---------------------------------------------------------------------------

beforeEach(() => {
  store.clear();
  mtimes.clear();
  dirEnsured = false;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("cache", () => {
  describe("get()", () => {
    test("returns null for a missing key", () => {
      const result = get("nonexistent query");
      expect(result).toBeNull();
    });

    test("returns null for a missing key with params", () => {
      const result = get("some query", "lang:en");
      expect(result).toBeNull();
    });
  });

  describe("set() then get() round-trip", () => {
    test("retrieves tweets that were stored", () => {
      const tweets = [makeTweet("1"), makeTweet("2")];
      set("hello world", "", tweets);

      const result = get("hello world");
      expect(result).not.toBeNull();
      expect(result).toHaveLength(2);
      expect(result![0].id).toBe("1");
      expect(result![1].id).toBe("2");
    });

    test("different queries are stored independently", () => {
      const t1 = [makeTweet("a")];
      const t2 = [makeTweet("b"), makeTweet("c")];
      set("query one", "", t1);
      set("query two", "", t2);

      expect(get("query one")).toEqual(t1);
      expect(get("query two")).toEqual(t2);
    });

    test("params distinguish separate cache entries", () => {
      const t1 = [makeTweet("p1")];
      const t2 = [makeTweet("p2")];
      set("bun", "lang:en", t1);
      set("bun", "lang:ja", t2);

      expect(get("bun", "lang:en")).toEqual(t1);
      expect(get("bun", "lang:ja")).toEqual(t2);
    });

    test("stores an empty tweet array", () => {
      set("empty", "", []);
      const result = get("empty");
      expect(result).toEqual([]);
    });
  });

  describe("TTL expiry", () => {
    test("returns tweets within TTL", () => {
      const tweets = [makeTweet("fresh")];
      set("ttl query", "", tweets);
      // 60 second TTL — should still be valid
      const result = get("ttl query", "", 60_000);
      expect(result).toEqual(tweets);
    });

    test("returns null and deletes file when entry is expired", () => {
      const tweets = [makeTweet("stale")];
      set("expired query", "", tweets);

      // Back-date the timestamp inside the stored JSON
      const keys = [...store.keys()];
      for (const k of keys) {
        const entry = JSON.parse(store.get(k)!);
        entry.timestamp = Date.now() - 5_000; // 5 seconds ago
        store.set(k, JSON.stringify(entry));
      }

      // TTL of 1 ms — entry is expired
      const result = get("expired query", "", 1);
      expect(result).toBeNull();

      // File must have been deleted
      expect([...store.keys()].length).toBe(0);
    });

    test("1 ms TTL: immediate expiry", () => {
      set("flash", "", [makeTweet("x")]);

      const keys = [...store.keys()];
      for (const k of keys) {
        const entry = JSON.parse(store.get(k)!);
        entry.timestamp = Date.now() - 100;
        store.set(k, JSON.stringify(entry));
      }

      expect(get("flash", "", 1)).toBeNull();
    });
  });

  describe("prune()", () => {
    test("removes expired entries and returns count", () => {
      // Two stale entries + one fresh
      set("stale1", "", [makeTweet("s1")]);
      set("stale2", "", [makeTweet("s2")]);
      set("fresh", "", [makeTweet("f1")]);

      // Age the first two entries via mtime
      const allKeys = [...store.keys()];
      const staleKeys = allKeys.slice(0, 2);
      for (const k of staleKeys) {
        mtimes.set(k, Date.now() - 10_000); // 10 s old
      }

      const removed = prune(5_000); // TTL = 5 s → two entries expired
      expect(removed).toBe(2);

      // Fresh entry survives
      expect(store.size).toBe(1);
    });

    test("returns 0 when no entries are expired", () => {
      set("a", "", [makeTweet("a")]);
      set("b", "", [makeTweet("b")]);

      const removed = prune(60_000); // generous TTL
      expect(removed).toBe(0);
      expect(store.size).toBe(2);
    });

    test("returns 0 on an empty cache", () => {
      expect(prune()).toBe(0);
    });
  });

  describe("clear()", () => {
    test("removes all entries and returns count", () => {
      set("x", "", [makeTweet("1")]);
      set("y", "", [makeTweet("2")]);
      set("z", "", [makeTweet("3")]);

      const removed = clear();
      expect(removed).toBe(3);
      expect(store.size).toBe(0);
    });

    test("returns 0 when cache is already empty", () => {
      expect(clear()).toBe(0);
    });

    test("get() returns null after clear()", () => {
      const tweets = [makeTweet("gone")];
      set("will be cleared", "", tweets);
      clear();
      expect(get("will be cleared")).toBeNull();
    });
  });
});
