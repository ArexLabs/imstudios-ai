export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchConfig {
  enabled: boolean;
  googleApiKey?: string;
  googleCx?: string;
  bingApiKey?: string;
}

const DDG_API = "https://html.duckduckgo.com/html/";
const GOOGLE_API = "https://www.googleapis.com/customsearch/v1";
const BING_API = "https://api.bing.microsoft.com/v7.0/search";

async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const url = new URL(DDG_API);
  url.searchParams.set("q", query);

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(8000),
    headers: { "User-Agent": "imstudios-ai/1.0" },
  });

  if (!res.ok) throw new Error(`DuckDuckGo returned ${res.status}`);

  const html = await res.text();
  const results: SearchResult[] = [];
  const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

  let match: RegExpExecArray | null;
  const urls: string[] = [];
  const titles: string[] = [];
  const snippets: string[] = [];

  while ((match = resultRegex.exec(html)) !== null) {
    urls.push(match[1]);
    titles.push(match[2].replace(/<[^>]*>/g, "").trim());
  }

  while ((match = snippetRegex.exec(html)) !== null) {
    snippets.push(match[1].replace(/<[^>]*>/g, "").trim());
  }

  for (let i = 0; i < Math.min(urls.length, 8); i++) {
    results.push({
      title: titles[i] || "",
      url: urls[i] || "",
      snippet: snippets[i] || "",
    });
  }

  return results;
}

async function searchGoogle(
  query: string,
  apiKey: string,
  cx: string,
): Promise<SearchResult[]> {
  const url = new URL(GOOGLE_API);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", query);
  url.searchParams.set("num", "8");

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Google Search returned ${res.status}`);

  const data = await res.json() as {
    items?: Array<{
      title?: string;
      link?: string;
      snippet?: string;
    }>;
  };

  return (data.items || []).map((item) => ({
    title: item.title || "",
    url: item.link || "",
    snippet: item.snippet || "",
  }));
}

async function searchBing(query: string, apiKey: string): Promise<SearchResult[]> {
  const url = new URL(BING_API);
  url.searchParams.set("q", query);
  url.searchParams.set("count", "8");
  url.searchParams.set("textFormat", "Raw");

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(8000),
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
    },
  });

  if (!res.ok) throw new Error(`Bing Search returned ${res.status}`);

  const data = await res.json() as {
    webPages?: {
      value?: Array<{
        name?: string;
        url?: string;
        snippet?: string;
      }>;
    };
  };

  return (data.webPages?.value || []).map((item) => ({
    title: item.name || "",
    url: item.url || "",
    snippet: item.snippet || "",
  }));
}

export async function searchWeb(query: string, config: SearchConfig): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const errors: string[] = [];

  if (config.googleApiKey && config.googleCx) {
    try {
      return await searchGoogle(query, config.googleApiKey, config.googleCx);
    } catch (e) {
      errors.push(`Google: ${e instanceof Error ? e.message : e}`);
    }
  }

  if (config.bingApiKey) {
    try {
      return await searchBing(query, config.bingApiKey);
    } catch (e) {
      errors.push(`Bing: ${e instanceof Error ? e.message : e}`);
    }
  }

  try {
    return await searchDuckDuckGo(query);
  } catch (e) {
    errors.push(`DuckDuckGo: ${e instanceof Error ? e.message : e}`);
  }

  console.error("[search] all backends failed:", errors.join("; "));
  return [];
}

function escapeMarkdown(text: string): string {
  return text.replace(/[\[\]()]/g, "\\$&");
}

export function formatSearchResults(query: string, results: SearchResult[]): string {
  if (results.length === 0) return "";

  const lines = [`Web search results for "${query}":`, ""];
  for (const r of results) {
    lines.push(r.url ? `- [${escapeMarkdown(r.title)}](${r.url})` : `- ${escapeMarkdown(r.title)}`);
    lines.push(`  ${r.snippet.replace(/\n/g, " ").slice(0, 300)}`);
    lines.push("");
  }

  return lines.join("\n").trim();
}
