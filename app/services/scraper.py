import re
import random
import httpx
from bs4 import BeautifulSoup

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

def _get_headers():
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.google.com/",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
    }


def resolve_url(url: str) -> str:
    try:
        response = httpx.get(url, headers=_get_headers(), follow_redirects=True, timeout=10)
        return str(response.url)
    except Exception:
        return url


def extract_asin(url: str):
    patterns = [
        r"/dp/([A-Z0-9]{10})",
        r"/gp/product/([A-Z0-9]{10})",
        r"/product/([A-Z0-9]{10})",
        r"/([A-Z0-9]{10})(?:[/?]|$)"
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def _is_blocked(response) -> bool:
    url_str = str(response.url)
    return (
        "signin" in url_str
        or "ap/signin" in url_str
        or response.status_code in (403, 503)
        or "Robot Check" in response.text
        or "Enter the characters you see below" in response.text
    )


def fetch_listing_page(asin: str):
    """Listing page — less aggressively blocked than /product-reviews/."""
    url = f"https://www.amazon.in/dp/{asin}"
    response = httpx.get(url, headers=_get_headers(), timeout=20, follow_redirects=True)
    if _is_blocked(response):
        raise Exception("Blocked on listing page")
    return response.text


def parse_listing_reviews(html: str) -> list:
    soup = BeautifulSoup(html, "html.parser")
    reviews = []
    selectors = [
        "span[data-hook='review-body']",
        "div[data-hook='review-collapsed']",
        "span.review-text-content span",
        "div.review-text",
    ]
    for selector in selectors:
        blocks = soup.select(selector)
        for block in blocks:
            text = block.get_text(strip=True)
            if text and len(text) > 30:
                reviews.append(text)
        if reviews:
            break
    return reviews


def fetch_reviews_page(asin: str):
    url = f"https://www.amazon.in/product-reviews/{asin}?sortBy=recent&pageNumber=1"
    response = httpx.get(url, headers=_get_headers(), timeout=20, follow_redirects=True)
    if _is_blocked(response):
        raise Exception("Blocked on reviews page")
    return response.text


def parse_reviews_page(html: str) -> list:
    soup = BeautifulSoup(html, "html.parser")
    reviews = []
    blocks = soup.select("span[data-hook='review-body']")
    for block in blocks[:30]:
        text = block.get_text(strip=True)
        if text and len(text) > 30:
            reviews.append(text)
    return reviews


def clean_reviews(reviews: list) -> list:
    seen = set()
    cleaned = []
    for r in reviews:
        r = r.strip()
        if r and r not in seen:
            seen.add(r)
            cleaned.append(r)
    return cleaned


FALLBACK_REVIEWS = [
    "Excellent build quality and durability, holds up well over time",
    "Very sharp and precise cutting, works great for kitchen tasks",
    "Good value for money considering the performance and quality",
    "Packaging could be better, product arrived with minor damage",
    "Not very beginner-friendly, requires some learning curve",
    "Works well for daily use without any issues so far",
    "Slightly overpriced compared to similar products in the market",
    "Handle feels comfortable even during extended usage sessions",
    "Would recommend for professional use, not casual home use",
    "Quality control could be improved, got a defective unit once",
]


def scrape_amazon_reviews(url: str) -> dict:
    try:
        print("\n--- SCRAPER START ---")

        resolved_url = resolve_url(url)
        print("Resolved URL:", resolved_url)

        asin = extract_asin(resolved_url)
        print("ASIN:", asin)

        if not asin:
            raise Exception("ASIN extraction failed")

        reviews = []

        # Strategy 1: listing page (less blocked)
        try:
            print("Trying strategy 1: listing page...")
            html = fetch_listing_page(asin)
            reviews = parse_listing_reviews(html)
            print(f"Strategy 1 got {len(reviews)} reviews")
        except Exception as e:
            print(f"Strategy 1 failed: {e}")

        # Strategy 2: dedicated reviews page
        if len(reviews) < 3:
            try:
                print("Trying strategy 2: reviews page...")
                html = fetch_reviews_page(asin)
                reviews = parse_reviews_page(html)
                print(f"Strategy 2 got {len(reviews)} reviews")
            except Exception as e:
                print(f"Strategy 2 failed: {e}")

        reviews = clean_reviews(reviews)
        print(f"Final review count: {len(reviews)}")

        if len(reviews) < 3:
            raise Exception(f"All strategies failed — only {len(reviews)} reviews found")

        return {
            "title": f"ASIN: {asin}",
            "rating": "N/A",
            "reviews": reviews[:30],
            "source": "scraped"
        }

    except Exception as e:
        print("SCRAPER ERROR:", str(e))
        print("--- USING FALLBACK DATA ---")

        return {
            "title": "Fallback Product",
            "rating": "N/A",
            "reviews": FALLBACK_REVIEWS,
            "source": "fallback",
            "error": str(e)
        }