import logging
from app.services.llm_client import LLMClient

logger = logging.getLogger(__name__)
llm = LLMClient()


def compare_products(main: dict, competitors: list) -> dict:
    logger.info(f"Comparing main product against {len(competitors)} competitor(s)")
    result = _llm_compare(main, competitors)

    if "error" in result:
        logger.error(f"LLM comparison failed: {result['error']} — using fallback")
        return _fallback(main)

    result = _ensure_keys(result, main)
    logger.info("Comparison complete")
    return result


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
- A feature in BOTH main and competitors is NOT a strength — it's a baseline.
- Weaknesses must be things the MAIN PRODUCT is worse at.
- Be specific. Avoid generic phrases.

--- MAIN PRODUCT ---
Pros: {main.get("pros", [])}
Cons: {main.get("cons", [])}
Use Cases: {main.get("use_cases", [])}

--- COMPETITORS ---
{_format_competitors(competitors)}

Return ONLY a valid JSON object. No markdown, no explanation:

{{
  "strengths": ["One-line: something the main product does genuinely better"],
  "weaknesses": ["One-line: something the main product is genuinely worse at"],
  "shared_issues": ["One-line: a problem across main AND competitors"],
  "competitor_advantages": ["One-line: a specific edge competitors have"],
  "market_gaps": ["One-line: an unmet need none solve well"],
  "positioning": "One sentence: where the main product sits in the market",
  "summary": "One sentence: the overall competitive verdict",
  "improvements": ["One-line: specific improvement the main product should make"],
  "marketing_angles": ["One-line: a compelling marketing angle grounded in data"]
}}

Rules:
- Each array must have 2-4 items.
- strengths and weaknesses must be mutually exclusive.
- Never return empty strings in any field.
- Return ONLY the JSON object.
"""

    return llm.generate_json(prompt)


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
            logger.warning(f"Missing key '{key}' in comparison result — using default")
            result[key] = default
    return result


def _fallback(main: dict) -> dict:
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