import re
import os
import random
import httpx
from bs4 import BeautifulSoup
from app.core.config import SERPAPI_KEY

try:
    from serpapi import GoogleSearch
    SERPAPI_AVAILABLE = True
except ImportError:
    SERPAPI_AVAILABLE = False

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
]

def _get_headers():
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
        "Referer": "https://www.google.com/",
        "DNT": "1",
        "Connection": "keep-alive",
    }


# ── URL + ASIN ────────────────────────────────────────────────────────────────

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


def fetch_via_serpapi(asin: str) -> list:
    if not SERPAPI_AVAILABLE:
        raise Exception("serpapi package not installed")
    if not SERPAPI_KEY:
        raise Exception("SERPAPI_KEY not set in .env")

    # Use Google search to find Amazon reviews — free plan compatible
    params = {
        "engine": "google",
        "q": f"amazon.in {asin} customer reviews",
        "api_key": SERPAPI_KEY,
        "num": "10",
    }

    search = GoogleSearch(params)
    results = search.get_dict()

    if "error" in results:
        raise Exception(f"SerpAPI error: {results['error']}")

    reviews = []

    # Pull text snippets from organic results
    for result in results.get("organic_results", []):
        snippet = result.get("snippet", "")
        if snippet and len(snippet) > 30 and "amazon" in result.get("link", "").lower():
            reviews.append(snippet.strip())

    # Also check knowledge graph / answer box
    answer = results.get("answer_box", {}).get("snippet", "")
    if answer and len(answer) > 30:
        reviews.append(answer.strip())

    if not reviews:
        raise Exception("Google search returned no usable review snippets")

    return reviews


def _is_blocked(response) -> bool:
    url_str = str(response.url)
    return (
        "signin" in url_str
        or "ap/signin" in url_str
        or response.status_code in (403, 503)
        or "Robot Check" in response.text
        or "Enter the characters you see below" in response.text
    )

def fetch_via_http(asin: str) -> list:
    url = f"https://www.amazon.in/product-reviews/{asin}?sortBy=recent&pageNumber=1"
    response = httpx.get(url, headers=_get_headers(), timeout=20, follow_redirects=True)
    if _is_blocked(response):
        raise Exception("Blocked by Amazon")

    soup = BeautifulSoup(response.text, "html.parser")
    reviews = []
    for block in soup.select("span[data-hook='review-body']")[:30]:
        text = block.get_text(strip=True)
        if text and len(text) > 30:
            reviews.append(text)

    if not reviews:
        raise Exception("No reviews parsed from HTML")
    return reviews


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

def clean_reviews(reviews: list) -> list:
    seen = set()
    cleaned = []
    for r in reviews:
        r = r.strip()
        if r and r not in seen:
            seen.add(r)
            cleaned.append(r)
    return cleaned


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

        # Strategy 1: SerpAPI (primary)
        try:
            print("Trying strategy 1: SerpAPI...")
            reviews = fetch_via_serpapi(asin)
            print(f"SerpAPI got {len(reviews)} reviews ✅")
        except Exception as e:
            print(f"SerpAPI failed: {e}")

        # Strategy 2: Direct HTTP
        if len(reviews) < 3:
            try:
                print("Trying strategy 2: direct HTTP...")
                reviews = fetch_via_http(asin)
                print(f"HTTP got {len(reviews)} reviews ✅")
            except Exception as e:
                print(f"HTTP failed: {e}")

        reviews = clean_reviews(reviews)
        print(f"Final review count: {len(reviews)}")

        if len(reviews) < 3:
            raise Exception("All strategies exhausted")

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