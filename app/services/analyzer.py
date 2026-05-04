from app.services.llm_client import LLMClient

llm = LLMClient()

def analyze_reviews(reviews):
    prompt = f"""
You are a strict JSON generator.

Extract:
- Top 5 reasons customers BUY
- Top 5 complaints
- Common use cases

Return ONLY valid JSON:

{{
  "pros": [],
  "cons": [],
  "use_cases": []
}}

Reviews:
{reviews}
"""

    return llm.generate_json(prompt)