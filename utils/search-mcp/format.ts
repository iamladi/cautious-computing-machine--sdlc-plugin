import type { SearchResult, ToolOutput } from "./types";

export function formatResponse(result: SearchResult): ToolOutput {
  const parts: string[] = [result.content];

  if (result.sources.length > 0) {
    parts.push("\n\n---\n**Sources:**");
    result.sources.forEach((source, i) => {
      parts.push(`[${i + 1}] [${source.title}](${source.url})`);
    });
  }

  if (result.images.length > 0) {
    parts.push("\n\n**Images:**");
    result.images.forEach((image) => {
      parts.push(`![](${image})`);
    });
  }

  const meta = {
    provider: result.meta.provider,
    ...(result.meta.model && { model: result.meta.model }),
    latencyMs: result.meta.latencyMs,
    ...(result.meta.cost !== undefined && { cost: result.meta.cost }),
  };

  return {
    content: [
      {
        type: "text",
        text: parts.join("\n") + `\n\n<meta>${JSON.stringify(meta)}</meta>`,
      },
    ],
  };
}
