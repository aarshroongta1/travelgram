import asyncio
from playwright.async_api import async_playwright
from typing import Set, List
from app.services.metadata import main as get_data
from app.schemas.reel import NewReel


async def search_duckduckgo(query: str, max_results: int = 20) -> List[str]:
    """Search DuckDuckGo for Instagram reel URLs."""
    urls = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        )
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        )
        page = await context.new_page()

        try:
            await page.goto("https://duckduckgo.com", timeout=15000)
            await page.fill("input[name='q']", query)
            await page.keyboard.press("Enter")
            await asyncio.sleep(3)

            links = await page.query_selector_all("a")
            for link in links:
                href = await link.get_attribute("href")
                if href and "instagram.com/reel/" in href:
                    clean_url = href.split('?')[0]
                    if clean_url not in urls:
                        urls.append(clean_url)
                        if len(urls) >= max_results:
                            break
        except Exception as e:
            print(f"Search error: {e}")
        finally:
            await browser.close()

    return urls


async def get_instagram_reels(
    query: str,
    city: str,
    category: str,
    existing_links: Set[str] = None,
    start_page: int = 1,
    max_links: int = 6,
    max_pages: int = 2
):
    existing_links = existing_links or set()

    search_query = f"site:instagram.com/reel {query}"
    print(f"Searching: {search_query}")

    all_urls = await search_duckduckgo(search_query, max_results=max_links + len(existing_links) + 10)
    print(f"Found {len(all_urls)} URLs from search")

    new_urls = [url for url in all_urls if url not in existing_links][:max_links]
    print(f"New URLs after filtering: {len(new_urls)}")

    reels = []
    if new_urls:
        results = await get_data(city=city, category=category, urls=new_urls)
        print(f"Metadata results: {len(results)}")
        reels = [NewReel(**r) for r in results if r is not None]

    return reels, start_page


if __name__ == "__main__":
    reels, page = asyncio.run(
        get_instagram_reels("best cafes in Paris", "Paris", "cafes")
    )
    for r in reels:
        print(r)
