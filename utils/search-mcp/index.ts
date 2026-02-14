import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Exa from "exa-js";

import type {
  SearchProvider,
  SearchInput,
  PerplexityOptions,
  ExaOptions,
  BraveOptions,
} from "./types";
import { validateProviderParams } from "./types";
import { formatResponse } from "./format";
import { searchPerplexity } from "./providers/perplexity";
import { searchExa, type ExaClient } from "./providers/exa";
import { searchBrave } from "./providers/brave";

const ALL_PROVIDERS: SearchProvider[] = ["perplexity", "exa", "brave"];

const ENV_KEY_MAP: Record<SearchProvider, string> = {
  perplexity: "OPENROUTER_API_KEY",
  exa: "EXA_API_KEY",
  brave: "BRAVE_API_KEY",
};

export function detectAvailableProviders(
  env: Record<string, string | undefined>
): SearchProvider[] {
  return ALL_PROVIDERS.filter((p) => {
    const key = env[ENV_KEY_MAP[p]];
    return key !== undefined && key !== "";
  });
}

export function resolveDefaultProvider(
  defaultProvider: string | undefined,
  available: SearchProvider[]
): SearchProvider {
  if (available.length === 0) {
    throw new Error(
      "No search providers available. Set at least one of: OPENROUTER_API_KEY, EXA_API_KEY, BRAVE_API_KEY."
    );
  }

  if (!defaultProvider) {
    return available[0];
  }

  if (!ALL_PROVIDERS.includes(defaultProvider as SearchProvider)) {
    throw new Error(
      `DEFAULT_PROVIDER '${defaultProvider}' is not a valid provider. Valid: ${ALL_PROVIDERS.join(", ")}.`
    );
  }

  if (!available.includes(defaultProvider as SearchProvider)) {
    throw new Error(
      `DEFAULT_PROVIDER '${defaultProvider}' is not available. Available: ${available.join(", ")}. Set ${ENV_KEY_MAP[defaultProvider as SearchProvider]} to enable.`
    );
  }

  return defaultProvider as SearchProvider;
}

export function buildToolDescription(
  available: SearchProvider[],
  defaultProvider: SearchProvider
): string {
  const providerList = available
    .map((p) => (p === defaultProvider ? `${p} (default)` : p))
    .join(", ");
  return `Search the web using multiple providers. Available: ${providerList}. Omit 'provider' to use ${defaultProvider}.`;
}

// --- Server startup (only runs when executed directly) ---

function startServer() {
  const available = detectAvailableProviders(process.env as Record<string, string | undefined>);
  const defaultProvider = resolveDefaultProvider(process.env.DEFAULT_PROVIDER, available);

  const envKeys = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || "perplexity/sonar-pro",
    EXA_API_KEY: process.env.EXA_API_KEY || "",
    BRAVE_API_KEY: process.env.BRAVE_API_KEY || "",
  };

  // Initialize Exa client if available
  let exaClient: ExaClient | undefined;
  if (available.includes("exa")) {
    exaClient = new Exa(envKeys.EXA_API_KEY) as unknown as ExaClient;
  }

  const server = new McpServer({ name: "search", version: "1.0.0" });

  server.registerTool(
    "search_web",
    {
      description: buildToolDescription(available, defaultProvider),
      inputSchema: {
        query: z.string().describe("Search query"),
        provider: z
          .enum(["perplexity", "exa", "brave"])
          .optional()
          .describe(
            `Search provider. Available: ${available.join(", ")}. Default: ${defaultProvider}.`
          ),
        recency: z
          .enum(["day", "week", "month", "year"])
          .optional()
          .describe("Filter results by recency"),
        num_results: z
          .number()
          .optional()
          .describe("Number of results. Brave max 20, Exa max 100."),
        // Perplexity-only params
        model: z
          .string()
          .optional()
          .describe("OpenRouter model ID (Perplexity only). Default: perplexity/sonar-pro."),
        temperature: z.number().optional().describe("Generation randomness (Perplexity only)."),
        top_p: z.number().optional().describe("Nucleus sampling threshold (Perplexity only)."),
        top_k: z.number().optional().describe("Top-k token limit (Perplexity only)."),
        max_tokens: z.number().optional().describe("Max tokens to generate (Perplexity only)."),
        frequency_penalty: z.number().optional().describe("Frequency penalty (Perplexity only)."),
        presence_penalty: z.number().optional().describe("Presence penalty (Perplexity only)."),
        // Exa-only params
        search_type: z
          .enum(["instant", "auto", "neural", "fast", "deep"])
          .optional()
          .describe("Exa search type (Exa only). Default: auto."),
        include_domains: z
          .array(z.string())
          .optional()
          .describe("Only include results from these domains (Exa only)."),
        exclude_domains: z
          .array(z.string())
          .optional()
          .describe("Exclude results from these domains (Exa only)."),
        category: z.string().optional().describe("Result category filter (Exa only)."),
        include_text: z
          .boolean()
          .optional()
          .describe("Include full text in results (Exa only)."),
        // Brave-only params
        result_filter: z
          .enum(["web"])
          .optional()
          .describe("Result type filter (Brave only). Only 'web' supported."),
      },
    },
    async (args) => {
      const provider = (args.provider ?? defaultProvider) as SearchProvider;

      // Check provider availability
      if (!available.includes(provider)) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Provider '${provider}' is not available. Available: ${available.join(", ")}. Set ${ENV_KEY_MAP[provider]} to enable.`,
            },
          ],
          isError: true,
        };
      }

      // Validate provider-specific params (FR-7)
      const paramErrors = validateProviderParams(provider, args);
      if (paramErrors.length > 0) {
        return {
          content: [{ type: "text" as const, text: paramErrors.join("\n") }],
          isError: true,
        };
      }

      const input: SearchInput = {
        query: args.query,
        provider,
        recency: args.recency as SearchInput["recency"],
        num_results: args.num_results,
      };

      try {
        let result;

        switch (provider) {
          case "perplexity": {
            const perplexityOpts: PerplexityOptions = {
              model: args.model,
              temperature: args.temperature,
              top_p: args.top_p,
              top_k: args.top_k,
              max_tokens: args.max_tokens,
              frequency_penalty: args.frequency_penalty,
              presence_penalty: args.presence_penalty,
            };
            result = await searchPerplexity(input, perplexityOpts, {
              apiKey: envKeys.OPENROUTER_API_KEY,
              defaultModel: envKeys.OPENROUTER_MODEL,
            });
            break;
          }

          case "exa": {
            if (!exaClient) {
              return {
                content: [{ type: "text" as const, text: "Exa client not initialized. Set EXA_API_KEY to enable." }],
                isError: true,
              };
            }
            const exaOpts: ExaOptions = {
              search_type: args.search_type as ExaOptions["search_type"],
              include_domains: args.include_domains,
              exclude_domains: args.exclude_domains,
              category: args.category,
              include_text: args.include_text,
            };
            result = await searchExa(input, exaOpts, {
              client: exaClient,
            });
            break;
          }

          case "brave": {
            const braveOpts: BraveOptions = {
              result_filter: args.result_filter as BraveOptions["result_filter"],
            };
            result = await searchBrave(input, braveOpts, {
              apiKey: envKeys.BRAVE_API_KEY,
            });
            break;
          }
        }

        return formatResponse(result);
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `${provider} error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }

  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

// Only start server when run directly (not when imported for testing)
if (import.meta.main) {
  startServer();
}
