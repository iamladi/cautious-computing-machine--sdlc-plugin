import type { SearchInput, SearchResult, BraveOptions, Recency } from "../types";
import { clampNumResults } from "../types";

type FetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const FRESHNESS_MAP: Record<Recency, string> = {
  day: "pd",
  week: "pw",
  month: "pm",
  year: "py",
};

export async function searchBrave(
  input: SearchInput,
  _options: BraveOptions,
  deps: { apiKey: string; baseUrl?: string; fetchFn?: FetchFn }
): Promise<SearchResult> {
  const startTime = performance.now();
  const { apiKey, baseUrl = "https://api.search.brave.com/res/v1/web/search", fetchFn = fetch } = deps;

  // Build query params
  const params = new URLSearchParams();
  params.set("q", input.query);

  const count = clampNumResults(input.provider, input.num_results);
  if (count !== undefined) {
    params.set("count", String(count));
  }

  if (input.recency) {
    params.set("freshness", FRESHNESS_MAP[input.recency]);
  }

  const url = `${baseUrl}?${params.toString()}`;

  // Create AbortController with 30s timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetchFn(url, {
      headers: {
        "X-Subscription-Token": apiKey,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`brave error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const results = data.web?.results || [];

    // Extract sources
    const sources = results.map((result: any) => ({
      title: result.title,
      url: result.url,
      snippet: result.description,
    }));

    // Extract images
    const images = results
      .filter((result: any) => result.thumbnail?.src)
      .map((result: any) => result.thumbnail.src);

    // Build content
    const content = results.length > 0
      ? results.map((result: any) => result.description).join("\n\n")
      : "No results found";

    const latencyMs = performance.now() - startTime;

    return {
      content,
      sources,
      images,
      meta: {
        provider: "brave",
        latencyMs,
      },
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("brave error (timeout): Request timed out after 30s");
    }

    throw error;
  }
}
