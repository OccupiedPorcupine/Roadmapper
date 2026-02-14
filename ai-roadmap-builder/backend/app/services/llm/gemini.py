# Google Gemini implementation of BaseLLMService
import asyncio
from collections.abc import AsyncIterator

import google.generativeai as genai

from app.core.config import settings
from app.services.llm.base import BaseLLMService


class GeminiService(BaseLLMService):
    """Gemini API streaming; runs sync SDK in executor to avoid blocking the event loop."""

    def __init__(self, api_key: str | None = None) -> None:
        key = api_key or settings.gemini_api_key
        if not key:
            raise ValueError("GEMINI_API_KEY is required for GeminiService")
        genai.configure(api_key=key)
        self._api_key = key

    async def generate_stream(
        self,
        system_prompt: str,
        user_content: str,
    ) -> AsyncIterator[str]:
        model = genai.GenerativeModel(
            "gemini-2.5-flash",
            system_instruction=system_prompt,
        )
        loop = asyncio.get_event_loop()
        queue: asyncio.Queue[str | None] = asyncio.Queue()

        def run_sync_stream() -> None:
            try:
                response = model.generate_content(
                    user_content,
                    stream=True,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.3,
                        max_output_tokens=8192,
                    ),
                )
                for chunk in response:
                    if chunk.text:
                        queue.put_nowait(chunk.text)
            finally:
                queue.put_nowait(None)  # sentinel

        loop.run_in_executor(None, run_sync_stream)

        while True:
            chunk = await queue.get()
            if chunk is None:
                break
            yield chunk
