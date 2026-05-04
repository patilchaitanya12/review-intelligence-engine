import os
from dotenv import load_dotenv

load_dotenv()

LLM_VENDOR = os.getenv("LLM_VENDOR", "generic")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
LLM_API_KEY = os.getenv("LLM_API_KEY")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")