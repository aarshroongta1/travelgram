import asyncio
from playwright.async_api import async_playwright


async def run():
    async with async_playwright() as p:
        # Launch Chromium in headful mode
        browser = await p.chromium.launch(
            headless=False,
            args=[
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
            ],
        )

        context = await browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/120.0.0.0 Safari/537.36",
        )
        page = await context.new_page()

        # Go to Bing
        await page.goto("https://www.bing.com", timeout=30000)

        # Wait for search box (try input first, fallback to textarea)
        try:
            await page.wait_for_selector("input#sb_form_q", timeout=5000)
            search_box = page.locator("input#sb_form_q")
        except:
            await page.wait_for_selector("textarea#sb_form_q", timeout=5000)
            search_box = page.locator("textarea#sb_form_q")

        # Type the query
        await search_box.click()
        await search_box.fill("site:instagram.com best cafes in Paris")
        await page.keyboard.press("Enter")

        # Wait for results
        await page.wait_for_selector("li.b_algo", timeout=10000)

        # Grab and print first few result links
        links = await page.query_selector_all("li.b_algo a")
        for i, link in enumerate(links[:5]):
            href = await link.get_attribute("href")
            print(f"Result {i+1}: {href}")

        # Keep browser open for 10 seconds
        await asyncio.sleep(10)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(run())
