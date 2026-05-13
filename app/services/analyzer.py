from app.services.llm_client import LLMClient

llm = LLMClient()

def analyze_reviews(reviews):
    prompt = f"""
You are a product intelligence expert analyzing REAL customer reviews.

REVIEWS:
{reviews}

STRICT PRE-FILTER — before analyzing, completely ignore any item that:
- Contains a price (₹, $, "for", numeric value next to currency)
- Contains a star rating or score ("4.8 out of 5", "rated", "stars", "rating")
- Contains a full product name or model number as a title
- Mentions a different brand or product not being reviewed
- Reads like a product listing description, spec sheet, or search snippet
- Is clearly metadata, not a human writing about their personal experience

Only analyze text that sounds like a real person describing their hands-on experience.

INSTRUCTIONS for valid review content:
- Return human-readable phrases (not single words)
- Each point should be 5-10 words
- Avoid generic terms like "good", "nice", "great product"
- Be specific and grounded in what customers actually said
- Remove duplicates
- Max 5 items per category
- Focus on real customer intent, not surface-level sentiment

OUTPUT FORMAT (STRICT JSON, no markdown, no explanation):
{{
  "pros": [],
  "cons": [],
  "use_cases": []
}}

GOOD examples:
- "Sharp picture quality during daylight viewing"
- "Remote control stops responding after few months"
- "Used as primary display in bedroom setup"

BAD examples (never output these):
- "Priced at ₹47,990 offers good value" — contains price
- "4.8 out of 5 stars rating" — contains rating
- "Xiaomi 108 cm 4K LED Smart Fire TV" — product title
- "Redmi Xiaomi offers impressive picture quality" — mentions other brand
"""

    return llm.generate_json(prompt)