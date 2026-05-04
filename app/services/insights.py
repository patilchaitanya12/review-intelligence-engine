from app.services.llm_client import LLMClient

llm = LLMClient()

def generate_insights(main, comparison):
    prompt = f"""
    Based on:

    Main product analysis:
    {main}

    Comparison:
    {comparison}

    Suggest:
    - Improvements
    - Marketing angles

    Keep it concise.
    """

    return llm.generate(prompt)