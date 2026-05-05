from app.services.llm_client import LLMClient

llm = LLMClient()

def analyze_reviews(reviews):
    prompt = f"""
    You are a product intelligence expert.
    
    Analyze the following customer reviews and extract meaningful insights.
    
    REVIEWS:
    {reviews}
    
    INSTRUCTIONS:
    - Return human-readable phrases (not single words)
    - Each point should be 5–10 words
    - Avoid generic terms like "good", "nice"
    - Be specific and actionable
    - Remove duplicates
    - Keep max 5 items per category
    - Focus on real customer intent, not surface-level sentiment
    
    OUTPUT FORMAT (STRICT JSON):
    {{
      "pros": [],
      "cons": [],
      "use_cases": []
    }}
    
    EXAMPLE:
    "Excellent cutting precision for daily kitchen tasks"
    "Handle feels comfortable even during long usage"
    """

    return llm.generate_json(prompt)