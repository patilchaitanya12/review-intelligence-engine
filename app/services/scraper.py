import re
import logging
import random
import httpx
from bs4 import BeautifulSoup
from app.core.config import SERPAPI_KEY
from app.services.url_normalizer import normalize_url

logger = logging.getLogger(__name__)

try:
    from serpapi import GoogleSearch
    SERPAPI_AVAILABLE = True
except ImportError:
    SERPAPI_AVAILABLE = False
    logger.warning("serpapi package not installed — SerpAPI strategy disabled")

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


# ── STRATEGY 1: SerpAPI ───────────────────────────────────────────────────────

def fetch_via_serpapi(asin: str) -> list:
    if not SERPAPI_AVAILABLE:
        raise Exception("serpapi package not installed")
    if not SERPAPI_KEY:
        raise Exception("SERPAPI_KEY not set in .env")

    # Try multiple queries from specific to broad
    queries = [
        f'amazon.in "{asin}" customer reviews',
        f'site:amazon.in "{asin}" reviews',
        f'amazon india {asin} TV review user experience',
    ]

    for i, query in enumerate(queries, 1):
        logger.info(f"SerpAPI query attempt {i}: {query}")

        params = {
            "engine": "google",
            "q": query,
            "api_key": SERPAPI_KEY,
            "num": "10",
        }

        search = GoogleSearch(params)
        results = search.get_dict()

        if "error" in results:
            logger.warning(f"SerpAPI query {i} error: {results['error']}")
            continue

        reviews = []

        for result in results.get("organic_results", []):
            snippet = result.get("snippet", "")
            link = result.get("link", "")
            # Accept snippets that contain the ASIN or are from Amazon
            if snippet and len(snippet) > 40:
                if asin in snippet or asin in link or "amazon" in link.lower():
                    reviews.append(snippet.strip())

        # Also check answer box
        answer = results.get("answer_box", {}).get("snippet", "")
        if answer and len(answer) > 40:
            reviews.append(answer.strip())

        if reviews:
            logger.info(f"SerpAPI query {i} returned {len(reviews)} snippets ✅")
            return reviews

        logger.warning(f"SerpAPI query {i} returned no usable snippets")

    raise Exception("All SerpAPI query attempts returned no usable review snippets")


# ── STRATEGY 2: Direct HTTP ───────────────────────────────────────────────────

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
    logger.info(f"HTTP fetch: {url}")

    response = httpx.get(url, headers=_get_headers(), timeout=20, follow_redirects=True)

    if _is_blocked(response):
        raise Exception("Blocked by Amazon (login redirect or CAPTCHA)")

    soup = BeautifulSoup(response.text, "html.parser")
    reviews = []
    for block in soup.select("span[data-hook='review-body']")[:30]:
        text = block.get_text(strip=True)
        if text and len(text) > 30:
            reviews.append(text)

    if not reviews:
        raise Exception("No reviews parsed from HTML — page may be empty or blocked")

    return reviews


# ── HELPERS ───────────────────────────────────────────────────────────────────

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


# ── MAIN ──────────────────────────────────────────────────────────────────────

def scrape_amazon_reviews(url: str) -> dict:
    try:
        logger.info("=" * 50)
        logger.info("SCRAPER START")
        logger.info(f"Raw URL: {url[:80]}...")

        normalized = normalize_url(url)
        platform = normalized["platform"]
        clean_url = normalized["normalized_url"]
        asin = normalized.get("asin")

        logger.info(f"Platform : {platform}")
        logger.info(f"Clean URL: {clean_url}")
        logger.info(f"ASIN     : {asin}")

        if normalized.get("error"):
            logger.warning(f"Normalizer warning: {normalized['error']}")

        if not asin:
            raise Exception(f"Could not extract ASIN from URL: {clean_url}")

        reviews = []

        # Strategy 1: SerpAPI
        try:
            logger.info("Trying strategy 1: SerpAPI...")
            reviews = fetch_via_serpapi(asin)
            logger.info(f"SerpAPI succeeded: {len(reviews)} reviews")
        except Exception as e:
            logger.warning(f"SerpAPI failed: {e}")

        # Strategy 2: Direct HTTP
        if len(reviews) < 3:
            try:
                logger.info("Trying strategy 2: direct HTTP...")
                reviews = fetch_via_http(asin)
                logger.info(f"HTTP succeeded: {len(reviews)} reviews")
            except Exception as e:
                logger.warning(f"HTTP failed: {e}")

        reviews = clean_reviews(reviews)
        logger.info(f"Final review count: {len(reviews)}")

        if len(reviews) < 3:
            raise Exception(f"All strategies exhausted — only {len(reviews)} reviews found")

        return {
            "title": f"ASIN: {asin}",
            "rating": "N/A",
            "reviews": reviews[:30],
            "source": "scraped",
            "platform": platform,
            "normalized_url": clean_url,
        }

    except Exception as e:
        logger.error(f"SCRAPER ERROR: {e}")
        logger.warning("Falling back to sample review data")
        return {
            "title": "Fallback Product",
            "rating": "N/A",
            "reviews": FALLBACK_REVIEWS,
            "source": "fallback",
            "error": str(e)
        }