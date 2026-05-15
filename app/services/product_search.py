import logging
from app.core.config import SERPAPI_KEY

logger = logging.getLogger(__name__)

try:
    from serpapi import GoogleSearch
    SERPAPI_AVAILABLE = True
except ImportError:
    SERPAPI_AVAILABLE = False
    logger.warning("serpapi not installed — product search disabled")


def search_amazon_products(query: str, max_results: int = 3) -> list[str]:
    """
    Takes a natural language query like "best 43 inch TV under 30k"
    and returns a list of Amazon.in product URLs.

    Args:
        query: Natural language product search query
        max_results: Max number of product URLs to return (default 3)

    Returns:
        List of clean Amazon.in product URLs
    """
    if not SERPAPI_AVAILABLE:
        raise Exception("serpapi package not installed")
    if not SERPAPI_KEY:
        raise Exception("SERPAPI_KEY not set in .env")

    logger.info(f"Searching Amazon products for: '{query}'")

    params = {
        "engine": "google",
        "q": f"site:amazon.in {query}",
        "api_key": SERPAPI_KEY,
        "num": "10",
    }

    search = GoogleSearch(params)
    results = search.get_dict()

    if "error" in results:
        raise Exception(f"SerpAPI error: {results['error']}")

    urls = []
    for result in results.get("organic_results", []):
        link = result.get("link", "")
        if "amazon.in" in link and "/dp/" in link:
            asin_match = __import__("re").search(r"/dp/([A-Z0-9]{10})", link)
            if asin_match:
                asin = asin_match.group(1)
                clean_url = f"https://www.amazon.in/dp/{asin}"
                if clean_url not in urls:
                    urls.append(clean_url)

        if len(urls) >= max_results:
            break

    logger.info(f"Found {len(urls)} product URLs for query: '{query}'")

    if not urls:
        raise Exception(f"No Amazon product URLs found for query: '{query}'")

    return urls