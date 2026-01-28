import asyncio
from playwright.async_api import async_playwright
from typing import Set
from app.services.metadata import main as get_data
from app.schemas.reel import NewReel

async def setup_browser(p):
    browser = await p.chromium.launch(
        headless=True,
        args=[
            '--no-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-client-side-phishing-detection',
            '--disable-default-apps',
            '--disable-extensions',
            '--disable-hang-monitor',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-sync',
            '--disable-translate',
            '--metrics-recording-only',
            '--safebrowsing-disable-auto-update',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
    )
    
    context = await browser.new_context(
        viewport={'width': 1920, 'height': 1080},
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        extra_http_headers={
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
    )
    page = await context.new_page()
    await page.add_init_script("Object.defineProperty(navigator, 'webdriver', { get: () => undefined });")
    return browser, page


async def type_search_query(page, text):
    element = page.locator("input[name='q']")
    await element.click()
    for char in text:
        await element.type(char)
    await page.keyboard.press("Enter")
    await asyncio.sleep(1)

async def load_more_results(page, times: int = 1):
    """Click 'More Results' button to load additional results on DuckDuckGo."""
    for _ in range(times):
        more_button = page.locator("button#more-results")
        if await more_button.count() > 0:
            await more_button.scroll_into_view_if_needed()
            await more_button.click()
            await asyncio.sleep(1.5)
        else:
            break

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
    all_urls = set()
    reels = []
    loads_done = start_page - 1  # Track how many times we've loaded more results

    async with async_playwright() as p:
        browser, page = await setup_browser(p)
        try:
            await page.goto("https://duckduckgo.com", timeout=30000)
            await page.wait_for_selector("input[name='q']", timeout=10000)
            search_query = f"site:instagram.com/reel {query}"
            await type_search_query(page, search_query)

            # Wait for results to load
            await page.wait_for_selector("article[data-testid='result']", timeout=15000)

            # Load more results to get to start_page position
            if loads_done > 0:
                await load_more_results(page, loads_done)

            loads_processed = 0

            while len(all_urls) < max_links and loads_processed < max_pages:
                # Extract links from results
                result_links = await page.query_selector_all("article[data-testid='result'] a[href*='instagram.com/reel']")
                page_urls = set()

                for a in result_links:
                    href = await a.get_attribute("href")
                    if href and "instagram.com/reel/" in href:
                        # DuckDuckGo provides direct URLs, no decoding needed
                        clean_url = href.split('?')[0]
                        page_urls.add(clean_url)

                new_urls = page_urls - all_urls - existing_links
                all_urls.update(new_urls)

                if len(all_urls) >= max_links:
                    break

                loads_processed += 1
                if loads_processed < max_pages:
                    await load_more_results(page, 1)
                    await asyncio.sleep(0.5)

            final_urls = list(all_urls)[:max_links]
            if final_urls:
                results = await get_data(city=city, category=category, urls=final_urls)
                reels = [NewReel(**r) for r in results if r is not None]

        finally:
            await browser.close()

    return reels, loads_done + loads_processed

if __name__ == "__main__":
    reels, page = asyncio.run(
        get_instagram_reels("best cafes in Paris", "Paris", "cafes")
    )
    for r in reels:
        print(r)
