export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SearchConfig {
  enabled: boolean;
  googleApiKey?: string;
  googleCx?: string;
  bingApiKey?: string;
}

const DDG_API = "https://api.duckduckgo.com/";
const GOOGLE_API = "https://www.googleapis.com/customsearch/v1";
const BING_API = "https://api.bing.microsoft.com/v7.0/search";

async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const url = new URL(DDG_API);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("no_html", "1");
  url.searchParams.set("skip_disambig", "1");
  url.searchParams.set("t", "imstudios-ai");

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(8000),
    headers: { "User-Agent": "imstudios-ai/1.0" },
  });

  if (!res.ok) throw new Error(`DuckDuckGo returned ${res.status}`);

  const data = await res.json() as {
    AbstractText?: string;
    AbstractURL?: string;
    AbstractSource?: string;
    Answer?: string;
    RelatedTopics?: Array<{
      Text?: string;
      FirstURL?: string;
      Topics?: Array<{ Text?: string; FirstURL?: string }>;
    }>;
    Results?: Array<{
      Text?: string;
      FirstURL?: string;
    }>;
  };

  const results: SearchResult[] = [];

  if (data.Answer && data.Answer !== data.AbstractText) {
    results.push({
      title: "Direct Answer",
      url: "",
      snippet: data.Answer,
    });
  }

  if (data.AbstractText) {
    results.push({
      title: data.AbstractSource || "Summary",
      url: data.AbstractURL || "",
      snippet: data.AbstractText.slice(0, 500),
    });
  }

  if (data.RelatedTopics) {
    for (const topic of data.RelatedTopics) {
      if (topic.Text && topic.FirstURL) {
        results.push({
          title: topic.Text.split(" - ")[0] || topic.Text,
          url: topic.FirstURL,
          snippet: topic.Text,
        });
      }
      if (topic.Topics) {
        for (const sub of topic.Topics) {
          if (sub.Text && sub.FirstURL) {
            results.push({
              title: sub.Text.split(" - ")[0] || sub.Text,
              url: sub.FirstURL,
              snippet: sub.Text,
            });
          }
        }
      }
    }
  }

  const seen = new Set<string>();
  return results.filter((r) => {
    const key = r.url || r.snippet;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
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

export function formatSearchResults(query: string, results: SearchResult[]): string {
  if (results.length === 0) return "";

  const lines = [`Web search results for "${query}":`, ""];
  for (const r of results) {
    lines.push(r.url ? `- [${r.title}](${r.url})` : `- ${r.title}`);
    lines.push(`  ${r.snippet.replace(/\n/g, " ").slice(0, 300)}`);
    lines.push("");
  }

  return lines.join("\n").trim();
}
