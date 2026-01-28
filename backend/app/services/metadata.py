import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import re


async def get_metadata(context, url, city, category, semaphore):
    async with semaphore:
        try:
            page = await context.new_page()
            await page.goto(url, timeout=15000)
            await asyncio.sleep(1)

            html = await page.content()
            await page.close()

            soup = BeautifulSoup(html, "html.parser")

            content = soup.find("meta", property="og:description")
            image = soup.find("meta", property="og:image")

            if not content or not image:
                return None

            description = content["content"]
            thumbnail = image["content"]

            match = re.search(
                r"(?:[\d,.KM]+\s+likes?,\s+[\d,.KM]+\s+comments?\s+-\s+)?(.+?)\s+on\s+.+?:\s*\"(.+?)\"",
                description,
                re.DOTALL
            )

            if not match:
                return None

            username = match.group(1).strip() if match.group(1) else "unknown"
            caption = match.group(2).strip() if match.group(2) else ""

            if not all([username, caption, thumbnail]):
                return None

            return {
                "url": url,
                "city": city,
                "category": category,
                "username": username,
                "caption": caption,
                "thumbnail": thumbnail
            }

        except Exception as e:
            return None


async def main(city, category, urls):
    results = []
    semaphore = asyncio.Semaphore(5)

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage']
        )
        context = await browser.new_context(
            viewport={'width': 1600, 'height': 900},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        )

        tasks = [
            asyncio.create_task(get_metadata(context, url, city, category, semaphore))
            for url in urls
        ]
        results = await asyncio.gather(*tasks)
        await browser.close()

    return [r for r in results if r is not None]
