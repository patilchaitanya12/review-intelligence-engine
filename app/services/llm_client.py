import httpx
from app.core.config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL

class LLMClient:
    def __init__(self):
        self.base_url = LLM_BASE_URL
        self.api_key = LLM_API_KEY

    def generate(self, prompt: str) -> str:
        response = httpx.post(
            f"{self.base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": LLM_MODEL,
                "messages": [{"role": "user", "content": prompt}]
            },
            timeout=30
        )

        response.raise_for_status()
        data = response.json()

        return data["choices"][0]["message"]["content"]