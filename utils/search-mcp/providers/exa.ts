import type { SearchInput, SearchResult, ExaOptions } from "../types";
import { recencyToDate, clampNumResults } from "../types";

export interface ExaClient {
  search(query: string, options?: Record<string, unknown>): Promise<{
    results: Array<{
      title: string | null;
      url: string;
      text?: string;
      image?: string;
    }>;
    costDollars?: { total: number };
    resolvedSearchType?: string;
    searchTime?: number;
  }>;
}

export async function searchExa(
  input: SearchInput,
  options: ExaOptions,
  deps: { client: ExaClient }
): Promise<SearchResult> {
  const startTime = Date.now();

  // Build Exa search options
  const searchOptions: Record<string, unknown> = {};

  // Map recency to startPublishedDate
  if (input.recency) {
    searchOptions.startPublishedDate = recencyToDate(input.recency);
  }

  // Map search_type to type
  if (options.search_type) {
    searchOptions.type = options.search_type;
  }

  // Map include_domains and exclude_domains
  if (options.include_domains) {
    searchOptions.includeDomains = options.include_domains;
  }
  if (options.exclude_domains) {
    searchOptions.excludeDomains = options.exclude_domains;
  }

  // Map category
  if (options.category) {
    searchOptions.category = options.category;
  }

  // Map include_text to contents
  if (options.include_text !== undefined) {
    searchOptions.contents = options.include_text ? { text: true } : false;
  }

  // Clamp num_results
  const clampedResults = clampNumResults("exa", input.num_results);
  if (clampedResults !== undefined) {
    searchOptions.numResults = clampedResults;
  }

  // Execute search
  const response = await deps.client.search(input.query, searchOptions);

  // Calculate latency
  const latencyMs = response.searchTime ?? (Date.now() - startTime);

  // Map results to sources
  const sources = response.results.map((result) => ({
    title: result.title ?? "Untitled",
    url: result.url,
    snippet: result.text,
  }));

  // Extract images
  const images = response.results
    .map((result) => result.image)
    .filter((image): image is string => image !== undefined);

  // Build content from result texts
  const contentParts = response.results
    .map((result) => result.text)
    .filter((text): text is string => text !== undefined);
  const content =
    contentParts.length > 0 ? contentParts.join("\n\n") : "No content returned";

  // Build meta
  const meta: SearchResult["meta"] = {
    provider: "exa",
    latencyMs,
  };

  if (response.resolvedSearchType) {
    meta.model = response.resolvedSearchType;
  }

  if (response.costDollars?.total !== undefined) {
    meta.cost = response.costDollars.total;
  }

  return {
    content,
    sources,
    images,
    meta,
  };
}
