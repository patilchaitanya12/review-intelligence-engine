import logging
from app.services.llm_client import LLMClient

logger = logging.getLogger(__name__)
llm = LLMClient()


def generate_customer_insights(products: list[dict]) -> dict:
    """
    Generate customer-friendly comparison and recommendation.

    Args:
        products: List of analyzed products, each with:
                  { asin, url, pros, cons, use_cases }

    Returns:
        {
            "winner": { "asin", "url", "reason" },
            "products": [
                {
                    "asin", "url",
                    "pros", "cons",
                    "best_for", "watch_out"
                }
            ],
            "summary": "one line plain English verdict"
        }
    """
    logger.info(f"Generating customer insights for {len(products)} products")

    formatted = ""
    for i, p in enumerate(products, 1):
        formatted += f"""
Product {i}:
  URL: {p.get('url', 'N/A')}
  ASIN: {p.get('asin', 'N/A')}
  Pros: {p.get('pros', [])}
  Cons: {p.get('cons', [])}
  Use Cases: {p.get('use_cases', [])}
"""

    prompt = f"""
You are a helpful shopping assistant advising a real customer.

A customer wants to compare these products and needs your honest recommendation.

{formatted}

Your job:
1. Analyze each product from a CUSTOMER perspective
2. Pick the single best one and explain why in plain English
3. For each product give honest pros, cons, what it's best for, and what to watch out for

STRICT RULES:
- Use simple everyday language. No business jargon.
- "Best for gaming" not "optimal for high-refresh-rate use cases"
- "Screen can look washed out in bright rooms" not "suboptimal luminance in high-ambient-light environments"
- Be honest — if a product has a serious flaw, say it clearly
- The winner must be clearly the best option, not a tie
- Never return empty strings in any field

Return ONLY valid JSON, no markdown:

{{
  "winner": {{
    "asin": "the winning product ASIN",
    "url": "the winning product URL",
    "reason": "One clear sentence — why this is the best pick for most buyers"
  }},
  "products": [
    {{
      "asin": "product ASIN",
      "url": "product URL",
      "pros": [
        "Customer-friendly pro (5-8 words)"
      ],
      "cons": [
        "Customer-friendly con (5-8 words)"
      ],
      "best_for": "Who should buy this — one line",
      "watch_out": "The one thing to be aware of before buying"
    }}
  ],
  "summary": "One plain-English sentence comparing all products and stating the verdict"
}}

Rules:
- products array must include ALL {len(products)} products
- pros and cons: 3-4 items each
- Return ONLY the JSON object
"""

    result = llm.generate_json(prompt)
    logger.info("Customer insights generation complete")
    return result