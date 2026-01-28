import asyncio
import logging
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import re

logger = logging.getLogger(__name__)


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
                logger.warning(f"Missing meta tags for {url}: content={bool(content)}, image={bool(image)}")
                return None

            description = content["content"]
            thumbnail = image["content"]

            username = None
            caption = None

            # Pattern 1: Standard format with likes/comments prefix
            # "1,234 likes, 56 comments - username on Instagram: "caption""
            match = re.search(
                r"(?:[\d,.KM]+\s+likes?,\s+[\d,.KM]+\s+comments?\s+-\s+)?(.+?)\s+on\s+.+?:\s*[\""](.+?)[\""]",
                description,
                re.DOTALL
            )

            if match:
                username = match.group(1).strip()
                caption = match.group(2).strip()

            # Pattern 2: Without quotes around caption
            # "username on Instagram: caption text here"
            if not username or not caption:
                match = re.search(
                    r"(?:[\d,.KM]+\s+likes?,\s+[\d,.KM]+\s+comments?\s+-\s+)?(.+?)\s+on\s+(?:Instagram|Reels?):\s*(.+)",
                    description,
                    re.DOTALL
                )
                if match:
                    username = match.group(1).strip()
                    caption = match.group(2).strip()

            # Pattern 3: Just extract any username-like pattern and use rest as caption
            # Fallback for unusual formats
            if not username or not caption:
                match = re.search(r"@?(\w+)[\s:]+(.{10,})", description)
                if match:
                    username = match.group(1).strip()
                    caption = match.group(2).strip()

            # Pattern 4: Last resort - use first part as username, rest as caption
            if not username or not caption:
                parts = description.split(":", 1)
                if len(parts) == 2:
                    username = parts[0].strip().split()[-1]  # Last word before colon
                    caption = parts[1].strip().strip('"').strip('"').strip('"')

            if not all([username, caption, thumbnail]):
                logger.warning(f"Failed to extract metadata for {url}: username={bool(username)}, caption={bool(caption)}")
                logger.debug(f"Raw description: {description[:200]}...")
                return None

            logger.info(f"Successfully extracted metadata for {url}")
            return {
                "url": url,
                "city": city,
                "category": category,
                "username": username,
                "caption": caption,
                "thumbnail": thumbnail
            }

        except Exception as e:
            logger.error(f"Exception fetching metadata for {url}: {e}")
            return None


async def main(city, category, urls):
    logger.info(f"Fetching metadata for {len(urls)} URLs: {city}/{category}")
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

    valid_results = [r for r in results if r is not None]
    logger.info(f"Metadata extraction complete: {len(valid_results)}/{len(urls)} successful")
    return valid_results
