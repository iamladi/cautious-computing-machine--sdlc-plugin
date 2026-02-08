/**
 * Fixture-based unit tests for parseTweets and thread root tweet handling.
 * Adapted from rohunvora/x-research-skill (public repo, no explicit license).
 */

import { describe, expect, test } from "bun:test";
import searchFixture from "./fixtures/search-response.json";
import singleTweetFixture from "./fixtures/single-tweet-response.json";
import threadFixture from "./fixtures/thread-response.json";

// parseTweets is not exported directly — import the module to access it.
// We test via the exported functions that use parseTweets internally.
// For direct testing, we re-export parseTweets in api.ts.
import { parseTweets, dedupe, sortBy, filterEngagement, type Tweet } from "../lib/api";

describe("parseTweets", () => {
  test("extracts tweets from search response with correct fields", () => {
    const tweets = parseTweets(searchFixture);

    expect(tweets.length).toBe(3);

    const first = tweets[0];
    expect(first.id).toBe("1234567890");
    expect(first.username).toBe("devexpert");
    expect(first.name).toBe("Dev Expert");
    expect(first.author_id).toBe("111");
    expect(first.metrics.likes).toBe(120);
    expect(first.metrics.impressions).toBe(5000);
    expect(first.metrics.retweets).toBe(15);
    expect(first.urls).toEqual(["https://github.com/oven-sh/bun/releases"]);
    expect(first.hashtags).toEqual(["bun"]);
    expect(first.tweet_url).toBe("https://x.com/devexpert/status/1234567890");
  });

  test("handles missing entities gracefully", () => {
    const tweets = parseTweets(searchFixture);
    const second = tweets[1];

    // No urls in entities
    expect(second.urls).toEqual([]);
    expect(second.mentions).toEqual(["bunaborash"]);
    expect(second.hashtags).toEqual([]);
  });

  test("handles unknown author gracefully", () => {
    const response = {
      data: [{
        id: "999",
        text: "orphan tweet",
        author_id: "unknown_author",
        created_at: "2026-01-01T00:00:00Z",
        conversation_id: "999",
        public_metrics: {},
      }],
      includes: { users: [] },
    };

    const tweets = parseTweets(response);
    expect(tweets.length).toBe(1);
    expect(tweets[0].username).toBe("?");
    expect(tweets[0].name).toBe("?");
  });

  test("returns empty array when no data", () => {
    expect(parseTweets({})).toEqual([]);
    expect(parseTweets({ data: undefined })).toEqual([]);
  });

  test("handles single tweet response (root tweet for thread)", () => {
    // Single tweet lookup returns { data: {...} } not { data: [...] }
    // parseTweets expects data to be an array, so callers must wrap it
    const wrapped = {
      ...singleTweetFixture,
      data: [singleTweetFixture.data],
    };
    const tweets = parseTweets(wrapped);

    expect(tweets.length).toBe(1);
    expect(tweets[0].id).toBe("9999999999");
    expect(tweets[0].username).toBe("thread_author");
    expect(tweets[0].metrics.likes).toBe(300);
    expect(tweets[0].hashtags).toEqual(["bun", "webdev"]);
  });

  test("parses thread response with multiple tweets", () => {
    const tweets = parseTweets(threadFixture);

    expect(tweets.length).toBe(3);
    expect(tweets[0].id).toBe("9999999999");
    expect(tweets[1].id).toBe("9999999998");
    expect(tweets[2].id).toBe("9999999997");

    // All tweets from same author
    for (const t of tweets) {
      expect(t.username).toBe("thread_author");
    }
  });
});

describe("dedupe", () => {
  test("removes duplicate tweets by ID", () => {
    const tweets = parseTweets(searchFixture);
    // Fixture has intentional duplicate (id: 1234567890 appears twice)
    expect(tweets.length).toBe(3);

    const unique = dedupe(tweets);
    expect(unique.length).toBe(2);
    expect(unique[0].id).toBe("1234567890");
    expect(unique[1].id).toBe("1234567891");
  });
});

describe("sortBy", () => {
  test("sorts by likes descending", () => {
    const tweets = parseTweets(searchFixture);
    const unique = dedupe(tweets);
    const sorted = sortBy(unique, "likes");

    expect(sorted[0].metrics.likes).toBeGreaterThanOrEqual(sorted[1].metrics.likes);
  });

  test("sorts by impressions descending", () => {
    const tweets = parseTweets(searchFixture);
    const unique = dedupe(tweets);
    const sorted = sortBy(unique, "impressions");

    expect(sorted[0].metrics.impressions).toBeGreaterThanOrEqual(sorted[1].metrics.impressions);
  });
});

describe("filterEngagement", () => {
  test("filters by minimum likes", () => {
    const tweets = parseTweets(searchFixture);
    const unique = dedupe(tweets);
    const filtered = filterEngagement(unique, { minLikes: 100 });

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe("1234567890");
  });

  test("filters by minimum impressions", () => {
    const tweets = parseTweets(searchFixture);
    const unique = dedupe(tweets);
    const filtered = filterEngagement(unique, { minImpressions: 3000 });

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe("1234567890");
  });

  test("returns all when no thresholds met", () => {
    const tweets = parseTweets(searchFixture);
    const unique = dedupe(tweets);
    const filtered = filterEngagement(unique, { minLikes: 0 });

    expect(filtered.length).toBe(2);
  });
});
