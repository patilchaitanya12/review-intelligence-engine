from app.services.llm_client import LLMClient

llm = LLMClient()


def compare_products(main, competitors):
    """
    Hybrid comparison engine:
    - deterministic logic
    - fallback heuristics
    - LLM-based strategic insights
    """

    #Normalize Inputs
    main_pros = set(normalize_list(main.get("pros", [])))
    main_cons = set(normalize_list(main.get("cons", [])))

    comp_pros = set()
    comp_cons = set()

    for comp in competitors:
        comp_pros.update(normalize_list(comp.get("pros", [])))
        comp_cons.update(normalize_list(comp.get("cons", [])))

    #Core Comparison Logic
    strengths = list(main_pros - comp_pros)
    weaknesses = list(comp_pros - main_pros)

    shared_issues = list(main_cons & comp_cons)
    competitor_advantages = list(comp_pros - main_pros)

    market_gaps = competitor_advantages.copy()

    base_comparison = {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "shared_issues": shared_issues,
        "competitor_advantages": competitor_advantages,
        "market_gaps": market_gaps
    }

    #Fallback Intelligence Layer
    base_comparison = ensure_meaningful_output(main, competitors, base_comparison)

    #LLM Enhancement Layer
    enhanced = enhance_with_llm(base_comparison)

    return {
        **base_comparison,
        **enhanced
    }


#HELPERS

def normalize_list(items):
    """Lowercase + strip to improve matching"""
    return [i.strip().lower() for i in items if i]


def ensure_meaningful_output(main, competitors, comparison):
    """
    Ensures output is never empty or useless.
    Handles:
    - identical products
    - weak scraping
    - fallback scenarios
    """

    main_pros = main.get("pros", [])
    main_cons = main.get("cons", [])

    #Case 1: Everything empty → fallback
    if (
        not comparison["strengths"]
        and not comparison["weaknesses"]
        and not comparison["competitor_advantages"]
    ):
        comparison["strengths"] = main_pros[:2]
        comparison["weaknesses"] = main_cons[:2]
        comparison["market_gaps"] = main_cons[:2]

    #Case 2: Only strengths missing
    if not comparison["strengths"]:
        comparison["strengths"] = main_pros[:2]

    #Case 3: Only weaknesses missing
    if not comparison["weaknesses"]:
        comparison["weaknesses"] = main_cons[:2]

    #Case 4: No market gaps
    if not comparison["market_gaps"]:
        comparison["market_gaps"] = main_cons[:2]

    return comparison


def enhance_with_llm(comparison):
    prompt = f"""
You are a product strategy expert.

Given this product comparison data:

{comparison}

Generate:
1. positioning (1 line)
2. summary (1 line)
3. 3 improvement ideas
4. 3 marketing angles

Return STRICT JSON:
{{
  "positioning": "",
  "summary": "",
  "improvements": [],
  "marketing_angles": []
}}
"""

    result = llm.generate_json(prompt)

    #Safe fallback
    if "error" in result:
        return {
            "positioning": "Competitive product with some differentiation",
            "summary": "Balanced product with areas of improvement",
            "improvements": [],
            "marketing_angles": []
        }

    return result