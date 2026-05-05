import re
import httpx
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept-Language": "en-IN,en;q=0.9",
    "Referer": "https://www.amazon.in/"
}


#Resolve shortened URLs (amzn.in → full URL)
def resolve_url(url: str):
    try:
        response = httpx.get(
            url,
            headers=HEADERS,
            follow_redirects=True,
            timeout=10
        )
        return str(response.url)
    except Exception:
        return url


#Extract ASIN robustly
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


#Fetch reviews page
def fetch_reviews_page(asin: str):
    review_url = f"https://www.amazon.in/product-reviews/{asin}"

    response = httpx.get(
        review_url,
        headers=HEADERS,
        timeout=20,
        follow_redirects=True
    )

    # Detect Amazon blocking
    if "signin" in str(response.url):
        raise Exception("Blocked by Amazon (login required)")

    return response.text


#Parse reviews
def parse_reviews(html: str):
    soup = BeautifulSoup(html, "html.parser")

    reviews = []

    review_blocks = soup.select(
        "span[data-hook='review-body'], div[data-hook='review-collapsed']"
    )

    for r in review_blocks[:30]:
        text = r.get_text(strip=True)
        if text:
            reviews.append(text)

    return reviews


def clean_reviews(reviews):
    seen = set()
    cleaned = []

    for r in reviews:
        r = r.strip()
        if r and r not in seen:
            seen.add(r)
            cleaned.append(r)

    return cleaned


#Fallback reviews (realistic)
FALLBACK_REVIEWS = [
    "Excellent build quality and durability",
    "Very sharp and precise cutting",
    "Value for money product",
    "Packaging could be better",
    "Not suitable for beginners",
    "Works well for daily use",
    "Good but slightly overpriced"
]


#MAIN FUNCTION
def scrape_amazon_reviews(url: str):
    try:
        print("\n--- SCRAPER START ---")

        #resolve URL
        resolved_url = resolve_url(url)
        print("Resolved URL:", resolved_url)

        #extract ASIN
        asin = extract_asin(resolved_url)
        print("ASIN:", asin)

        if not asin:
            raise Exception("ASIN extraction failed")

        #fetch + parse
        html = fetch_reviews_page(asin)
        reviews = parse_reviews(html)

        print("Raw reviews:", len(reviews))

        #clean
        reviews = clean_reviews(reviews)
        print("Cleaned reviews:", len(reviews))

        #fallback if blocked or too few
        if len(reviews) < 5:
            raise Exception("Too few reviews (likely blocked)")

        return {
            "title": f"ASIN: {asin}",
            "rating": "N/A",
            "reviews": reviews[:30]
        }

    except Exception as e:
        print("SCRAPER ERROR:", str(e))
        print("--- USING FALLBACK ---")

        return {
            "title": "Fallback Product",
            "rating": "N/A",
            "reviews": FALLBACK_REVIEWS,
            "error": str(e)
        }