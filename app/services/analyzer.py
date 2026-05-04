from app.services.llm_client import LLMClient

llm = LLMClient()

def analyze_reviews(reviews):
    prompt = f"""
    You are analyzing customer reviews.

    Extract:
    1. Top 5 reasons customers BUY this product
    2. Top 5 complaints
    3. Common use cases

    Return JSON:

    {{
      "pros": [],
      "cons": [],
      "use_cases": []
    }}

    Reviews:
    {reviews}
    """

    return llm.generate(prompt)