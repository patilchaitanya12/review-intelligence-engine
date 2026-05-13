import re
import httpx
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept-Language": "en-IN,en;q=0.9",
}

def detect_platform(url: str) -> str:
    """
    Detects which platform the URL belongs to.
    Returns: 'amazon' | 'flipkart' | 'alibaba' | 'meesho' | 'unknown'
    """
    url_lower = url.lower()

    if any(d in url_lower for d in ["amazon.in", "amazon.com", "amzn.in", "amzn.to"]):
        return "amazon"
    if "flipkart.com" in url_lower:
        return "flipkart"
    if "alibaba.com" in url_lower:
        return "alibaba"
    if "meesho.com" in url_lower:
        return "meesho"

    return "unknown"

def resolve_short_url(url: str) -> str:
    """
    Follows redirects to get the full URL.
    Handles amzn.in, amzn.to, bit.ly, and any other shorteners.
    """
    try:
        response = httpx.get(url, headers=HEADERS, follow_redirects=True, timeout=10)
        return str(response.url)
    except Exception:
        return url

def normalize_amazon(url: str) -> dict:
    """
    Cleans Amazon URLs of all tracking params.
    Extracts ASIN and returns the shortest canonical URL.

    Handles:
    - https://www.amazon.in/Some-Product-Name/dp/B0CQ2ZRPBB/ref=sr_1_1?...
    - https://amzn.in/d/abc123
    - https://www.amazon.in/dp/B0CQ2ZRPBB?th=1&psc=1
    - https://www.amazon.com/gp/product/B0CQ2ZRPBB
    """

    # Resolve short URLs first
    if "amzn.in" in url or "amzn.to" in url:
        url = resolve_short_url(url)

    # Extract ASIN
    asin = None
    patterns = [
        r"/dp/([A-Z0-9]{10})",
        r"/gp/product/([A-Z0-9]{10})",
        r"/product/([A-Z0-9]{10})",
        r"/([A-Z0-9]{10})(?:[/?]|$)",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            asin = match.group(1)
            break

    if not asin:
        return {
            "platform": "amazon",
            "normalized_url": url,
            "asin": None,
            "error": "Could not extract ASIN"
        }

    # Build clean canonical URL
    domain = "amazon.in" if "amazon.in" in url else "amazon.com"
    clean_url = f"https://www.{domain}/dp/{asin}"

    return {
        "platform": "amazon",
        "normalized_url": clean_url,
        "asin": asin,
        "error": None
    }


def normalize_flipkart(url: str) -> dict:
    """
    Cleans Flipkart URLs.

    Handles:
    - https://www.flipkart.com/product-name/p/itm123?pid=XYZ&lid=...&marketplace=...
    - Strips all tracking params, keeps only pid
    """
    parsed = urlparse(url)

    params = parse_qs(parsed.query)
    pid = params.get("pid", [None])[0]

    # Build clean URL
    clean_query = f"pid={pid}" if pid else ""
    clean_url = urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        "",
        clean_query,
        ""
    ))

    return {
        "platform": "flipkart",
        "normalized_url": clean_url,
        "pid": pid,
        "error": None
    }

def normalize_alibaba(url: str) -> dict:
    """
    Cleans Alibaba URLs.

    Handles:
    - https://www.alibaba.com/product-detail/Product-Name_123456789.html?spm=...
    - Strips tracking params, keeps the product detail path
    """
    parsed = urlparse(url)

    # Extract product ID from path
    product_id = None
    match = re.search(r"_(\d+)\.html", parsed.path)
    if match:
        product_id = match.group(1)

    clean_url = urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        "", "", ""
    ))

    return {
        "platform": "alibaba",
        "normalized_url": clean_url,
        "product_id": product_id,
        "error": None
    }


def normalize_generic(url: str) -> dict:
    """
    For unknown platforms — strips common tracking params
    and returns the cleanest possible URL.
    """
    # Common tracking params to strip
    TRACKING_PARAMS = {
        "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
        "ref", "tag", "mkrid", "mkcid", "mkevt", "campid", "toolid",
        "gclid", "fbclid", "msclkid", "affiliate", "source", "aff",
    }

    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    # Remove tracking params
    clean_params = {k: v for k, v in params.items() if k.lower() not in TRACKING_PARAMS}

    clean_query = urlencode(clean_params, doseq=True)
    clean_url = urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        "",
        clean_query,
        ""
    ))

    return {
        "platform": "unknown",
        "normalized_url": clean_url,
        "error": None
    }

def normalize_url(url: str) -> dict:
    """
    Main function. Call this with any URL.

    Returns:
    {
        "platform": "amazon" | "flipkart" | "alibaba" | "meesho" | "unknown",
        "normalized_url": "clean canonical URL",
        "original_url": "what the user pasted",
        "asin": "B0CQ2ZRPBB",     # Amazon only
        "pid": "XYZABC123",        # Flipkart only
        "product_id": "123456789", # Alibaba only
        "error": None | "error message"
    }
    """
    url = url.strip()
    original = url

    # Resolve any shorteners first
    if any(s in url for s in ["amzn.in", "amzn.to", "bit.ly", "tinyurl"]):
        url = resolve_short_url(url)

    platform = detect_platform(url)

    if platform == "amazon":
        result = normalize_amazon(url)
    elif platform == "flipkart":
        result = normalize_flipkart(url)
    elif platform == "alibaba":
        result = normalize_alibaba(url)
    else:
        result = normalize_generic(url)

    result["original_url"] = original
    return result