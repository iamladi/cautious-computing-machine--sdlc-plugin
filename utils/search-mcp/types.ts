export type SearchProvider = "perplexity" | "exa" | "brave";

export type Recency = "day" | "week" | "month" | "year";

export interface SearchSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface SearchResult {
  content: string;
  sources: SearchSource[];
  images: string[];
  meta: {
    provider: SearchProvider;
    model?: string;
    latencyMs: number;
    cost?: number;
  };
}

export interface SearchInput {
  query: string;
  provider: SearchProvider;
  recency?: Recency;
  num_results?: number;
}

export interface PerplexityOptions {
  model?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ExaOptions {
  search_type?: "instant" | "auto" | "neural" | "fast" | "deep";
  include_domains?: string[];
  exclude_domains?: string[];
  category?: string;
  include_text?: boolean;
}

export interface BraveOptions {
  result_filter?: "web";
}

export type ToolOutput = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

const RECENCY_DAYS: Record<Recency, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

export function recencyToDate(recency: Recency, now?: Date): string {
  const reference = now ?? new Date();
  const ms = RECENCY_DAYS[recency] * 24 * 60 * 60 * 1000;
  return new Date(reference.getTime() - ms).toISOString();
}

export const PROVIDER_PARAM_MATRIX: Record<string, SearchProvider> = {
  // Exa-only
  search_type: "exa",
  include_domains: "exa",
  exclude_domains: "exa",
  category: "exa",
  include_text: "exa",
  // Perplexity-only
  model: "perplexity",
  temperature: "perplexity",
  top_p: "perplexity",
  top_k: "perplexity",
  max_tokens: "perplexity",
  frequency_penalty: "perplexity",
  presence_penalty: "perplexity",
  // Brave-only
  result_filter: "brave",
};

const NUM_RESULTS_MAX: Partial<Record<SearchProvider, number>> = {
  brave: 20,
  exa: 100,
};

export function clampNumResults(
  provider: SearchProvider,
  numResults: number | undefined
): number | undefined {
  if (numResults === undefined) return undefined;
  if (provider === "perplexity") return undefined;
  const max = NUM_RESULTS_MAX[provider];
  if (max !== undefined && numResults > max) return max;
  return numResults;
}

export function validateProviderParams(
  provider: SearchProvider,
  params: Record<string, unknown>
): string[] {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const allowedProvider = PROVIDER_PARAM_MATRIX[key];
    if (allowedProvider && allowedProvider !== provider) {
      errors.push(
        `'${key}' is only available with provider='${allowedProvider}'.`
      );
    }
  }
  return errors;
}
