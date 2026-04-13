import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import type { Tweet, TwitterUser } from "./api";
import {
  formatTweetTelegram,
  formatResultsTelegram,
  formatTweetMarkdown,
  formatResearchMarkdown,
  formatProfileTelegram,
} from "./format";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeTweet(overrides: Partial<Tweet> = {}): Tweet {
  return {
    id: "123",
    text: "Hello world",
    author_id: "u1",
    username: "testuser",
    name: "Test User",
    created_at: new Date(Date.now() - 30 * 60_000).toISOString(), // 30m ago
    conversation_id: "123",
    metrics: {
      likes: 42,
      retweets: 5,
      replies: 2,
      quotes: 1,
      impressions: 1200,
      bookmarks: 3,
    },
    urls: [],
    mentions: [],
    hashtags: [],
    tweet_url: "https://x.com/testuser/status/123",
    ...overrides,
  };
}

function makeUser(overrides: Partial<TwitterUser> = {}): TwitterUser {
  return {
    id: "u1",
    username: "testuser",
    name: "Test User",
    description: "Engineer building things",
    public_metrics: {
      followers_count: 5400,
      following_count: 300,
      tweet_count: 1200,
    },
    ...overrides,
  };
}

// ── compactNumber (tested indirectly via formatTweetTelegram) ──────────────

describe("compactNumber formatting (via formatTweetTelegram)", () => {
  test("plain number stays as-is", () => {
    const t = makeTweet({ metrics: { ...makeTweet().metrics, likes: 42, impressions: 999 } });
    const out = formatTweetTelegram(t);
    expect(out).toContain("42L");
    expect(out).toContain("999I");
  });

  test("thousands are formatted with K", () => {
    const t = makeTweet({ metrics: { ...makeTweet().metrics, likes: 1500, impressions: 10000 } });
    const out = formatTweetTelegram(t);
    expect(out).toContain("1.5K");
    expect(out).toContain("10.0K");
  });

  test("millions are formatted with M", () => {
    const t = makeTweet({ metrics: { ...makeTweet().metrics, likes: 2_500_000, impressions: 1_000_000 } });
    const out = formatTweetTelegram(t);
    expect(out).toContain("2.5M");
    expect(out).toContain("1.0M");
  });

  test("zero remains as 0", () => {
    const t = makeTweet({ metrics: { ...makeTweet().metrics, likes: 0, impressions: 0 } });
    const out = formatTweetTelegram(t);
    expect(out).toContain("0L");
    expect(out).toContain("0I");
  });
});

// ── formatTweetTelegram ────────────────────────────────────────────────────

describe("formatTweetTelegram", () => {
  test("includes username, engagement, and tweet URL", () => {
    const t = makeTweet();
    const out = formatTweetTelegram(t);
    expect(out).toContain("@testuser");
    expect(out).toContain("42L");
    expect(out).toContain("1.2K");
    expect(out).toContain("https://x.com/testuser/status/123");
  });

  test("prepends index when provided", () => {
    const out0 = formatTweetTelegram(makeTweet(), 0);
    const out2 = formatTweetTelegram(makeTweet(), 2);
    expect(out0).toMatch(/^1\. /);
    expect(out2).toMatch(/^3\. /);
  });

  test("no index prefix when index is omitted", () => {
    const out = formatTweetTelegram(makeTweet());
    expect(out).not.toMatch(/^\d+\. /);
  });

  test("strips t.co short links from text", () => {
    const t = makeTweet({ text: "Check this out https://t.co/abcXYZ cool" });
    const out = formatTweetTelegram(t);
    expect(out).not.toContain("https://t.co/");
    expect(out).toContain("Check this out");
    expect(out).toContain("cool");
  });

  test("appends first url when urls present", () => {
    const t = makeTweet({ urls: ["https://example.com/article", "https://other.com"] });
    const out = formatTweetTelegram(t);
    expect(out).toContain("https://example.com/article");
    expect(out).not.toContain("https://other.com");
  });

  test("no extra url line when urls is empty", () => {
    const t = makeTweet({ urls: [] });
    const out = formatTweetTelegram(t);
    // Only tweet_url should appear, not a separate url line
    const lines = out.split("\n");
    // tweet_url is the last line
    expect(lines[lines.length - 1]).toBe("https://x.com/testuser/status/123");
    expect(lines.length).toBe(3); // "prefix@user (eng · time)", text, tweet_url
  });

  test("truncates text longer than 200 chars", () => {
    const longText = "a".repeat(210);
    const t = makeTweet({ text: longText });
    const out = formatTweetTelegram(t);
    expect(out).toContain("...");
    // The displayed text line should be 200 chars (197 + "...")
    const textLine = out.split("\n")[1];
    expect(textLine.length).toBeLessThanOrEqual(200);
  });

  test("text at exactly 200 chars is not truncated", () => {
    const text = "b".repeat(200);
    const t = makeTweet({ text });
    const out = formatTweetTelegram(t);
    expect(out).not.toContain("...");
  });

  test("includes time ago in output", () => {
    // tweet is 30m ago → should show "30m"
    const out = formatTweetTelegram(makeTweet());
    expect(out).toMatch(/\d+m/);
  });
});

// ── formatResultsTelegram ──────────────────────────────────────────────────

describe("formatResultsTelegram", () => {
  test("formats multiple tweets separated by double newlines", () => {
    const tweets = [makeTweet({ id: "1" }), makeTweet({ id: "2" })];
    const out = formatResultsTelegram(tweets);
    expect(out).toContain("\n\n");
  });

  test("includes query header when query provided", () => {
    const out = formatResultsTelegram([makeTweet()], { query: "typescript" });
    expect(out).toContain('"typescript"');
    expect(out).toContain("1 results");
  });

  test("no query header when query omitted", () => {
    const out = formatResultsTelegram([makeTweet()]);
    expect(out).not.toMatch(/^"/);
  });

  test("respects limit option", () => {
    const tweets = Array.from({ length: 20 }, (_, i) => makeTweet({ id: String(i) }));
    const out = formatResultsTelegram(tweets, { limit: 3 });
    expect(out).toContain("+17 more");
  });

  test("default limit is 15", () => {
    const tweets = Array.from({ length: 20 }, (_, i) => makeTweet({ id: String(i) }));
    const out = formatResultsTelegram(tweets);
    expect(out).toContain("+5 more");
  });

  test("no 'more' line when count is within limit", () => {
    const tweets = [makeTweet()];
    const out = formatResultsTelegram(tweets);
    expect(out).not.toContain("more");
  });

  test("empty tweet array returns empty string (no query)", () => {
    const out = formatResultsTelegram([]);
    expect(out).toBe("");
  });
});

// ── formatTweetMarkdown ────────────────────────────────────────────────────

describe("formatTweetMarkdown", () => {
  test("formats username in bold with tweet link", () => {
    const out = formatTweetMarkdown(makeTweet());
    expect(out).toContain("**@testuser**");
    expect(out).toContain("[Tweet](https://x.com/testuser/status/123)");
  });

  test("includes raw like and impression counts", () => {
    const out = formatTweetMarkdown(makeTweet());
    expect(out).toContain("42L");
    expect(out).toContain("1200I");
  });

  test("strips t.co links from text", () => {
    const t = makeTweet({ text: "See https://t.co/abcXYZ here" });
    const out = formatTweetMarkdown(t);
    expect(out).not.toContain("https://t.co/");
    expect(out).toContain("See");
    expect(out).toContain("here");
  });

  test("includes links section with hostnames when urls present", () => {
    const t = makeTweet({ urls: ["https://github.com/user/repo"] });
    const out = formatTweetMarkdown(t);
    expect(out).toContain("Links:");
    expect(out).toContain("[github.com](https://github.com/user/repo)");
  });

  test("no links section when urls empty", () => {
    const out = formatTweetMarkdown(makeTweet({ urls: [] }));
    expect(out).not.toContain("Links:");
  });

  test("multiline text is blockquoted with continuation markers", () => {
    const t = makeTweet({ text: "line one\nline two" });
    const out = formatTweetMarkdown(t);
    expect(out).toContain("line one\n  > line two");
  });
});

// ── formatResearchMarkdown ─────────────────────────────────────────────────

describe("formatResearchMarkdown", () => {
  const today = new Date().toISOString().split("T")[0];

  test("includes query and date in header", () => {
    const out = formatResearchMarkdown("test query", []);
    expect(out).toContain("# X Research: test query");
    expect(out).toContain(`**Date:** ${today}`);
  });

  test("lists tweet count", () => {
    const out = formatResearchMarkdown("q", [makeTweet(), makeTweet({ id: "2" })]);
    expect(out).toContain("**Tweets found:** 2");
  });

  test("renders Top Results section when no themes given", () => {
    const out = formatResearchMarkdown("q", [makeTweet()]);
    expect(out).toContain("## Top Results (by engagement)");
  });

  test("renders themed sections when themes provided", () => {
    const tweet = makeTweet({ id: "abc" });
    const out = formatResearchMarkdown("q", [tweet], {
      themes: [{ title: "Performance", tweetIds: ["abc"] }],
    });
    expect(out).toContain("## Performance");
    expect(out).toContain("@testuser");
    expect(out).not.toContain("## Top Results");
  });

  test("includes api call count when provided", () => {
    const out = formatResearchMarkdown("q", [], { apiCalls: 7 });
    expect(out).toContain("**API calls:** 7");
  });

  test("omits api calls line when not provided", () => {
    const out = formatResearchMarkdown("q", []);
    expect(out).not.toContain("API calls");
  });

  test("includes search queries when provided", () => {
    const out = formatResearchMarkdown("q", [], { queries: ["alpha", "beta"] });
    expect(out).toContain("`alpha`");
    expect(out).toContain("`beta`");
  });

  test("includes estimated cost", () => {
    const tweets = Array.from({ length: 10 }, (_, i) => makeTweet({ id: String(i) }));
    const out = formatResearchMarkdown("q", tweets);
    expect(out).toContain("Est. cost:");
    expect(out).toContain("$0.05");
  });
});

// ── formatProfileTelegram ──────────────────────────────────────────────────

describe("formatProfileTelegram", () => {
  test("includes username, name, follower and tweet counts", () => {
    const out = formatProfileTelegram(makeUser(), []);
    expect(out).toContain("@testuser — Test User");
    expect(out).toContain("5.4K followers");
    expect(out).toContain("1.2K tweets");
  });

  test("includes description when present", () => {
    const out = formatProfileTelegram(makeUser(), []);
    expect(out).toContain("Engineer building things");
  });

  test("description is omitted when not set", () => {
    const user = makeUser({ description: undefined });
    const out = formatProfileTelegram(user, []);
    expect(out).not.toContain("Engineer");
  });

  test("truncates description longer than 150 chars", () => {
    const longDesc = "x".repeat(200);
    const user = makeUser({ description: longDesc });
    const out = formatProfileTelegram(user, []);
    expect(out).toContain("x".repeat(150));
    expect(out).not.toContain("x".repeat(151));
  });

  test("handles missing public_metrics gracefully", () => {
    const user = makeUser({ public_metrics: undefined });
    const out = formatProfileTelegram(user, []);
    expect(out).toContain("0 followers");
    expect(out).toContain("0 tweets");
  });

  test("includes recent tweets in output", () => {
    const tweets = [
      makeTweet({ id: "1", text: "First tweet" }),
      makeTweet({ id: "2", text: "Second tweet" }),
    ];
    const out = formatProfileTelegram(makeUser(), tweets);
    expect(out).toContain("Recent:");
    expect(out).toContain("First tweet");
    expect(out).toContain("Second tweet");
  });

  test("shows at most 10 tweets", () => {
    const tweets = Array.from({ length: 15 }, (_, i) =>
      makeTweet({ id: String(i), text: `Tweet ${i}` })
    );
    const out = formatProfileTelegram(makeUser(), tweets);
    // Tweet 10 (index 10, "Tweet 10") should NOT appear
    expect(out).not.toContain("Tweet 10");
    // Tweet 9 (index 9, "Tweet 9") should appear
    expect(out).toContain("Tweet 9");
  });

  test("works with empty tweet list", () => {
    const out = formatProfileTelegram(makeUser(), []);
    expect(out).toContain("Recent:");
  });
});
