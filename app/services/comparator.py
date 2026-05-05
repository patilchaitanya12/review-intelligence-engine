from app.services.llm_client import LLMClient

llm = LLMClient()


def compare_products(main: dict, competitors: list) -> dict:
    """
    LLM-first comparison engine.

    Delegates semantic comparison entirely to the LLM so that
    near-duplicate phrases across main vs competitor don't bleed
    into the wrong bucket (the old set-subtraction bug).

    Args:
        main: Output from analyzer.py — { pros, cons, use_cases }
        competitors: List of analyzer.py outputs for competitor products

    Returns:
        dict with keys: strengths, weaknesses, shared_issues,
                        competitor_advantages, market_gaps,
                        positioning, summary, improvements, marketing_angles
    """

    result = _llm_compare(main, competitors)

    if "error" in result:
        return _fallback(main)

    return _ensure_keys(result, main)


def _llm_compare(main: dict, competitors: list) -> dict:
    prompt = f"""
You are a senior product strategy expert performing a competitive analysis.

You will be given review analysis data for a MAIN product and one or more
COMPETITOR products. Your job is to identify:

1. What the main product genuinely does BETTER than competitors
2. What the main product genuinely does WORSE than competitors
3. Issues that exist across all products (shared problems)
4. Advantages competitors have that the main product lacks
5. Market gaps nobody is solving well

IMPORTANT RULES:
- Compare SEMANTICALLY, not by exact wording. 
  "build quality is great" and "excellent build quality and durability" 
  are the SAME feature — do NOT list it in both strengths and weaknesses.
- A feature that exists in BOTH main and competitors is NOT a strength 
  of the main product — it is a shared baseline. Only list it as a strength 
  if the main product clearly does it better.
- Weaknesses must be things the MAIN PRODUCT is worse at, not things 
  competitors are good at.
- Be specific. Avoid generic phrases.

--- MAIN PRODUCT ---
Pros: {main.get("pros", [])}
Cons: {main.get("cons", [])}
Use Cases: {main.get("use_cases", [])}

--- COMPETITORS ---
{_format_competitors(competitors)}

Return ONLY a valid JSON object with this exact structure. No markdown, no explanation:

{{
  "strengths": [
    "One-line: something the main product does genuinely better than competitors"
  ],
  "weaknesses": [
    "One-line: something the main product is genuinely worse at vs competitors"
  ],
  "shared_issues": [
    "One-line: a problem that exists across main AND competitors"
  ],
  "competitor_advantages": [
    "One-line: a specific edge competitors have over the main product"
  ],
  "market_gaps": [
    "One-line: an unmet need none of the products solve well"
  ],
  "positioning": "One sentence: where the main product sits in the market",
  "summary": "One sentence: the overall competitive verdict",
  "improvements": [
    "One-line: specific improvement the main product should make"
  ],
  "marketing_angles": [
    "One-line: a compelling marketing angle grounded in the data"
  ]
}}

Rules:
- Each array must have 2–4 items.
- strengths and weaknesses must be mutually exclusive — no item should appear in both.
- Return ONLY the JSON object.
"""

    return llm.generate_json(prompt)


# ── HELPERS ──────────────────────────────────────────────────────────────────

def _format_competitors(competitors: list) -> str:
    if not competitors:
        return "No competitor data provided."

    parts = []
    for i, comp in enumerate(competitors, 1):
        parts.append(
            f"Competitor {i}:\n"
            f"  Pros: {comp.get('pros', [])}\n"
            f"  Cons: {comp.get('cons', [])}\n"
            f"  Use Cases: {comp.get('use_cases', [])}"
        )
    return "\n\n".join(parts)


def _ensure_keys(result: dict, main: dict) -> dict:
    """
    Guarantee every key the UI expects is present.
    Uses safe defaults rather than crashing.
    """
    defaults = {
        "strengths": main.get("pros", [])[:2],
        "weaknesses": main.get("cons", [])[:2],
        "shared_issues": [],
        "competitor_advantages": [],
        "market_gaps": main.get("cons", [])[:2],
        "positioning": "Competitive product with unique strengths",
        "summary": "Solid product with clear areas for improvement",
        "improvements": [],
        "marketing_angles": [],
    }

    for key, default in defaults.items():
        if key not in result or not result[key]:
            result[key] = default

    return result


def _fallback(main: dict) -> dict:
    """Hard fallback when LLM call fails entirely."""
    return {
        "strengths": main.get("pros", [])[:3],
        "weaknesses": main.get("cons", [])[:3],
        "shared_issues": [],
        "competitor_advantages": [],
        "market_gaps": main.get("cons", [])[:2],
        "positioning": "Could not generate positioning — LLM error",
        "summary": "Could not generate summary — LLM error",
        "improvements": [],
        "marketing_angles": [],
    }