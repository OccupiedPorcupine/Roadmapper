# Model router: returns the correct LLM service based on .env / config
from functools import lru_cache

from app.core.config import settings
from app.services.llm.base import BaseLLMService
from app.services.llm.gemini import GeminiService


@lru_cache(maxsize=1)
def get_llm_service() -> BaseLLMService:
    """Return the configured LLM implementation (e.g. Gemini). Cached per process."""
    provider = (settings.llm_provider or "gemini").strip().lower()
    if provider == "gemini":
        return GeminiService()
    raise ValueError(f"Unknown LLM provider: {provider}. Set LLM_PROVIDER=gemini or add implementation.")
