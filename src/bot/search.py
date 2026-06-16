import asyncio
import logging
import urllib.parse
from bs4 import BeautifulSoup
import httpx

logger = logging.getLogger("bot.search")

async def search_google(client: httpx.AsyncClient, query: str, api_key: str = None, cx: str = None) -> list[dict[str, str]]:
    """Query Google using Custom Search JSON API, fallback to DuckDuckGo HTML if keys are missing."""
    if api_key and cx:
        try:
            url = f"https://customsearch.googleapis.com/customsearch/v1?q={urllib.parse.quote(query)}&key={api_key}&cx={cx}"
            r = await client.get(url)
            if r.status_code == 200:
                data = r.json()
                results = []
                for item in data.get("items", [])[:3]:
                    results.append({
                        "title": item.get("title", ""),
                        "link": item.get("link", ""),
                        "snippet": item.get("snippet", "")
                    })
                return results
            else:
                logger.warning("Google API returned status %d: %s", r.status_code, r.text)
        except Exception:
            logger.exception("Error querying Google Custom Search API")

    # Fallback: Scrape DuckDuckGo HTML (extremely stable and GDPR-compliant)
    try:
        url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
        r = await client.get(url)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, "html.parser")
            results = []
            for result in soup.find_all("a", class_="result__url")[:3]:
                link = result.get("href", "")
                parent = result.find_parent("div", class_="result__body")
                title_a = parent.find("a", class_="result__a") if parent else None
                snippet_div = parent.find("a", class_="result__snippet") if parent else None

                if title_a and link:
                    # Clean the redirect link from DuckDuckGo
                    parsed = urllib.parse.urlparse(link)
                    qs = urllib.parse.parse_qs(parsed.query)
                    clean_url = qs.get("uddg", [link])[0]
                    if clean_url.startswith("//"):
                        clean_url = "https:" + clean_url

                    results.append({
                        "title": title_a.get_text().strip(),
                        "link": clean_url,
                        "snippet": snippet_div.get_text().strip() if snippet_div else ""
                    })
            return results
    except Exception:
        logger.exception("Error falling back to DuckDuckGo search")
    return []

async def search_bing(client: httpx.AsyncClient, query: str, api_key: str = None) -> list[dict[str, str]]:
    """Query Bing using official Web Search API, fallback to Bing Mobile scraping if key is missing."""
    if api_key:
        try:
            url = f"https://api.bing.microsoft.com/v7.0/search?q={urllib.parse.quote(query)}"
            headers = {"Ocp-Apim-Subscription-Key": api_key}
            r = await client.get(url, headers=headers)
            if r.status_code == 200:
                data = r.json()
                results = []
                web_pages = data.get("webPages", {}).get("value", [])
                for item in web_pages[:3]:
                    results.append({
                        "title": item.get("name", ""),
                        "link": item.get("url", ""),
                        "snippet": item.get("snippet", "")
                    })
                return results
            else:
                logger.warning("Bing API returned status %d: %s", r.status_code, r.text)
        except Exception:
            logger.exception("Error querying Bing Web Search API")

    # Fallback: Scrape Bing Mobile
    try:
        url = f"https://www.bing.com/search?q={urllib.parse.quote(query)}"
        mobile_headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1"
        }
        r = await client.get(url, headers=mobile_headers)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, "html.parser")
            results = []
            count = 0
            for anchor in soup.find_all("a"):
                heading = anchor.find(["h2", "h3"])
                if heading:
                    link = anchor.get("href", "")
                    title = heading.get_text().strip()
                    snippet = ""
                    parent = anchor.parent
                    if parent:
                        sib = parent.find_next_sibling()
                        if sib:
                            snippet = sib.get_text().strip()

                    if link and link.startswith("http") and "bing.com" not in link:
                        results.append({
                            "title": title,
                            "link": link,
                            "snippet": snippet
                        })
                        count += 1
                        if count >= 3:
                            break
            return results
    except Exception:
        logger.exception("Error scraping Bing Search")
    return []

async def search_yahoo(client: httpx.AsyncClient, query: str) -> list[dict[str, str]]:
    """Query Yahoo Search via web scraping (stable and bypasses consent popups)."""
    try:
        url = f"https://search.yahoo.com/search?p={urllib.parse.quote(query)}"
        r = await client.get(url)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, "html.parser")
            results = []
            count = 0
            for div in soup.find_all("div", class_=lambda x: x and "algo" in x):
                h3 = div.find("h3", class_="title")
                anchor = h3.find("a") if h3 else None
                snippet_div = div.find("div", class_="compText")
                if not snippet_div:
                    snippet_div = div.find("span", class_="fc-falcon")

                if anchor:
                    link = anchor.get("href", "")
                    title = anchor.get_text().strip()
                    snippet = snippet_div.get_text().strip() if snippet_div else ""

                    if link and link.startswith("http"):
                        results.append({
                            "title": title,
                            "link": link,
                            "snippet": snippet
                        })
                        count += 1
                        if count >= 3:
                            break
            return results
    except Exception:
        logger.exception("Error scraping Yahoo Search")
    return []

async def run_search(query: str, google_key: str = None, google_cx: str = None, bing_key: str = None) -> str:
    """Run search queries across Google/DDG, Bing, and Yahoo in parallel and return formatted markdown."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    async with httpx.AsyncClient(headers=headers, timeout=10.0, follow_redirects=True) as client:
        google_task = search_google(client, query, google_key, google_cx)
        bing_task = search_bing(client, query, bing_key)
        yahoo_task = search_yahoo(client, query)
        
        google_res, bing_res, yahoo_res = await asyncio.gather(
            google_task, bing_task, yahoo_task, return_exceptions=True
        )
        
        if isinstance(google_res, Exception):
            google_res = []
        if isinstance(bing_res, Exception):
            bing_res = []
        if isinstance(yahoo_res, Exception):
            yahoo_res = []
            
        lines = []
        
        # Format Google
        if google_res:
            lines.append("### Google / DuckDuckGo Results:")
            for idx, res in enumerate(google_res, 1):
                lines.append(f"{idx}. **[{res['title']}]({res['link']})**")
                if res['snippet']:
                    lines.append(f"   *Snippet: {res['snippet']}*")
            lines.append("")
            
        # Format Bing
        if bing_res:
            lines.append("### Bing Results:")
            for idx, res in enumerate(bing_res, 1):
                lines.append(f"{idx}. **[{res['title']}]({res['link']})**")
                if res['snippet']:
                    lines.append(f"   *Snippet: {res['snippet']}*")
            lines.append("")
            
        # Format Yahoo
        if yahoo_res:
            lines.append("### Yahoo Results:")
            for idx, res in enumerate(yahoo_res, 1):
                lines.append(f"{idx}. **[{res['title']}]({res['link']})**")
                if res['snippet']:
                    lines.append(f"   *Snippet: {res['snippet']}*")
            lines.append("")
            
        if not lines:
            return "No search results found from Google, Bing, or Yahoo."
            
        return "\n".join(lines)
