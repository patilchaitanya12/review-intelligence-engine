import httpx
import json
from typing import Any, Dict
from app.core.config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL


class LLMClient:
    def __init__(self):
        self.base_url = LLM_BASE_URL
        self.api_key = LLM_API_KEY
        self.timeout = 30

    def _make_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        try:
            response = httpx.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=self.timeout
            )

            response.raise_for_status()
            return response.json()

        except httpx.TimeoutException:
            raise Exception("LLM request timed out")

        except httpx.HTTPStatusError as e:
            raise Exception(f"LLM HTTP error: {e.response.text}")

        except Exception as e:
            raise Exception(f"LLM request failed: {str(e)}")

    def _extract_content(self, response_json: Dict[str, Any]) -> str:
        try:
            return response_json["choices"][0]["message"]["content"]
        except Exception:
            raise Exception("Invalid LLM response format")

    def _clean_response(self, text: str) -> str:
        text = text.strip()
        
        if text.startswith("```"):
            parts = text.split("```")
            if len(parts) >= 2:
                text = parts[1]

        return text.strip()

    def generate(self, prompt: str) -> str:
        payload = {
            "model": LLM_MODEL,
            "messages": [{"role": "user", "content": prompt}]
        }

        response_json = self._make_request(payload)
        content = self._extract_content(response_json)

        return self._clean_response(content)

    def generate_json(self, prompt: str) -> Dict[str, Any]:
        payload = {
            "model": LLM_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        }

        response_json = self._make_request(payload)
        content = self._extract_content(response_json)
        cleaned = self._clean_response(content)

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return {
                "error": "Failed to parse JSON",
                "raw_response": cleaned
            }