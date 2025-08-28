import asyncio
import base64
import urllib.parse
import random
from playwright.async_api import async_playwright
from typing import Set, List
from app.services.metadata import main as get_data
from app.schemas.reel import NewReel

def decode_bing_url(bing_url: str) -> str:
    try:
        parsed = urllib.parse.urlparse(bing_url)
        params = urllib.parse.parse_qs(parsed.query)
        if 'u' in params:
            encoded_url = params['u'][0]
            if encoded_url.startswith('a1'):
                encoded_url = encoded_url[2:]
            missing_padding = len(encoded_url) % 4
            if missing_padding:
                encoded_url += '=' * (4 - missing_padding)
            try:
                return base64.b64decode(encoded_url).decode('utf-8')
            except:
                return urllib.parse.unquote(encoded_url)
        return bing_url
    except:
        return bing_url

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
    element = page.locator("textarea#sb_form_q")
    await element.click()
    for char in text:
        await element.type(char)
    await page.keyboard.press("Enter")
    await asyncio.sleep(0.5)

async def go_to_page(page, target_page, current_page):
    while current_page < target_page:
        next_button = page.locator("a.sb_pagN")
        if not next_button or await next_button.count() == 0:
            return current_page
        await next_button.first.scroll_into_view_if_needed()
        await next_button.first.click()
        await page.wait_for_selector("li.b_algo", timeout=10000)
        current_page += 1
    return current_page

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

    async with async_playwright() as p:
        browser, page = await setup_browser(p)
        try:
            await page.goto("https://www.bing.com", timeout=30000)
            await page.wait_for_selector("textarea#sb_form_q", timeout=10000)
            search_query = f"site:instagram.com/reel {query}"
            await type_search_query(page, search_query)
            await page.wait_for_selector("li.b_algo", timeout=10000)

            current_page = await go_to_page(page, start_page, 1)
            pages_processed = 0

            while len(all_urls) < max_links and pages_processed < max_pages:
                result_links = await page.query_selector_all("li.b_algo a")
                page_urls = set()
                for a in result_links:
                    href = await a.get_attribute("href")
                    if href:
                        if "bing.com/ck/a" in href:
                            decoded = decode_bing_url(href)
                            if "instagram.com/reel/" in decoded:
                                page_urls.add(decoded.split('?')[0])
                        elif "instagram.com/reel/" in href:
                            page_urls.add(href.split('?')[0])

                new_urls = page_urls - all_urls - existing_links
                all_urls.update(new_urls)

                if len(all_urls) >= max_links:
                    break

                pages_processed += 1
                if pages_processed < max_pages:
                    new_page = await go_to_page(page, current_page + 1, current_page)
                    if new_page == current_page:
                        break
                    current_page = new_page

            final_urls = list(all_urls)[:max_links]
            if final_urls:
                results = await get_data(city=city, category=category, urls=final_urls)
                reels = [NewReel(**r) for r in results if r is not None]

        finally:
            await browser.close()

    return reels, current_page
