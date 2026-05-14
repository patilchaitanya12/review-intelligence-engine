import logging
from app.services.llm_client import LLMClient

logger = logging.getLogger(__name__)
llm = LLMClient()


def generate_insights(main: dict, comparison: dict) -> dict:
    logger.info("Generating strategic insights")

    prompt = f"""
You are a senior product strategist and growth consultant.

You have been given the following data from a customer review analysis:

--- MAIN PRODUCT ANALYSIS ---
Pros (what customers love):
{main.get("pros", [])}

Cons (what customers complain about):
{main.get("cons", [])}

Use Cases (how customers are using it):
{main.get("use_cases", [])}

--- COMPETITIVE COMPARISON ---
Strengths vs competitors:
{comparison.get("strengths", [])}

Weaknesses vs competitors:
{comparison.get("weaknesses", [])}

Positioning:
{comparison.get("positioning", "")}

Competitive Summary:
{comparison.get("summary", "")}

---

Your task is to generate deep, specific, and actionable insights.
Do NOT be generic. Every point must be grounded in the data above.

Return ONLY a valid JSON object with exactly this structure:

{{
  "improvements": [
    {{
      "area": "short label e.g. Packaging",
      "issue": "what the problem is based on reviews",
      "action": "specific fix the product team should take"
    }}
  ],
  "marketing_angles": [
    {{
      "angle": "short hook or tagline — never empty",
      "rationale": "why this resonates based on review data"
    }}
  ],
  "target_audience": [
    {{
      "segment": "e.g. Home gym users",
      "reason": "why this group is a strong fit based on use cases and pros"
    }}
  ],
  "key_differentiators": [
    "One-line differentiator that can be used in ads or listings"
  ],
  "risk_flags": [
    {{
      "risk": "potential business or product risk",
      "severity": "low | medium | high",
      "mitigation": "what to do about it"
    }}
  ],
  "quick_wins": [
    "Immediately actionable improvement that requires minimal effort"
  ]
}}

Rules:
- Return ONLY the JSON. No markdown, no explanation, no code fences.
- Each array must have 3-5 items.
- Never return empty strings in any field. Every field must have actual content.
- If you cannot generate a value, skip that item entirely rather than returning empty.
- Be specific, not generic. Avoid filler phrases like "improve quality" without context.
"""

    result = llm.generate_json(prompt)
    logger.info("Insights generation complete")
    return result